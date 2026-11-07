import { test, expect, type Page } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const html=readFileSync('maque/index.html','utf8');
const modules=new Set(readdirSync('maque').filter(file=>/\.(js|css)$/.test(file)));
const assets=new Set(readdirSync('maque/assets').map(file=>'assets/'+file));
const raw=readFileSync('maque/true-heart-story.js','utf8');
const story=JSON.parse(raw.slice(raw.indexOf('{'),raw.lastIndexOf('}')+1));
async function open(page:Page) {
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{
    for(const version of ['27','31'])localStorage.setItem(`maque_build_${version}_initialized`,'yes');
    localStorage.setItem('maque_affection','80');localStorage.setItem('maque_dates_completed','["baseball"]');
    localStorage.setItem('maque_gifts_unlocked','yes');
  });
  await page.route('**/maque/**',route=>{
    const name=new URL(route.request().url()).pathname.slice('/maque/'.length);
    if(!name)return route.fulfill({contentType:'text/html',body:html});
    if(!modules.has(name)&&!assets.has(name))return route.abort();
    const contentType=name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.svg')?'image/svg+xml':name.endsWith('.png')?'image/png':'image/jpeg';
    return route.fulfill({contentType,body:readFileSync('maque/'+name)});
  });
  await page.goto('/maque/');await page.evaluate("view('home')");
  await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));
  return errors;
}
async function play(page:Page) {
  await page.evaluate('showLoveEnding()');
  await expect(page.locator('#loveEnding')).toHaveAttribute('data-phase','memory');
}

test('all seventeen uploaded originals are assigned to the ending and retain their exact bytes',()=>{
  const uploaded=story.photos.filter((photo:any)=>photo.source?.archive==='20261107-201534.zip');
  expect(uploaded).toHaveLength(17);expect(story.photos).toHaveLength(19);
  expect(new Set(story.photos.map((photo:any)=>photo.src)).size).toBe(19);
  expect(uploaded.map((photo:any)=>photo.source.file)).toEqual(Array.from({length:17},(_,index)=>`IMG_${9920+index}.JPG`));
  for(const photo of uploaded) {
    const bytes=readFileSync('maque/'+photo.src.replace(/^\.\//,''));
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(photo.source.sha256);
    expect(photo.width).toBeGreaterThan(0);expect(photo.height).toBeGreaterThan(0);
  }
  expect(story.finalEyes.src).toBe('./assets/date-escape-background.jpg');
});

for(const [width,height] of [[320,844],[390,844],[1440,900]]) {
  test(`the full photo flood, blackout and threatening final message fit ${width}px`,async({page})=>{
    await page.setViewportSize({width,height});const errors=await open(page);await play(page);
    const photos=page.locator('.love-memory-photo');await expect(photos).toHaveCount(38);
    const sources=await photos.evaluateAll(nodes=>[...new Set(nodes.map(node=>node.getAttribute('src')))]);
    expect(sources).toEqual(story.photos.map((photo:any)=>photo.src));
    await expect.poll(()=>photos.evaluateAll(nodes=>nodes.every(node=>(node as HTMLImageElement).complete&&(node as HTMLImageElement).naturalWidth>0))).toBe(true);
    const ratios=await photos.evaluateAll(nodes=>nodes.map(node=>{
      const image=node as HTMLImageElement,style=getComputedStyle(image);
      const width=parseFloat(style.width)-parseFloat(style.borderLeftWidth)-parseFloat(style.borderRightWidth);
      const height=parseFloat(style.height)-parseFloat(style.borderTopWidth)-parseFloat(style.borderBottomWidth);
      return {fit:style.objectFit,ratio:width/height,natural:image.naturalWidth/image.naturalHeight};
    }));
    for(const photo of ratios){expect(photo.fit).toBe('contain');expect(Math.abs(photo.ratio-photo.natural)).toBeLessThan(.025);}
    await page.clock.runFor(2500);await expect(page.locator('#loveEndingRedline')).toBeVisible();
    await page.locator('#loveEnding').screenshot({path:`outputs/maque/true-heart-photo-flood-${width}.png`,animations:'disabled'});
    await page.clock.runFor(1000);await expect(page.locator('#loveEnding')).toHaveAttribute('data-phase','typing');
    await expect(photos).toHaveCount(0);await page.clock.runFor(2400);
    await expect(page.locator('.love-typed-row')).toHaveCount(34);
    expect(await page.locator('#loveTypingScreen').evaluate(node=>node.scrollHeight>node.clientHeight)).toBe(true);
    await page.locator('#loveEnding').screenshot({path:`outputs/maque/true-heart-type-flood-${width}.png`,animations:'disabled'});
    await page.clock.runFor(170);await expect(page.locator('#loveEnding')).toHaveAttribute('data-phase','silence');
    await expect(page.locator('#loveFinalFlash')).toBeHidden();
    await page.clock.runFor(400);await expect(page.locator('#loveEnding')).toHaveAttribute('data-phase','obsession');
    await expect(page.locator('.love-thread-poem p').first()).toHaveText(story.redThreadPoem[0]);
    await page.clock.runFor(5000);
    await expect(page.locator('.love-thread-poem p')).toHaveText([...story.redThreadPoem,story.obsession]);
    await page.locator('#loveEnding').screenshot({path:`outputs/maque/true-heart-roses-time-${width}.png`,animations:'disabled'});
    await page.clock.runFor(1800);await expect(page.locator('#loveEnding')).toHaveAttribute('data-phase','impact');
    await expect(page.locator('#loveFinalFlash')).toBeVisible();await expect(page.locator('#loveEndingReturn')).toBeHidden();
    await expect(page.locator('.love-final-vow')).toHaveText('我们生生世世不分离');
    await expect.poll(()=>page.locator('#loveFinalEyes').evaluate((image:HTMLImageElement)=>image.complete&&image.naturalWidth>0)).toBe(true);
    await page.locator('#loveEnding').screenshot({path:`outputs/maque/true-heart-final-impact-${width}.png`,animations:'disabled'});
    await page.clock.runFor(1700);await expect(page.locator('#loveEndingReturn')).toBeVisible();
    await page.locator('#loveEndingReturn').click();
    await expect(page.locator('.sequel-epilogue .letter-for-you')).toHaveText('写给你的信件');
    await expect(page.locator('.letter-light-particles i')).toHaveCount(128);
    await page.clock.runFor(2800);await page.locator('#openClosingLetter').click();await page.clock.runFor(1200);
    await expect(page.locator('.epilogue-note')).toBeVisible();
    await expect(page.locator('.epilogue-salutation')).toHaveText('给看到这里的你：');
    expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('maque_sequel_v1')!).endings)).toEqual(['trueHeart']);
    await page.clock.runFor(10000);await expect(page.locator('#loveEnding')).not.toHaveClass(/show/);
    expect(errors).toEqual([]);
  });
}

for(const mode of ['device','setting']) {
  test(`reduced motion via ${mode} keeps every source photo and the same ending`,async({page})=>{
    const errors=await open(page);
    if(mode==='device')await page.emulateMedia({reducedMotion:'reduce'});
    else {await page.evaluate('MaquePhoneExtras.openSettings()');await page.getByRole('checkbox',{name:'减少动态效果'}).check();}
    await play(page);await expect(page.locator('.love-memory-photo')).toHaveCount(19);
    const sources=await page.locator('.love-memory-photo').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('src')));
    expect(sources).toEqual(story.photos.map((photo:any)=>photo.src));
    await page.clock.runFor(13200);await expect(page.locator('#loveFinalFlash')).toBeVisible();
    for(const selector of ['#loveFinalFlash','.love-final-eye-slit'])await expect(page.locator(selector)).toHaveCSS('animation-name','none');
    await page.clock.runFor(1500);await page.locator('#loveEndingReturn').click();
    await expect(page.locator('.letter-for-you')).toHaveText('写给你的信件');expect(errors).toEqual([]);
  });
}

test('restarting the performance clears earlier timers and cannot skip the final hold',async({page})=>{
  await open(page);await play(page);await page.clock.runFor(1200);await play(page);
  await page.keyboard.press('Tab');await expect(page.locator('#loveEnding')).toBeFocused();
  await page.clock.runFor(2500);await expect(page.locator('#loveEnding')).toHaveAttribute('data-phase','memory');
  await expect(page.locator('.love-memory-photo')).toHaveCount(38);
  await page.evaluate('finishLoveEnding()');await expect(page.locator('#loveEnding')).toHaveClass(/show/);
  await expect(page.locator('.sequel-ending')).toHaveCount(0);
  await page.clock.runFor(13000);await page.locator('#loveEndingReturn').click();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('maque_sequel_v1')!).endings)).toEqual(['trueHeart']);
});

test('the letter gathers light before it opens and shows the complete author letter at phone width',async({page})=>{
  await page.setViewportSize({width:390,height:844});await open(page);await page.clock.runFor(5000);
  await page.evaluate('MaqueSequel.finishDiaryEnding()');
  await expect(page.locator('[data-ending-animation]')).toHaveAttribute('data-ending-animation','reunion');
  await page.locator('#sequelClosingLetter').click();
  await expect(page.locator('.letter-light-particles i')).toHaveCount(128);
  await expect(page.locator('#openClosingLetter')).toBeDisabled();
  await expect(page.locator('.epilogue-note')).toBeHidden();
  await page.clock.runFor(2800);await expect(page.locator('#openClosingLetter')).toBeEnabled();
  await page.locator('#archives').screenshot({path:'outputs/maque/closing-letter-envelope-390.png',animations:'disabled'});
  await page.locator('#openClosingLetter').click();await expect(page.locator('.letter-formation')).toHaveAttribute('data-phase','opening');
  await expect(page.locator('.epilogue-note')).toBeHidden();await page.clock.runFor(1200);
  await expect(page.locator('.letter-formation')).toHaveAttribute('data-phase','opened');await expect(page.locator('.epilogue-note')).toBeVisible();
  await expect(page.locator('.epilogue-salutation')).toHaveText('给看到这里的你：');
  await expect(page.locator('.epilogue-letter-body')).toHaveText(['谢谢你花时间读完这个故事。','爱和记忆本身就是无解的莫比乌斯环，向前还是向后，都可以开展新的故事和结局。','我一直相信，爱会创造奇迹，无论结局如何，爱都真实存在过。']);
  await expect(page.locator('.epilogue-signature')).toHaveText('----再次，与你');
  await page.locator('.epilogue-note').screenshot({path:'outputs/maque/closing-letter-open-390.png',animations:'disabled'});
  expect(await page.locator('#archives').evaluate(node=>node.scrollWidth<=node.clientWidth)).toBe(true);
});
