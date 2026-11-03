import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

const html = readFileSync("maque/index.html", "utf8");
const files = new Set([
  "sequel-story.js", "sequel.js", "sequel.css",
  "date-expansion.js", "date-expansion.css",
  ...[
    "sungchan-instagram-avatar.jpg", "sungchan-football-childhood.jpg",
    "date-escape-background.jpg", "date-escape-eunseok-reference.jpg",
    "date-escape-sungchan-reference.jpg", "date-baseball-background.jpg",
    "date-baseball-couple-1.jpg", "date-baseball-couple-2.jpg",
    "date-idol-background.jpg", "date-idol-reference-1.jpg",
    "date-idol-reference-2.jpg", "dates-icon.svg", "gifts-icon.svg",
    "samsara-icon.svg",
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

test("secret archive is unavailable below 20 percent without disturbing the phone", async ({ page }) => {
  const errors = await open(page, 19);
  await expect(page.locator("#archiveApp")).toBeHidden();
  await page.getByRole("button", { name: /KaKaoTalk/ }).click();
  await expect(page.locator("#sequelChatEntry")).toBeHidden();
  await expect(page.locator("#kakao")).toHaveClass(/active/);
  expect(errors).toEqual([]);
});
