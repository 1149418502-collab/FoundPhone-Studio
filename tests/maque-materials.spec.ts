import { test, expect, type Page } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const html=readFileSync('maque/index.html','utf8');
const modules=new Set(readdirSync('maque').filter(name=>/\.(js|css)$/.test(name)));
const assets=new Set(readdirSync('maque/assets').map(name=>'assets/'+name));
async function open(page:Page,affection=5,dates:string[]=[],owned:string[]=[]) {
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(({affection,dates,owned})=>{
    if(localStorage.getItem('new-materials-test'))return;
    localStorage.setItem('new-materials-test','yes');
    for(const build of ['27','31'])localStorage.setItem(`maque_build_${build}_initialized`,'yes');
    localStorage.setItem('maque_affection',String(affection));
    localStorage.setItem('maque_dates_completed',JSON.stringify(dates));
    localStorage.setItem('maque_owned_gifts',JSON.stringify(owned));
    localStorage.setItem('maque_gifts_unlocked','yes');
    localStorage.setItem('maque_correspondence_v1',JSON.stringify({version:1,personalNote:'旧日常不应出现在游戏里',chapters:{}}));
  },{affection,dates,owned});
  await page.route('**/maque/**',route=>{
    const name=new URL(route.request().url()).pathname.slice('/maque/'.length);
    if(!name)return route.fulfill({contentType:'text/html',body:html});
    if(!modules.has(name)&&!assets.has(name))return route.abort();
    return route.fulfill({contentType:name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.svg')?'image/svg+xml':name.endsWith('.png')?'image/png':'image/jpeg',body:readFileSync('maque/'+name)});
  });
  await page.goto('/maque/');await page.evaluate("view('home')");return errors;
}
async function identity(page:Page) {
  await page.evaluate('albumReady');
  await page.evaluate(async()=>{
    const photo={id:'material-test-identity',src:'./assets/date-baseball-couple-1.jpg',alt:'测试形象'};
    await savePhoto(photo);dateSelectedPhotoId=photo.id;dateJourneyAccepted=true;localStorage.setItem('maque_date_photo_id',photo.id);view('dates');showDateCatalog();
  });
}
async function start(page:Page,name:string) {
  await identity(page);
  await page.getByRole('button',{name:'选择约会场景：'+name,exact:true}).click();
  if(name!=='棒球场')await page.getByRole('button',{name:'开始 / 继续这次约会',exact:true}).click();
}
async function sorted(page:Page) {
  const dates=await page.locator('#insFeed > article').evaluateAll(nodes=>nodes.map(node=>(node as HTMLElement).dataset.publishedOn!));
  expect(dates).toEqual([...dates].sort().reverse());
}

test('the optional twelve-dialogue route is absent from every entry and the ending letter, including old saves',async({page})=>{
  const requests:string[]=[];page.on('request',request=>requests.push(request.url()));
  const errors=await open(page,80,['baseball']);
  await expect(page.locator('#correspondenceEntry,#correspondenceInbox,#correspondenceChat,#correspondencePaper,.cw-entry,.cw-game-entry')).toHaveCount(0);
  for(const screen of ['kakao','game','info']) {
    await page.evaluate(id=>view(id),screen);
    await expect(page.locator('#'+screen)).not.toContainText(/日常往来|0\s*\/\s*12/);
  }
  await identity(page);await expect(page.locator('#dateCatalog')).not.toContainText(/多聊一会儿|日常往来/);
  await page.evaluate('MaquePhoneExtras.openNotes()');await expect(page.locator('#phoneNotes')).not.toContainText(/日常往来|段往来/);
  await page.evaluate('MaqueSequel.finishDiaryEnding()');
  await page.locator('#sequelClosingLetter').click();await page.getByRole('button',{name:'拆开最后的情书'}).click();
  await expect(page.locator('.epilogue-note')).toBeVisible();await expect(page.locator('.epilogue-note')).not.toContainText('旧日常不应出现在游戏里');
  expect(requests.some(url=>url.includes('correspondence'))).toBe(false);
  expect(await page.evaluate(()=>localStorage.getItem('maque_affection'))).toBe('80');expect(errors).toEqual([]);
});

test('all fifteen shop images and the chat gift picker share one complete still-life collection',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  const errors=await open(page,80,['baseball'],['签名足球','双层芝士汉堡']);
  await page.evaluate("openApp('gifts')");
  await expect(page.locator('.gift-card .gift-photo-set')).toHaveCount(15);
  const frames=await page.locator('.gift-card .gift-photo-set').evaluateAll(nodes=>nodes.map(node=>({tile:(node as HTMLElement).dataset.giftTile,image:getComputedStyle(node).backgroundImage,position:getComputedStyle(node).backgroundPosition,width:node.getBoundingClientRect().width,height:node.getBoundingClientRect().height})));
  expect(new Set(frames.map(frame=>frame.image)).size).toBe(1);
  expect(frames[0].image).toContain('gift-collection.png');expect(frames.map(frame=>Number(frame.tile))).toEqual(Array.from({length:15},(_,index)=>index));
  for(const frame of frames)expect(Math.abs(frame.width-frame.height)).toBeLessThan(1);
  await page.evaluate(async()=>{const image=new Image();image.src='./assets/gift-collection.png';await image.decode();});
  await expect(page.locator('#featureNotice')).toBeHidden({timeout:8000});
  await page.locator('#gifts').screenshot({path:'outputs/maque/gifts-unified-390.png'});
  await page.evaluate("openApp('kakao')");await page.locator('#chatGiftButton').click();
  for(const [name,tile] of [['签名足球','11'],['双层芝士汉堡','10']]) {
    const thumb=page.locator('.chat-gift-choice').filter({hasText:name}).locator('.gift-photo-set');
    await expect(thumb).toHaveAttribute('data-gift-tile',tile);
    await expect(thumb).toHaveCSS('background-position',frames[Number(tile)].position);
  }
  await page.locator('#giftPicker .dialog').screenshot({path:'outputs/maque/gift-picker-unified-390.png'});
  expect(await page.locator('#gifts img[src*="unsplash"]').count()).toBe(0);expect(errors).toEqual([]);
});

test('the supplied football background appears in the scene, journey and finale while the childhood photograph stays in its story beat',async({page})=>{
  await page.setViewportSize({width:390,height:844});const errors=await open(page);await identity(page);
  const scene=page.getByRole('button',{name:'选择约会场景：足球校园',exact:true});
  await expect(scene.locator('.scene-art img')).toHaveAttribute('src','./assets/date-football-background.jpg');
  await scene.click();await page.getByRole('button',{name:'开始 / 继续这次约会',exact:true}).click();
  await expect(page.locator('.extra-date-visual img')).toHaveAttribute('src','./assets/date-football-background.jpg');
  await page.locator('#extraDateNext').click();await page.locator('[data-choice="pass"]').click();await page.locator('#extraDateNext').click();
  await page.locator('#extraDateBall').click();await page.locator('#extraDateNext').click();await page.locator('#extraDateNext').click();
  await page.locator('[data-choice="childhood"]').click();await page.locator('#extraDateNext').click();
  await expect(page.locator('.extra-date-memories img')).toHaveAttribute('src','./assets/sungchan-football-childhood.jpg');
  await page.locator('#extraDateNext').click();await page.locator('[data-choice="hand"]').click();await page.locator('#extraDateNext').click();
  await expect(page.locator('#extraDateResult .extra-date-memories img')).toHaveAttribute('src','./assets/date-football-background.jpg');
  await expect(page.locator('.extra-memory-label')).toHaveText('我和成灿的足球校园合影');
  await page.locator('#dates').evaluate(node=>{node.scrollTop=0});await page.locator('#dates').screenshot({path:'outputs/maque/football-materials-390.png'});
  await page.evaluate("openApp('instagram')");await expect(page.locator('[data-extra-date-post="football"] .ins-post-image')).toHaveAttribute('src','./assets/date-football-background.jpg');
  await sorted(page);expect(errors).toEqual([]);
});

test('the baseball pair automatically publishes after Sungchan and is sorted by its provided date without duplicates',async({page})=>{
  const errors=await open(page);await page.evaluate("openApp('instagram')");
  await expect(page.locator('[data-authored-post="eunseok-2026-10-06"]')).toHaveCount(0);
  await expect(page.locator('[data-authored-post="eunseok-2026-10-20"]')).toHaveCount(1);
  await start(page,'棒球场');await page.evaluate("openApp('instagram')");
  const own=page.locator('[data-authored-post="eunseok-2026-10-06"]');
  await expect(own.locator('.silver-post-caption')).toHaveText('오늘 잘 즐기다 왔다 ~');
  await expect(own.locator('.ins-post-image')).toHaveAttribute('src','./assets/eunseok-instagram-20261006-1.jpg');
  await own.getByRole('button',{name:'下一张动态照片'}).click();await expect(own.locator('.ins-post-image')).toHaveAttribute('src','./assets/eunseok-instagram-20261006-2.jpg');
  const sequence=await page.locator('#insFeed > article').evaluateAll(nodes=>nodes.map(node=>(node as HTMLElement).dataset.authoredPost||(node as HTMLElement).dataset.scene));
  expect(sequence.indexOf('eunseok-2026-10-20')).toBeLessThan(sequence.indexOf('eunseok-2026-10-06'));
  expect(sequence.indexOf('eunseok-2026-10-06')).toBeLessThan(sequence.indexOf('baseball'));
  await page.reload();await page.evaluate("openApp('instagram')");await expect(own).toHaveCount(1);await expect(page.locator('[data-scene="baseball"]')).toHaveCount(1);
  await sorted(page);expect(errors).toEqual([]);
});

test('idol materials publish my July post before his August post and both supplied comments persist',async({page})=>{
  await page.setViewportSize({width:390,height:844});const errors=await open(page);await start(page,'一日爱豆');
  await page.locator('#extraDateNext').click();await page.locator('[data-choice="water"]').click();await page.locator('#extraDateNext').click();
  for(const move of ['breathe','raise','turn'])await page.locator(`[data-move="${move}"]`).click();
  await page.locator('#extraDateNext').click();await page.locator('#extraDateNext').click();await page.locator('[data-choice="sungchan"]').click();await page.locator('#extraDateNext').click();
  await expect(page.locator('.extra-date-memories img')).toHaveCount(2);
  await expect(page.locator('.extra-date-memories img').first()).toHaveAttribute('src','./assets/eunseok-instagram-20250709-1.jpg');
  await page.evaluate("openApp('instagram')");
  await expect(page.locator('[data-authored-post="eunseok-2025-07-09"] .silver-post-caption')).toHaveText('成璨nim康桑哈密哒');
  await expect(page.locator('[data-authored-post="sungchan-2025-08-17"]')).toHaveCount(0);
  await page.evaluate("view('dates');MaqueExtraDates.start('idol')");await page.locator('#extraDateNext').click();await page.locator('[data-choice="name"]').click();await page.locator('#extraDateNext').click();
  await page.getByRole('button',{name:'看看他的 Instagram 日记 ↗'}).click();
  const theirs=page.locator('[data-authored-post="sungchan-2025-08-17"]');
  await expect(theirs.locator('.silver-post-caption')).toHaveText('和一位很害羞的男粉一起');
  await expect(theirs.locator('.ins-post-image')).toHaveAttribute('src','./assets/sungchan-instagram-20250817-1.jpg');
  const published=await page.evaluate(()=>JSON.parse(localStorage.getItem('maque_silver_instagram_v1')!).announced);
  expect(published.indexOf('eunseok-2025-07-09')).toBeLessThan(published.indexOf('sungchan-2025-08-17'));
  await theirs.getByRole('button',{name:'评论这条动态'}).click();
  for(const text of ['康桑哈密达！','我是夫熙俊'])await theirs.getByRole('button',{name:'评论：'+text,exact:true}).click();
  await expect(theirs.locator('.authored-comment')).toHaveCount(2);
  await page.reload();await page.evaluate("openApp('instagram')");
  await expect(theirs.locator('.authored-comment')).toHaveCount(2);await expect(theirs.locator('.authored-comment b')).toHaveText(['eunseok','eunseok']);
  await expect(theirs.locator('.authored-comment')).toContainText(['康桑哈密达！','我是夫熙俊']);
  await expect(page.locator('[data-extra-date-post="idol"]')).toHaveCount(0);await sorted(page);
  expect(await page.evaluate(()=>localStorage.getItem('maque_affection'))).toBe('25');
  await theirs.scrollIntoViewIfNeeded();
  await expect(theirs.locator('.ins-post-image')).toBeVisible();
  await expect.poll(()=>theirs.locator('.ins-post-image').evaluate((image:HTMLImageElement)=>image.complete&&image.naturalWidth>0)).toBe(true);
  await theirs.screenshot({path:'outputs/maque/idol-authored-post-comments-390.png'});expect(errors).toEqual([]);
});

test('my supplied Instagram avatar stays independent from the date identity and all uploaded originals retain their checksums',async({page})=>{
  await open(page);await identity(page);await page.evaluate("openApp('instagram')");
  await expect(page.locator('#insSilverStoryAvatar')).toHaveAttribute('src','./assets/eunseok-instagram-avatar.jpg');
  for(const image of await page.locator('.silver-profile-post .ins-post-header img').all())await expect(image).toHaveAttribute('src','./assets/eunseok-instagram-avatar.jpg');
  await expect(page.locator('#insStoryAvatar')).toHaveAttribute('src','./assets/sungchan-instagram-avatar.jpg');
  const manifest=JSON.parse(readFileSync('maque/assets/media-sources.json','utf8'));
  const images=manifest.images.filter((image:any)=>image.source==='Author-uploaded 新素材.zip');expect(images).toHaveLength(7);
  for(const image of images)expect(createHash('sha256').update(readFileSync('maque/assets/'+image.file)).digest('hex')).toBe(image.sha256);
});
