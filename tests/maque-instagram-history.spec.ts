import { test, expect, type Page } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const html = readFileSync('maque/index.html', 'utf8');
const modules = new Set(readdirSync('maque').filter(name => /\.(?:js|css)$/.test(name)));
const assets = new Set(readdirSync('maque/assets').map(name => 'assets/' + name));
const expected = [
  { date: '2026-10-20', code: '20261020', caption: '커플템으로 가자 ~', count: 1 },
  { date: '2024-09-21', code: '20240921', caption: '爆炸银硕！', count: 1 },
  { date: '2024-09-18', code: '20240918', caption: '大家~中秋假期过得好吗？ 我久违地回老家看了查理 感觉变大了 ㅎㅎ 남은剩下的假期多吃点好吃的,好好休息!!😊', count: 2 },
  { date: '2024-09-03', code: '20240903', caption: '很有意思下次还会再来的🤗😚🧡', count: 1 },
  { date: '2024-06-21', code: '20240621', caption: 'Boombadoom Boom Boom Boom Base~😚', count: 2 },
  { date: '2024-05-10', code: '20240510', caption: '好吃', count: 1 },
];
const post = (page: Page, date: string) => page.locator(`[data-silver-post="eunseok-${date}"]`);

async function open(page: Page, affection = 0, currentPosts = false) {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(({ affection, currentPosts }) => {
    if (localStorage.getItem('silver-history-test')) return;
    localStorage.setItem('silver-history-test', 'yes');
    for (const build of ['27', '31']) localStorage.setItem(`maque_build_${build}_initialized`, 'yes');
    localStorage.setItem('maque_affection', String(affection));
    if (currentPosts) {
      localStorage.setItem('maque_date_posts', '["baseball"]');
      localStorage.setItem('maque_extra_dates_v1', JSON.stringify({version:4,sessions:{},completed:['football'],likes:[],comments:{}}));
    }
  }, { affection, currentPosts });
  await page.route('**/maque/**', route => {
    const name = new URL(route.request().url()).pathname.slice('/maque/'.length);
    if (!name) return route.fulfill({contentType:'text/html',body:html});
    if (!modules.has(name) && !assets.has(name)) return route.abort();
    return route.fulfill({contentType:name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.svg')?'image/svg+xml':name.endsWith('.png')?'image/png':'image/jpeg',body:readFileSync('maque/'+name)});
  });
  await page.route('https://images.unsplash.com/**', route => route.abort());
  await page.goto('/maque/'); await page.evaluate("view('home')");
  await page.getByRole('button',{name:'Instagram',exact:true}).click();
  return errors;
}

test('six unconditional captions are paired with the supplied dated photos, newest first, on a fresh phone', async({page})=>{
  const errors = await open(page);
  await expect(page.locator('.silver-profile-post')).toHaveCount(6);
  expect(await page.locator('.silver-profile-post').evaluateAll(nodes=>nodes.map(node=>(node as HTMLElement).dataset.publishedOn))).toEqual(expected.map(item=>item.date));
  for (const item of expected) {
    const article=post(page,item.date);
    await expect(article.locator('.silver-post-caption')).toHaveText(item.caption);
    await expect(article.locator('time')).toHaveAttribute('datetime',item.date);
    await expect(article.locator('.ins-post-header b')).toHaveText('eunseok');
    await expect(article.locator('.ins-post-image')).toHaveAttribute('src',`./assets/eunseok-instagram-${item.code}-1.jpg`);
    await article.locator('.ins-post-image').scrollIntoViewIfNeeded();
    await expect.poll(()=>article.locator('.ins-post-image').evaluate((image:HTMLImageElement)=>image.complete&&image.naturalWidth>0)).toBe(true);
    await expect(article.locator('.ins-post-image')).toHaveCSS('object-fit','contain');
    const frame=await article.locator('.ins-photo').boundingBox(),image=await article.locator('.ins-post-image').boundingBox();
    expect(image!.height).toBeLessThanOrEqual(frame!.height+1);
    expect(image!.width).toBeLessThanOrEqual(frame!.width+1);
    if(item.count===2) await expect(article.locator('.silver-photo-counter')).toHaveText('1 / 2');
    else await expect(article.locator('.silver-photo-counter')).toHaveCount(0);
  }
  await expect(page.locator('.ins-empty')).toHaveCount(0);
  await expect(page.locator('[data-scene]')).toHaveCount(0);
  expect(await page.evaluate('mediaAssets.album.length')).toBe(0);
  expect(errors).toEqual([]);
});

test('both two-photo posts navigate to their own second image without changing the caption or date',async({page})=>{
  const errors=await open(page);
  for(const item of expected.filter(item=>item.count===2)) {
    const article=post(page,item.date);
    await article.getByRole('button',{name:'下一张动态照片'}).click();
    await expect(article.locator('.ins-post-image')).toHaveAttribute('src',`./assets/eunseok-instagram-${item.code}-2.jpg`);
    await expect.poll(()=>article.locator('.ins-post-image').evaluate((image:HTMLImageElement)=>image.complete&&image.naturalWidth>0)).toBe(true);
    await expect(article.locator('.silver-photo-counter')).toHaveText('2 / 2');
    await expect(article.getByRole('button',{name:'下一张动态照片'})).toBeHidden();
    await expect(article.locator('.silver-post-caption')).toHaveText(item.caption);
    await expect(article.locator('time')).toHaveAttribute('datetime',item.date);
    await article.locator('.silver-carousel').focus();
    await page.keyboard.press('ArrowLeft');
    await expect(article.locator('.silver-photo-counter')).toHaveText('1 / 2');
  }
  expect(errors).toEqual([]);
});

test('likes, bookmarks and selected slides survive refreshing without altering affection or date progress',async({page})=>{
  await open(page,42);
  const article=post(page,'2024-09-18');
  const like=article.getByRole('button',{name:'喜欢这条动态',exact:true});
  await article.locator('.ins-post-image').dblclick();
  await expect(like).toHaveAttribute('aria-pressed','true');
  await article.locator('.ins-post-image').dblclick();
  await expect(like).toHaveAttribute('aria-pressed','true');
  await article.getByRole('button',{name:'收藏这条动态'}).click();
  await article.getByRole('button',{name:'下一张动态照片'}).click();
  await page.reload(); await page.evaluate("openApp('instagram')");
  await expect(like).toHaveAttribute('aria-pressed','true');
  await expect(article.getByRole('button',{name:'收藏这条动态'})).toHaveAttribute('aria-pressed','true');
  await expect(article.locator('.silver-photo-counter')).toHaveText('2 / 2');
  expect(await page.evaluate(()=>localStorage.getItem('maque_affection'))).toBe('42');
  expect(await page.evaluate('completedDates.size')).toBe(0);
  await article.getByRole('button',{name:'喜欢这条动态',exact:true}).click();
  await expect(like).toHaveAttribute('aria-pressed','false');
});

test('horizontal swipes change a photo while vertical scrolling leaves the carousel position unchanged',async({page})=>{
  await page.setViewportSize({width:390,height:844});await open(page);
  const article=post(page,'2024-09-18'),media=article.locator('.silver-carousel');
  const swipe=async(dx:number,dy:number)=>media.evaluate((node,{dx,dy})=>{
    const start=new Event('touchstart',{bubbles:true});Object.defineProperty(start,'touches',{value:[{clientX:250,clientY:200}]});node.dispatchEvent(start);
    const end=new Event('touchend',{bubbles:true});Object.defineProperty(end,'changedTouches',{value:[{clientX:250+dx,clientY:200+dy}]});node.dispatchEvent(end);
  },{dx,dy});
  await swipe(5,160);
  await expect(article.locator('.silver-photo-counter')).toHaveText('1 / 2');
  await swipe(-150,5);
  await expect(article.locator('.silver-photo-counter')).toHaveText('2 / 2');
  await swipe(150,5);
  await expect(article.locator('.silver-photo-counter')).toHaveText('1 / 2');
  await expect(article.getByRole('button',{name:'喜欢这条动态',exact:true})).toHaveAttribute('aria-pressed','false');
});

test('game posts and supplied history follow publication dates, including after private-post interactions',async({page})=>{
  const errors=await open(page,60,true);
  const check=async()=>{
    expect(await page.locator('#insFeed > article').evaluateAll(nodes=>nodes.slice(-5).map(node=>(node as HTMLElement).dataset.publishedOn))).toEqual(expected.slice(1).map(item=>item.date));
    await expect(page.locator('.silver-profile-post')).toHaveCount(7);
    const dates=await page.locator('#insFeed > article').evaluateAll(nodes=>nodes.map(node=>(node as HTMLElement).dataset.publishedOn!));
    expect(dates).toEqual([...dates].sort().reverse());
  };
  await check();
  await expect(page.locator('[data-scene="baseball"]')).toHaveCount(1);
  await expect(page.locator('[data-extra-date-post="football"]')).toHaveCount(1);
  await page.locator('[data-sequel-post="echo"]').getByRole('button',{name:'喜欢这条私密动态'}).click();
  await check();
  await page.getByRole('button',{name:'刷新动态'}).click();
  await check();
  await expect(page.locator('[data-scene="baseball"] .ins-post-header img')).toHaveAttribute('src','./assets/sungchan-instagram-avatar.jpg');
  expect(errors).toEqual([]);
});

for(const width of [320,390]) {
  test(`dated Instagram photos and captions fit a ${width}px phone`,async({page})=>{
    await page.setViewportSize({width,height:844}); await open(page);
    const screen=page.locator('#instagram');
    await expect.poll(()=>post(page,'2026-10-20').locator('.ins-post-image').evaluate((image:HTMLImageElement)=>image.complete&&image.naturalWidth>0)).toBe(true);
    await screen.screenshot({path:`outputs/maque/silver-instagram-history-${width}.png`});
    for(const item of expected) {
      const article=post(page,item.date);await article.scrollIntoViewIfNeeded();
      expect(await article.evaluate(node=>node.scrollWidth<=node.clientWidth+1)).toBe(true);
      const rect=await article.boundingBox(),phone=await screen.boundingBox();
      expect(rect!.x).toBeGreaterThanOrEqual(phone!.x-1);
      expect(rect!.x+rect!.width).toBeLessThanOrEqual(phone!.x+phone!.width+1);
    }
    await post(page,'2024-09-18').getByRole('button',{name:'下一张动态照片'}).click();
    await post(page,'2024-09-18').screenshot({path:`outputs/maque/silver-instagram-charlie-${width}.png`});
  });
}

test('all seven bundled photographs match the recorded original bytes',()=>{
  const manifest=JSON.parse(readFileSync('maque/assets/media-sources.json','utf8'));
  const images=manifest.images.filter((image:any)=>image.source==='Author-uploaded 银硕ins.zip');
  expect(images).toHaveLength(7);
  for(const image of images) expect(createHash('sha256').update(readFileSync('maque/assets/'+image.file)).digest('hex')).toBe(image.sha256);
});
