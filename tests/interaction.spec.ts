import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import { PDFDocument } from "pdf-lib";

test("upload-first discovery, file retention and drop handling", async ({
  page,
}) => {
  await page.goto("/upload");
  await expect(page.locator(".boot-screen")).toHaveCount(0);
  await expect(page.locator(".output-choices")).toHaveCount(0);
  await expect(
    page.locator(".studio-sidebar,.tool-tabs,.local-section"),
  ).toHaveCount(0);
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "unknown.exe",
      mimeType: "application/octet-stream",
      buffer: Buffer.from("not supported"),
    });
  await expect(page.getByRole("alert")).toContainText("isn’t supported");
  await expect(page.locator(".output-choices")).toHaveCount(0);
  const png = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    canvas.getContext("2d")!.fillRect(0, 0, 16, 16);
    return canvas.toDataURL().split(",")[1];
  });
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "sample.png",
      mimeType: "image/png",
      buffer: Buffer.from(png, "base64"),
    });
  await expect(
    page.getByRole("group", { name: "Output format" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "WEBP", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: "MP3", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "PNG", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "PNG", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "sound.wav",
      mimeType: "audio/wav",
      buffer: Buffer.from("other kind"),
    });
  await expect(page.getByRole("alert")).toContainText("different tools");
  await expect(page.locator(".flow-file-list .file-row")).toHaveCount(1);
  await page.getByRole("button", { name: "Clear files", exact: true }).click();
  await page.locator(".flow-upload").evaluate((element) => {
    const transfer = new DataTransfer();
    transfer.items.add(
      new File(["A local document."], "note.txt", { type: "text/plain" }),
    );
    element.dispatchEvent(
      new DragEvent("drop", { bubbles: true, dataTransfer: transfer }),
    );
  });
  await expect(page.locator(".output-choice")).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "PDF", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Clear files", exact: true }).click();
  const pdf = await PDFDocument.create();
  pdf.addPage();
  const bytes = Buffer.from(await pdf.save());
  await page.locator("input[type=file]").setInputFiles([
    { name: "first.pdf", mimeType: "application/pdf", buffer: bytes },
    { name: "second.pdf", mimeType: "application/pdf", buffer: bytes },
  ]);
  await expect(
    page.getByRole("button", { name: "Merge PDFs", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Merge PDFs", exact: true }).click();
  await page
    .getByRole("button", { name: "Move second.pdf up", exact: true })
    .click();
  await expect(page.locator(".file-info strong").first()).toHaveText(
    "second.pdf",
  );
});

test("language menu supports keyboard, dismissal and persistence", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".boot-screen")).toHaveCount(0);
  const combo = page.getByRole("combobox", {
    name: "Language / زبان",
    exact: true,
  });
  await combo.focus();
  await combo.press("ArrowDown");
  await expect(page.getByRole("listbox")).toBeVisible();
  await combo.press("End");
  await combo.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("lang", "el");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await combo.click();
  await combo.press("Escape");
  await expect(combo).toBeFocused();
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await combo.click();
  await page.locator(".hero-statement").click();
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".boot-screen")).toHaveCount(0);
  await expect(page.locator("html")).toHaveAttribute("lang", "el");
});

test("loading screen uses every language in both themes and respects saved appearance", async ({
  browser,
}) => {
  await fs.mkdir(".impeccable/review", { recursive: true });
  const titles: Record<string, string> = {
    en: "Opening your studio.",
    fa: "میز کارت داره آماده می‌شه.",
    ru: "Открываем вашу студию.",
    zh: "正在打开工作台。",
    fr: "Ouverture de votre studio.",
    it: "Apertura del tuo studio.",
    de: "Dein Studio wird geöffnet.",
    ar: "نجهّز الاستوديو الخاص بك.",
    la: "Officina tua aperitur.",
    el: "Ανοίγουμε το στούντιό σου.",
  };
  for (const [lang, title] of Object.entries(titles))
    for (const theme of ["light", "dark"]) {
      const context = await browser.newContext({
        viewport: { width: 300, height: 740 },
        reducedMotion: "reduce",
        serviceWorkers: "block",
      });
      await context.addInitScript(
        ({ lang, theme }) => {
          localStorage.setItem("offline_converter_lang", lang);
          localStorage.setItem("offline_converter_theme", theme);
        },
        { lang, theme },
      );
      const page = await context.newPage();
      let resume!: () => void;
      const gate = new Promise<void>((resolve) => {
        resume = resolve;
      });
      await page.route("**/assets/*.woff2", async (route) => {
        await gate;
        await route.continue();
      });
      try {
        await page.goto("http://127.0.0.1:4173/", {
          waitUntil: "domcontentloaded",
        });
        await expect(page.locator(".boot-screen")).toBeVisible();
        await expect(page.locator(".boot-screen h1")).toHaveText(title);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await expect(page.locator("html")).toHaveAttribute(
          "dir",
          lang === "ar" || lang === "fa" ? "rtl" : "ltr",
        );
        const background = await page
          .locator(".boot-screen")
          .evaluate((element) => getComputedStyle(element).backgroundColor);
        expect(background).toBe(
          theme === "dark" ? "rgb(22, 24, 28)" : "rgb(245, 245, 240)",
        );
        expect(
          await page.locator(".boot-content").evaluate((element) => {
            const rect = element.getBoundingClientRect();
            return rect.left >= 0 && rect.right <= innerWidth;
          }),
        ).toBe(true);
        // Fonts are intentionally held to inspect startup. A screenshot waits
        // for those same fonts and would deadlock this controlled loading state.
        resume();
        await expect(page.locator(".boot-screen")).toHaveCount(0);
      } finally {
        resume();
        await context.close();
      }
    }
});

test("selected formats fit 300px through ultrawide in both themes", async ({
  page,
}) => {
  await page.goto("/upload");
  await expect(page.locator(".boot-screen")).toHaveCount(0);
  const png = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 20;
    canvas.height = 20;
    canvas.getContext("2d")!.fillRect(0, 0, 20, 20);
    return canvas.toDataURL().split(",")[1];
  });
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "a-very-long-file-name-for-the-responsive-converter.png",
      mimeType: "image/png",
      buffer: Buffer.from(png, "base64"),
    });
  for (const theme of ["light", "dark"]) {
    if (theme === "dark")
      await page
        .getByRole("button", { name: "Switch color theme", exact: true })
        .click();
    for (const width of [300, 360, 390, 768, 1440, 2560]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      for (const selector of [
        ".file-flow",
        ".output-choices",
        ".site-header",
      ])
        expect(
          await page.locator(selector).evaluate((element) => {
            const rect = element.getBoundingClientRect();
            return rect.left >= -1 && rect.right <= innerWidth + 1;
          }),
        ).toBe(true);
      for (const box of await page.locator(".output-choice").all())
        expect(
          await box.evaluate(
            (element) => element.scrollWidth <= element.clientWidth + 1,
          ),
        ).toBe(true);
      if (width === 300 || width === 1440)
        await page.screenshot({
          path: `.impeccable/review/flow-${width}-${theme}.png`,
          fullPage: true,
        });
    }
  }
});
