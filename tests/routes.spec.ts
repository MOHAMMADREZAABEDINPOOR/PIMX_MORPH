import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

test('Persian stays selected across clean URLs, navigation, reload and language changes', async ({ page }) => {
  await page.goto('/upload?lang=fa&tool=image-to-pdf#studio');
  await expect(page.locator('.boot-screen')).toHaveCount(0);
  await expect(page).toHaveURL(/\/upload\?tool=image-to-pdf#studio$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'fa');
  await expect(page.locator('.main-nav a[href="/library"]')).toHaveText('تاریخچه');
  await page.locator('.main-nav a[href="/library"]').click();
  await expect(page).toHaveURL(/\/library$/);
  await page.reload();
  await expect(page.locator('.boot-screen')).toHaveCount(0);
  await expect(page.locator('html')).toHaveAttribute('lang', 'fa');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://pimxmorph.pages.dev/library');
  await page.locator('.language-trigger').click();
  await page.getByRole('option').filter({ has: page.locator('span[lang="en"]') }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page).toHaveURL(/\/library$/);
  await page.locator('.main-nav a[href="/offline"]').click();
  await expect(page).toHaveURL(/\/offline$/);
});

test('studio laboratory encodes downloadable samples and has its own material routes', async ({ page }) => {
  await page.goto('/upload?lang=en');
  await expect(page.locator('.boot-screen')).toHaveCount(0);
  await expect(page.locator('.lab-preview-image img')).toBeVisible();
  await expect(page.locator('.route-guide, .route-format-list, .route-questions:visible')).toHaveCount(0);
  await page.getByRole('button', { name: 'PNG', exact: true }).click();
  await expect(page.locator('.lab-quality input')).toBeDisabled();
  await expect(page.getByRole('link', { name: 'Download sample', exact: true })).toHaveAttribute('download', 'morph-sample.png');
  const event = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download sample', exact: true }).click();
  const download = await event;
  const bytes = await fs.readFile((await download.path())!);
  expect(bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  await page.getByRole('button', { name: 'JPG', exact: true }).click();
  await expect(page.locator('.lab-quality input')).toBeEnabled();
  await expect(page.getByRole('link', { name: 'Download sample', exact: true })).toHaveAttribute('download', 'morph-sample.jpeg');
  const highSize = await page.locator('.lab-receipt strong').innerText();
  await page.locator('.lab-quality input').fill('10');
  await expect(page.locator('.lab-receipt strong')).not.toHaveText(highSize);
  await page.locator('.material-routes a[href*="image-to-pdf"]').click();
  await expect(page).toHaveURL(/\/upload\?tool=image-to-pdf#studio$/);
  await expect(page.locator('.flow-upload')).toBeInViewport();
});

test('history calendar and format shelf filter real saved outputs', async ({ page }) => {
  await page.goto('/library?lang=en');
  await expect(page.locator('.boot-screen')).toHaveCount(0);
  await expect(page.locator('.history-shelf-empty')).toBeVisible();
  await expect(page.locator('.history-day')).toHaveCount(7);
  await page.evaluate(async () => {
    const request = indexedDB.open('morph-library', 1);
    const db = await new Promise<IDBDatabase>((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      for (const [id, name, created] of [['a', 'today.png', Date.now()], ['b', 'yesterday.png', yesterday.getTime()], ['c', 'today.txt', Date.now()]] as const) tx.objectStore('files').put({ id, name, created, blob: new Blob(['saved output']) });
      tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
    });
    db.close(); window.dispatchEvent(new Event('morph-library-change'));
  });
  await expect(page.locator('.library-row')).toHaveCount(3);
  await expect(page.locator('.history-format-folder')).toHaveCount(2);
  await expect(page.locator('.history-folder-tab').first()).toHaveCSS('height', '12px');
  await expect(page.locator('.history-folder-tab').first()).toHaveCSS('transform', 'none');
  await page.screenshot({ path: '.impeccable/review/history-populated.png', fullPage: true });
  await page.locator('.history-format-folder').filter({ has: page.getByText('PNG', { exact: true }) }).click();
  await expect(page.locator('.library-row')).toHaveCount(2);
  await page.locator('.history-day').last().click();
  await expect(page.locator('.library-row')).toHaveCount(1);
  await expect(page.locator('.library-row h2')).toHaveText('today.png');
  await page.getByRole('button', { name: 'Show all files', exact: true }).click();
  await expect(page.locator('.library-row')).toHaveCount(3);
  await expect(page.locator('.route-notes, .route-handoff, .library-summary')).toHaveCount(0);
});

test('offline answers animate in both directions and support keyboard and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/offline?lang=fa');
  await expect(page.locator('.boot-screen')).toHaveCount(0);
  await expect(page.locator('.route-capability-row')).toHaveCount(5);
  const question = page.locator('.route-question').first(), trigger = question.getByRole('button'), panel = question.locator('.question-reveal');
  await trigger.scrollIntoViewIfNeeded();
  await expect(panel).toHaveCSS('height', '0px');
  await expect(panel).toHaveCSS('transition-duration', '0.42s, 0.25s');
  await trigger.focus(); await page.keyboard.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect.poll(() => panel.evaluate(element => element.getBoundingClientRect().height)).toBeGreaterThan(30);
  await trigger.click(); await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toHaveCSS('opacity', '1');
  await page.keyboard.press('Space');
  await expect(panel).toHaveCSS('height', '0px');
  await expect(panel).toHaveAttribute('inert', '');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await panel.evaluate(element => parseFloat(getComputedStyle(element).transitionDuration))).toBeLessThan(.001);
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
});

test('distinct route sections fit phone and desktop in both themes', async ({ page }) => {
  await fs.mkdir('.impeccable/review', { recursive: true });
  for (const route of ['/upload', '/library', '/offline']) {
    await page.goto(`${route}?lang=fa`);
    await expect(page.locator('.boot-screen')).toHaveCount(0);
    for (const theme of ['light', 'dark']) {
      if (await page.locator('html').getAttribute('data-theme') !== theme) await page.locator('.theme-toggle').click();
      for (const width of [1440, 390, 300]) {
        await page.setViewportSize({ width, height: 950 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        if (width !== 300) await page.screenshot({ path: `.impeccable/review/distinct-${route.slice(1)}-${theme}-${width}.png`, fullPage: true });
      }
    }
  }
});

