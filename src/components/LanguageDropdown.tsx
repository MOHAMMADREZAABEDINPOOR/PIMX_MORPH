import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LANG_NAMES, Language } from '../utils/translations';

interface LanguageDropdownProps {
  currentLang: Language;
  onLanguageChange: (newLang: Language) => void;
  isRtl: boolean;
}

const languageIcons: Record<Language, string> = {
  en: '🇺🇸',
  fa: '🇮🇷',
  ru: '🇷🇺',
  zh: '🇨🇳',
  fr: '🇫🇷',
  it: '🇮🇹',
  de: '🇩🇪',
  ar: '🇸🇦',
  la: '🏛️',
  el: '🇬🇷',
};

export default function LanguageDropdown({
  currentLang,
  onLanguageChange,
  isRtl,
}: LanguageDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectLanguage = (code: Language) => {
    onLanguageChange(code);
    setIsOpen(false);
  };

  return (
    <div className="relative select-none" ref={dropdownRef} id="custom-language-container">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition duration-200 cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-95"
        aria-label="Change language"
        id="language-dropdown-trigger"
      >
        <Globe className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        <span className="hidden sm:inline-block">{languageIcons[currentLang]}</span>
        <span className="font-semibold">{LANG_NAMES[currentLang]}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Menu item options */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{ zIndex: 100 }}
            className={`absolute ${
              isRtl ? 'left-0 origin-top-left' : 'right-0 origin-top-right'
            } mt-2 w-56 max-h-72 sm:max-h-80 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl shadow-slate-100/40 dark:shadow-slate-950/50 backdrop-blur-xl`}
          >
            <div className="px-2.5 py-1.5 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800/60 mb-1">
              Select Language / انتخاب زبان
            </div>
            <div className="space-y-0.5">
              {(Object.keys(LANG_NAMES) as Language[]).map((code) => {
                const isSelected = currentLang === code;
                return (
                  <button
                    key={code}
                    onClick={() => selectLanguage(code)}
                    className={`flex items-center justify-between w-full px-2.5 py-2 text-xs rounded-lg transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-500 text-white font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base select-none">{languageIcons[code]}</span>
                      <span>{LANG_NAMES[code]}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-white font-bold" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
