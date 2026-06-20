import React from 'react';
import { Terminal, ShieldAlert, Cpu, HelpCircle, Check, HelpCircle as HelpIcon, Sparkles } from 'lucide-react';
import { Language, TRANSLATIONS } from '../utils/translations';

interface GuideSectionProps {
  lang: Language;
}

export default function GuideSection({ lang }: GuideSectionProps) {
  const t = (key: string) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key;
  const isRtl = lang === 'fa' || lang === 'ar';

  return (
    <div className="max-w-4xl mx-auto mt-16 space-y-12 px-2" id="documentation-reference">
      {/* Dynamic SEO Informational Sections */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-6 font-sans">
          {t('how_it_works_title')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 dark:text-slate-300">
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center text-[10px]">1</span>
              {t('step_1_title')}
            </h4>
            <p className={`leading-relaxed text-slate-500 dark:text-slate-400 text-[11px] ${isRtl ? 'pr-7' : 'pl-7'}`}>
              {t('step_1_desc')}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center text-[10px]">2</span>
              {t('step_2_title')}
            </h4>
            <p className={`leading-relaxed text-slate-500 dark:text-slate-400 text-[11px] ${isRtl ? 'pr-7' : 'pl-7'}`}>
              {t('step_2_desc')}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center text-[10px]">3</span>
              {t('step_3_title')}
            </h4>
            <p className={`leading-relaxed text-slate-500 dark:text-slate-400 text-[11px] ${isRtl ? 'pr-7' : 'pl-7'}`}>
              {t('step_3_desc')}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center text-[10px]">4</span>
              {t('step_4_title')}
            </h4>
            <p className={`leading-relaxed text-slate-500 dark:text-slate-400 text-[11px] ${isRtl ? 'pr-7' : 'pl-7'}`}>
              {t('step_4_desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Deployment Guide Section */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm overflow-hidden" id="cf-pages-deployment-guide">
        <div className="flex items-center gap-2.5 mb-4">
          <Terminal className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest font-sans">
            {t('deployment_guide_title')}
          </h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          {t('deployment_guide_desc')}
        </p>

        <div className="space-y-5 text-xs text-slate-600 dark:text-slate-300">
          <div className={`flex gap-3 ${isRtl ? 'text-right' : 'text-left'}`}>
            <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0">STEP 1:</span>
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-200">{t('deploy_step_1_title')}</p>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5">{t('deploy_step_1_desc')}</p>
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 mt-2 font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                # Compile files to optimized production assets<br/>
                npm run build
              </div>
            </div>
          </div>

          <div className={`flex gap-3 ${isRtl ? 'text-right' : 'text-left'}`}>
            <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0">STEP 2:</span>
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-200">{t('deploy_step_2_title')}</p>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5">{t('deploy_step_2_desc')}</p>
            </div>
          </div>

          <div className={`flex gap-3 ${isRtl ? 'text-right' : 'text-left'}`}>
            <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0">STEP 3:</span>
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-200">{t('deploy_step_3_title')}</p>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5">{t('deploy_step_3_desc')}</p>
              <div className="mt-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-1 font-mono text-[10px] text-slate-600 dark:text-slate-300">
                <div><span className="text-amber-600 dark:text-amber-400 font-bold">Framework Preset:</span> Create React App (or None)</div>
                <div><span className="text-amber-600 dark:text-amber-400 font-bold">Build Command:</span> npm run build</div>
                <div><span className="text-amber-600 dark:text-amber-400 font-bold">Build Directory:</span> dist</div>
                <div><span className="text-amber-600 dark:text-amber-400 font-bold">Node.js Version:</span> 18 or above</div>
              </div>
            </div>
          </div>

          <div className={`flex gap-3 ${isRtl ? 'text-right' : 'text-left'}`}>
            <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0">STEP 4:</span>
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-200">{t('deploy_step_4_title')}</p>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5">{t('deploy_step_4_desc')}</p>
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-201 dark:border-slate-800 rounded-lg p-2.5 mt-2 font-mono text-[10px] text-blue-600 dark:text-blue-400">
                /*<br/>
                &nbsp;&nbsp;Cross-Origin-Opener-Policy: same-origin<br/>
                &nbsp;&nbsp;Cross-Origin-Embedder-Policy: require-corp
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="space-y-4" id="conversion-faqs">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <HelpIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          {t('faq_title')}
        </h3>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isRtl ? 'text-right' : 'text-left'}`}>
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-1">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">{t('faq_q1')}</h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('faq_a1')}
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-1">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">{t('faq_q2')}</h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('faq_a2')}
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-1">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">{t('faq_q3')}</h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('faq_a3')}
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-1">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">{t('faq_q4')}</h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('faq_a4')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
