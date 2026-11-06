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

for(const width of [320,390]) {
  test(`archive icon, index and locked records remain readable within a ${width}px phone`,async({page})=>{
    await page.setViewportSize({width,height:844});
    const errors=await open(page,60);
    const icon=page.locator('#archiveApp img');
    await expect(icon).toHaveAttribute('src',/archive-index-icon\.svg\?v=/);
    await expect.poll(()=>icon.evaluate((image:HTMLImageElement)=>image.complete&&image.naturalWidth>0)).toBe(true);
    expect((await icon.boundingBox())!.width).toBeLessThanOrEqual(46);
    await expect(page.locator('#featureNotice')).toBeHidden({timeout:5000});
    await page.locator('#home').screenshot({path:`outputs/maque/archive-icon-${width}.png`});
    await page.locator('#archiveApp').click();
    await expect(page.locator('.archive-index')).toBeVisible();
    await expect(page.locator('.archive-index .archive-title')).toContainText('未寄出的');
    await expect(page.locator('.archive-folder')).toHaveCount(3);
    await expect(page.locator('[data-chapter="echo"]')).toBeEnabled();
    await expect(page.locator('[data-chapter="second"]')).toBeDisabled();
    await expect(page.locator('#archives')).not.toContainText(/一周目|二周目|上一轮|玩家\s*[AB]/);
    await phoneFits(page,'.archive-index');
    await page.locator('#archives').evaluate(node=>{node.scrollTop=0});
    await page.locator('#archives').screenshot({path:`outputs/maque/archive-index-${width}.png`});
    await page.locator('[data-chapter="echo"]').click();
    await expect(page.locator('#archiveAnswer')).toHaveAttribute('inputmode','numeric');
    await phoneFits(page,'.archive-dossier');
    await page.locator('#archives').evaluate(node=>{node.scrollTop=0});
    await page.locator('#archives').screenshot({path:`outputs/maque/archive-file-${width}.png`});
    expect(errors).toEqual([]);
  });
}

test("the 60 percent archive unlocks on the phone and 01 is found through KakaoTalk and Instagram", async ({ page }) => {
  const errors = await open(page, 60);
  const app = page.locator("#archiveApp");
  await expect(app).toBeVisible();
  await expect(page.locator("#archiveTeaser")).toContainText("RECOVERY INDEX");
  await app.click();
  await page.locator('[data-chapter="echo"]').click();
  await page.getByRole("button", { name: /KakaoTalk · 和成灿确认/ }).click();
  for (let i = 0; i < 11; i++) {
    await expect(page.locator("#sequelNext")).toBeEnabled();
    await page.locator("#sequelNext").click();
  }
  await page.locator('[data-sequel-choice="trust"]').click();
  await page.locator("#sequelBackToArchive").click();
  await page.getByRole("button", { name: /Instagram · 查看他的快拍/ }).click();
  await expect(page.locator(".sequel-story-overlay")).toContainText("01");
  await page.getByRole("button", { name: "关闭快拍" }).click();
  await page.getByRole("button", { name: "回到秘密档案" }).click();
  await page.locator("#archiveAnswer").fill("Black Shadow");
  await page.locator("#archiveSubmit").click();
  await expect(page.locator("#archiveFeedback")).toContainText("还没有对上");
  await page.locator("#archiveAnswer").fill("01");
  await page.locator("#archiveSubmit").click();
  await expect(page.locator("#archives")).toContainText("01 号日志");
  expect(errors).toEqual([]);
});

test("a completed room date reveals no diary until its related archive is actually decrypted",async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem("maque_sequel_v1",JSON.stringify({version:1,dates:["escape"],chapters:{},endings:[],currentEnding:null}));
  });
  const errors=await open(page,80);
  await page.locator("#archiveApp").click();
  await expect(page.locator(".archive-journal")).toHaveCount(0);
  for(const [chapter,answer] of [["echo","01"],["second","02"]]) {
    await page.locator(`[data-chapter="${chapter}"]`).click();
    await expect(page.locator("#archives")).not.toContainText(/一周目|二周目|上一轮|实例|第二个成灿/);
    await page.getByRole("button",{name:/KakaoTalk · 和成灿确认/}).click();
    for(let i=0;i<11;i++) {
      await expect(page.locator("#sequelNext")).toBeEnabled();
      await page.locator("#sequelNext").click();
    }
    await page.locator('[data-sequel-choice="trust"]').click();
    await page.locator("#sequelBackToArchive").click();
    await page.getByRole("button",{name:/Instagram · 查看他的快拍/}).click();
    await page.getByRole("button",{name:"关闭快拍"}).click();
    await page.locator(`[data-sequel-post="${chapter}"]`).getByRole("button",{name:"回到秘密档案"}).click();
    await page.locator("#archiveAnswer").fill(answer);
    await page.locator("#archiveSubmit").click();
    await expect(page.locator(".archive-success")).toBeVisible();
    await page.locator("#archives .sequel-back").click();
    await expect(page.locator(".archive-journal-day")).toHaveCount(chapter==="second"?10:0);
  }
  await expect(page.locator("#archives")).not.toContainText(/一周目|二周目|上一轮|日记模板|稍后补充|第十天是成灿离开房间后的私人回忆/);
  await page.locator('[data-room-journal-day="10"] summary').click();
  await expect(page.locator('[data-room-journal-day="10"]')).toContainText("最后一个字后面");
  expect(errors).toEqual([]);
});
