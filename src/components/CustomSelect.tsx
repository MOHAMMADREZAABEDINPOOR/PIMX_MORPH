import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface SelectOption {
  value: string;
  label: string;
  desc?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  lang: string;
  id?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  lang,
  id,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isRtl = lang === 'fa' || lang === 'ar';

  // Find the currently selected option to render its title/labels in the trigger
  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div
      className="relative select-none w-full"
      ref={containerRef}
      id={id || 'custom-select-wrapper'}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 transition duration-200 cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`${isRtl ? 'text-right' : 'text-left'} truncate`}>
          {selectedOption?.label}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Options List Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{ zIndex: 50 }}
            className={`absolute left-0 right-0 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-1.5 shadow-xl shadow-slate-100/40 dark:shadow-slate-950/60 backdrop-blur-xl`}
            role="listbox"
          >
            <div className="space-y-0.5">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`flex items-center justify-between w-full px-3 py-2 text-xs rounded-lg transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-semibold'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className={`flex flex-col min-w-0 ${isRtl ? 'text-right items-start' : 'text-left items-start'}`}>
                      <span className="truncate">{option.label}</span>
                      {option.desc && (
                        <span
                          className={`text-[10px] mt-0.5 truncate ${
                            isSelected
                              ? 'text-blue-100'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {option.desc}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-white font-bold shrink-0 ml-2 mr-2" />
                    )}
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
