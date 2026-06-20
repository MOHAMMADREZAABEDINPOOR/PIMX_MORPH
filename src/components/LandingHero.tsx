import React from 'react';
import { ShieldCheck, Cpu, Zap, FileImage, FileText, Combine, Scissors, FileCode, Sliders, Sparkles } from 'lucide-react';
import { ConversionType, ConverterInfo } from '../types';
import { Language, TRANSLATIONS } from '../utils/translations';

interface LandingHeroProps {
  converters: ConverterInfo[];
  selectedType: ConversionType;
  onSelectType: (id: ConversionType) => void;
  lang: Language;
}

export default function LandingHero({
  converters,
  selectedType,
  onSelectType,
  lang,
}: LandingHeroProps) {
  const t = (key: string) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key;

  const isRtl = lang === 'fa' || lang === 'ar';

  return (
    <div className="text-center py-8">
      {/* Privacy Badge Accent */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-6">
        <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" id="badge-lock-icon" />
        <span>{t('hero_privacy_badge')}</span>
      </div>

      {/* Main Typography Header */}
      <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 max-w-4xl mx-auto leading-tight" id="main-greeting-header">
        {t('hero_title_1')} <span className="text-blue-600 dark:text-blue-400">{t('hero_title_2')}</span>
      </h1>
      <p className="mt-5 text-sm sm:text-base max-w-2xl mx-auto text-slate-600 dark:text-slate-300 leading-relaxed" id="main-editorial-p">
        {t('hero_description')}
      </p>

      {/* Trust factors panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto my-8 px-4" id="trust-factors-grid">
        <div className={`flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 ${isRtl ? 'text-right' : 'text-left'}`}>
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('zero_uploads')}</h4>
            <p className="text-xxs text-slate-500 dark:text-slate-400 mt-0.5">{t('zero_uploads_desc')}</p>
          </div>
        </div>
        <div className={`flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 ${isRtl ? 'text-right' : 'text-left'}`}>
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('wasm_speed')}</h4>
            <p className="text-xxs text-slate-500 dark:text-slate-400 mt-0.5">{t('wasm_speed_desc')}</p>
          </div>
        </div>
        <div className={`flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 ${isRtl ? 'text-right' : 'text-left'}`}>
          <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('completely_offline')}</h4>
            <p className="text-xxs text-slate-500 dark:text-slate-400 mt-0.5">{t('completely_offline_desc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icon mapper matching specified conversions
function renderIcon(type: ConversionType) {
  switch (type) {
    case 'universal':
      return <Sparkles className="w-4.5 h-4.5 text-amber-400 animate-pulse" />;
    case 'pdf-to-img':
      return <FileImage className="w-4.5 h-4.5" />;
    case 'pdf-to-docx':
      return <FileText className="w-4.5 h-4.5" />;
    case 'image-convert':
      return <Sliders className="w-4.5 h-4.5" />;
    case 'image-to-pdf':
      return <FileCode className="w-4.5 h-4.5 text-blue-500" />;
    case 'merge-pdf':
      return <Combine className="w-4.5 h-4.5" />;
    case 'split-pdf':
      return <Scissors className="w-4.5 h-4.5" />;
    case 'compress-pdf':
      return <FileCode className="w-4.5 h-4.5" />;
    case 'heic-to-img':
      return <FileImage className="w-4.5 h-4.5 text-rose-500" />;
  }
}
