import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

const html = readFileSync("maque/index.html", "utf8");
const localModules = new Set([
  "silver-instagram-story.js", "silver-instagram.js", "silver-instagram.css",
  "sequel-story.js",
  "sequel.js",
  "sequel.css",
  "date-expansion.js",
  "date-expansion.css",
  "correspondence-story.js", "correspondence.js", "correspondence.css",
  "phone-extras.js", "phone-extras.css",
  "memory-vault.js",
  "memory-vault.css",
]);
const localAssets = new Set([
  "sungchan-instagram-avatar.jpg",
  ...["20240510-1","20240621-1","20240621-2","20240903-1","20240918-1","20240918-2","20240921-1"].map(id => "eunseok-instagram-" + id + ".jpg"),
  "locked-heart-vault.png",
  "sungchan-football-childhood.jpg",
  "date-escape-background.jpg",
  "date-escape-eunseok-reference.jpg",
  "date-escape-sungchan-reference.jpg",
  "date-baseball-background.jpg",
  "date-baseball-couple-1.jpg",
  "date-baseball-couple-2.jpg",
  "date-idol-background.jpg",
  "date-idol-reference-1.jpg",
  "date-idol-reference-2.jpg",
  "dates-icon.svg",
  "gifts-icon.svg",
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

]);
const special = "「真心」";
const gifts = [
  ["郁金香花束", "放在显眼的地方"],
  ["红玫瑰", "藏在花里的心意"],
  ["草莓奶油蛋糕", "第一口让给你"],
  ["软绵绵玩偶", "给它起个名字"],
  ["冰美式", "刚好想喝点冰的"],
  ["无线耳机", "第一首听什么"],
  ["柔软围巾", "脖子也能暖暖的"],
  ["手写日记本", "第一页就写今天"],
  ["香氛蜡烛", "睡觉前一定会熄灭"],
  ["手作曲奇礼盒", "忍不住又拿了一块"],
  ["双层芝士汉堡", "平时不知道吃什么的时候就会选汉堡"],
  ["签名足球", "从很小的时候就开始踢了"],
  ["明星球衣", "从小就一直踢球"],
];
async function open(page: Page, affection = 0, owned: string[] = [], completedDates: string[] = []) {
  await page.addInitScript(
    ({ affection, owned, completedDates }) => {
      // Keep the existing one-time build migration from deleting this test save.
      if (!localStorage.getItem("maque_test_initialized")) {
        for (const version of ["27", "31"])
          localStorage.setItem(`maque_build_${version}_initialized`, "yes");
        localStorage.setItem("maque_affection", String(affection));
        localStorage.setItem("maque_owned_gifts", JSON.stringify(owned));
        localStorage.setItem("maque_dates_completed", JSON.stringify(completedDates));
        localStorage.setItem("maque_gifts_unlocked", "yes");
        localStorage.setItem("maque_test_initialized", "yes");
      }
    },
    { affection, owned, completedDates },
  );
  await page.route("**/maque/", (route) =>
    route.fulfill({ contentType: "text/html", body: html }),
  );
  await page.route("**/maque/*", (route) => {
    const name = new URL(route.request().url()).pathname.slice(
      "/maque/".length,
    );
    if (!localModules.has(name)) return route.fallback();
    return route.fulfill({
      contentType: name.endsWith(".css") ? "text/css" : "text/javascript",
      body: readFileSync("maque/" + name),
    });
  });
  await page.route("**/maque/assets/*", (route) => {
    const path = new URL(route.request().url()).pathname;
    const name = path.slice("/maque/assets/".length);
    if (!localAssets.has(name)) return route.abort();
    return route.fulfill({
      contentType: name.endsWith(".svg") ? "image/svg+xml" : name.endsWith(".png") ? "image/png" : "image/jpeg",
      body: readFileSync("maque/assets/" + name),
    });
  });
  await page.route("https://images.unsplash.com/**", (route) => route.abort());
  await page.goto("/maque/");
  // Begin from a returning player's unlocked phone; interact with real controls below.
  await page.evaluate("view('home')");
}
async function chat(page: Page) {
  await page.getByRole("button", { name: /KaKaoTalk/ }).click();
}
async function buy(page: Page, name: string) {
  await page.evaluate("openApp('gifts')");
  await page
    .locator(".gift-card")
    .filter({ has: page.locator("b", { hasText: name }) })
    .getByRole("button")
    .click();
  await page.locator("#giftConfirmButton").click();
}
async function send(page: Page, name: string) {
  await page.locator("#chatGiftButton").click();
  await page.locator(".chat-gift-choice").filter({ hasText: name }).click();
}
async function advance(page: Page, count: number) {
  for (let i = 0; i < count; i++)
    await page.locator("#chatarea").click({ position: { x: 8, y: 8 } });
}

async function finishGiftConversation(page: Page) {
  const count = await page.evaluate(
    "ordinaryGiftDialogue[pendingOrdinaryGiftName].length - (ordinaryGiftDialogue[pendingOrdinaryGiftName].some(line => line[0] === 'sys') ? 1 : 0)",
  );
  expect(count).toBeGreaterThanOrEqual(7);
  await advance(page, count);
}

const avatarData =
  /id="kakao"[\s\S]*?<img[^>]+src="data:image\/jpeg;base64,([^" ]+)/.exec(
    html,
  )![1];
const albumFile = {
  name: "我的形象.jpg",
  mimeType: "image/jpeg",
  buffer: Buffer.from(avatarData, "base64"),
};
async function seedGamePhotoAlbum(page: Page) {
  await page.evaluate(`(() => {
    const photo = {id:"test-game-photo", name:"游戏相册照片.jpg", src:"./assets/sungchan-instagram-avatar.jpg", alt:"游戏相册测试素材", importedAt:"2026-01-01T00:00:00Z", takenAt:"2026-01-01T00:00:00Z", favorite:false, width:1280, height:1280, bytes:1000, type:"image/jpeg"};
    mediaAssets.album.splice(0, mediaAssets.album.length, photo);
    photoRecords.set(photo.id, photo);
  })()`);
}
async function prepareDateJourney(page: Page) {
  await page.evaluate("albumReady");
  await seedGamePhotoAlbum(page);
  if (await page.locator("#dateCatalog").isVisible()) return;
  await page.getByRole("button", { name: /开始我们的约会之旅/ }).click();
  await page.getByRole("button", { name: "是", exact: true }).click();
  await expect(page.locator("#photos")).toBeVisible();
  await expect(page.locator("#photoPickerCaption")).toHaveText(
    "从游戏相册选择我的形象",
  );
  await expect(page.locator(".photos-add")).toBeHidden();
  await expect(page.locator(".photos-import-button")).toBeHidden();
  await expect(page.locator("#photoImport")).toBeDisabled();
  await expect(page.locator(".photo-tile")).toHaveCount(1);
  await page.locator(".photo-tile").first().click();
  await page.getByRole("button", { name: "使用这张形象", exact: true }).click();
  await expect(page.locator("#dateUploadTitle")).toHaveText("形象已准备好");
  await page.locator("#dateUploadContinue").click();
}

async function finishBaseballDate(
  page: Page,
  cheerChoice: string,
  kisscamChoice: string,
) {
  const before = await page.evaluate(() =>
    Number(localStorage.getItem("maque_affection")),
  );
  await page.evaluate("openApp('dates')");
  await prepareDateJourney(page);
  await page
    .getByRole("button", { name: "选择约会场景：棒球场", exact: true })
    .click();
  await page.locator("#dateDetail .date-primary").click();
  await expect(page.locator("#dateArrivalStart")).toBeVisible();
  await expect(page.locator("#dateDetail")).toContainText("两张球票");
  await expect(page.locator(".date-player-chip img")).toHaveAttribute(
    "src",
    "./assets/sungchan-instagram-avatar.jpg",
  );
  await page.locator("#dateArrivalStart").click();
  await expect(page.locator(".date-story-label")).toHaveText("EUNSEOK / 我");
  await expect(page.locator(".date-story-cn")).toContainText(
    "今天本来只是约好",
  );
  await page.locator("#dateDetail .date-primary").click();
  await page.locator("#dateDetail .date-primary").click();
  await expect(page.locator("#dateLuckyAccept")).toBeVisible();
  await expect(page.locator(".lucky-invitation")).toContainText("幸运观众");
  await page.locator("#dateLuckyAccept").click();
  await page.getByRole("button", { name: new RegExp(cheerChoice) }).click();
  await expect(page.locator("#dateDetail .date-story-cn")).toContainText(
    cheerChoice.startsWith("我会") ? "旁边笑一笑" : "和你一起呼吸",
  );
  await page.locator("#dateDetail .date-primary").click();
  await page.locator("#datePitchThrow").click();
  await expect(page.locator("#datePitchThrow")).toBeHidden();
  await expect(page.locator("#dateKissChoices")).toBeVisible();
  await page.locator("#dates").screenshot({
    path: "outputs/maque/baseball-kisscam.png",
  });
  await page
    .locator("#dateKissChoices")
    .getByRole("button", { name: new RegExp(kisscamChoice) })
    .click();
  await expect(page.locator("#dateDetail .date-story-cn")).toContainText(
    kisscamChoice === "轻轻靠近他" ? "我现在只看得见你" : "不太想松手",
  );
  await page.locator("#dateDetail .date-primary").click();
  await page.locator("#dateDetail .date-primary").click();
  expect(
    await page.evaluate(() => Number(localStorage.getItem("maque_affection"))),
  ).toBe(before);
  await page.locator("#dateDetail .date-primary").click();
  await expect(
    page.getByRole("button", { name: /去看看成灿的 Instagram/ }),
  ).toBeVisible();
  const finaleImages = page.locator(".date-result-image");
  await expect(finaleImages).toHaveCount(2);
  for (let i = 0; i < 2; i++) {
    const image = finaleImages.nth(i);
    await expect(image).toHaveAttribute(
      "src",
      `./assets/date-baseball-couple-${i + 1}.jpg`,
    );
    await expect
      .poll(() =>
        image.evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
        ),
      )
      .toBe(true);
  }
  await page.locator("#dates").screenshot({
    path: "outputs/maque/baseball-finale.png",
  });
}

test("invitation notification and SMS preserve the Black Shadow clue", async ({
  page,
}) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await open(page);
  await page.evaluate("pin='0319';unlock()");
  await page.clock.fastForward(650);
  await expect(page.locator("#noticebody")).toContainText("Black Shadow");
  await page.locator("#notice").click();
  await expect(page.locator("#sms")).toHaveClass(/active/);
  await expect(page.locator("#sms .bubble").first()).toContainText(
    "Black Shadow",
  );
  await expect(page.locator("#sms .bubble").first()).not.toContainText(
    "亲爱的宋银硕",
  );
});

test("character generation shows a two-second loading state before Sungchan's message", async ({ page }) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await open(page);
  await page.evaluate("beginRegistration()");
  await page.locator("#nameinput").fill("郑成灿");
  await page.getByRole("button", { name: "确认", exact: true }).click();
  await expect(page.locator("#confirmed")).toHaveClass(/show/);
  await expect(page.locator("#confirmtext")).toContainText("正在生成角色档案");
  await page.clock.fastForward(1999);
  await expect(page.locator("#confirmtext")).toContainText("正在生成角色档案");
  await page.clock.fastForward(1);
  await expect(page.locator("#confirmtext")).toContainText("我是为了你才出现的");
});

test("food refusal retracts at 500ms and the second retraction still reveals the red text", async ({
  page,
}) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await open(page);
  await chat(page);
  await advance(page, 4);
  const refuse = page.getByRole("button", { name: "我不想说", exact: true });
  await refuse.click();
  await refuse.click(); // Pending retraction ignores a second tap.
  await page.clock.fastForward(499);
  await expect(page.locator("#chatarea .chatrow.me").last()).toContainText(
    "我不想说",
  );
  await expect(page.locator("#chatarea .system-bubble")).toHaveCount(0);
  await page.clock.fastForward(1);
  await expect(page.locator("#chatarea .system-bubble")).toHaveText(
    "消息已撤回",
  );
  await expect(page.locator("#redSecret")).not.toHaveClass(/show/);
  await refuse.click();
  await page.clock.fastForward(499);
  await expect(page.locator("#chatarea .system-bubble")).toHaveCount(1);
  await page.clock.fastForward(1);
  await expect(page.locator("#chatarea .system-bubble")).toHaveCount(2);
  await expect(page.locator("#redSecret")).toHaveClass(/show/);
  await expect(page.locator("#redSecret")).toHaveText("亲爱的 不要口是心非");
  await page.clock.fastForward(1000);
  await page.getByRole("button", { name: "今天吃了蒸饺", exact: true }).click();
  await expect(page.locator("#chatarea .chatrow.me").last()).toContainText(
    "今天吃了蒸饺",
  );
  await expect(page.locator("#replyChoices")).toHaveCount(0);
});

test("hamburger follows the supplied dialogue, gifts after three messages, and rewards at the end", async ({
  page,
}) => {
  const lines = [
    "吃过饭了吗？",
    "我刚才吃了这个",
    "是最近人气很高店来着",
    "赠送给 郑成灿 · 双层芝士汉堡",
    "啊 是汉堡",
    "这是我很喜欢的食物！",
    "平时不知道吃什么的时候就会选汉堡",
    "谢谢你呀 完全是我的口味",
    "你喜欢就好",
    "本来还有点担心你会不会喜欢这个……",
    "我很喜欢呀",
    "不过我平时吃的那家店也很不错 店里还有草莓奶昔搭配的套餐",
    "下次我们一起去店里吃吧？",
    "好啊 不过薯条也别忘记",
    "没问题",
    "吃完我们一起去散步好吗？",
    "我们可以聊聊你喜欢的食物",
    "我还想和你一起吃很多次饭",
  ];
  await open(page, 0, ["双层芝士汉堡"]);
  await chat(page);
  await page.evaluate("Math.random=()=>0");
  await send(page, "双层芝士汉堡");
  for (let i = 0; i < lines.length; i++) {
    if (i > 0) await advance(page, 1);
    await expect(page.locator("#chatarea .chatrow").last()).toContainText(
      lines[i],
    );
    await expect(page.locator("#chatarea .system-bubble")).toHaveCount(
      i < 3 ? 0 : 1,
    );
    expect(
      await page.evaluate(() =>
        Number(localStorage.getItem("maque_affection")),
      ),
    ).toBe(i === lines.length - 1 ? 3 : 0);
  }
  await expect(page.locator("#chatGiftButton")).toBeEnabled();
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("maque_owned_gifts")!),
    ),
  ).toEqual([]);
});

test("chat portraits decode and match the embedded header portrait", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await open(page);
  await chat(page);
  await advance(page, 2);
  const portraits = page.locator("#chatarea img");
  await expect(portraits).toHaveCount(2);
  for (const portrait of await portraits.all()) {
    await expect(portrait).toHaveAttribute(
      "src",
      (await page.locator("#kakao .nav .avatar").getAttribute("src")) as string,
    );
    await expect
      .poll(() =>
        portrait.evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
        ),
      )
      .toBe(true);
  }
  expect(errors).toEqual([]);
});

for (const [name, line] of gifts) {
  test(`individual gift conversation: ${name}`, async ({ page }) => {
    await open(page);
    await buy(page, name);
    await page.evaluate("view('home')");
    await chat(page);
    await send(page, name);
    await expect(page.locator("#chatGiftButton")).toBeDisabled();
    await finishGiftConversation(page);
    await expect(page.locator("#chatarea")).toContainText(line);
    if (name === "签名足球")
      await expect(page.locator("#chatarea")).toContainText(
        "我会把奖杯送给你的",
      );
    if (name === "双层芝士汉堡")
      await expect(page.locator("#chatarea")).toContainText(
        "我还想和你一起吃很多次饭",
      );
    await expect(page.locator("#chatarea .system-bubble")).toHaveText(
      "赠送给 郑成灿 · " + name,
    );
    await expect(page.locator("#chatGiftButton")).toBeEnabled();
    const score = await page.evaluate(() =>
      Number(localStorage.getItem("maque_affection")),
    );
    expect(score).toBeGreaterThanOrEqual(3);
    expect(score).toBeLessThanOrEqual(5);
    expect(
      await page.evaluate(() =>
        JSON.parse(localStorage.getItem("maque_owned_gifts")!),
      ),
    ).toEqual([]);
    await page.reload();
    await expect(page.locator("#affectionValue")).toHaveText(`♥ ${score}%`);
  });
}

test("one gift at a time; rapid second gift cannot interrupt or gain extra affection", async ({
  page,
}) => {
  await open(page, 0, ["红玫瑰", "签名足球"]);
  await chat(page);
  await send(page, "红玫瑰");
  await page.evaluate("sendGiftInChat('签名足球');openGiftPicker()");
  await expect(page.locator("#giftPicker")).not.toHaveClass(/show/);
  await finishGiftConversation(page);
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("maque_owned_gifts")!),
    ),
  ).toEqual(["签名足球"]);
  await expect(page.locator("#chatarea")).not.toContainText("最喜欢的运动");
  await send(page, "签名足球");
  await finishGiftConversation(page);
  const score = await page.evaluate(() =>
    Number(localStorage.getItem("maque_affection")),
  );
  expect(score).toBeGreaterThanOrEqual(6);
  expect(score).toBeLessThanOrEqual(10);
});

test("under 80% blocks buying and gifting even for an old save owning the special gift", async ({
  page,
}) => {
  await open(page, 79, ["纯洁无瑕的爱"], ["baseball"]);
  await chat(page);
  await sendLockedGift();
  async function sendLockedGift() {
    await page.locator("#chatGiftButton").click();
    await expect(page.locator(".chat-gift-choice")).toBeDisabled();
    await expect(page.locator(".chat-gift-choice")).toContainText("80%");
    await page.locator(".gift-picker-close").click();
    await page.evaluate("sendGiftInChat('「真心」')");
    await expect(page.locator("#modalbody")).toContainText("80%");
    await page.locator("#modal button").click();
  }
  await page.evaluate("openApp('gifts')");
  await expect(page.locator("#pureLoveBuy")).toBeDisabled();
  await expect(page.locator("#pureLoveHint")).toContainText("当前 79%");
  await page.evaluate("buyGift('「真心」',true)");
  await expect(page.locator("#giftConfirm")).not.toHaveClass(/show/);
});

test("crossing 80% with the baseball shop available unlocks special gifts and clamps at 100%", async ({
  page,
}) => {
  await open(page, 77, ["红玫瑰"], ["baseball"]);
  await chat(page);
  await page.evaluate("Math.random=()=>0");
  await send(page, "红玫瑰");
  await finishGiftConversation(page);
  await expect(page.locator("#affectionValue")).toHaveText("♥ 80%");
  await expect(page.locator("#pureLoveBuy")).toBeEnabled();
  await page.reload();
  await expect(page.locator("#pureLoveBuy")).toBeEnabled();
  await page.evaluate("affection=98;Math.random=()=>0.999;increaseAffection()");
  await expect(page.locator("#affectionValue")).toHaveText("♥ 100%");
});

test("special gift needs two warnings, cancellation resets confirmation, and both ending choices work", async ({
  page,
}) => {
  await open(page, 80, [], ["baseball"]);
  await buy(page, special);
  await expect(page.locator("#giftConfirmText")).toContainText("第二次提醒");
  expect(
    await page.evaluate(() => localStorage.getItem("maque_owned_gifts")),
  ).toBe("[]");
  await page.getByRole("button", { name: "再想想", exact: true }).click();
  await page.locator("#pureLoveBuy").click();
  await expect(page.locator("#giftConfirmText")).toContainText("第一次提醒");
  await page.locator("#giftConfirmButton").click();
  await expect(page.locator("#giftConfirmText")).toContainText("无法回头");
  await page.locator("#giftConfirmButton").click();
  await page.evaluate("view('home')");
  await chat(page);
  await send(page, special);
  await advance(page, await page.evaluate("specialGiftDialogue.length"));
  await page
    .getByRole("button", { name: "哈哈哈，我是开玩笑的", exact: true })
    .click();
  await expect(page.locator("#pureLoveSecret")).toHaveClass(/show/);
  await expect(page.locator("#pureLoveChoices")).toHaveClass(/show/, {
    timeout: 5000,
  });
  await page
    .getByRole("button", { name: "我当然会全心全意爱你", exact: true })
    .click();
  await expect(page.locator("#loveEnding")).toHaveClass(/show/);
  await expect(page.locator("#lovePhotoStorm .love-memory-photo")).toHaveCount(28);
  await expect(page.locator("#loveEndingRedline")).toContainText("这些你都忘了吗");
  await expect(page.locator("#loveTypingScreen")).toBeVisible({ timeout: 5000 });
  await expect(page.locator("#loveTypedRows .love-typed-row")).toHaveCount(34, { timeout: 6000 });
  await expect(page.locator("#loveFinalFlash")).toContainText("我们生生世世不分离");
  await page.getByRole("button", { name: "继续", exact: true }).click();
  await expect(page.locator(".sequel-ending h1")).toContainText("「真心」");
  await expect(page.locator(".sequel-ending-count")).toContainText("/ 5");
  await page.getByRole("button", { name: "打开片尾的信" }).click();
  await page.getByRole("button", { name: "拆开最后的情书" }).click();
  await expect(page.locator(".epilogue-note")).toBeVisible();
  await expect(page.locator(".epilogue-note")).toContainText("梵语 saṃsāra");
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("maque_owned_gifts")!),
    ),
  ).toEqual([]);
  const score = await page.evaluate(() =>
    Number(localStorage.getItem("maque_affection")),
  );
  expect(score).toBeGreaterThanOrEqual(83);
  expect(score).toBeLessThanOrEqual(85);
});

test("dating unlocks at 5%, keeps the current chat and focus, and uses 1.5 second notices", async ({
  page,
}) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await open(page, 4, ["红玫瑰"]);
  await expect(page.locator("#dateApp")).toBeHidden();
  await chat(page);
  await page.evaluate("Math.random=()=>0");
  await send(page, "红玫瑰");
  await finishGiftConversation(page);
  await expect(page.locator("#kakao")).toHaveClass(/active/);
  expect(
    await page.locator("#dateApp").evaluate((el) => (el as HTMLElement).hidden),
  ).toBe(false);
  await expect(page.locator("#featureNotice")).toContainText("约会");
  await expect(page.locator("#featureNotice")).toHaveCSS(
    "pointer-events",
    "none",
  );
  await page.locator("#chatGiftButton").focus();
  await page.clock.fastForward(1499);
  await expect(page.locator("#featureNotice")).toBeVisible();
  await page.clock.fastForward(1);
  await expect(page.locator("#featureNotice")).toBeHidden();
  await page.evaluate("giftUnlockPushed=false;pushGiftUnlock()");
  await expect(page.locator("#featureNotice")).toContainText("礼赠");
  await expect(page.locator("#chatGiftButton")).toBeFocused();
  await page.clock.fastForward(1500);
  await expect(page.locator("#featureNotice")).toBeHidden();
  await page.reload();
  await page.evaluate("view('home')");
  await expect(page.locator("#featureNotice")).toBeHidden();
  await page.getByRole("button", { name: /约会/ }).click();
  await expect(page.locator("#dateIntro .date-quote")).toHaveText(
    "나랑 조금 더 가까워지고 싶어요?",
  );
});

test("Samsara, dates and gifts load the matching local SVG launcher icons", async ({
  page,
}) => {
  await page.setViewportSize({width:390,height:844});
  await page.addInitScript(() => { localStorage.setItem("maque_installed", "yes"); localStorage.setItem("maque_registered", "yes"); });
  await open(page, 85);
  for (const [app, asset] of [
    ["samsaraApp", "samsara-icon.svg"],
    ["dateApp", "dates-icon.svg"],
    ["giftApp", "gifts-icon.svg"],
  ]) {
    const icon = page.locator("#" + app + " img");
    await expect(icon).toHaveCount(1);
    const build = /name="maque-build" content="([^"]+)"/.exec(html)![1];
    await expect(icon).toHaveAttribute("src", "./assets/" + asset + "?v=" + build);
    await expect
      .poll(() =>
        icon.evaluate(
          (img: HTMLImageElement) =>
            img.complete && img.naturalWidth > 0 && img.naturalHeight > 0,
        ),
      )
      .toBe(true);
  }
  const nativeIcons=page.locator("#home .native-app-icon img");
  await expect(nativeIcons).toHaveCount(9);
  for(const icon of await nativeIcons.all()) await expect.poll(() => icon.evaluate((img:HTMLImageElement) => img.complete && img.naturalWidth>0)).toBe(true);
  await expect(page.locator("#samsaraApp")).toBeVisible();
  await expect(page.locator("#featureNotice")).toBeHidden({timeout:6000});
  await page.locator("#home").screenshot({path:"outputs/maque/launcher-icons-revised.png"});
});

test("dating threshold guards direct access and four mobile scene cards have introductions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, 4);
  await page.evaluate("openApp('dates')");
  await expect(page.locator("#modalbody")).toContainText("5%");
  await page.locator("#modal button").click();
  await page.evaluate("affection=5;syncDateUnlock()");
  await page.getByRole("button", { name: /约会/ }).click();
  await prepareDateJourney(page);
  await expect(page.locator(".date-scene")).toHaveCount(4);
  for (const [name, source] of [
    ["九号房间", "date-escape-background.jpg"],
    ["棒球场", "date-baseball-background.jpg"],
    ["足球校园", "sungchan-football-childhood.jpg"],
    ["一日爱豆", "date-idol-background.jpg"],
  ]) {
    const background = page
      .getByRole("button", { name: "选择约会场景：" + name, exact: true })
      .locator(".scene-art.has-photo > img");
    await expect(background).toHaveAttribute("src", "./assets/" + source);
    await expect(background).toHaveCSS("opacity", "0.5");
    await expect
      .poll(() =>
        background.evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
        ),
      )
      .toBe(true);
  }
  await expect(page.locator(".scene-name-escape")).toHaveText("九号房间");
  const spacing = await page
    .locator(".scene-name-escape")
    .evaluate((el) => parseFloat(getComputedStyle(el).letterSpacing));
  expect(spacing).toBeGreaterThan(0);
  for (const name of ["足球校园", "一日爱豆"]) {
    await page
      .getByRole("button", { name: "选择约会场景：" + name, exact: true })
      .click();
    await expect(page.locator("#dateDetail .date-detail-copy")).not.toBeEmpty();
    await expect(page.locator("#dateDetail .date-primary")).toBeEnabled();
    await page
      .getByRole("button", { name: "返回约会场景", exact: true })
      .click();
  }
  expect(
    await page
      .locator("#dates")
      .evaluate((el) => el.scrollWidth <= el.clientWidth),
  ).toBe(true);
  await page
    .locator("#dates")
    .screenshot({ path: "outputs/maque/dating-scenes.png" });
  expect(
    await page.evaluate(() => localStorage.getItem("maque_date_posts")),
  ).toBeNull();
});

for (const choice of [
  "我会在这里，最大声地为你加油。",
  "慢慢呼吸，你现在的样子已经很帅气了。",
]) {
  for (const kisscamChoice of ["轻轻靠近他", "牵着手朝镜头挥手"]) {
    test(
      "baseball date, Instagram memory, saved likes and one-time reward: " +
        choice +
        " / " +
        kisscamChoice,
      async ({ page }) => {
        const errors: string[] = [];
        page.on("pageerror", (e) => errors.push(e.message));
        await open(page, 5);
        await expect(page.locator('[data-room-gift]')).toHaveCount(2);
        await expect(page.locator('[data-room-gift]').first()).toBeHidden();
        await finishBaseballDate(page, choice, kisscamChoice);
        await expect(page.locator('[data-room-gift]')).toHaveCount(2);
        await expect(page.locator('[data-room-gift]').first()).not.toHaveAttribute('hidden');
        await expect(page.locator('#pureLoveBuy')).toBeDisabled();
        await expect(page.locator('#vaultPurchaseButton')).toBeDisabled();
        await expect(page.locator('#featureNoticeTitle')).toHaveText('礼赠商店上新了');
        await expect(page.locator('#featureNoticeBody')).toContainText('好感度达到 80% 后可购买');
        const score = await page.evaluate(() =>
          Number(localStorage.getItem("maque_affection")),
        );
        expect(score).toBe(25);
        await page
          .getByRole("button", { name: /去看看成灿的 Instagram/ })
          .click();
        await expect(page.locator('.silver-profile-post')).toHaveCount(5);
        await expect(page.locator('#insFeed > article').first()).toHaveAttribute('data-scene', 'baseball');
        await expect(page.locator('#insFeed > article[data-scene="baseball"]')).toHaveCount(1);
        await expect(page.locator(".ins-post[data-scene=baseball]")).toHaveCount(1);
        await expect(page.locator(".ins-post[data-scene=baseball] .ins-caption")).toContainText("银硕");
        await expect(page.locator(".ins-post[data-scene=baseball] .ins-post-image")).toHaveCount(1);
        await expect(page.locator(".ins-post[data-scene=baseball] .ins-post-image")).toHaveAttribute(
          "src",
          "./assets/date-baseball-couple-1.jpg",
        );
        await page
          .getByRole("button", { name: "下一张合影", exact: true })
          .click();
        await expect(page.locator(".ins-post[data-scene=baseball] .ins-post-image")).toHaveAttribute(
          "src",
          "./assets/date-baseball-couple-2.jpg",
        );
        await expect
          .poll(() =>
            page
              .locator(".ins-post[data-scene=baseball] .ins-post-image")
              .evaluate(
                (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
              ),
          )
          .toBe(true);
        await page
          .locator('.ins-post[data-scene="baseball"]')
          .getByRole("button", { name: "喜欢这条动态", exact: true })
          .click();
        await expect(
          page.locator('.ins-post[data-scene="baseball"]').getByRole("button", { name: "喜欢这条动态", exact: true }),
        ).toHaveAttribute("aria-pressed", "true");
        await page
          .locator("#instagram")
          .screenshot({ path: "outputs/maque/baseball-instagram.png" });
        await page.reload();
        await seedGamePhotoAlbum(page);
        await page.evaluate("openApp('instagram')");
        await expect(page.locator(".ins-post[data-scene=baseball]")).toHaveCount(1);
        await expect(
          page.locator('.ins-post[data-scene="baseball"]').getByRole("button", { name: "喜欢这条动态", exact: true }),
        ).toHaveAttribute("aria-pressed", "true");
        await finishBaseballDate(page, choice, kisscamChoice);
        expect(
          await page.evaluate(() =>
            Number(localStorage.getItem("maque_affection")),
          ),
        ).toBe(score);
        await page.evaluate("openApp('instagram')");
        await expect(page.locator(".ins-post[data-scene=baseball]")).toHaveCount(1);
        expect(errors).toEqual([]);
      },
    );
  }
}

test("date invitation centers both labels, scales each refusal, and hides No on the third", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await open(page, 5);
  await page.evaluate("openApp('dates')");
  await page.getByRole("button", { name: /开始我们的约会之旅/ }).click();
  const yes = page
    .locator("#dateConfirm")
    .getByRole("button", { name: "是", exact: true });
  const no = page
    .locator("#dateConfirm")
    .getByRole("button", { name: "否", exact: true });
  for (const button of [yes, no]) {
    const offset = await button.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const text = range.getBoundingClientRect();
      const box = element.getBoundingClientRect();
      return {
        x: Math.abs(text.x + text.width / 2 - box.x - box.width / 2),
        y: Math.abs(text.y + text.height / 2 - box.y - box.height / 2),
      };
    });
    expect(offset.x).toBeLessThan(1);
    expect(offset.y).toBeLessThan(2);
  }
  const initialYes = (await yes.boundingBox())!;
  const initialNo = (await no.boundingBox())!;
  await no.click();
  await expect(page.locator("#dateConfirm")).toBeVisible();
  await expect(page.locator("#dateRefusalHint")).not.toHaveClass(/show/);
  let yesBox = (await yes.boundingBox())!;
  let noBox = (await no.boundingBox())!;
  expect(yesBox.width / initialYes.width).toBeCloseTo(1.5, 2);
  expect(yesBox.height / initialYes.height).toBeCloseTo(1.5, 2);
  expect(noBox.width / initialNo.width).toBeCloseTo(0.5, 2);
  expect(noBox.height / initialNo.height).toBeCloseTo(0.5, 2);
  await no.click();
  await expect(page.locator("#dateRefusalHint")).toHaveText(
    "亲爱的 你不想见我吗？",
  );
  await expect(page.locator("#dateRefusalHint")).toHaveClass(/show/);
  yesBox = (await yes.boundingBox())!;
  noBox = (await no.boundingBox())!;
  expect(yesBox.width / initialYes.width).toBeCloseTo(2.25, 2);
  expect(noBox.width / initialNo.width).toBeCloseTo(0.25, 2);
  await no.click();
  await expect(no).toBeHidden();
  yesBox = (await yes.boundingBox())!;
  expect(yesBox.width / initialYes.width).toBeCloseTo(3.375, 2);
  const phone = (await page.locator("#dates").boundingBox())!;
  expect(yesBox.x).toBeGreaterThanOrEqual(phone.x);
  expect(yesBox.x + yesBox.width).toBeLessThanOrEqual(phone.x + phone.width);
  await expect(page.locator("#dateCatalog")).toBeHidden();
  await yes.click();
  await expect(page.locator("#photos")).toHaveClass(/active/);
  await expect(page.locator("#photosEmpty")).toBeVisible();
  await page.getByRole("button", { name: "取消选择", exact: true }).click();
  await expect(page.locator("#dateConfirm")).toBeVisible();
  await page.evaluate("showDateCatalog()");
  await expect(page.locator("#dateCatalog")).toBeHidden();
});

test("chosen identity is reused on reopening and reload, with an optional replacement", async ({
  page,
}) => {
  await open(page, 5);
  await page.locator("#dateApp").click();
  await prepareDateJourney(page);
  const selected = await page.evaluate(() =>
    localStorage.getItem("maque_date_photo_id"),
  );
  expect(selected).toBeTruthy();
  await page.evaluate("goHome()");
  await page.locator("#dateApp").click();
  await expect(page.locator("#dateCatalog")).toBeVisible();
  await expect(page.locator("#dateIntro")).toBeHidden();
  await expect(page.locator("#dateConfirm")).toBeHidden();
  await expect(page.locator("#dateUpload")).toBeHidden();
  await page.reload();
  await page.evaluate("view('home')");
  await seedGamePhotoAlbum(page);
  await page.locator("#dateApp").click();
  await expect(page.locator("#dateCatalog")).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("maque_date_photo_id")),
  ).toBe(selected);
  await page.locator("#dateChangeIdentity").click();
  await expect(page.locator("#photos")).toHaveClass(/active/);
  await expect(page.locator("#photoImport")).toBeDisabled();
  await expect(page.locator(".photo-tile")).toHaveCount(1);
  await page.getByRole("button", { name: "取消选择", exact: true }).click();
  await expect(page.locator("#dateCatalog")).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("maque_date_photo_id")),
  ).toBe(selected);
});

test("missing identity data recovers to selection rather than leaving a stale catalog", async ({
  page,
}) => {
  await open(page, 5);
  await page.evaluate(() =>
    localStorage.setItem("maque_date_photo_id", "missing-local-photo"),
  );
  await page.reload();
  await page.evaluate("view('home')");
  await page.locator("#dateApp").click();
  await expect(page.locator("#dateIntro")).toBeVisible();
  await expect(page.locator("#dateCatalog")).toBeHidden();
  await prepareDateJourney(page);
  await expect(page.locator("#dateCatalog")).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("maque_date_photo_id")),
  ).not.toBe("missing-local-photo");
});

test("chosen identity loads for one second while Instagram uses the supplied couple photos", async ({
  page,
}) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await open(page, 5);
  await page.evaluate("openApp('dates')");
  await page.getByRole("button", { name: /开始我们的约会之旅/ }).click();
  await seedGamePhotoAlbum(page);
  await page.getByRole("button", { name: "是", exact: true }).click();
  await expect(page.locator("#photoImport")).toBeDisabled();
  await expect(page.locator(".photo-tile")).toHaveCount(1);
  await page.locator(".photo-tile").click();
  await page.getByRole("button", { name: "使用这张形象", exact: true }).click();
  const identity = await page
    .locator("#dateUploadPreview img")
    .getAttribute("src");
  expect(identity).toBe("./assets/sungchan-instagram-avatar.jpg");
  const selectedPhotoId = await page.evaluate(() =>
    localStorage.getItem("maque_date_photo_id"),
  );
  expect(selectedPhotoId).toBeTruthy();
  await expect(page.locator("#dateUploadTitle")).toHaveText(
    "正在载入我的形象…",
  );
  await page.clock.fastForward(999);
  await expect(page.locator("#dateUploadContinue")).toBeHidden();
  await page.clock.fastForward(1);
  await expect(page.locator("#dateUploadTitle")).toHaveText("形象已准备好");
  await page.locator("#dateUploadContinue").click();
  await page
    .getByRole("button", { name: "选择约会场景：棒球场", exact: true })
    .click();
  await page.evaluate("openApp('instagram')");
  await expect(page.locator(".ins-post[data-scene=baseball] .ins-post-image")).toHaveAttribute(
    "src",
    "./assets/date-baseball-couple-1.jpg",
  );
  await expect(page.locator(".ins-post[data-scene=baseball] .ins-post-image")).not.toHaveAttribute(
    "src",
    identity!,
  );
  await expect
    .poll(() =>
      page
        .locator(".ins-post[data-scene=baseball] .ins-post-image")
        .evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
        ),
    )
    .toBe(true);
  await page.getByRole("button", { name: "下一张合影", exact: true }).click();
  await expect(page.locator(".ins-post[data-scene=baseball] .ins-post-image")).toHaveAttribute(
    "src",
    "./assets/date-baseball-couple-2.jpg",
  );
  await page.reload();
  await page.evaluate("openApp('instagram')");
  await expect(page.locator(".ins-post[data-scene=baseball] .ins-post-image")).toHaveAttribute(
    "src",
    "./assets/date-baseball-couple-1.jpg",
  );
  expect(
    await page.evaluate(() => localStorage.getItem("maque_date_photo_id")),
  ).toBe(selectedPhotoId);
  await expect
    .poll(() =>
      page
        .locator(".ins-post[data-scene=baseball] .ins-post-image")
        .evaluate((img: HTMLImageElement) => img.naturalWidth > 0),
    )
    .toBe(true);
  await seedGamePhotoAlbum(page);
  await page.evaluate("openApp('photos')");
  await expect(page.locator(".photo-tile")).toHaveCount(1);
  await expect(page.locator(".photo-tile img")).toHaveAttribute(
    "src",
    "./assets/sungchan-instagram-avatar.jpg",
  );
});

test("album keeps originals and metadata; adding time is never used as the capture date", async ({
  page,
}) => {
  await open(page);
  await page.evaluate("openApp('photos')");
  await page.locator("#photoImport").setInputFiles([
    albumFile,
    {
      name: "unsupported.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
    },
  ]);
  await expect(page.locator(".photo-tile")).toHaveCount(1);
  await expect(page.locator("#photoImportStatus")).toContainText(
    "1 张无法读取",
  );
  await page.locator(".photo-tile").click();
  await expect(page.locator("#photoDetailDate")).toHaveText("未记录拍摄日期");
  await page
    .getByRole("button", { name: "显示照片信息", exact: true })
    .first()
    .click();
  await expect(page.locator("#photoInfo")).toContainText("尚未提供");
  await expect(page.locator("#photoInfo")).toContainText("JPEG");
  await page.getByRole("button", { name: "收藏照片", exact: true }).click();
  await expect(page.locator("#photoFavorite")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.evaluate(
    "(async()=>{const p=photoRecords.get(activePhotoId);await savePhoto({...p,takenAt:'2021-05-06T12:34:00+08:00'});openPhotoDetail(p.id)})()",
  );
  await expect(page.locator("#photoDetailDate")).toContainText("2021年5月6日");
  await page.reload();
  await page.evaluate("openApp('photos')");
  await page.getByRole("button", { name: "个人收藏", exact: true }).click();
  await expect(page.locator(".photo-tile")).toHaveCount(1);
  await page.locator(".photo-tile").click();
  await expect(page.locator("#photoDetailDate")).toContainText("2021年5月6日");
  await page
    .locator("#photos")
    .screenshot({ path: "outputs/maque/photo-details.png" });
});

test("Instagram avatar source is independent and centered inside its story ring", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, 5);
  await page.evaluate(
    `const canvas=document.createElement('canvas');canvas.width=40;canvas.height=80;const ctx=canvas.getContext('2d');ctx.fillStyle='#c78d94';ctx.fillRect(0,0,40,80);mediaAssets.instagramAvatar.src=canvas.toDataURL('image/png');openedDates.add('baseball');openApp('instagram');`,
  );
  const image = page.locator("#insStoryAvatar"),
    ring = page.locator(".ins-ring").first();
  await expect
    .poll(() =>
      image.evaluate(
        (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
      ),
    )
    .toBe(true);
  expect(await image.getAttribute("src")).not.toBe(
    await page.locator("#kakao .nav .avatar").getAttribute("src"),
  );
  const a = (await image.boundingBox())!,
    b = (await ring.boundingBox())!;
  expect(Math.abs(a.x + a.width / 2 - (b.x + b.width / 2))).toBeLessThan(0.5);
  expect(Math.abs(a.y + a.height / 2 - (b.y + b.height / 2))).toBeLessThan(0.5);
  expect(Math.abs(a.width - a.height)).toBeLessThan(0.5);
  await expect(page.locator(".ins-post-header img").first()).toHaveAttribute(
    "src",
    (await image.getAttribute("src")) as string,
  );
});

test("phone clock and weekday follow device time across midnight", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    timezoneId: "Asia/Shanghai",
    baseURL,
  });
  try {
    const page = await context.newPage();
    await page.clock.install({ time: new Date("2026-11-02T15:59:58Z") });
    await page.clock.pauseAt(new Date("2026-11-02T15:59:59Z"));
    await open(page);
    await expect(page.locator(".lockclock .time")).toHaveText("23:59");
    await expect(page.locator(".lockclock .date")).toHaveText("11月2日 星期一");
    await page.clock.fastForward(1000);
    await expect(page.locator(".lockclock .time")).toHaveText("00:00");
    await expect(page.locator(".lockclock .date")).toHaveText("11月3日 星期二");
    await expect(page.locator(".home [data-live-clock]")).toHaveText("00:00");
  } finally {
    await context.close();
  }
});

test("football script gifts after the question, sends the memory, and rewards only at the last line", async ({
  page,
}) => {
  await open(page, 0, ["签名足球"]);
  await chat(page);
  await page.evaluate("Math.random=()=>0");
  await send(page, "签名足球");
  await expect(page.locator("#chatarea .chatrow").last()).toContainText(
    "成灿是……体育类型的对吧",
  );
  await advance(page, 6);
  await expect(page.locator("#chatarea .chatrow").last()).toContainText(
    "是什么呀",
  );
  await expect(page.locator("#chatarea .system-bubble")).toHaveCount(0);
  await advance(page, 1);
  await expect(page.locator("#chatarea .chatrow").last()).toContainText(
    "赠送给 郑成灿 · 签名足球",
  );
  await advance(page, 8);
  await expect(page.locator("#chatarea .chatrow").last()).toContainText(
    "真想看看你那时候的样子",
  );
  await advance(page, 1);
  await expect(page.locator(".photo-message")).toHaveCount(1);
  await expect(page.locator(".photo-message > img")).toHaveAttribute(
    "src",
    "./assets/sungchan-football-childhood.jpg",
  );
  await expect
    .poll(() =>
      page
        .locator(".photo-message > img")
        .evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBe(1024);
  await advance(page, 12);
  expect(
    await page.evaluate(() => Number(localStorage.getItem("maque_affection"))),
  ).toBe(0);
  await advance(page, 1);
  await expect(page.locator("#chatarea .chatrow").last()).toContainText(
    "如果赢得冠军，我会把奖杯送给你的",
  );
  expect(
    await page.evaluate(() => Number(localStorage.getItem("maque_affection"))),
  ).toBe(3);
});

test("a photo near the bottom of a long album opens fully on screen and returns to its place", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await open(page);
  await page.evaluate("openApp('photos')");
  await page.locator("#photoImport").setInputFiles(
    Array.from({ length: 18 }, (_, i) => ({
      ...albumFile,
      name: `memory-${i}.jpg`,
    })),
  );
  await expect(page.locator(".photo-tile")).toHaveCount(18);
  await page.locator(".photo-tile").last().click();
  const image = (await page.locator("#photoDetail").boundingBox())!,
    phone = (await page.locator("#photos").boundingBox())!;
  expect(Math.abs(image.y - phone.y)).toBeLessThan(1);
  await expect(page.getByRole("button", { name: /所有照片/ })).toBeVisible();
  await page.getByRole("button", { name: /所有照片/ }).click();
  expect(
    await page.locator("#photos").evaluate((el) => el.scrollTop),
  ).toBeGreaterThan(0);
});

test("provided image 2 is the decoded IG story and post portrait", async ({
  page,
}) => {
  await open(page, 5);
  await page.evaluate("openedDates.add('baseball');openApp('instagram')");
  const story = page.locator("#insStoryAvatar");
  await expect(story).toHaveAttribute("src", /sungchan-instagram-avatar\.jpg$/);
  await expect
    .poll(() =>
      story.evaluate(
        (img: HTMLImageElement) =>
          img.complete &&
          img.naturalWidth === 1280 &&
          img.naturalHeight === 1280,
      ),
    )
    .toBe(true);
  await expect(page.locator(".ins-post-header img").first()).toHaveAttribute(
    "src",
    (await story.getAttribute("src")) as string,
  );
  await expect(page.locator(".ins-ring").first()).toBeVisible();
  await expect(page.locator(".memory-photo-placeholder")).toHaveCount(0);
  await expect(page.locator("#featureNotice")).toBeHidden({ timeout: 5000 });
  await page
    .locator("#instagram")
    .screenshot({ path: "outputs/maque/provided-instagram-avatar.png" });
});


test("room nine keeps all nine choices in the present, without exposing hidden background", async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await open(page, 50);
  await page.evaluate(() => {
    const identity={id:"identity-test",src:"./assets/date-baseball-couple-1.jpg",alt:"我的形象"};
    return savePhoto(identity).then(()=>{dateSelectedPhotoId=identity.id;dateJourneyAccepted=true;localStorage.setItem("maque_date_photo_id",identity.id);view("dates");showDateCatalog()});
  });
  const locked=page.getByRole("button",{name:/选择约会场景：九号房间/});
  await expect(locked).toBeVisible();
  await locked.click();
  await expect(page.locator("#modalbody")).toContainText("先完成棒球、校园足球和一日爱豆");
  await page.locator("#modal button").click();
  await page.evaluate(()=>{completedDates.add("baseball");completedDates.add("football");completedDates.add("idol");storeDateList("maque_dates_completed",completedDates);showDateCatalog()});
  await page.getByRole("button",{name:/选择约会场景：九号房间/}).click();
  await page.locator("#roomNineStart").click();
  await page.locator("#extraDateNext").click();
  for(let day=1;day<=9;day++) {
    await expect(page.locator(".room-nine-oldrun, .room-nine-file, .room-nine-tally")).toHaveCount(0);
    await expect(page.locator("#dateDetailContent")).not.toContainText(/一周目|二周目|上一轮|玩家\s*[AB]|下意识|记忆索引|虚拟模拟|RECOVERED SNAPSHOT/);
    await expect(page.locator(".extra-date-progress span")).toHaveCount(9);
    await expect(page.locator(".room-nine-day")).toContainText(`${String(day).padStart(2,"0")} / 09`);
    await expect(page.locator(".room-nine-choice")).toHaveCount(3);
    await expect(page.locator('.room-nine-choice[data-choice="other"]')).toHaveText("让成灿承受伤害");
    await expect(page.locator('.room-nine-choice[data-choice="self"]')).toHaveText("我独自承受伤害");
    const erase = page.locator('.room-nine-choice[data-choice="erase"]');
    await expect(erase).toHaveText("二人都失去一段共同的记忆");
    await erase.click();
    await expect(erase).toBeDisabled();
    await expect(page.locator("#roomNineMemoryLock")).toHaveText("不可以。");
    await expect(page.locator('.room-nine-choice[data-choice="other"]')).toBeEnabled();
    await expect(page.locator('.room-nine-choice[data-choice="self"]')).toBeEnabled();
    const self = page.locator('.room-nine-choice[data-choice="self"]');
    await self.click();
    if([2,3,5,6,7].includes(day)) {
      await expect(self).toHaveCount(0);
      await expect(erase).toBeDisabled();
      await expect(page.locator(".room-nine-day")).toContainText(`${String(day).padStart(2,"0")} / 09`);
      expect(await page.evaluate(()=>JSON.parse(localStorage.getItem("maque_extra_dates_v1")!).sessions.escape.roomChoices.length)).toBe(day-1);
      await page.locator('.room-nine-choice[data-choice="other"]').click();
    }
    await page.locator("#roomNineContinue").click();
  }
  await expect(page.locator("#extraDateResult")).toContainText("轻轻握住了我的手");
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem("maque_extra_dates_v1")!).sessions.escape.roomChoices)).toHaveLength(9);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem("maque_extra_dates_v1")!).sessions.escape.roomChoices.map((choice:any)=>choice.id))).toEqual(["self","other","other","self","other","other","other","self","self"]);
  await expect(page.locator("#affectionValue")).toHaveText("♥ 70%");
  await expect(page.locator("#pureLoveBuy")).toBeDisabled();
  await page.evaluate("view('home')");
  await page.locator("#archiveApp").click();
  await expect(page.locator(".archive-journal-day")).toHaveCount(0);
  await expect(page.locator("#archives")).not.toContainText(/一周目|二周目|上一轮|银硕每次都选择删除/);
});

async function enterRoomNine(page: Page, mode: 'start' | 'resume' | 'preview' = 'start') {
  await page.evaluate(() => {
    const identity={id:"identity-test",src:"./assets/date-baseball-couple-1.jpg",alt:"我的形象"};
    return savePhoto(identity).then(()=>{dateSelectedPhotoId=identity.id;dateJourneyAccepted=true;localStorage.setItem("maque_date_photo_id",identity.id);view("dates");showDateCatalog()});
  });
  await page.getByRole("button",{name:/选择约会场景：九号房间/}).click();
  await expect(page.locator("#dateDetailContent")).not.toContainText(/一周目|二周目|上一轮|玩家\s*[AB]|下意识|记忆索引|虚拟模拟|RECOVERED SNAPSHOT/);
  if(mode !== 'preview') await page.locator(mode === 'resume' ? "#roomNineResume" : "#roomNineStart").click();
}

for (const width of [320,390]) {
  test(`room nine choices stay full-width, stacked and readable at ${width}px, including disabled memory`, async ({page}) => {
    await page.setViewportSize({width,height:844});
    await open(page,60,[],["baseball","football","idol"]);
    await enterRoomNine(page);
    await page.locator("#extraDateNext").click();
    await expect(page.locator("#featureNotice")).toBeHidden({timeout:5000});
    await expect(page.locator(".date-player-chip")).toHaveCount(0);
    const controls=page.locator(".room-nine-choice");
    const inspect=async()=> {
      const sizes=await controls.evaluateAll(nodes=>nodes.map(node=>{
        const box=node.getBoundingClientRect(), style=getComputedStyle(node);
        return {x:box.x,y:box.y,width:box.width,height:box.height,font:parseFloat(style.fontSize),align:style.textAlign};
      }));
      const group=await page.locator(".room-nine-options").boundingBox();
      expect(sizes).toHaveLength(3);
      for(const size of sizes) {
        expect(size.height).toBeGreaterThanOrEqual(80);
        expect(size.font).toBeGreaterThanOrEqual(16);
        expect(size.align).toBe("center");
        expect(Math.abs(size.width-group!.width)).toBeLessThan(1);
        expect(Math.abs(size.x-group!.x)).toBeLessThan(1);
      }
      expect(sizes[1].y-sizes[0].y-sizes[0].height).toBeGreaterThanOrEqual(13);
      expect(sizes[2].y-sizes[1].y-sizes[1].height).toBeGreaterThanOrEqual(13);
      expect(await page.locator("#dates").evaluate(node=>node.scrollWidth<=node.clientWidth+1)).toBe(true);
      return sizes;
    };
    const before=await inspect();
    await page.locator("#dates").screenshot({path:`outputs/maque/room-nine-clean-${width}.png`});
    await controls.nth(2).click();
    await expect(controls.nth(2)).toBeDisabled();
    const after=await inspect();
    expect(after[2].height).toBe(before[2].height);
    await page.locator("#dates").evaluate(node=>{node.scrollTop=0});
    await page.locator("#dates").screenshot({path:`outputs/maque/room-nine-locked-${width}.png`});
  });
}

test("room nine resumes a confirmed day without accepting a duplicate choice or showing saved background",async({page})=>{
  await open(page,60,[],["baseball","football","idol"]);
  await enterRoomNine(page);
  await page.locator("#extraDateNext").click();
  await page.locator('.room-nine-choice[data-choice="erase"]').click();
  await page.reload();
  await page.evaluate("view('home')");
  await enterRoomNine(page,'resume');
  await expect(page.locator('.room-nine-choice[data-choice="erase"]')).toBeDisabled();
  await page.locator('.room-nine-choice[data-choice="other"]').click();
  await page.reload();
  await page.evaluate("view('home')");
  await enterRoomNine(page,'resume');
  await expect(page.locator(".room-nine-choice")).toHaveCount(0);
  await expect(page.locator(".room-nine-result")).toContainText("选择已确认");
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem("maque_extra_dates_v1")!).sessions.escape.roomChoices)).toEqual([{id:"other",day:1}]);
  await page.locator("#roomNineContinue").click();
  await expect(page.locator(".room-nine-day")).toContainText("02 / 09");
  await expect(page.locator('.room-nine-choice[data-choice="erase"]')).toBeEnabled();
});

test("a saved fifth day is labelled before entering, and starting from day one preserves other game progress",async({page})=>{
  await page.addInitScript(()=>{
    if(localStorage.getItem('room-entry-seeded'))return;
    localStorage.setItem('room-entry-seeded','yes');
    localStorage.setItem('maque_extra_dates_v1',JSON.stringify({version:4,sessions:{escape:{step:1,choices:{},roomIndex:4,roomChoices:Array.from({length:4},(_,index)=>({id:'other',day:index+1}))}},completed:['football','idol'],likes:['football'],comments:{football:'留在这里。'}}));
  });
  await open(page,80,['红玫瑰'],['baseball','football','idol']);
  await enterRoomNine(page,'preview');
  await expect(page.locator('.room-nine-saved-day')).toContainText('05 / 09');
  await expect(page.locator('#roomNineResume')).toHaveText('继续第 05 天');
  await expect(page.locator('#roomNineStart')).toHaveText('从第一天开始');
  await page.locator('#roomNineStart').scrollIntoViewIfNeeded();
  await expect(page.locator('#featureNotice')).toBeHidden({timeout:5000});
  await page.locator('#dates').screenshot({path:'outputs/maque/room-nine-explicit-entry.png'});
  await page.locator('#roomNineResume').click();
  await expect(page.locator('.room-nine-day')).toContainText('05 / 09');
  await page.getByRole('button',{name:'返回约会场景',exact:true}).click();
  await enterRoomNine(page,'start');
  await page.locator('#extraDateNext').click();
  await expect(page.locator('.room-nine-day')).toContainText('01 / 09');
  const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('maque_extra_dates_v1')!));
  expect(save.sessions.escape.roomChoices).toEqual([]);
  expect(save.completed).toEqual(['football','idol']);
  expect(save.likes).toEqual(['football']);
  expect(save.comments.football).toBe('留在这里。');
  expect(await page.evaluate(()=>localStorage.getItem('maque_affection'))).toBe('80');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('maque_owned_gifts')!))).toContain('红玫瑰');
});

test("an unverified fifth-day cursor cannot skip four days when no choices were recorded",async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('maque_extra_dates_v1',JSON.stringify({version:4,sessions:{escape:{step:1,roomIndex:4,roomChoices:[]}},completed:[],likes:[],comments:{}}));
  });
  await open(page,60,[],['baseball','football','idol']);
  await enterRoomNine(page,'preview');
  await expect(page.locator('#roomNineResume')).toHaveText('继续第 01 天');
  await page.locator('#roomNineResume').click();
  await expect(page.locator('.room-nine-day')).toContainText('01 / 09');
});

test("detached intro and day controls cannot skip days or commit a choice to a later task",async({page})=>{
  await open(page,60,[],['baseball','football','idol']);
  await enterRoomNine(page);
  await page.evaluate(()=>{
    const intro=document.querySelector<HTMLButtonElement>('#extraDateNext')!;
    intro.click();intro.click();
    const choice=document.querySelector<HTMLButtonElement>('.room-nine-choice[data-choice="other"]')!;
    choice.click();
    const next=document.querySelector<HTMLButtonElement>('#roomNineContinue')!;
    next.click();
    for(let i=0;i<6;i++){choice.click();next.click();}
  });
  await expect(page.locator('.room-nine-day')).toContainText('02 / 09');
  await expect(page.locator('.room-nine-choice')).toHaveCount(3);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('maque_extra_dates_v1')!).sessions.escape.roomChoices)).toEqual([{id:'other',day:1}]);
});

test("a rejected self choice and a grey memory choice persist independently without completing the day",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await open(page,60,[],['baseball','football','idol']);
  await enterRoomNine(page);
  await page.locator('#extraDateNext').click();
  await page.locator('.room-nine-choice[data-choice="other"]').click();
  await page.locator('#roomNineContinue').click();
  await page.locator('.room-nine-choice[data-choice="erase"]').click();
  await page.locator('.room-nine-choice[data-choice="self"]').click();
  await expect(page.locator('.room-nine-choice[data-choice="self"]')).toHaveCount(0);
  await expect(page.locator('.room-nine-choice[data-choice="erase"]')).toBeDisabled();
  await page.reload();
  await page.evaluate("view('home')");
  await enterRoomNine(page,'resume');
  await expect(page.locator('.room-nine-day')).toContainText('02 / 09');
  await expect(page.locator('.room-nine-choice[data-choice="self"]')).toHaveCount(0);
  await expect(page.locator('.room-nine-choice[data-choice="erase"]')).toBeDisabled();
  await page.locator('#dates').evaluate(node=>{node.scrollTop=0});
  await page.locator('#dates').screenshot({path:'outputs/maque/room-nine-forced-choice-390.png'});
  await page.locator('.room-nine-choice[data-choice="other"]').click();
  await page.locator('#roomNineContinue').click();
  await expect(page.locator('.room-nine-day')).toContainText('03 / 09');
  await expect(page.locator('.room-nine-choice[data-choice="erase"]')).toBeEnabled();
  await page.locator('.room-nine-choice[data-choice="self"]').click();
  await expect(page.locator('.room-nine-choice[data-choice="self"]')).toHaveCount(0);
  await page.locator('.room-nine-choice[data-choice="erase"]').click();
  await expect(page.locator('.room-nine-choice[data-choice="erase"]')).toBeDisabled();
  await expect(page.locator('.room-nine-day')).toContainText('03 / 09');
});

test("deployed game copy contains no playthrough exposition, role mapping or author diary template",()=>{
  const deployedCopy=[html,...[...localModules].filter(file=>file.endsWith(".js")).map(file=>readFileSync("maque/"+file,"utf8"))].join("\n");
  expect(deployedCopy).not.toMatch(/一周目|二周目|上一轮|二代目|第二个成灿|玩家\s*[ABＡＢ]|下意识|RECOVERED SNAPSHOT|INSTANCE\s*0[12]|旧一周目的九次记录|第十天是成灿离开房间后的私人回忆/);
});


test("the encrypted diary requires two confirmations and leads to the gentle repeated-first-meeting ending", async ({ page }) => {
  await open(page, 80, [], ["baseball"]);
  await page.evaluate("window.MaqueMemoryVault.purchase()");
  await expect(page.locator("#memoryVault")).toContainText("这份记录可能改变");
  await page.getByRole("button",{name:"现在打开"}).click();
  await expect(page.locator("#memoryVault")).toContainText("确认打开？");
  await page.getByRole("button",{name:"确认，打开文件夹"}).click();
  await expect(page.locator("#memoryVault")).toContainText("你看到那个文件夹了，对吗？");
  await expect(page.locator("#memoryVault img")).toHaveCount(2);
  await page.getByRole("button",{name:"回复成灿"}).click();
  await page.getByRole("button",{name:"记起我们，再次相爱"}).click();
  await expect(page.locator("#archives")).toContainText("再次爱上他");
  await expect(page.locator("#archives")).toContainText("第一次见面");
});


for(const savedStep of [1,2]) {
test(`an existing completed room save at step ${savedStep} preserves progress and strips obsolete background fields`, async ({ page }) => {
  await page.addInitScript((step) => {
    localStorage.setItem("maque_extra_dates_v1", JSON.stringify({version:2,sessions:{escape:{step,choices:{},roomChoices:Array.from({length:9},()=>({id:"self",memory:"old"})),roomIndex:8,roomComplete:true,reward:15}},completed:["escape"],likes:[],comments:{},previousRun:{self:9,source:"SC-01"}}));
  },savedStep);
  await open(page,80,[],["baseball","football","idol","escape"]);
  const save=await page.evaluate(()=>JSON.parse(localStorage.getItem("maque_extra_dates_v1")!));
  expect(save.version).toBe(4);
  expect(save.sessions.escape.step).toBe(2);
  expect(save.sessions.escape.reward).toBe(15);
  expect(save.sessions.escape.roomChoices).toHaveLength(9);
  expect(save.previousRun).toBeUndefined();
  expect(save.sessions.escape.roomChoices[0]).toEqual({id:"self",day:1});
  expect(save.completed).toContain("escape");
  expect(JSON.parse(await page.evaluate(()=>localStorage.getItem("maque_dates_completed")!))).toContain("escape");
});
}
