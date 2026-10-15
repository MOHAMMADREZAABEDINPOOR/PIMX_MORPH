/**
 * Dynamic SEO Manager for PIMXMORPH SPA.
 *
 * Because this app is a single-page application, search engine crawlers and
 * social previews need the meta tags updated whenever the active converter
 * changes. This helper centralizes all DOM mutations so the rest of the app
 * just calls `updateSeo()`.
 */

export interface SeoInput {
  title: string;
  description: string;
  /** Stable converter id, e.g. "pdf-to-img". Falls back to the site root. */
  toolId?: string;
  /** Active UI language code, used for hreflang + og:locale. */
  lang?: string;
  path?: string;
}

const SITE_URL = 'https://pimxmorph.pages.dev';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

/** Create or update a meta tag, returning the element. */
function setMeta(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Create or update a <link> tag (canonical / alternate), returning the element. */
function setLink(rel: string, href: string, hreflang?: string): void {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    if (hreflang) el.setAttribute('hreflang', hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Upsert a JSON-LD block identified by a data-seo attribute. */
function setJsonLd(id: string, data: unknown): void {
  let el = document.head.querySelector<HTMLScriptElement>(
    `script[type="application/ld+json"][data-seo="${id}"]`
  );
  if (!el) {
    el = document.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    el.setAttribute('data-seo', id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/** Build the canonical URL for a given tool + language. */
function buildUrl(toolId?: string, lang?: string, path = '/'): string {
  return `${SITE_URL}${path}`;
}

const LOCALE_MAP: Record<string, string> = {
  en: 'en_US',
  fa: 'fa_IR',
  ru: 'ru_RU',
  zh: 'zh_CN',
  fr: 'fr_FR',
  it: 'it_IT',
  de: 'de_DE',
  ar: 'ar_AR',
  la: 'la_VA',
  el: 'el_GR',
};

/** Map of hreflang codes used in the <link rel="alternate"> block. */
const HREFLANGS = ['en', 'fa'];

/**
 * Update every SEO-relevant tag for the current view.
 * Called from App.tsx whenever the active converter or language changes.
 */
export function updateSeo({ title, description, toolId, lang = 'en', path = '/' }: SeoInput): void {
  const fullTitle = title.includes('PIMX') ? title : `${title} | PIMX MORPH`;
  const canonicalUrl = buildUrl(toolId, lang, path);
  setMeta('name', 'robots', path === '/library' || !['/', '/upload', '/offline'].includes(path) ? 'noindex, follow' : 'index, follow, max-image-preview:large');

  // --- Primary ---
  document.title = fullTitle;
  document.documentElement.lang = lang;
  setMeta('name', 'description', description);

  // --- Canonical & alternates ---
  setLink('canonical', canonicalUrl);
  // Language is a browser preference; each page has one public URL.
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

  // --- Open Graph ---
  setMeta('property', 'og:title', fullTitle);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', canonicalUrl);
  setMeta('property', 'og:image', DEFAULT_OG_IMAGE);
  setMeta('property', 'og:image:width', '1200');
  setMeta('property', 'og:image:height', '630');
  setMeta('property', 'og:image:alt', 'PIMX MORPH — private local file conversion');
  setMeta('property', 'og:locale', LOCALE_MAP[lang] || 'en_US');
  document.querySelectorAll('meta[property="og:locale:alternate"]').forEach(el => el.remove());
  HREFLANGS.filter(code => code !== lang).forEach(code => {
    const meta = document.createElement('meta'); meta.setAttribute('property', 'og:locale:alternate'); meta.content = LOCALE_MAP[code]; document.head.appendChild(meta);
  });

  // --- Twitter ---
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', fullTitle);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image', DEFAULT_OG_IMAGE);

  // --- Per-tool JSON-LD (rich result) ---
  document.querySelectorAll('script[type="application/ld+json"]:not([data-seo])').forEach(el => el.remove());
  setJsonLd('webapp-tool', {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PIMXMORPH',
    url: canonicalUrl,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (Web Browser)',
    description,
    inLanguage: lang,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'PIMXMORPH', url: SITE_URL },
  });
  setJsonLd('breadcrumb', { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'PIMX MORPH', item: buildUrl(undefined, lang) }, ...(path === '/' ? [] : [{ '@type': 'ListItem', position: 2, name: title, item: canonicalUrl }])] });
}
