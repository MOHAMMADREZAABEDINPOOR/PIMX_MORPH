import { test, expect } from '@playwright/test';

test('library call to action retains readable text on hover in both themes and opens the studio', async ({ page }) => {
  await page.goto('/library?lang=en');
  await expect(page.locator('.boot-screen')).toHaveCount(0);
  const link = page.locator('.library-empty .button');
  for (const theme of ['light', 'dark']) {
    if (await page.locator('html').getAttribute('data-theme') !== theme) await page.locator('.theme-toggle').click();
    await link.hover();
    await link.evaluate(async element => {
      // Measure the settled hover colors, not the first frame of the transition.
      getComputedStyle(element).backgroundColor;
      await Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => {})));
    });
    await expect.poll(() => link.evaluate(element => {
      const style = getComputedStyle(element);
      const luminance = (color: string) => {
        const rgb = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(value => { const c = value / 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; });
        return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
      };
      const a = luminance(style.color), b = luminance(style.backgroundColor);
      return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    })).toBeGreaterThanOrEqual(4.5);
    await expect(link).toContainText('Open the studio');
  }
  await link.click();
  await expect(page).toHaveURL(/\/upload/);
  await expect(page.locator('.flow-upload')).toBeVisible();
});

test('footer ink and letter wave respond to pointer and respect reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?lang=en');
  await expect(page.locator('.boot-screen')).toHaveCount(0);
  const footer = page.locator('.kinetic-footer');
  await footer.scrollIntoViewIfNeeded();
  const box = (await footer.boundingBox())!;
  await page.mouse.move(box.x + box.width * .3, box.y + box.height * .5);
  await expect.poll(() => page.locator('.footer-word .footer-glyph').nth(1).evaluate(element => {
    const matrix = getComputedStyle(element).transform;
    return matrix === 'none' ? 0 : Math.abs(new DOMMatrixReadOnly(matrix).m42);
  })).toBeGreaterThan(3);
  await expect.poll(() => page.locator('.footer-ink').evaluate(element => getComputedStyle(element).clipPath)).not.toContain('circle(0px');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.footer-word .footer-glyph').nth(1)).toHaveCSS('transform', 'none');
  await page.locator('.footer-launch').click();
  await expect(page).toHaveURL(/\/upload/);
});
