import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

const html = readFileSync("maque/index.html", "utf8");
const special = "纯洁无瑕的爱";
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
  ["双层芝士汉堡", "没事的时候，我经常会去吃"],
  ["签名足球", "从很小的时候就开始踢了"],
  ["明星球衣", "从小就一直踢球"],
];
async function open(page: Page, affection = 0, owned: string[] = []) {
  await page.addInitScript(
    ({ affection, owned }) => {
      // Keep the existing one-time build migration from deleting this test save.
      if (!localStorage.getItem("maque_test_initialized")) {
        for (const version of ["27", "31"])
          localStorage.setItem(`maque_build_${version}_initialized`, "yes");
        localStorage.setItem("maque_affection", String(affection));
        localStorage.setItem("maque_owned_gifts", JSON.stringify(owned));
        localStorage.setItem("maque_gifts_unlocked", "yes");
        localStorage.setItem("maque_test_initialized", "yes");
      }
    },
    { affection, owned },
  );
  await page.route("**/maque/", (route) =>
    route.fulfill({ contentType: "text/html", body: html }),
  );
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
    "ordinaryGiftDialogue[pendingOrdinaryGiftName].length",
  );
  expect(count).toBeGreaterThanOrEqual(7);
  await advance(page, count);
}

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
        "今天要和我一起吃汉堡吗",
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

test("79% blocks buying and gifting even for an old save owning the special gift", async ({
  page,
}) => {
  await open(page, 79, [special]);
  await chat(page);
  await sendLockedGift();
  async function sendLockedGift() {
    await page.locator("#chatGiftButton").click();
    await expect(page.locator(".chat-gift-choice")).toBeDisabled();
    await expect(page.locator(".chat-gift-choice")).toContainText("80%");
    await page.locator(".gift-picker-close").click();
    await page.evaluate("sendGiftInChat('纯洁无瑕的爱')");
    await expect(page.locator("#modalbody")).toContainText("80%");
    await page.locator("#modal button").click();
  }
  await page.evaluate("openApp('gifts')");
  await expect(page.locator("#pureLoveBuy")).toBeDisabled();
  await expect(page.locator("#pureLoveHint")).toContainText("当前 79%");
  await page.evaluate("buyGift('纯洁无瑕的爱',true)");
  await expect(page.locator("#giftConfirm")).not.toHaveClass(/show/);
});

test("crossing 80% unlocks immediately, clamps at 100%, and restores after reload", async ({
  page,
}) => {
  await open(page, 77, ["红玫瑰"]);
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
  await open(page, 80);
  await buy(page, special);
  await expect(page.locator("#giftConfirmText")).toContainText("第二次提醒");
  expect(
    await page.evaluate(() => localStorage.getItem("maque_owned_gifts")),
  ).toBe("[]");
  await page.getByRole("button", { name: "再想想", exact: true }).click();
  await page.locator("#pureLoveBuy").click();
  await expect(page.locator("#giftConfirmText")).toContainText("第一次提醒");
  await page.locator("#giftConfirmButton").click();
  await expect(page.locator("#giftConfirmText")).toContainText("意义深重");
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
  await expect(page.locator(".date-quote")).toHaveText(
    "나랑 조금 더 가까워지고 싶어요?",
  );
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
  await page.getByRole("button", { name: "挑选约会场景" }).click();
  await expect(page.locator(".date-scene")).toHaveCount(4);
  await expect(page.locator(".scene-name-escape")).toHaveText("大 逃 殺");
  const spacing = await page
    .locator(".scene-name-escape")
    .evaluate((el) => parseFloat(getComputedStyle(el).letterSpacing));
  expect(spacing).toBeGreaterThan(5);
  for (const name of ["大逃殺", "足球校园", "一日爱豆"]) {
    await page
      .getByRole("button", { name: "选择约会场景：" + name, exact: true })
      .click();
    await expect(page.locator(".date-detail-copy")).not.toBeEmpty();
    await expect(
      page.getByRole("button", { name: "等待下一次邀请" }),
    ).toBeDisabled();
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
  test(
    "baseball date, Instagram memory, saved likes and one-time reward: " +
      choice,
    async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await open(page, 5);
      async function enter() {
        await page.evaluate("openApp('dates')");
        await page.getByRole("button", { name: "挑选约会场景" }).click();
        await page
          .getByRole("button", { name: "选择约会场景：棒球场", exact: true })
          .click();
        await expect(page.locator(".date-detail-copy")).toContainText(
          "LG Twins",
        );
        await page.locator("#dateDetail .date-primary").click();
        await page.locator("#dateDetail .date-primary").click();
        await page.locator("#dateDetail .date-primary").click();
        await page.getByRole("button", { name: new RegExp(choice) }).click();
        for (let i = 0; i < 4; i++)
          await page.locator("#dateDetail .date-primary").click();
      }
      await enter();
      const score = await page.evaluate(() =>
        Number(localStorage.getItem("maque_affection")),
      );
      expect(score).toBeGreaterThanOrEqual(8);
      expect(score).toBeLessThanOrEqual(10);
      await page
        .getByRole("button", { name: /去看看成灿的 Instagram/ })
        .click();
      await expect(page.locator(".ins-post")).toHaveCount(1);
      await expect(page.locator(".ins-caption")).toContainText(
        "和银硕一起到了棒球场",
      );
      await page
        .getByRole("button", { name: "喜欢这条动态", exact: true })
        .click();
      await expect(
        page.getByRole("button", { name: "喜欢这条动态", exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      await page
        .locator("#instagram")
        .screenshot({ path: "outputs/maque/baseball-instagram.png" });
      await page.reload();
      await page.evaluate("openApp('instagram')");
      await expect(page.locator(".ins-post")).toHaveCount(1);
      await expect(
        page.getByRole("button", { name: "喜欢这条动态", exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      await enter();
      expect(
        await page.evaluate(() =>
          Number(localStorage.getItem("maque_affection")),
        ),
      ).toBe(score);
      await page.evaluate("openApp('instagram')");
      await expect(page.locator(".ins-post")).toHaveCount(1);
      expect(errors).toEqual([]);
    },
  );
}
