import { test, expect, type Page } from '@playwright/test';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync('maque/index.html', 'utf8');
const context = { window: {} as Record<string, any> };
vm.runInNewContext(readFileSync('maque/correspondence-story.js', 'utf8'), context);
const episodes = context.window.MaqueCorrespondenceStory.episodes;
const files = new Set(readdirSync('maque').filter(name => /\.(js|css)$/.test(name)));
const assets = new Set(readdirSync('maque/assets').map(name => 'assets/' + name));
async function open(page: Page, stored: unknown = null) {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(({ stored }) => {
    if (localStorage.getItem('correspondence-test')) return;
    localStorage.setItem('correspondence-test', 'yes');
    for (const version of ['27', '31']) localStorage.setItem(`maque_build_${version}_initialized`, 'yes');
    localStorage.setItem('maque_affection', '5'); localStorage.setItem('maque_gifts_unlocked', 'yes');
    if (stored) localStorage.setItem('maque_correspondence_v1', JSON.stringify(stored));
  }, { stored });
  await page.route('**/maque/**', route => {
    const name = new URL(route.request().url()).pathname.slice('/maque/'.length);
    if (!name || name === 'index.html') return route.fulfill({ contentType: 'text/html', body: html });
    if (!files.has(name) && !assets.has(name)) return route.abort();
    return route.fulfill({ contentType: name.endsWith('.js') ? 'text/javascript' : name.endsWith('.css') ? 'text/css' : name.endsWith('.svg') ? 'image/svg+xml' : 'image/jpeg', body: readFileSync('maque/' + name) });
  });
  await page.route('https://images.unsplash.com/**', route => route.abort());
  await page.goto('/maque/'); await page.evaluate("view('home')"); return errors;
}
async function advanceUntilClue(page: Page) {
  for (let i = 0; i < 35 && await page.locator('#correspondenceNext').count(); i++) await page.locator('#correspondenceNext').click();
  await expect(page.locator('#correspondenceClue')).toBeVisible();
}
async function readEvidence(page: Page, episode: any) {
  await page.locator('#correspondenceClue').click();
  if (episode.artifact.app === 'notes') {
    await expect(page.locator('#phoneNotes')).toBeVisible();
    await page.locator(`[data-note="correspondence-clue-${episode.id}"]`).click();
  } else if (episode.artifact.app === 'instagram') {
    await expect(page.locator('#instagram')).toBeVisible();
    await expect(page.locator('#insFeed > article').first()).toHaveAttribute('data-correspondence-post', episode.id);
    await page.locator(`[data-correspondence-post="${episode.id}"] .cw-story-quote`).click();
  }
  await expect(page.locator('#correspondencePaper h1')).toHaveText(episode.artifact.title);
  if (episode.artifact.interaction === 'quote') {
    await page.locator(`[data-evidence-quote="${episode.artifact.answer}"]`).click();
  } else if (episode.artifact.interaction === 'arrange') {
    for (let index = 0; index < episode.artifact.fragments.length; index++) await page.locator(`[data-evidence-fragment="${index}"]`).click();
    await page.locator('#correspondenceArrange').click();
  } else if (episode.artifact.interaction === 'checklist') {
    for (const item of episode.artifact.items) await page.getByRole('checkbox', { name: item, exact: true }).check();
    await page.locator('#correspondencePack').click();
  } else await page.locator(`[data-evidence-answer="${episode.artifact.answer}"]`).click();
  await page.locator('#correspondenceBack').click();
  if (episode.artifact.interaction === 'quote') await expect(page.locator('.cw-saved-excerpt')).toContainText(episode.artifact.quotes[episode.artifact.answer]);
}
async function finishEpisode(page: Page, episode: any, choice = 0) {
  await page.evaluate(id => (window as any).MaqueCorrespondence.openEpisode(id), episode.id);
  await advanceUntilClue(page); await readEvidence(page, episode);
  await page.locator(`[data-correspondence-choice="${episode.choices[choice].id}"]`).click();
  await expect(page.locator('#correspondenceMessages')).toContainText(episode.choices[choice].reply[0][1]);
  for (let i = 0; i < 35 && await page.locator('#correspondenceNext').count(); i++) await page.locator('#correspondenceNext').click();
  await page.locator('#correspondenceLetter').click();
  await expect(page.locator('#correspondencePaper h1')).toHaveText(episode.letter.title);
  await page.locator('#correspondenceFinish').click();
}

test('the single-pass content budget exceeds 14,000 Han characters without counting alternate answers', async () => {
  const han = (text: string) => (text.match(/\p{Script=Han}/gu) || []).length;
  let minimum = 0; const ids = new Set();
  expect(episodes).toHaveLength(12);
  for (const episode of episodes) {
    expect(ids.has(episode.id)).toBe(false);
    if (episode.recall) {
      expect(ids.has(episode.recall.episode)).toBe(true);
      const previous = episodes.find((item: any) => item.id === episode.recall.episode);
      expect(Object.keys(episode.recall.replies).sort()).toEqual(previous.choices.map((item: any) => item.id).sort());
    }
    ids.add(episode.id);
    expect(episode.artifact.answer).toBeGreaterThanOrEqual(0);
    expect(episode.artifact.answer).toBeLessThan(episode.artifact.options.length);
    if (episode.artifact.image) expect(existsSync('maque/' + episode.artifact.image)).toBe(true);
    if (episode.artifact.interaction === 'quote') {
      expect(episode.artifact.quotes).toHaveLength(3);
      for (const quote of episode.artifact.quotes) expect(episode.artifact.paragraphs.join('')).toContain(quote);
    }
    const common = [...episode.opening.map((line: string[]) => line[1]), ...episode.artifact.paragraphs, ...episode.closing.map((line: string[]) => line[1]), ...episode.letter.paragraphs].reduce((sum, text) => sum + han(text), 0);
    minimum += common + Math.min(...episode.choices.map((choice: any) => han(choice.label) + choice.reply.reduce((sum: number, line: string[]) => sum + han(line[1]), 0)));
  }
  expect(minimum).toBeGreaterThanOrEqual(14000);
});

test('partial reading survives reload, later chapters stay locked, and core affection is preserved', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = await open(page); await page.evaluate("view('kakao')"); await page.locator('#correspondenceEntry').click();
  await page.locator('#correspondenceInbox').screenshot({ path: 'outputs/maque/correspondence-inbox.png' });
  await expect(page.locator('[data-correspondence-episode="tomorrow"]')).toBeDisabled();
  await page.locator('[data-correspondence-episode="rain"]').click();
  await page.locator('#correspondenceNext').click(); await page.locator('#correspondenceNext').click();
  await page.locator('#correspondenceChat').screenshot({ path: 'outputs/maque/correspondence-chat.png' });
  const read = await page.locator('.cw-message').count();
  await page.reload(); await page.evaluate("MaqueCorrespondence.openEpisode('rain')");
  await expect(page.locator('.cw-message')).toHaveCount(read);
  expect(await page.evaluate("localStorage.getItem('maque_affection')")).toBe('5');
  await expect(page.locator('#sms')).toContainText('Black Shadow');
  expect(errors).toEqual([]);
});

test('a missed observation gives a local hint and cannot skip the cross-app clue', async ({ page }) => {
  await open(page); await page.evaluate("MaqueCorrespondence.openEpisode('rain')");
  await advanceUntilClue(page); await page.locator('#correspondenceClue').click();
  await page.locator('[data-note="correspondence-clue-rain"]').click();
  await page.locator('[data-evidence-answer="1"]').click();
  await expect(page.locator('.cw-evidence-feedback')).toContainText('台阶');
  await expect(page.locator('#correspondenceBack')).toHaveCount(0);
  await page.reload(); await page.evaluate("MaqueCorrespondence.openEpisode('rain')");
  await expect(page.locator('#correspondenceClue')).toBeVisible();
  await readEvidence(page, episodes[0]); await expect(page.locator('.cw-choice')).toHaveCount(2);
});

test('later messages recall the actual earlier choice instead of a default answer', async ({ page }) => {
  await open(page); await finishEpisode(page, episodes[0], 1); await finishEpisode(page, episodes[1], 0);
  await page.evaluate("MaqueCorrespondence.openEpisode('read')");
  await page.locator('#correspondenceNext').click(); await page.locator('#correspondenceNext').click();
  await expect(page.locator('#correspondenceMessages')).toContainText(episodes[2].recall.replies.quiet);
  await expect(page.locator('#correspondenceMessages')).not.toContainText(episodes[2].recall.replies.call);
});

test('all twelve episodes can be read, kept in Notes, and carried into the existing ending letter', async ({ page }) => {
  test.setTimeout(180000); await page.setViewportSize({ width: 390, height: 844 });
  const errors = await open(page);
  for (const [index, episode] of episodes.entries()) await finishEpisode(page, episode, index % 2);
  await expect(page.locator('.cw-memory-row')).toHaveCount(12);
  expect(await page.locator('#correspondencePaper').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await page.locator('#correspondencePersonalNote').fill('下次见面，我还是会认真看你。<img src=x onerror=alert(1)>');
  await page.getByRole('button', { name: '留在这只手机里', exact: true }).click();
  await page.reload(); await page.evaluate('MaqueCorrespondence.openLedger()');
  await expect(page.locator('#correspondencePersonalNote')).toHaveValue(/下次见面/);
  await page.locator('#correspondencePaper').screenshot({ path: 'outputs/maque/correspondence-keepsakes.png' });
  await page.evaluate('MaquePhoneExtras.openNotes()');
  await expect(page.locator('[data-note^="correspondence-letter-"]')).toHaveCount(12);
  await page.evaluate('MaqueSequel.finishDiaryEnding()');
  await page.locator('#sequelClosingLetter').click(); await page.locator('#openClosingLetter').click();
  await expect(page.locator('.epilogue-note')).toContainText('下次见面，我还是会认真看你。<img');
  await expect(page.locator('.epilogue-note img')).toHaveCount(0);
  expect(await page.evaluate("localStorage.getItem('maque_affection')")).toBe('5');
  expect(await page.evaluate("JSON.parse(localStorage.getItem('maque_correspondence_v1')).chapters.tomorrow.closed")).toBe(true);
  expect(errors).toEqual([]);
});

test('elapsed time excludes an idle screen and never unlocks or advances dialogue', async ({ page }) => {
  await page.clock.install(); await page.clock.pauseAt(new Date(Date.now() + 1000));
  await open(page); await page.evaluate('MaqueCorrespondence.open()');
  await page.clock.fastForward(90000);
  const tracked = await page.evaluate("JSON.parse(localStorage.getItem('maque_correspondence_v1')).activeMs");
  expect(tracked).toBeLessThanOrEqual(60000);
  await expect(page.locator('[data-correspondence-episode="fries"]')).toBeDisabled();
  await expect(page.locator('[data-correspondence-episode="rain"]')).toBeEnabled();
});

test('corrupted side-story data cannot erase or block the existing phone', async ({ page }) => {
  const errors = await open(page, { version: 1, chapters: { rain: { cursor: -9, choice: 'unknown', closed: true }, tomorrow: { closed: true } }, activeId: 'missing', personalNote: {}, activeMs: -10 });
  await page.evaluate('MaqueCorrespondence.open()');
  await expect(page.locator('[data-correspondence-episode="rain"]')).toBeEnabled();
  await expect(page.locator('[data-correspondence-episode="tomorrow"]')).toBeDisabled();
  expect(await page.evaluate("localStorage.getItem('maque_affection')")).toBe('5'); expect(errors).toEqual([]);
});

test('an unfinished draft arrangement survives reloading and can be corrected without losing the conversation', async ({ page }) => {
  const chapters: Record<string, unknown> = {};
  for (const episode of episodes.slice(0, 8)) chapters[episode.id] = { cursor: episode.opening.length + (episode.recall ? 1 : 0), evidenceChoice: episode.artifact.answer, choice: episode.choices[0].id, after: episode.choices[0].reply.length + episode.closing.length, closed: true };
  await open(page, { version: 1, chapters }); await page.evaluate("MaqueCorrespondence.openEpisode('voice')");
  await advanceUntilClue(page); await page.locator('#correspondenceClue').click();
  for (const index of [2, 1, 0]) await page.locator(`[data-evidence-fragment="${index}"]`).click();
  await page.locator('#correspondenceArrange').click();
  await expect(page.locator('.cw-evidence-feedback')).toContainText('顺序'); await expect(page.locator('#correspondenceBack')).toHaveCount(0);
  await page.reload(); await page.evaluate("MaqueCorrespondence.openEpisode('voice')"); await page.locator('#correspondenceClue').click();
  await expect(page.locator('.cw-draft-preview')).toHaveText([...episodes[8].artifact.fragments].reverse().join(''));
  await page.locator('#correspondenceReorder').click();
  for (const index of [0, 1, 2]) await page.locator(`[data-evidence-fragment="${index}"]`).click();
  await page.locator('#correspondenceArrange').click(); await page.locator('#correspondenceBack').click();
  await expect(page.locator('.cw-choice')).toHaveCount(2);
});
