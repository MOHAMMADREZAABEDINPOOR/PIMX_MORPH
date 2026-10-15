import {
  cpSync,
  mkdirSync,
  copyFileSync,
  readFileSync,
  writeFileSync,
  existsSync,
  unlinkSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
const source = (...parts) => path.join(root, "node_modules", ...parts);
const destination = (...parts) => path.join(root, "public", ...parts);
mkdirSync(destination("engines"), { recursive: true });
copyFileSync(
  source("@ffmpeg/core/dist/esm/ffmpeg-core.js"),
  destination("engines/ffmpeg-core.js"),
);
const wasm = readFileSync(source("@ffmpeg/core/dist/esm/ffmpeg-core.wasm"));
const chunkSize = 16 * 1024 * 1024;
for (let index = 0; index < 2; index++)
  writeFileSync(
    destination("engines", `ffmpeg-core-${index}.bin`),
    wasm.subarray(index * chunkSize, (index + 1) * chunkSize),
  );
// Remove only the obsolete generated asset, whose size exceeds Pages' limit.
if (existsSync(destination("engines/ffmpeg-core.wasm")))
  unlinkSync(destination("engines/ffmpeg-core.wasm"));
for (const folder of ["cmaps", "standard_fonts", "wasm"])
  cpSync(source("pdfjs-dist", folder), destination("pdf", folder), {
    recursive: true,
  });
console.log("Local media and PDF engines prepared.");
