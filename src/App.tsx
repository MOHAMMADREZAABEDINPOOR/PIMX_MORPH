import React, { useState, useEffect } from 'react';
import { Sun, Moon, ShieldCheck } from 'lucide-react';
import { ConversionType, ConverterInfo } from './types';
import LandingHero from './components/LandingHero';
import ConverterWidget from './components/ConverterWidget';
import GuideSection from './components/GuideSection';
import LanguageDropdown from './components/LanguageDropdown';
import { Language, LANG_NAMES, TRANSLATIONS, CONVERTER_LOCALIZATION } from './utils/translations';
import AdminPanel from './components/AdminPanel';
import { recordActiveVisit } from './utils/tracker';
import SplashLoader from './components/SplashLoader';
import { AnimatePresence } from 'motion/react';

const CONVERTERS: ConverterInfo[] = [
  {
    id: 'universal',
    title: 'Smart Auto-Detect',
    description: 'Drop custom PDF, HEIC, JPEG, PNG, BMP, or GIF files. The system auto-identifies appropriate tools instantly.',
    icon: 'Sparkles',
    acceptedTypes: ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.svg', '.heic', '.heif', '.tiff'],
    maxFreeSize: 5 * 1024 * 1024,
    maxProSize: 50 * 1024 * 1024,
    seoTitle: 'Smart Single-Action File-Type Classifier & Converter client suite',
    seoDescription: 'Secure offline auto-detection engine. Identify files instantly in browser memory thread to save time.'
  },
  {
    id: 'pdf-to-img',
    title: 'PDF to JPG / PNG',
    description: 'Render PDF page views into individual images offline.',
    icon: 'FileImage',
    acceptedTypes: ['.pdf'],
    maxFreeSize: 5 * 1024 * 1024,
    maxProSize: 50 * 1024 * 1024,
    seoTitle: 'Convert PDF Documents to High-Fidelity Images (JPEG/PNG) Completely Locally',
    seoDescription: 'Prune pages or compile clean visual files straight inside your client cache memory thread. High-resolution canvas renderings support flawless output.'
  },
  {
    id: 'pdf-to-docx',
    title: 'PDF to Word (DOCX)',
    description: 'Deconstruct PDF page elements into editable Word Documents.',
    icon: 'FileText',
    acceptedTypes: ['.pdf'],
    maxFreeSize: 5 * 1024 * 1024,
    maxProSize: 50 * 1024 * 1024,
    seoTitle: 'Extract Structured Text from PDF to Editable MS Word Documents Offline',
    seoDescription: 'Convert digital reports, tax agreements, and draft bills safely. Employs advanced canvas token line translation parameters without sending bytes to a cloud host.'
  },
  {
    id: 'image-convert',
    title: 'Image Converter',
    description: 'Compress and adapt standard images to JPG, PNG, WebP, GIF, or BMP.',
    icon: 'Sliders',
    acceptedTypes: ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.svg', '.tiff'],
    maxFreeSize: 5 * 1024 * 1024,
    maxProSize: 50 * 1024 * 1024,
    seoTitle: 'Lossless Image Format Conversions & Asset Compression Parameters',
    seoDescription: 'Resize, shrink, or optimize photography assets. Formats supported: transparent PNG vectors, light WebP assets, or flattened JPEGs with customizable sliders.'
  },
  {
    id: 'image-to-pdf',
    title: 'Image to PDF',
    description: 'Compile single or multiple photographs into high-resolution PDF pages.',
    icon: 'FileCode',
    acceptedTypes: ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.svg', '.heic', '.heif', '.tiff'],
    maxFreeSize: 5 * 1024 * 1024,
    maxProSize: 50 * 1024 * 1024,
    seoTitle: 'Compile standard images directly into high-fidelity PDF documents',
    seoDescription: 'Integrate WebP, JPEG, PNG, or iOS HEIC snaps into formatted pages offline.'
  },
  {
    id: 'merge-pdf',
    title: 'Merge PDFs',
    description: 'Combine multiple PDF filings into a single unified workspace.',
    icon: 'Combine',
    acceptedTypes: ['.pdf'],
    maxFreeSize: 5 * 1024 * 1024, // Per file
    maxProSize: 50 * 1024 * 1024,
    seoTitle: 'Merge PDF Documents Offline - Drag, Reorder and Join Multi-page Files',
    seoDescription: 'Collate quarterly records, portfolio items, or application files inside a single stream safely using pdf-lib.'
  },
  {
    id: 'split-pdf',
    title: 'Split PDF',
    description: 'Deconstruct a master PDF file into targeted extract intervals.',
    icon: 'Scissors',
    acceptedTypes: ['.pdf'],
    maxFreeSize: 5 * 1024 * 1024,
    maxProSize: 50 * 1024 * 1024,
    seoTitle: 'Deconstruct & Slice Specific PDF Pages in Browser Sandbox',
    seoDescription: 'Extract target ranges (e.g. 1-2, 4) into newly created document objects without breaking critical formatting structures.'
  },
  {
    id: 'compress-pdf',
    title: 'Compress PDF',
    description: 'Optimize stream dictionaries to shrink PDF size client-side.',
    icon: 'FileCode',
    acceptedTypes: ['.pdf'],
    maxFreeSize: 5 * 1024 * 1024,
    maxProSize: 50 * 1024 * 1024,
    seoTitle: 'Compress and Optimize PDF File Bounds Privately',
    seoDescription: 'Shrink overall storage space by compiling underlying objects and pruning redundant fonts offline. Maintain readability and text layers.'
  },
  {
    id: 'heic-to-img',
    title: 'HEIC to JPG / PNG',
    description: 'Unlock proprietary iOS HEIF/HEIC photos directly in browser.',
    icon: 'FileImage',
    acceptedTypes: ['.heic', '.heif'],
    maxFreeSize: 5 * 1024 * 1024,
    maxProSize: 50 * 1024 * 1024,
    seoTitle: 'Convert HEIC/HEIF Pictures from iPhone directly to JPG or PNG',
    seoDescription: 'No need to buy cloud utilities. Decrypt standard apple raw photos and view them on Windows or Linux devices with high quality output.'
  }
];

export default function App() {
  const [selectedType, setSelectedType] = useState<ConversionType>('universal');
  const [isProEnabled, setIsProEnabled] = useState<boolean>(true);
  const [isProModalOpen, setIsProModalOpen] = useState<boolean>(false);
  const [processedCount, setProcessedCount] = useState<number>(0);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [lang, setLang] = useState<Language>('en');
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Initialize theme mode & conversions counts from localStorage safely
  useEffect(() => {
    // Determine path routing to show Admin Panel
    if (window.location.pathname === '/pimxmorphadmin') {
      setIsAdminView(true);
    } else {
      setIsAdminView(false);
    }

    // Capture the visitor metrics (device, browser, exact date & dynamic location lookup)
    if (window.location.pathname !== '/pimxmorphadmin') {
      recordActiveVisit().catch(e => console.error('Tracker registration error:', e));
    }

    const savedTheme = localStorage.getItem('offline_converter_theme');
    if (savedTheme === 'light') {
      setDarkMode(false);
    } else {
      setDarkMode(true);
    }

    const savedLang = localStorage.getItem('offline_converter_lang');
    if (savedLang && Object.keys(LANG_NAMES).includes(savedLang)) {
      setLang(savedLang as Language);
    }

    setIsProEnabled(true);

    // Check dynamic daily date
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('offline_converter_date');
    const savedCount = localStorage.getItem('offline_converter_processed_day_count');

    if (savedDate === today && savedCount) {
      setProcessedCount(parseInt(savedCount, 10));
    } else {
      // New day: reset usage counters
      localStorage.setItem('offline_converter_date', today);
      localStorage.setItem('offline_converter_processed_day_count', '0');
      setProcessedCount(0);
    }
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('offline_converter_lang', newLang);
  };

  // Update localStorage when conversion items increment
  const handleProcessedCountChange = (count: number) => {
    setProcessedCount(count);
    localStorage.setItem('offline_converter_processed_day_count', count.toString());
  };

  const handleToggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('offline_converter_theme', newMode ? 'dark' : 'light');
  };

  const handleUpgradeSuccess = () => {
    setIsProEnabled(true);
    localStorage.setItem('offline_converter_pro_bool', 'true');
  };

  // Map local active language fields onto core Converters payload safely
  const getLocalizedConverters = (): ConverterInfo[] => {
    return CONVERTERS.map((c) => {
      const loc = CONVERTER_LOCALIZATION[lang]?.[c.id] || CONVERTER_LOCALIZATION['en']?.[c.id];
      return {
        ...c,
        title: loc?.title || c.title,
        description: loc?.description || c.description,
        seoTitle: loc?.seoTitle || c.seoTitle,
        seoDescription: loc?.seoDescription || c.seoDescription,
      };
    });
  };

  const localizedConverters = getLocalizedConverters();
  const activeConverter = localizedConverters.find((c) => c.id === selectedType) || localizedConverters[0];
  const t = (key: string) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key;
  const isRtl = lang === 'fa' || lang === 'ar';

  // Dynamic SEO Metadata Injection Hook
  useEffect(() => {
    if (activeConverter) {
      const pageTitle = activeConverter.seoTitle 
        ? `${activeConverter.seoTitle} | PIMXMORPH` 
        : `${activeConverter.title} - Free Client-Side Multi-Format File Converter | PIMXMORPH`;
      document.title = pageTitle;

      // Update Meta Description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', activeConverter.seoDescription || activeConverter.description);

      // Update OpenGraph Title
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', pageTitle);

      // Update OpenGraph Description
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement('meta');
        ogDesc.setAttribute('property', 'og:description');
        document.head.appendChild(ogDesc);
      }
      ogDesc.setAttribute('content', activeConverter.seoDescription || activeConverter.description);
      
      // Update HTML lang attribute
      document.documentElement.lang = lang;
    }
  }, [activeConverter, lang]);

  if (isAdminView) {
    return <AdminPanel />;
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashLoader
            onComplete={() => setShowSplash(false)}
            lang={lang}
            darkMode={darkMode}
            onToggleTheme={handleToggleTheme}
          />
        )}
      </AnimatePresence>

      <div dir={isRtl ? 'rtl' : 'ltr'} className={darkMode ? 'dark min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans' : 'min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans'}>
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-3.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-extrabold tracking-widest text-lg sm:text-xl text-slate-900 dark:text-slate-100 font-sans uppercase">
              PIMXMORPH
            </span>
          </div>
 
          <div className="flex items-center gap-2 font-display">
            {/* Elegant Language Selector dropdown */}
            <LanguageDropdown
              currentLang={lang}
              onLanguageChange={handleLanguageChange}
              isRtl={isRtl}
            />
 
            {/* Theme Toggle Selection */}
            <button
              onClick={handleToggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 transition text-slate-500 dark:text-slate-400 cursor-pointer"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              id="theme-toggle"
            >
              {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Workspace Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <LandingHero
          converters={localizedConverters}
          selectedType={selectedType}
          onSelectType={(id) => setSelectedType(id)}
          lang={lang}
        />

        <div className="mt-8">
          <ConverterWidget
            currentConverter={activeConverter}
            onProcessedCountChange={handleProcessedCountChange}
            processedCount={processedCount}
            onSelectConverter={(id) => setSelectedType(id)}
            lang={lang}
          />
        </div>

        {/* Cloudflare Deploy Instructions & Dynamic FAQ Accordion */}
        <GuideSection lang={lang} />
      </main>

      {/* Footer Credentials */}
      <footer className="mt-20 py-8 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 text-center text-xs text-slate-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-semibold text-slate-400">
            {lang === 'fa' ? '© ۲۰۲۶ PIMXMORPH حریم خصوصی کاملاً حفظ می‌شود و پردازش در مرورگر شما صورت می‌گیرد.' : '© 2026 PIMXMORPH Client Sandbox. Keep your data private.'}
          </p>
          <div className="flex gap-4">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4.5 h-4.5" /> {t('active_client_tls') || 'Active Client TLS Encryption'}
            </span>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
