<div align="center">

<a href="https://pimxmorph.pages.dev/"><img src="assets/readme/hero.gif" width="1200" alt="PIMX MORPH: animated project artwork" /></a>

[English](README.md) · [فارسی](README.fa.md) · [Live website ↗](https://pimxmorph.pages.dev/)

[![Live GitHub statistics](https://raw.githubusercontent.com/MOHAMMADREZAABEDINPOOR/MOHAMMADREZAABEDINPOOR/main/assets/readme/live-PIMX_MORPH.svg)](https://github.com/MOHAMMADREZAABEDINPOOR/PIMX_MORPH)

</div>

# PIMX MORPH

Convert images, PDFs, documents, audio, video and structured data locally. Upload first to see compatible outputs, save finished conversions in a browser library, and install the app with downloaded tools available offline.

<a href="https://pimxmorph.pages.dev/"><img src="assets/readme/redesign.gif" width="1200" alt="Preview of the redesigned interface: PIMX MORPH" /></a>

[Preview of the redesigned interface · PNG](assets/readme/redesign.png) · [Static artwork](assets/readme/hero.png)

## What you can do

- Upload-first workflow with compatible output formats
- Local image/HEIC, PDF, DOCX, media and JSON/CSV tools
- Persistent output library, installable PWA and downloadable offline media engine

## Upload, convert, keep

Start at `/`, open `/upload` and select files. MORPH then shows compatible output formats. Download finished conversions or return to them in `/library`; outputs are stored locally and can be downloaded again or deleted. `/offline` reports which tools are actually saved on the device.

The folded-M identity, animated 3D artwork, Persian/English interface and light/dark themes accompany the same local conversion engines. Files are processed on your device without uploading their contents. No account or AI API key is needed for conversion.

## Formats and limits

Image and HEIC tools, PDF merge/split/rendering, document text workflows, audio/video conversion and JSON/CSV each have their own supported inputs and outputs. PDF-to-Word reconstructs available text and can lose layout. Scanned text needs a separate OCR tool. Browser memory and the bundled codecs limit media conversions.

## Install and use offline

Open the production app online and wait for the offline kit to report readiness. Save the larger media tools separately before disconnecting. Cached tools and saved conversion outputs use separate browser storage. Clearing site data can remove both; keep important downloads outside the browser. Installation depends on browser support.

Read [OFFLINE.md](OFFLINE.md) for caching, installation, engine licensing and update behavior.

## Run locally

Use Node.js 22.12 or newer.

```sh
npm ci
npm run dev
```

| Command | Purpose |
| --- | --- |
| `npm run lint` | TypeScript checks |
| `npm run build` | Prepare local engines, build and prerender routes |
| `npm run preview` | Preview the production PWA |
| `npm run test:e2e` | Browser, format and offline conversion checks |

Deploy the generated `dist` directory to a static HTTPS host, preserving `_headers` and `_redirects` for Cloudflare Pages. Converter engines are prepared from npm dependencies by `predev` and `prebuild`. Optional visit tracking in `functions/` is separate from file processing.

See [converter source](src/), [asset/build scripts](scripts/) and [offline guide](OFFLINE.md).

[GitHub](https://github.com/MOHAMMADREZAABEDINPOOR/PIMX_MORPH) · [PIMX](https://github.com/MOHAMMADREZAABEDINPOOR) · [Portfolio](https://pimx.pages.dev/)
