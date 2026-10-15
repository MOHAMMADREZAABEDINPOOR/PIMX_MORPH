import { chromium } from "@playwright/test";
import fontkit from "@pdf-lib/fontkit";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const target = new URL("public/brand/", root);
await mkdir(target, { recursive: true });
const geometry = JSON.parse(
  await readFile(new URL("assets/brand/geometry.json", root), "utf8"),
);
const font = fontkit
  .create(await readFile(new URL("assets/brand/Manrope-variable.ttf", root)))
  .getVariation({ wght: 750 });
const colors = {
  blue: "#2349e8",
  orange: "#ed8058",
  paper: "#f5f5f0",
  ink: "#22241f",
};
const mark = (body = colors.blue, fold = colors.orange) =>
  `<path d="${geometry.body}" fill="${body}" fill-rule="evenodd"/><path d="${geometry.fold}" fill="${fold}"/>`;
const svg = (content, box = "0 0 80 80") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" role="img" aria-label="PIMX MORPH"><title>PIMX MORPH — Shift monogram</title>${content}</svg>`;
function lettering(text, size, x, y, fill) {
  const run = font.layout(text),
    scale = size / font.unitsPerEm;
  let cursor = 0;
  return run.glyphs
    .map((glyph, index) => {
      const position = run.positions[index];
      const path = `<path d="${glyph.path.toSVG()}" transform="translate(${x + (cursor + position.xOffset) * scale} ${y - position.yOffset * scale}) scale(${scale} ${-scale})" fill="${fill}"/>`;
      cursor += position.xAdvance - font.unitsPerEm * 0.025;
      return path;
    })
    .join("");
}
const lockup = (ink = colors.ink, body = colors.blue, fold = colors.orange) =>
  svg(
    `${mark(body, fold)}${lettering("PIMX", 13, 93, 29, ink)}${lettering("MORPH", 36, 91, 64, ink)}`,
    "0 0 245 80",
  );
const files = {
  "morph-symbol.svg": svg(mark()),
  "morph-symbol-white.svg": svg(mark(colors.paper)),
  "morph-symbol-mono.svg": svg(mark(colors.ink, colors.ink)),
  "morph-symbol-mono-white.svg": svg(mark("#fff", "#fff")),
  "morph-logo.svg": lockup(),
  "morph-logo-white.svg": lockup(colors.paper, colors.paper),
  "morph-logo-mono.svg": lockup(colors.ink, colors.ink, colors.ink),
};
for (const [name, content] of Object.entries(files))
  await writeFile(new URL(name, target), content);
const app = svg(
  `<rect width="512" height="512" rx="112" fill="${colors.blue}"/><g transform="translate(56 56) scale(5)">${mark(colors.paper)}</g>`,
  "0 0 512 512",
);
await writeFile(new URL("public/icon.svg", root), app);
await writeFile(new URL("public/favicon.svg", root), app);

const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1024, height: 1024 },
    deviceScaleFactor: 1,
  });
  for (const [name, content, width, height] of [
    ["morph-symbol.png", files["morph-symbol.svg"], 1024, 1024],
    ["morph-symbol-white.png", files["morph-symbol-white.svg"], 1024, 1024],
    ["morph-logo.png", files["morph-logo.svg"], 1470, 480],
    ["morph-logo-white.png", files["morph-logo-white.svg"], 1470, 480],
  ]) {
    await page.setViewportSize({ width, height });
    await page.setContent(
      `<style>*{margin:0}body{background:transparent}svg{display:block;width:${width}px;height:${height}px}</style>${content}`,
    );
    await page.screenshot({
      path: fileURLToPath(new URL(name, target)),
      omitBackground: true,
    });
  }
  await page.setViewportSize({ width: 1600, height: 1100 });
  await page.setContent(
    `<style>*{box-sizing:border-box;margin:0}body{background:${colors.paper};color:${colors.ink};font-family:Arial,sans-serif}.board{padding:68px 80px}.top{display:flex;justify-content:space-between;font-size:17px}.hero{height:580px;display:flex;align-items:center;justify-content:center}.hero svg{width:760px}.bottom{display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px}.sample{height:235px;display:flex;align-items:center;justify-content:center;border-radius:18px}.sample svg{width:136px;height:136px}.light{background:#fff}.dark{background:${colors.ink}}.blue{background:${colors.blue}}.caption{display:flex;justify-content:space-between;font-size:13px;color:#686b64;margin-top:20px}</style><div class="board"><div class="top"><b>PIMX MORPH</b><span>A change of form.</span></div><div class="hero">${files["morph-logo.svg"]}</div><div class="bottom"><div class="sample light">${files["morph-symbol.svg"]}</div><div class="sample dark">${files["morph-symbol-white.svg"]}</div><div class="sample blue">${svg(mark(colors.paper))}</div></div><div class="caption"><span>Shift monogram / Primary mark</span><span>Cobalt · Apricot · Paper</span></div></div>`,
  );
  await page.screenshot({
    path: fileURLToPath(new URL("morph-brand-preview.png", target)),
  });
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(`<style>*{box-sizing:border-box;margin:0}body{background:${colors.paper};color:${colors.ink};font-family:Arial,sans-serif;padding:64px}.brand{width:290px}h1{font-size:78px;letter-spacing:-3px;line-height:1.08;margin-top:60px;max-width:900px}p{font-size:25px;margin-top:30px;color:#686b64}.corner{position:absolute;right:65px;bottom:55px;width:165px;transform:rotate(-12deg)}</style><div class="brand">${files["morph-logo.svg"]}</div><h1>Same file.<br>New possibilities.</h1><p>Private file conversion. Right on your device.</p><div class="corner">${files["morph-symbol.svg"]}</div>`);
  await page.screenshot({ path: fileURLToPath(new URL('public/og-image.png', root)) });
} finally {
  await browser.close();
}
await writeFile(
  new URL("provenance.json", target),
  JSON.stringify(
    {
      origin:
        "Original interwoven Shift vector mark authored for PIMX MORPH in assets/brand/geometry.json. Wordmark outlined from Manrope at weight 750; SIL OFL 1.1, see assets/brand/Manrope-OFL.txt. All PNG files are direct Chromium rasterizations; no external imagery or raster tracing.",
      generator: "scripts/create-brand.mjs",
      palette: colors,
    },
    null,
    2,
  ),
);
console.log("MORPH vector logos, transparent PNGs and brand preview created.");
