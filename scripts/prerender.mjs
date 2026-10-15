import { build } from 'esbuild';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

// Render the public components with React on Node. No browser or user storage
// is needed on Cloudflare's build workers, and conversion code stays client-side.
const renderer = resolve('scripts/.prerender-server.mjs');
const result = await build({ entryPoints: ['scripts/static-pages.tsx'], bundle: true, platform: 'node', format: 'esm', packages: 'external', loader: { '.css': 'empty' }, write: false });
await writeFile(renderer, result.outputFiles[0].text);
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
try {
  const { renderPage, pages } = await import(pathToFileURL(renderer).href);
  const shell = await readFile('dist/index.html', 'utf8');
  if (!shell.includes('<div id="root"></div>')) throw new Error('Run npm run build to generate a fresh Vite shell before prerendering.');
  for (const [route, meta] of Object.entries(pages)) {
    const title = `${meta.title} | PIMX MORPH`, url = `https://pimxmorph.pages.dev${route}`;
    const privatePage = route === '/library';
    const data = { '@context': 'https://schema.org', '@graph': [{ '@type': 'WebApplication', name: 'PIMX MORPH', url, description: meta.description, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } }, { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'PIMX MORPH', item: 'https://pimxmorph.pages.dev/' }, ...(route === '/' ? [] : [{ '@type': 'ListItem', position: 2, name: meta.title, item: url }])] }] };
    let markup = shell.replace(/<title>.*?<\/title>/s, `<title>${escape(title)}</title>`)
      .replace(/<meta name="description" content="[^"]*"\s*\/?\s*>/, `<meta name="description" content="${escape(meta.description)}">`)
      .replace(/<link rel="canonical" href="[^"]*"\s*\/?\s*>/, `<link rel="canonical" href="${url}">`)
      .replace(/<meta property="og:title" content="[^"]*"\s*\/?\s*>/, `<meta property="og:title" content="${escape(title)}">`)
      .replace(/<meta property="og:description" content="[^"]*"\s*\/?\s*>/, `<meta property="og:description" content="${escape(meta.description)}">`)
      .replace(/<meta property="og:url" content="[^"]*"\s*\/?\s*>/, `<meta property="og:url" content="${url}">`)
      .replace(/<meta name="twitter:card" content="[^"]*"\s*\/?\s*>/, '<meta name="twitter:card" content="summary_large_image">')
      .replace(/<script type="application\/ld\+json">.*?<\/script>/s, `<script type="application/ld+json">${JSON.stringify(data).replaceAll('<', '\\u003c')}</script>`)
      .replace('<div id="root"></div>', `<div id="root">${renderPage(route)}</div>`);
    if (privatePage) markup = markup.replace(/<meta name="robots" content="[^"]*"\s*\/?\s*>/, '<meta name="robots" content="noindex, follow">');
    markup = markup.replace('</head>', `<meta property="og:image" content="https://pimxmorph.pages.dev/og-image.png"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(meta.description)}"><meta name="twitter:image" content="https://pimxmorph.pages.dev/og-image.png"></head>`);
    const target = route === '/' ? 'dist/index.html' : `dist${route}.html`;
    await writeFile(target, markup);
    console.log(`Prerendered ${route}`);
  }
  // Preserve a usable error page for static hosts.
  const shell404 = shell.replace(/<title>.*?<\/title>/s, '<title>Page not found | PIMX MORPH</title>').replace(/<meta name="robots" content="[^"]*"\s*\/?\s*>/, '<meta name="robots" content="noindex, follow">').replace('<div id="root"></div>', '<div id="root"><main><h1>Page not found.</h1><a href="/">Back home</a></main></div>');
  await writeFile('dist/404.html', shell404);
} finally {
  await unlink(renderer);
}
