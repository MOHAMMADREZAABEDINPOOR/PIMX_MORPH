import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";

test("home format gallery is interactive and leaves the upload flow usable", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".boot-screen")).toHaveCount(0);
  const gallery = page.locator(".format-gallery");
  await gallery.scrollIntoViewIfNeeded();
  await expect(
    gallery.getByRole("button", { name: "Images", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await gallery.getByRole("button", { name: "Documents", exact: true }).click();
  await expect(gallery.locator(".format-route")).toHaveText("PDFTXT");
  await expect(gallery.locator(".family-description")).toContainText(
    "split a PDF",
  );
  await gallery
    .getByRole("button", { name: "Sound & motion", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(gallery.locator(".format-route")).toHaveText("WAVMP3");
  await expect(gallery.locator(".family-description")).toContainText("codec");
  await gallery.getByRole("link", { name: "Convert your file" }).click();
  await expect(page.locator("#studio")).toBeInViewport();
  await expect(page.locator(".output-choices")).toHaveCount(0);
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "note.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("A new idea."),
    });
  await expect(page.locator(".output-choices")).toContainText("PDF");
});

test("new home sections fit all ten locales at 300px and both themes", async ({
  page,
}) => {
  await fs.mkdir(".impeccable/review", { recursive: true });
  const names = ["en", "fa", "ru", "zh", "fr", "it", "de", "ar", "la", "el"];
  for (const theme of ["light", "dark"]) {
    for (const lang of names) {
      await page.setViewportSize({ width: 300, height: 844 });
      await page.addInitScript(
        ({ theme, lang }) => {
          localStorage.setItem("offline_converter_theme", theme);
          localStorage.setItem("offline_converter_lang", lang);
        },
        { theme, lang },
      );
      await page.goto(`/?lang=${lang}`);
      await expect(page.locator(".boot-screen")).toHaveCount(0);
      await expect(page.locator(".home-chapter")).toHaveCount(4);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(300);
      for (const button of await page.locator(".family-picker button").all()) {
        await button.click();
        await expect(button).toHaveAttribute("aria-pressed", "true");
      }
      for (const chapter of await page.locator(".home-chapter").all()) {
        const bounds = await chapter.boundingBox();
        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(300);
      }
      if (lang === "fa") {
        await page.screenshot({
          path: `.impeccable/review/home-fa-300-${theme}.png`,
          fullPage: true,
        });
      }
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/?lang=en");
  await expect(page.locator(".boot-screen")).toHaveCount(0);
  await page
    .locator(".format-gallery")
    .screenshot({ path: ".impeccable/review/home-gallery-desktop.png" });
  await page
    .locator(".file-journey")
    .screenshot({ path: ".impeccable/review/home-journey-desktop.png" });
  await page
    .locator(".local-workshop")
    .screenshot({ path: ".impeccable/review/home-local-desktop.png" });
  await page.setViewportSize({ width: 768, height: 1024 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(768);
});

test("decorative motion obeys pause, offscreen and reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator(".boot-screen")).toHaveCount(0);
  await expect(page.locator(".file-journey")).toHaveAttribute(
    "data-still",
    "true",
  );
  await page.locator(".file-journey").scrollIntoViewIfNeeded();
  await expect(page.locator(".file-journey")).toHaveAttribute(
    "data-still",
    "false",
  );
  await expect
    .poll(() =>
      page
        .locator(".machine-rings i")
        .first()
        .evaluate((el) => getComputedStyle(el).animationPlayState),
    )
    .toBe("running");
  await page.locator(".motion-toggle").click();
  await page.locator(".file-journey").scrollIntoViewIfNeeded();
  await expect(page.locator(".file-journey")).toHaveAttribute(
    "data-still",
    "true",
  );
  await expect
    .poll(() =>
      page
        .locator(".machine-rings i")
        .first()
        .evaluate((el) => getComputedStyle(el).animationPlayState),
    )
    .toBe("paused");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() =>
      page
        .locator(".machine-rings i")
        .first()
        .evaluate((el) => getComputedStyle(el).animationName),
    )
    .toBe("none");
});
