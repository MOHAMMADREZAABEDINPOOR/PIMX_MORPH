# Standalone and offline operation

MORPH is a Progressive Web App. Use HTTPS in production, or localhost when testing. The normal development server does not register a production service worker.

```sh
npm ci
npm run build
npm run preview
```

Open the preview URL online and wait for “Saved on this device” in the offline kit. The application, self-hosted fonts, PDF resources, converter chunks and HEIC decoder are precached. Click “Save media tools for offline” to save the larger FFmpeg engine. Disconnect, reload, and use the saved tools. User files are held in memory and are never placed in the application cache.

Install with the browser's install prompt. Safari on iPhone/iPad uses Share → Add to Home Screen. Where installation is supported, the manifest opens MORPH in a standalone window. This is an installable web application, not a native executable.

Updates wait for the user to save their outputs and reload. Device storage policies can evict cached tools; a first online visit and sufficient storage are required. A PDF to Word conversion reconstructs text, not page layout. Scanned text needs a separate OCR tool. Media formats depend on the codecs present in the input and the bundled FFmpeg build.

## Assets and deployment

`predev` and `prebuild` prepare local engine assets from locked npm dependencies. No file data or converter runtime is sent to a CDN. The 32 MB media engine is split into hosting-friendly parts and reassembled in memory for WebAssembly. Cloudflare Pages can serve the generated `dist` directory with the existing `_headers` and `_redirects`.

`public/fonts/Vazirmatn-Regular.ttf` is licensed under SIL OFL 1.1; see its adjacent license and provenance. Application icons are rasterizations of the original `public/icon.svg`; regenerate them with `node scripts/create-icons.mjs` (Chrome required). FFmpeg's package includes its own license; review its licensing when distributing modified builds.

## Checks

`npm run lint` checks TypeScript. `npm run test:e2e` uses installed Chrome and the production preview. The suite checks responsive layouts, Persian RTL, standalone metadata, real offline image/PDF/DOCX/CSV/media conversions and format signatures.


Public routes are `/`, `/upload`, `/library` and `/offline`. Open `/offline` to see actual readiness. Build-time SEO rendering uses React on Node and does not require a browser installation.
