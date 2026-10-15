import { chromium } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
const svg = await readFile(
  new URL("../public/icon.svg", import.meta.url),
  "utf8",
);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  viewport: { width: 512, height: 512 },
  deviceScaleFactor: 1,
});
for (const [name, size] of [
  ["pwa-512.png", 512],
  ["pwa-192.png", 192],
  ["apple-touch-icon.png", 180],
]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<style>*{margin:0}svg{width:${size}px;height:${size}px;display:block}</style>${svg}`,
  );
  await page.screenshot({
    path: new URL(`../public/${name}`, import.meta.url).pathname.replace(
      /^\/(\w:)/,
      "$1",
    ),
  });
}
await page.setViewportSize({ width: 512, height: 512 });
await page.setContent(
  `<style>*{margin:0}body{width:512px;height:512px;background:#2349e8;display:grid;place-items:center}svg{width:512px;height:512px}</style>${svg}`,
);
await page.screenshot({
  path: new URL(
    "../public/pwa-maskable-512.png",
    import.meta.url,
  ).pathname.replace(/^\/(\w:)/, "$1"),
});
await writeFile(
  new URL("../public/icons.provenance.json", import.meta.url),
  JSON.stringify(
    {
      origin:
        "Original geometric vector brand mark in public/icon.svg, rasterized with Chromium by scripts/create-icons.mjs. No stock or generated imagery.",
      files: [
        "pwa-512.png",
        "pwa-192.png",
        "pwa-maskable-512.png",
        "apple-touch-icon.png",
      ],
    },
    null,
    2,
  ),
);
await browser.close();
