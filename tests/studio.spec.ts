import { test, expect, Page } from "@playwright/test";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { Document, Packer, Paragraph } from "docx";
import fs from "node:fs/promises";
import { createRequire } from "node:module";

async function setLanguage(page: Page, code: string) {
  await expect(page.locator(".boot-screen")).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Language / زبان", exact: true })
    .click();
  await page
    .getByRole("option")
    .filter({ has: page.locator(`span[lang="${code}"]`) })
    .click();
}
async function ready(page: Page) {
  await page.goto("/offline");
  await expect(page.locator(".boot-screen")).toHaveCount(0);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect(
    page.getByText("Saved on this device", { exact: true }),
  ).toBeVisible({ timeout: 60_000 });
  await page.goto("/upload");
  await expect(page.locator(".boot-screen")).toHaveCount(0);
}
async function output(page: Page) {
  await expect(page.locator(".file-flow")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  await expect(
    page.locator(".download-row, .error-message").first(),
  ).toBeVisible({ timeout: 100_000 });
  expect(await page.locator(".error-message").allTextContents()).toEqual([]);
  return page
    .locator(".download-row")
    .first()
    .evaluate(async (element: HTMLAnchorElement) =>
      Array.from(
        new Uint8Array(await (await fetch(element.href)).arrayBuffer()),
      ),
    );
}
async function upload(
  page: Page,
  name: string,
  mimeType: string,
  buffer: Buffer,
) {
  await page
    .locator("input[type=file]")
    .setInputFiles({ name, mimeType, buffer });
}
async function pdfFixture() {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  pdf
    .addPage([300, 400])
    .drawText("MORPH local conversion", { x: 20, y: 300, font });
  pdf.addPage([300, 400]).drawText("Second page", { x: 20, y: 300, font });
  return Buffer.from(await pdf.save());
}

test("desktop, mobile, Persian and dark mode render without overflow or runtime errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await ready(page);
  await page.evaluate(() => document.fonts.ready);
  await page.goto('/');
  await expect(page.locator(".transform-papers")).toBeVisible();
  await page.locator('.main-nav a[href="/upload"]').click();
  await fs.mkdir(".impeccable/review", { recursive: true });
  await page.screenshot({
    path: ".impeccable/review/desktop.png",
    fullPage: true,
  });
  for (const width of [2560, 1440, 768, 390, 320, 300]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      await page.locator(".file-flow").evaluate((element) => {
        const box = element.getBoundingClientRect();
        return box.left >= 0 && box.right <= innerWidth;
      }),
    ).toBe(true);
    if (width === 390)
      await page.screenshot({
        path: ".impeccable/review/mobile.png",
        fullPage: true,
      });
  }
  await setLanguage(page, "fa");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator(".upload-intro h1")).toContainText("شکل تازه");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: ".impeccable/review/persian-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "تغییر حالت روشن و تیره" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: ".impeccable/review/persian-dark.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("cold offline navigation and real image conversion work without network", async ({
  page,
  context,
}) => {
  await ready(page);
  const png = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 24;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(0, 0, 32, 24);
    return canvas.toDataURL("image/png").split(",")[1];
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator(".boot-screen")).toHaveCount(0);
  await expect(page.locator(".upload-intro h1")).toBeVisible();
  await upload(page, "red.png", "image/png", Buffer.from(png, "base64"));
  await page
    .getByRole("button", { name: "Convert files", exact: true })
    .click();
  const bytes = await output(page);
  expect(Buffer.from(bytes).toString("ascii", 0, 4)).toBe("RIFF");
  expect(Buffer.from(bytes).toString("ascii", 8, 12)).toBe("WEBP");
  const dimensions = await page.evaluate(async (bytes) => {
    const image = await createImageBitmap(
      new Blob([new Uint8Array(bytes)], { type: "image/webp" }),
    );
    return [image.width, image.height];
  }, bytes);
  expect(dimensions).toEqual([32, 24]);
  await expect(page.locator(".main-nav").getByText("Offline", { exact: true })).toBeVisible();
});

test("every offered locale translates the primary controls and offline installation action", async ({
  page,
}) => {
  await page.goto("/upload");
  const choices = [
    ["ru", "Выбрать файлы", "Установить MORPH"],
    ["zh", "选择文件", "安装 MORPH"],
    ["fr", "Choisir des fichiers", "Installer MORPH"],
    ["it", "Scegli file", "Installa MORPH"],
    ["de", "Dateien auswählen", "MORPH installieren"],
    ["ar", "اختيار ملفات", "تثبيت MORPH"],
    ["la", "Documenta elige", "MORPH institue"],
    ["el", "Επιλογή αρχείων", "Εγκατάσταση MORPH"],
  ];
  for (const [lang, choose, install] of choices) {
    await setLanguage(page, lang);
    await expect(
      page.getByRole("button", { name: choose, exact: true }),
    ).toBeVisible();
    await page.locator('.main-nav a[href="/offline"]').click();
    await expect(
      page.getByRole("button", { name: install, exact: true }),
    ).toBeVisible();
    await page.locator('.main-nav a[href="/upload"]').click();
    await expect(page.locator("html")).toHaveAttribute(
      "dir",
      lang === "ar" ? "rtl" : "ltr",
    );
  }
  await setLanguage(page, "ar");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page
      .locator(".file-flow")
      .evaluate(
        (element) => element.getBoundingClientRect().right <= innerWidth,
      ),
  ).toBe(true);
  await page.screenshot({
    path: ".impeccable/review/arabic-mobile.png",
    fullPage: true,
  });
});

test("offline PDF rendering, extraction and strict split ranges", async ({
  page,
  context,
}) => {
  await ready(page);
  await context.setOffline(true);
  await page.reload();
  const pdf = await pdfFixture();

  await upload(page, "two-pages.pdf", "application/pdf", pdf);
  await page
    .getByRole("button", { name: "Convert files", exact: true })
    .click();
  const jpg = await output(page);
  expect(jpg.slice(0, 3)).toEqual([255, 216, 255]);
  await expect(page.locator(".download-row")).toHaveCount(2);
  await page.getByRole("button", { name: "TXT", exact: true }).click();

  await page
    .getByRole("button", { name: "Convert files", exact: true })
    .click();
  expect(Buffer.from(await output(page)).toString("utf8")).toContain(
    "MORPH local conversion",
  );
  await page.getByRole("button", { name: "Split PDF", exact: true }).click();

  await page.getByRole("textbox", { name: "Pages to keep" }).fill("1-99");
  await page
    .getByRole("button", { name: "Convert files", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Choose pages between 1 and 2",
  );
  await page.getByRole("textbox", { name: "Pages to keep" }).fill("۲");
  await page
    .getByRole("button", { name: "Convert files", exact: true })
    .click();
  const split = await PDFDocument.load(new Uint8Array(await output(page)));
  expect(split.getPageCount()).toBe(1);
});

test("DOCX uses real ZIP/XML extraction and CSV preserves quoted multiline values offline", async ({
  page,
  context,
}) => {
  await ready(page);
  await context.setOffline(true);
  await page.reload();

  const docx = await Packer.toBuffer(
    new Document({
      sections: [
        { children: [new Paragraph("A real Word document. سلام دنیا")] },
      ],
    }),
  );
  await upload(
    page,
    "real.docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    docx,
  );
  await page
    .getByRole("button", { name: "Convert files", exact: true })
    .click();
  expect(Buffer.from(await output(page)).toString("utf8")).toContain(
    "A real Word document. سلام دنیا",
  );
  await page.getByRole("button", { name: "Clear files", exact: true }).click();
  await upload(
    page,
    "quoted.csv",
    "text/csv",
    Buffer.from('name,note\r\n"Reza, M","first line\nsecond ""quoted"" line"'),
  );
  await page
    .getByRole("button", { name: "Convert files", exact: true })
    .click();
  expect(JSON.parse(Buffer.from(await output(page)).toString("utf8"))).toEqual([
    { name: "Reza, M", note: 'first line\nsecond "quoted" line' },
  ]);
});

test("media pack is cached and produces real MP3 bytes after a cold offline reload", async ({
  page,
  context,
}) => {
  await ready(page);
  await page.goto("/offline");
  await page
    .getByRole("button", { name: "Save media tools for offline", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Media tools saved", exact: true }),
  ).toBeVisible({ timeout: 100_000 });
  await page.goto("/upload");
  await context.setOffline(true);
  await page.reload();
  const sampleRate = 8000,
    samples = 4000,
    wav = Buffer.alloc(44 + samples * 2);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(36 + samples * 2, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(sampleRate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(samples * 2, 40);
  for (let index = 0; index < samples; index++)
    wav.writeInt16LE(
      Math.round(Math.sin((2 * Math.PI * 440 * index) / sampleRate) * 12000),
      44 + index * 2,
    );
  await upload(page, "tone.wav", "audio/wav", wav);
  await page
    .getByRole("button", { name: "Convert files", exact: true })
    .click();
  const mp3 = Buffer.from(await output(page));
  expect(mp3.subarray(0, 4).toString("ascii")).not.toBe("RIFF");
  expect(
    mp3.subarray(0, 3).toString("ascii") === "ID3" ||
      (mp3[0] === 255 && (mp3[1] & 224) === 224),
  ).toBe(true);
  const decoded = await page.evaluate(
    async (bytes) => {
      const audio = new AudioContext();
      try {
        const result = await audio.decodeAudioData(
          new Uint8Array(bytes).buffer,
        );
        return result.duration;
      } finally {
        await audio.close();
      }
    },
    [...mp3],
  );
  expect(decoded).toBeGreaterThan(0.4);
  // Generate a deterministic valid source rather than relying on headless captureStream.
  const factory = createRequire(import.meta.url)("@ffmpeg/core");
  const previousSelf = Reflect.get(globalThis, "self");
  let core;
  try {
    // This browser-oriented core only needs a worker location during initialization;
    // the fixture generator provides its WASM bytes directly from the locked package.
    Reflect.set(globalThis, "self", {
      location: { href: "file:///ffmpeg-core.js" },
    });
    core = await factory({
      wasmBinary: await fs.readFile(
        "node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.wasm",
      ),
    });
  } finally {
    if (previousSelf === undefined) Reflect.deleteProperty(globalThis, "self");
    else Reflect.set(globalThis, "self", previousSelf);
  }
  core.setLogger(() => {});
  core.exec(
    "-f",
    "lavfi",
    "-i",
    "color=c=blue:s=64x48:r=12:d=0.7",
    "-c:v",
    "libvpx",
    "-an",
    "sample.webm",
  );
  expect(core.ret).toBe(0);
  const webm = Buffer.from(core.FS.readFile("sample.webm"));
  expect(webm.byteLength).toBeGreaterThan(200);
  await page.getByRole("button", { name: "Clear files", exact: true }).click();
  await upload(page, "sample.webm", "video/webm", Buffer.from(webm));
  await page
    .getByRole("button", { name: "Convert files", exact: true })
    .click();
  const mp4 = Buffer.from(await output(page));
  expect(mp4.toString("ascii", 4, 8)).toBe("ftyp");
  const videoSize = await page.evaluate(
    async (bytes) => {
      const video = document.createElement("video"),
        url = URL.createObjectURL(
          new Blob([new Uint8Array(bytes)], { type: "video/mp4" }),
        );
      try {
        return await new Promise<number[]>((resolve, reject) => {
          video.onloadedmetadata = () =>
            resolve([video.videoWidth, video.videoHeight]);
          video.onerror = () => reject(new Error("Video is not playable"));
          video.src = url;
        });
      } finally {
        URL.revokeObjectURL(url);
      }
    },
    [...mp4],
  );
  expect(videoSize).toEqual([64, 48]);
});

test("manifest has standalone configuration and real icons; installation fallback is actionable", async ({
  page,
  request,
}) => {
  await page.goto("/offline");
  const response = await request.get("/site.webmanifest");
  const manifest = await response.json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.id).toBe("/");
  for (const icon of manifest.icons) {
    const response = await request.get(icon.src);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/png");
  }
  await page
    .getByRole("button", { name: "Install MORPH", exact: true })
    .click();
  await expect(page.locator(".install-instructions")).toContainText(
    "Add to Home Screen",
  );
});
