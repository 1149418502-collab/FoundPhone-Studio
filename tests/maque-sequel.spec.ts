import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

const html = readFileSync("maque/index.html", "utf8");
const files = new Set([
  "gift-collection.css",
  "silver-instagram-story.js", "silver-instagram.js", "silver-instagram.css",
  "sequel-story.js", "sequel.js", "sequel.css",
  "date-expansion.js", "date-expansion.css",
  "phone-extras.js", "phone-extras.css",
  "memory-vault.js", "memory-vault.css",
  ...[
    "sungchan-instagram-avatar.jpg",
  "gift-collection.png","date-football-background.jpg","eunseok-instagram-avatar.jpg","eunseok-instagram-20261020-1.jpg","eunseok-instagram-20261006-1.jpg","eunseok-instagram-20261006-2.jpg","eunseok-instagram-20250709-1.jpg","sungchan-instagram-20250817-1.jpg",
    ...["20240510-1","20240621-1","20240621-2","20240903-1","20240918-1","20240918-2","20240921-1"].map(id => "eunseok-instagram-" + id + ".jpg"), "sungchan-football-childhood.jpg",
    "date-escape-background.jpg", "date-escape-eunseok-reference.jpg",
    "date-escape-sungchan-reference.jpg", "date-baseball-background.jpg",
    "date-baseball-couple-1.jpg", "date-baseball-couple-2.jpg",
    "date-idol-background.jpg", "date-idol-reference-1.jpg",
    "date-idol-reference-2.jpg", "dates-icon.svg", "gifts-icon.svg",
    "samsara-icon.svg", "archive-index-icon.svg",
    "launcher-photos.png",
    "launcher-kakao.jpg",
    "launcher-camera.png",
    "launcher-instagram.png",
    "launcher-notes.png",
    "launcher-phone.png",
    "launcher-settings.png",
    "launcher-messages.png",
    "launcher-mail.png",

  ].map((name) => "assets/" + name),
]);

async function open(page: Page, affection = 60) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript((value) => {
    if (localStorage.getItem("maque_sequel_test_initialized")) return;
    for (const version of ["27", "31"])
      localStorage.setItem(`maque_build_${version}_initialized`, "yes");
    localStorage.setItem("maque_affection", String(value));
    localStorage.setItem("maque_gifts_unlocked", "yes");
    localStorage.setItem("maque_sequel_test_initialized", "yes");
  }, affection);
  await page.route("**/maque/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const name = path.slice("/maque/".length);
    if (!name) return route.fulfill({ contentType: "text/html", body: html });
    if (!files.has(name)) return route.abort();
    const contentType = name.endsWith(".js") ? "text/javascript"
      : name.endsWith(".css") ? "text/css"
      : name.endsWith(".svg") ? "image/svg+xml" : "image/jpeg";
    return route.fulfill({ contentType, body: readFileSync("maque/" + name) });
  });
  await page.route("https://images.unsplash.com/**", (route) => route.abort());
  await page.goto("/maque/");
  await page.evaluate("view('home')");
  return errors;
}

async function prepareIdentity(page: Page) {
  await page.getByRole("button", { name: "约会", exact: true }).click();
  await page.getByRole("button", { name: /开始我们的约会之旅/ }).click();
  await page.getByRole("button", { name: "是", exact: true }).click();
  const data = /id="kakao"[\s\S]*?<img[^>]+src="data:image\/jpeg;base64,([^" ]+)/.exec(html)![1];
  await page.locator("#photoImport").setInputFiles({
    name: "我的形象.jpg", mimeType: "image/jpeg", buffer: Buffer.from(data, "base64"),
  });
  await page.locator(".photo-tile").first().click();
  await page.getByRole("button", { name: "使用这张形象", exact: true }).click();
  await expect(page.locator("#dateUploadTitle")).toHaveText("形象已准备好");
  await page.locator("#dateUploadContinue").click();
}

async function phoneFits(page: Page, selector: string) {
  const bounds = await page.locator(".phone").boundingBox();
  expect(bounds).not.toBeNull();
  const content = page.locator(selector);
  const box = await content.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(bounds!.x - 1);
  expect(box!.x + box!.width).toBeLessThanOrEqual(bounds!.x + bounds!.width + 1);
  expect(await content.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
}

test("secret archive is unavailable below 60 percent without disturbing the phone", async ({ page }) => {
  const errors = await open(page, 59);
  await expect(page.locator("#archiveApp")).toBeHidden();
  await expect(page.locator("#archiveTeaser")).toBeHidden();
  await page.getByRole("button", { name: /KaKaoTalk/ }).click();
  await expect(page.locator("#sequelChatEntry")).toBeHidden();
  await expect(page.locator("#kakao")).toHaveClass(/active/);
  expect(errors).toEqual([]);
});

async function enterArchive(page:Page) {
  await page.evaluate('MaqueSequel.openArchives()');
  if(await page.locator('#archiveAnswer').isVisible()) {
    await page.locator('#archiveAnswer').fill('2001');await page.locator('#archiveSubmit').click();
    await expect(page.locator('#archiveLoading')).toContainText('绝密档案开启中');
  }
  await expect(page.locator('.archive-index')).toBeVisible({timeout:5000});
}
async function readChapter(page:Page,id:string,choice='trust') {
  if(!await page.locator('.archive-index').isVisible())await page.locator('#archives .sequel-back').click();
  await page.locator(`[data-chapter="${id}"]`).click();
  await page.getByRole('button',{name:/KakaoTalk · 和成灿确认/}).click();
  const length=await page.evaluate(id=>window.MaqueSequelStory.chapters.find(chapter=>chapter.id===id)!.chat.length,id);
  for(let index=1;index<length;index++) {
    await expect(page.locator('#sequelNext')).toBeEnabled();await page.locator('#sequelNext').click();
  }
  await page.locator(`[data-sequel-choice="${choice}"]`).click();await page.locator('#sequelBackToArchive').click();
  await page.getByRole('button',{name:/Instagram · 查看他的快拍/}).click();
  await page.getByRole('button',{name:'关闭快拍'}).click();
  await page.locator(`[data-sequel-post="${id}"]`).getByRole('button',{name:'回到秘密档案'}).click();
  await page.locator('#archiveRead').click();await expect(page.locator('.archive-success')).toBeVisible();
}

for(const width of [320,390]) {
  test(`classified access, loading, index and database logs fit a ${width}px phone`,async({page})=>{
    await page.setViewportSize({width,height:844});const errors=await open(page,60);
    const icon=page.locator('#archiveApp img');await expect(icon).toHaveAttribute('src',/archive-index-icon\.svg\?v=/);
    expect((await icon.boundingBox())!.width).toBeLessThanOrEqual(46);
    await expect(page.locator('#featureNotice')).toBeHidden({timeout:5000});await page.locator('#archiveApp').click();
    await expect(page.locator('#archiveAnswer')).toHaveAttribute('inputmode','numeric');
    await expect(page.locator('#archiveAnswer')).toHaveAttribute('type','password');
    await expect(page.locator('.archive-index,.archive-log-entry')).toHaveCount(0);
    await phoneFits(page,'.archive-access');
    await page.locator('#archives').screenshot({path:`outputs/maque/archive-access-${width}.png`});
    await page.locator('#archiveAnswer').fill('2001');await page.locator('#archiveSubmit').click();
    await expect(page.locator('#archiveLoading')).toContainText('绝密档案开启中');
    await page.locator('#archives').screenshot({path:`outputs/maque/archive-loading-${width}.png`});
    await expect(page.locator('.archive-index')).toBeVisible({timeout:5000});
    await expect(page.locator('#archives')).toHaveCSS('background-color','rgb(9, 11, 15)');
    await expect(page.locator('.archive-system-status')).toContainText('游戏重置次数');
    await expect(page.locator('.archive-system-status dd')).toHaveText(['2','数据异常','无法修复']);
    await expect(page.locator('.archive-folder')).toHaveCount(3);
    await expect(page.locator('[data-chapter="echo"]')).toBeEnabled();await expect(page.locator('[data-chapter="second"]')).toBeDisabled();
    await phoneFits(page,'.archive-index');await page.locator('#archives').screenshot({path:`outputs/maque/archive-index-${width}.png`});
    await readChapter(page,'echo');await expect(page.locator('.archive-log-entry')).toHaveCount(7);
    await expect(page.locator('.archive-log-stream')).toContainText('进程拒绝结束');
    await expect(page.locator('.archive-log-stream')).toContainText('无法修复');
    await expect(page.locator('.archive-log-stream')).toContainText('█▒∅');
    await phoneFits(page,'.archive-dossier');await phoneFits(page,'.archive-log-stream');
    await page.locator('#archives').evaluate(node=>{node.scrollTop=0});
    await page.locator('#archives').screenshot({path:`outputs/maque/archive-log-${width}.png`});expect(errors).toEqual([]);
  });
}

test('only 2001 opens the archive, and loading does not reveal the database early',async({page})=>{
  const errors=await open(page,60);await page.clock.install();
  await page.evaluate('MaqueSequel.openArchives()');
  for(const wrong of ['01','02','0319','2002']) {
    await page.locator('#archiveAnswer').fill(wrong);await page.locator('#archiveSubmit').click();
    await expect(page.locator('#archiveFeedback')).toContainText('口令不匹配');
    await expect(page.locator('.archive-system-status,.archive-folder,.archive-log-entry')).toHaveCount(0);
  }
  await page.locator('#archiveAnswer').fill('2001');await page.locator('#archiveSubmit').click();
  await expect(page.locator('#archiveLoading')).toHaveAttribute('aria-busy','true');
  await page.clock.runFor(1200);await expect(page.locator('.archive-index')).toHaveCount(0);
  await page.clock.runFor(650);await expect(page.locator('.archive-index')).toBeVisible();
  await page.locator('[data-chapter="echo"]').click();await expect(page.locator('#archiveAnswer')).toHaveCount(0);
  await page.locator('#archiveRead').click();await expect(page.locator('#archiveFeedback')).toContainText('关联记录未核对');
  await expect(page.locator('.archive-log-entry')).toHaveCount(0);expect(errors).toEqual([]);
});

test('leaving an archive load cannot reopen the app or authenticate a later visit',async({page})=>{
  await open(page,60);await page.clock.install();await page.evaluate('MaqueSequel.openArchives()');
  await page.locator('#archiveAnswer').fill('2001');await page.locator('#archiveSubmit').click();
  await page.locator('#archives .sequel-home').click();await page.clock.runFor(2500);
  await expect(page.locator('#home')).toHaveClass(/active/);await page.evaluate('MaqueSequel.openArchives()');
  await expect(page.locator('#archiveAnswer')).toBeVisible();await expect(page.locator('.archive-index')).toHaveCount(0);
});

test('private KakaoTalk access uses the same archive key and returns to the requested conversation',async({page})=>{
  await open(page,60);await page.evaluate('MaqueSequel.openChat("echo")');
  await expect(page.locator('#archiveAnswer')).toBeVisible();await expect(page.locator('#sequelChat')).not.toHaveClass(/active/);
  await page.locator('#archiveAnswer').fill('2001');await page.locator('#archiveSubmit').click();
  await expect(page.locator('#sequelChat')).toHaveClass(/active/,{timeout:5000});
  await expect(page.locator('#sequelChatLog')).toContainText('没发到你那里');
});

test('old solved files and collected endings survive, but the new database still requires the key after reload',async({page})=>{
  await page.addInitScript(()=>{
    if(localStorage.getItem('archive-old-save'))return;localStorage.setItem('archive-old-save','yes');
    localStorage.setItem('maque_sequel_v1',JSON.stringify({version:1,dates:['escape'],endings:['reunion','loop'],chapters:{echo:{solved:true,choice:'trust',cursor:12,storySeen:true},second:{solved:true,choice:'distance',cursor:12,storySeen:true}},announced:60}));
  });
  await open(page,80);await enterArchive(page);
  await expect(page.locator('.archive-ending-link')).toHaveText(['结局 · 明天见','结局 · ∞']);
  await page.locator('[data-chapter="second"]').click();await expect(page.locator('.archive-log-stream')).toContainText('选项强制修改');
  await expect(page.locator('.archive-log-stream')).toContainText('target: Eunseok → null');
  await page.reload();await page.evaluate('MaqueSequel.openArchives()');await expect(page.locator('#archiveAnswer')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('maque_sequel_v1')!));
  expect(saved.chapters.second.choice).toBe('distance');expect(saved.chapters.second.solved).toBe(true);expect(saved.endings).toEqual(['reunion','loop']);
});

test('a completed room date reveals no ten-day journal until its related database block is read',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('maque_sequel_v1',JSON.stringify({version:1,dates:['escape'],chapters:{},endings:[],currentEnding:null})));
  const errors=await open(page,80);await enterArchive(page);await expect(page.locator('.archive-journal')).toHaveCount(0);
  await readChapter(page,'echo');await page.locator('#archives .sequel-back').click();await expect(page.locator('.archive-journal')).toHaveCount(0);
  await readChapter(page,'second');await page.locator('#archives .sequel-back').click();await expect(page.locator('.archive-journal-day')).toHaveCount(10);
  await page.locator('[data-room-journal-day="10"] summary').click();await expect(page.locator('[data-room-journal-day="10"]')).toContainText('最后一个字后面');
  await expect(page.locator('#archives')).not.toContainText(/一周目|二周目|上一轮|日记模板|稍后补充/);expect(errors).toEqual([]);
});

for(const route of [
  {id:'reunion',choice:'trust',final:'reunion',title:'结局 · 明天见'},
  {id:'farewell',choice:'trust',final:'farewell',title:'结局 · 把春天还给你'},
  {id:'suspense',choice:'distance',final:'reunion',title:'结局 · 明日或不再'},
  {id:'loop',choice:'trust',final:'loop',title:'结局 · ∞'}
]) {
  test(`database and social records still reach ${route.id} with the renamed ending`,async({page})=>{
    test.setTimeout(60000);const errors=await open(page,80);await enterArchive(page);
    for(const id of ['echo','second','dawn'])await readChapter(page,id,route.choice);
    await page.locator('#sequelFinale').click();await page.locator(`[data-ending-choice="${route.final}"]`).click();
    await expect(page.locator('.sequel-ending h1')).toHaveText(route.title);
    expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('maque_sequel_v1')!).endings)).toContain(route.id);
    await page.locator('#sequelClosingLetter').click();await page.getByRole('button',{name:'拆开最后的情书'}).click();
    await expect(page.locator('.epilogue-note')).toBeVisible();await expect(page.locator('.epilogue-word')).toHaveText('Samsara');
    expect(errors).toEqual([]);
  });
}
