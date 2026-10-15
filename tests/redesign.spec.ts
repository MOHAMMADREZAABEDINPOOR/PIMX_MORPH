import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

test('public pages contain rendered content and unique metadata before JavaScript runs', async ({ request }) => {
  for (const [route, heading] of [['/', 'Same file.'], ['/upload', 'A new form starts here.'], ['/offline', 'Take your studio along.'], ['/library', 'Your next chapter.']]) {
    const response = await request.get(route === '/' ? '/' : `${route}.html`);
    expect(response.ok()).toBe(true);
    const html = await response.text();
    expect(html.replace(/<[^>]*>/g, '')).toContain(heading);
    expect(html).toContain(`rel="canonical" href="https://pimxmorph.pages.dev${route}"`);
    expect(html).toContain('application/ld+json');
    expect(html).toContain('https://pimxmorph.pages.dev/og-image.png');
    if (route === '/library') expect(html).toContain('name="robots" content="noindex, follow"');
  }
});

test('real conversion persists in the local library across reload, downloads and deletes', async ({ page }) => {
  await page.goto('/upload');
  await expect(page.locator('.boot-screen')).toHaveCount(0);
  const png = await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 20; canvas.height = 12;
    canvas.getContext('2d')!.fillRect(0,0,20,12);
    return canvas.toDataURL().split(',')[1];
  });
  await page.locator('input[type=file]').setInputFiles({ name: 'local-original.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') });
  await page.getByRole('button', { name: 'Convert files', exact: true }).click();
  await expect(page.locator('.save-status')).toContainText('Saved to your local library');
  await page.locator('.save-status a').click();
  await expect(page).toHaveURL(/\/library$/);
  await expect(page.locator('.library-row')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('.library-row')).toHaveCount(1);
  const name = await page.locator('.library-row h2').innerText();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: `Download ${name}`, exact: true }).click();
  const download = await downloadEvent;
  const bytes = await fs.readFile((await download.path())!);
  expect(bytes.toString('ascii', 0, 4)).toBe('RIFF');
  expect(bytes.toString('ascii', 8, 12)).toBe('WEBP');
  await page.getByRole('button', { name: `Delete ${name}`, exact: true }).click();
  await page.reload();
  await expect(page.locator('.library-row')).toHaveCount(0);
  await expect(page.locator('.library-empty')).toBeVisible();
});

test('navigation retains selected files and exposes tools through real URLs', async ({ page }) => {
  await page.goto('/upload');
  await expect(page.locator('.boot-screen')).toHaveCount(0);
  await page.locator('input[type=file]').setInputFiles({ name: 'keep-me.txt', mimeType: 'text/plain', buffer: Buffer.from('Keep this local.') });
  await page.locator('.main-nav a[href="/library"]').click();
  await page.getByRole('button', { name: 'Tool library', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search library', exact: true }).fill('HEIC');
  await expect(page.locator('.tool-library-row')).toHaveCount(1);
  await page.locator('.main-nav a[href="/upload"]').click();
  await expect(page.locator('.file-info strong')).toHaveText('keep-me.txt');
  await page.goBack();
  await expect(page.locator('#library-title')).toBeVisible();
});

test('all routes fit desktop, tablet and 300px in Persian and English, with correct canonical and privacy', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await fs.mkdir('.impeccable/review', { recursive: true });
  for (const lang of ['en', 'fa']) for (const route of ['/', '/upload', '/library', '/offline']) {
    await page.goto(`${route}?lang=${lang}`);
    await expect(page.locator('.boot-screen')).toHaveCount(0);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://pimxmorph.pages.dev${route}`);
    for (const width of [1440, 768, 390, 300]) {
      await page.setViewportSize({ width, height: 950 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (width === 1440 || width === 390) await page.screenshot({ path: `.impeccable/review/redesign-${route.replaceAll('/','') || 'home'}-${lang}-${width}.png`, fullPage: true });
    }
    if (route === '/library') await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'noindex, follow');
  }
  expect(errors).toEqual([]);
});

test('motion pauses and resumes and compatible specimen changes by keyboard', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('.boot-screen')).toHaveCount(0);
  await page.getByRole('button', { name: 'WAV to MP3', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.conversion-specimen strong')).toHaveText('WAVMP3');
  await page.locator('.motion-toggle').click();
  await expect(page.locator('.sculpture-stage')).toHaveAttribute('data-paused', 'true');
  await expect(page.locator('.specimen-sweep')).toHaveCSS('animation-play-state', 'paused');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.specimen-sweep')).toHaveCSS('animation-name', 'none');
});
