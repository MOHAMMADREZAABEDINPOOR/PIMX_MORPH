import RouteSections from "./components/RouteSections";
import KineticFooter from "./components/KineticFooter";
import { lazy, Suspense, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Moon,
  Sun,
  ShieldCheck,
  Infinity as InfinityIcon,
  Play,
  Pause,
} from "lucide-react";
import { AnimatePresence, MotionConfig } from "motion/react";
import HomeFAQ from "./components/HomeFAQ";
import HomeHero from "./components/HomeHero";
import Library from "./components/Library";
import Studio from "./components/Studio";
import InstallPanel from "./components/InstallPanel";
import { Language, LANG_NAMES } from "./utils/translations";
import { Category } from "./utils/catalog";
import { updateSeo } from "./utils/seo";
import { copyFor } from "./utils/studioCopy";
import BrandMark from "./components/BrandMark";
import LanguageDropdown from "./components/LanguageDropdown";
import SplashLoader from "./components/SplashLoader";
import HomeSections, { HomeFinale } from "./components/HomeSections";
const AdminPanel = lazy(() => import("./components/AdminPanel"));
function stored(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}
export default function App() {
  const [route, setRoute] = useState(() => location.pathname === '/' && new URLSearchParams(location.search).has('tool') ? '/upload' : location.pathname.replace(/\/$/, '') || '/');
  useEffect(() => {
    const pop = () => setRoute(location.pathname.replace(/\/$/, '') || '/');
    const navigate = (event: MouseEvent) => {
      const anchor = (event.target as Element).closest?.('a');
      if (!anchor || anchor.target || anchor.hasAttribute('download') || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const url = new URL(anchor.href);
      if (url.origin !== location.origin || !['/', '/upload', '/library', '/offline'].includes(url.pathname)) return;
      if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
      event.preventDefault();
      url.searchParams.delete('lang');
      history.pushState({}, '', url.pathname + url.search + url.hash);
      setRoute(url.pathname); window.scrollTo({ top: 0, behavior: 'instant' });
      requestAnimationFrame(() => { if(url.hash) document.getElementById(url.hash.slice(1))?.scrollIntoView(); else document.querySelector<HTMLElement>('main [data-route-heading], main h1:not([hidden] h1)')?.focus({ preventScroll: true }); });
    };
    addEventListener('popstate', pop); document.addEventListener('click', navigate);
    return () => { removeEventListener('popstate', pop); document.removeEventListener('click', navigate); };
  }, []);
  const [lang, setLang] = useState<Language>(() => {
    const candidate =
      new URLSearchParams(location.search).get("lang") ||
      stored("offline_converter_lang", "en");
    return candidate in LANG_NAMES ? (candidate as Language) : "en";
  });
  const [theme, setTheme] = useState(() =>
    stored(
      "offline_converter_theme",
      matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
    ),
  );
  const [category, setCategory] = useState<Category>("all");
  const [scenePaused, setScenePaused] = useState(false);
  const [preparing, setPreparing] = useState(true);
  const [entered, setEntered] = useState(false);
  const booting = preparing || !entered;
  useEffect(() => {
    let active = true;
    const timeout = setTimeout(() => {
      if (active) setPreparing(false);
    }, 4500);
    Promise.allSettled([document.fonts.ready]).then(() => {
      if (active) setPreparing(false);
      clearTimeout(timeout);
    });
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, []);
  const fa = lang === "fa",
    rtl = fa || lang === "ar";
  const say = copyFor(lang);
  useEffect(() => {
    document.documentElement.dir = rtl ? "rtl" : "ltr";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.backgroundColor =
      theme === "dark" ? "#16181c" : "#f5f5f0";
    document.documentElement.classList.toggle("dark", theme === "dark");
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#16181c" : "#f5f5f0");
    try {
      localStorage.setItem("offline_converter_lang", lang);
      localStorage.setItem("offline_converter_theme", theme);
    } catch {
      /* Storage is optional. */
    }
    updateSeo({
      path: route,
      title: route === '/upload' ? say('Private file converter — images, PDF, audio & video', 'تبدیل فایل خصوصی؛ عکس، PDF، صدا و ویدئو') : route === '/library' ? say('Your local file library', 'تاریخچه فایل‌های محلی') : route === '/offline' ? say('Offline file converter & install', 'نصب مبدل فایل آفلاین') : say(
        "Private File Converter — Images, PDF, Audio & Video",
        "تبدیل فایل خصوصی؛ عکس، PDF، صدا و ویدئو",
      ),
      description: route === '/upload' ? say('Choose files, discover compatible output formats, convert and download on your device. Convert images, PDFs, documents, audio and video without uploading their contents.', 'فایل را انتخاب کن، فرمت سازگار را ببین و خروجی را روی دستگاهت بساز و دانلود کن. تبدیل عکس، PDF، سند، صدا و ویدئو بدون ارسال محتوای فایل.') : route === '/library' ? say('Find, download and delete your converted files saved in this browser. Browse the library of image, PDF, document and media tools.', 'فایل‌های تبدیل‌شدهٔ ذخیره‌شده در این مرورگر را جست‌وجو، دانلود و حذف کن. کتابخانهٔ ابزارهای تصویر، PDF، سند و رسانه را ببین.') : route === '/offline' ? say('Install PIMX MORPH and check your saved offline tools. Download the optional media engine for local audio and video conversion without an internet connection.', 'PIMX MORPH را نصب کن و وضعیت ابزارهای ذخیره‌شده را ببین. موتور اختیاری رسانه را برای تبدیل محلی صدا و ویدئو بدون اینترنت دانلود کن.') : say(
        "Convert images, PDFs, documents, audio and video on your device. Install MORPH and take your downloaded tools offline.",
        "عکس، PDF، سند، صدا و ویدئو را روی دستگاه خودت تبدیل کن. MORPH را نصب کن و ابزارهای دریافت‌شده را آفلاین همراهت داشته باش.",
      ),
      lang,
    });
    const url = new URL(location.href);
    url.searchParams.delete('lang');
    history.replaceState({}, '', route + url.search + url.hash);
  }, [lang, theme, rtl, route]);
  if (location.pathname === "/pimxmorphadmin")
    return (
      <Suspense fallback={<p className="loading-page">Loading…</p>}>
        <AdminPanel />
      </Suspense>
    );
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ type: "spring", stiffness: 190, damping: 28, mass: 1 }}
    >
      <AnimatePresence>
        {booting && (
          <SplashLoader
            key="boot"
            lang={lang}
            theme={theme}
            ready={!preparing}
            onEntered={() => setEntered(true)}
            onLanguageChange={setLang}
            onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
          />
        )}
      </AnimatePresence>
      <div
        className="site-shell"
        inert={booting || undefined}
        aria-busy={booting}
      >
        <a className="skip-link" href="#main-content">
          {say("Skip to converter", "رفتن به ابزار تبدیل")}
        </a>
        <header className="site-header">
          <a href="/" className="brand" aria-label="PIMX MORPH home">
            <span className="brand-symbol">
              <BrandMark />
            </span>
            <span>
              PIMX<span className="brand-morph">MORPH</span>
            </span>
          </a>
          <nav
            className="main-nav"
            aria-label={say("Main navigation", "منوی اصلی")}
          >
            <a href="/" aria-current={route === '/' ? 'page' : undefined}>{say('Home', 'خانه')}</a>
            <a href="/upload" aria-current={route === '/upload' ? 'page' : undefined}>{say('Studio', 'استودیو')}</a>
            <a href="/library" aria-current={route === '/library' ? 'page' : undefined}>{say('Library', 'تاریخچه')}</a>
            <a href="/offline" aria-current={route === '/offline' ? 'page' : undefined}>{say('Offline', 'آفلاین')}</a>
          </nav>
          <div className="header-actions">
            <LanguageDropdown
              currentLang={lang}
              onLanguageChange={setLang}
              isRtl={rtl}
            />
            <button
              className="icon-button theme-toggle"
              aria-label={say("Switch color theme", "تغییر حالت روشن و تیره")}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <a className="header-cta" href="/upload">
              {say("Let’s convert", "شروع کنیم")}
              <ArrowUpRight size={16} />
            </a>
          </div>
        </header>
        <main id="main-content" className="route-content" data-route={route}>
          {route === '/' && <HomeHero lang={lang} paused={scenePaused} onPause={() => setScenePaused(!scenePaused)} />}
          <div hidden={route !== '/upload'}><div className="page-intro upload-intro page-inset"><h1 tabIndex={-1}>{say('A new form starts here.', 'شکل تازه، از اینجا.')}</h1><p>{say('Choose your files. We’ll find the formats that fit.', 'فایل‌هایت را انتخاب کن؛ فرمت‌های سازگار را نشانت می‌دهیم.')}</p></div><Studio lang={lang} onCategoryChange={setCategory} /><RouteSections lang={lang} surface="studio" /></div>
          {route === '/library' && <Library lang={lang} />}
          {route === '/' && <>
          <HomeSections lang={lang} paused={scenePaused} />

          <HomeFAQ lang={lang}/>
          <HomeFinale lang={lang} paused={scenePaused} />
          </>}
          {route === '/offline' && <><div className="page-intro page-inset"><h1 tabIndex={-1}>{say('Take your studio along.', 'استودیو را همراهت ببر.')}</h1><p>{say('Install MORPH. Save the tools you need. Keep creating without a connection.', 'MORPH را نصب کن، ابزارها را ذخیره کن و بدون اینترنت هم تبدیل کن.')}</p></div></>}
          <div hidden={route !== "/offline"}><InstallPanel lang={lang}/><RouteSections lang={lang} surface="offline" /></div>
          {!['/', '/upload', '/library', '/offline'].includes(route) && <section className="page-inset page-intro"><h1>{say('Page not found.', 'صفحه پیدا نشد.')}</h1><a className="button button-dark" href="/">{say('Back home', 'بازگشت به خانه')}</a></section>}
        </main>
        <footer className="site-footer">
          <div className="footer-top">
            <a href="/" className="brand">
              <span className="brand-symbol">
                <BrandMark />
              </span>
              PIMX MORPH
            </a>
            <p>
              {say(
                "A better shape for what’s next.",
                "یک شکل تازه برای قدم بعدی.",
              )}
            </p>
            <a
              href="https://github.com/MOHAMMADREZAABEDINPOOR/PIMX_MORPH"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
              <ArrowUpRight size={16} />
            </a>
          </div>
          <KineticFooter lang={lang}/>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} PIMX MORPH</span>
            <span>
              {say(
                "Made for files. Built for people.",
                "برای فایل‌ها ساخته شده. برای آدم‌ها طراحی شده.",
              )}
            </span>
            <a href="#">
              {say("Back to top", "برگشت به بالا")}
              <ArrowUpRight size={14} />
            </a>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
