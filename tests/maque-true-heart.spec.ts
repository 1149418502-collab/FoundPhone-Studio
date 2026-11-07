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
    await page.clock.runFor(400);await expect(page.locator('#loveEnding')).toHaveAttribute('data-phase','impact');
    await expect(page.locator('#loveFinalFlash')).toBeVisible();await expect(page.locator('#loveEndingReturn')).toBeHidden();
    await expect(page.locator('.love-final-vow')).toHaveText('我们生生世世不分离');
    await expect.poll(()=>page.locator('#loveFinalEyes').evaluate((image:HTMLImageElement)=>image.complete&&image.naturalWidth>0)).toBe(true);
    await page.locator('#loveEnding').screenshot({path:`outputs/maque/true-heart-final-impact-${width}.png`,animations:'disabled'});
    await page.clock.runFor(1700);await expect(page.locator('#loveEndingReturn')).toBeVisible();
    await page.locator('#loveEndingReturn').click();
    await expect(page.locator('.sequel-ending h1')).toHaveText('结局 · 「真心」');
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
    await page.clock.runFor(6400);await expect(page.locator('#loveFinalFlash')).toBeVisible();
    for(const selector of ['#loveFinalFlash','.love-final-eye-slit'])await expect(page.locator(selector)).toHaveCSS('animation-name','none');
    await page.clock.runFor(1500);await page.locator('#loveEndingReturn').click();
    await expect(page.locator('.sequel-ending h1')).toContainText('「真心」');expect(errors).toEqual([]);
  });
}

test('restarting the performance clears earlier timers and cannot skip the final hold',async({page})=>{
  await open(page);await play(page);await page.clock.runFor(1200);await play(page);
  await page.keyboard.press('Tab');await expect(page.locator('#loveEnding')).toBeFocused();
  await page.clock.runFor(2500);await expect(page.locator('#loveEnding')).toHaveAttribute('data-phase','memory');
  await expect(page.locator('.love-memory-photo')).toHaveCount(38);
  await page.evaluate('finishLoveEnding()');await expect(page.locator('#loveEnding')).toHaveClass(/show/);
  await expect(page.locator('.sequel-ending')).toHaveCount(0);
  await page.clock.runFor(6000);await page.locator('#loveEndingReturn').click();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('maque_sequel_v1')!).endings)).toEqual(['trueHeart']);
});
