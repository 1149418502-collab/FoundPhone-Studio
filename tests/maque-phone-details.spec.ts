import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const photos = [
  { id: 'game-a', name: '第一张.jpg', src: './assets/date-baseball-couple-1.jpg', takenAt: '2025-03-01T12:00:00Z' },
  { id: 'game-b', name: '第二张.jpg', src: './assets/date-baseball-couple-2.jpg', takenAt: '2025-03-02T12:00:00Z' },
  { id: 'game-c', name: '第三张.jpg', src: './assets/date-idol-reference-1.jpg', takenAt: '2025-03-03T12:00:00Z' }
].map(item => ({ ...item, width: 100, height: 100, bytes: 1000, type: 'image/jpeg', favorite: false }));
const html = readFileSync('maque/index.html', 'utf8').replace('album:[]', 'album:' + JSON.stringify(photos));
async function open(page: Page, affection = 0, dates: string[] = [], extraSave: unknown = null, databaseUnavailable = false) {
  await page.addInitScript(({ affection, dates, extraSave, databaseUnavailable }) => {
    if (!localStorage.getItem('phone-details-test')) {
      localStorage.setItem('phone-details-test', 'yes');
      for (const build of ['27', '31']) localStorage.setItem(`maque_build_${build}_initialized`, 'yes');
      localStorage.setItem('maque_affection', String(affection));
      localStorage.setItem('maque_dates_completed', JSON.stringify(dates));
      localStorage.setItem('maque_date_posts', JSON.stringify(dates.includes('baseball') ? ['baseball'] : []));
      if (extraSave) localStorage.setItem('maque_extra_dates_v1', JSON.stringify(extraSave));
    }
    if (databaseUnavailable) indexedDB.open = () => { throw new Error('test: storage unavailable'); };
  }, { affection, dates, extraSave, databaseUnavailable });
  await page.route('**/maque/**', route => {
    const name = new URL(route.request().url()).pathname.slice('/maque/'.length);
    if (!name || name === 'index.html') return route.fulfill({ contentType: 'text/html', body: html });
    if (!/^(?:[a-z-]+\.(?:js|css)|assets\/[a-z0-9.-]+\.(?:jpg|png|svg))$/.test(name)) return route.abort();
    const contentType = name.endsWith('.js') ? 'text/javascript' : name.endsWith('.css') ? 'text/css' : name.endsWith('.svg') ? 'image/svg+xml' : 'image/jpeg';
    return route.fulfill({ contentType, body: readFileSync('maque/' + name) });
  });
  await page.route('https://images.unsplash.com/**', route => route.abort());
  await page.goto('/maque/'); await page.evaluate("view('home')");
}

test('optional notes save the checklist, gate the hidden draft, and leave the main story untouched', async ({ page }) => {
  await open(page, 5);
  await page.locator('#phoneNotesApp').click();
  await page.locator('[data-note="food"]').click();
  const fries = page.getByRole('checkbox', { name: '汉堡。还有薯条，别漏了。' });
  await fries.check();
  await page.reload(); await page.evaluate('MaquePhoneExtras.openNotes()');
  await page.locator('[data-note="food"]').click(); await expect(fries).toBeChecked();
  expect(await page.evaluate("localStorage.getItem('maque_affection')")).toBe('5');
  await expect(page.locator('#sms')).toContainText('Black Shadow');
  await page.evaluate('MaquePhoneExtras.openNotes()');
  await page.getByRole('searchbox').fill('01'); await expect(page.locator('[data-note="draft"]')).toHaveCount(0);
  await page.evaluate('affection=60;MaquePhoneExtras.openNotes()');
  await page.getByRole('searchbox').fill('01'); await page.locator('[data-note="draft"]').click();
  await expect(page.locator('#phoneNotes')).toContainText('回来的时候，叫我一声就好。');
});

test('date keepsakes unlock wallpapers that persist and can restore the original background', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await open(page, 25, ['baseball']);
  const original = await page.locator('#lock').evaluate(el => (el as HTMLElement).style.backgroundImage);
  await page.getByRole('button', { name: '打开手机设置' }).click();
  await page.locator('[data-wallpaper="stands"]').click();
  await page.getByRole('checkbox', { name: '减少动态效果' }).check();
  await page.reload();
  await expect(page.locator('#lock')).toHaveAttribute('style', /date-baseball-couple-1/);
  await expect(page.locator('#home')).toHaveAttribute('style', /date-baseball-couple-1/);
  await expect(page.locator('body')).toHaveClass(/phone-calm-motion/);
  await page.evaluate('MaquePhoneExtras.openNotes()'); await page.locator('[data-note="ticket"]').click();
  await expect(page.locator('.phone-note-photo')).toHaveCount(2);
  expect(await page.locator('#phoneNotes').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await page.locator('#phoneNotes').screenshot({ path: 'outputs/maque/phone-note-keepsake.png' });
  await page.evaluate('MaquePhoneExtras.openSettings()'); await page.locator('[data-wallpaper="original"]').click();
  expect(await page.locator('#lock').evaluate(el => (el as HTMLElement).style.backgroundImage)).toBe(original);
  await page.locator('#phoneSettings').screenshot({ path: 'outputs/maque/phone-settings.png' });
});

test('double tapping a photo likes once through the existing saved post state', async ({ page }) => {
  await open(page, 25, ['baseball']); await page.evaluate("openApp('instagram')");
  const post = page.locator('.ins-post[data-scene="baseball"]');
  await post.locator('.ins-post-image').dblclick();
  await expect(post.getByRole('button', { name: '喜欢这条动态', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await post.locator('.ins-post-image').dblclick();
  await expect(post.getByRole('button', { name: '喜欢这条动态', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.reload(); await page.evaluate("openApp('instagram')");
  await expect(post.getByRole('button', { name: '喜欢这条动态', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate("localStorage.getItem('maque_affection')")).toBe('25');
});

test('game album retains favorites in identity mode and supports arrow keys without opening the device picker', async ({ page }) => {
  await open(page, 5); await page.evaluate("openPhotos('date')");
  await page.locator('[data-photo-id="game-a"]').click();
  await page.locator('#photoFavorite').click(); await page.getByRole('button', { name: '下一张照片', exact: true }).click();
  await expect(page.locator('#photoDetailImage')).toHaveAttribute('src', photos[1].src);
  await page.keyboard.press('ArrowRight'); await expect(page.locator('#photoDetailImage')).toHaveAttribute('src', photos[2].src);
  await page.keyboard.press('ArrowLeft'); await expect(page.locator('#photoDetailImage')).toHaveAttribute('src', photos[1].src);
  await page.keyboard.press('Escape'); await page.locator('#photosFavorites').click();
  await expect(page.locator('.photo-tile')).toHaveCount(1);
  await expect(page.locator('#photoImport')).toBeDisabled(); await expect(page.locator('.photos-add')).toBeHidden();
  await page.reload(); await page.evaluate("openPhotos('date');setPhotoFilter('favorite')");
  await expect(page.locator('[data-photo-id="game-a"]')).toBeVisible();
});

test('bundled photos remain readable if IndexedDB is unavailable', async ({ page }) => {
  await open(page, 5, [], null, true); await page.evaluate("openPhotos('date')");
  await expect(page.locator('.photo-tile')).toHaveCount(3);
  await expect(page.locator('#photoImport')).toBeDisabled();
  await page.locator('[data-photo-id="game-a"]').click(); await expect(page.locator('#photoDetailImage')).toBeVisible();
});

test('20 percent rewards and archive announcement state survive reloading', async ({ page }) => {
  await open(page, 60, ['football'], { version: 4, sessions: { football: { step: 3, reward: 20 } }, completed: ['football'] });
  expect(await page.evaluate("JSON.parse(localStorage.getItem('maque_extra_dates_v1')).sessions.football.reward")).toBe(20);
  await expect(page.locator('#featureNotice')).toBeHidden({ timeout: 5000 });
  await page.reload(); await expect(page.locator('#featureNotice')).toBeHidden();
  expect(await page.evaluate("JSON.parse(localStorage.getItem('maque_sequel_v1')).announced")).toBe(60);
});

test('calm motion keeps the true-heart ending while slowing and reducing its animation', async ({ page }) => {
  await open(page, 80); await page.evaluate('MaquePhoneExtras.openSettings()');
  await page.getByRole('checkbox', { name: '减少动态效果' }).check();
  await page.evaluate('showLoveEnding()');
  await expect(page.locator('.love-memory-photo')).toHaveCount(19);
  await expect(page.locator('#loveFinalFlash')).toBeVisible({ timeout: 20000 });
  expect(await page.locator('#loveFinalFlash').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await page.locator('#loveEndingReturn').click();
  await expect(page.locator('.letter-for-you')).toHaveText('写给你的信件');
});
