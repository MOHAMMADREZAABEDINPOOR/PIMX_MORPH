import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, Cpu, Lock, CheckCircle2, Globe, Sun, Moon } from 'lucide-react';

interface SplashLoaderProps {
  onComplete: () => void;
  lang: 'en' | 'fa';
  darkMode: boolean;
  onToggleTheme?: () => void;
}

export default function SplashLoader({ onComplete, lang, darkMode, onToggleTheme }: SplashLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = lang === 'fa' ? [
    { text: 'تحلیل لایه‌های امنیتی مرورگر...', icon: Shield, color: 'text-blue-500' },
    { text: 'بارگذاری الگوهای رمزگذاری آفلاین...', icon: Lock, color: 'text-indigo-500' },
    { text: 'راه‌اندازی موتور امن PIMXMORPH...', icon: Cpu, color: 'text-emerald-500' },
    { text: 'تخصیص حافظه محلی برای پردازش...', icon: Sparkles, color: 'text-purple-500' },
    { text: 'محیط شما آماده و ۱۰۰٪ امن است.', icon: CheckCircle2, color: 'text-teal-500' },
  ] : [
    { text: 'Analyzing browser security sandboxes...', icon: Shield, color: 'text-blue-400' },
    { text: 'Loading offline encryption schemas...', icon: Lock, color: 'text-indigo-400' },
    { text: 'Configuring local PIMXMORPH micro-engine...', icon: Cpu, color: 'text-emerald-400' },
    { text: 'Allocating client sandbox memory threads...', icon: Sparkles, color: 'text-purple-400' },
    { text: 'System ready. Absolute Privacy active.', icon: CheckCircle2, color: 'text-teal-400' },
  ];

  useEffect(() => {
    // Elegant incremental progress simulation with varied step speeds
    const startTime = Date.now();
    const duration = 2800; // 2.8 seconds of beautiful loading

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const computed = Math.min(100, Math.floor((elapsed / duration) * 100));
      
      setProgress(computed);

      // Distribute steps based on computed progress bounds
      if (computed < 22) {
        setCurrentStep(0);
      } else if (computed < 45) {
        setCurrentStep(1);
      } else if (computed < 68) {
        setCurrentStep(2);
      } else if (computed < 90) {
        setCurrentStep(3);
      } else {
        setCurrentStep(4);
      }

      if (elapsed >= duration) {
        clearInterval(timer);
        // Let it rest for a tiny moment so the user sees the completed feedback
        setTimeout(() => {
          onComplete();
        }, 400);
      }
    }, 45);

    return () => clearInterval(timer);
  }, [onComplete]);

  const ActiveIcon = steps[currentStep]?.icon || Shield;

  return (
    <div 
      id="splash-loader-screen" 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-700 select-none overflow-hidden ${
        darkMode 
          ? 'bg-[#05070c] text-slate-100' 
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Decorative ambient glowing backdrops */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 transition-colors duration-1000 ${
          darkMode ? 'bg-indigo-600' : 'bg-indigo-300'
        }`} />
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 transition-colors duration-1000 ${
          darkMode ? 'bg-[#06b6d4]' : 'bg-sky-300'
        }`} />
      </div>

      {/* Floating control buttons inside loader */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className={`p-2.5 rounded-xl border transition duration-200 cursor-pointer ${
              darkMode 
                ? 'border-slate-800 bg-[#0c1222]/30 hover:bg-[#0c1222]/80 text-amber-400' 
                : 'border-slate-200 bg-white/55 hover:bg-white text-slate-600 hover:text-slate-900'
            }`}
            title={darkMode ? 'Switch to Light' : 'Switch to Dark'}
            id="splash-theme-toggle"
          >
            {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
        )}
      </div>

      {/* Main Core Content Wrap */}
      <div className="w-full max-w-lg px-6 flex flex-col items-center">
        
        {/* Futuristic SVG Morphing File Animation Logo */}
        <div className="relative mb-12 flex items-center justify-center w-36 h-36">
          
          {/* Rotating outer orbit indicator */}
          <svg className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke={darkMode ? '#3b82f6' : '#2563eb'}
              strokeWidth="1"
              strokeDasharray="6 12 18 6"
              className="opacity-40"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={darkMode ? '#10b981' : '#059669'}
              strokeWidth="0.5"
              strokeDasharray="4 8"
              className="opacity-30"
            />
          </svg>

          {/* Morphing glow blob */}
          <motion.div
            animate={{
              borderRadius: ["42% 58% 70% 30% / 45% 45% 55% 55%", "70% 30% 52% 48% / 60% 40% 60% 40%", "42% 58% 70% 30% / 45% 45% 55% 55%"],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`absolute w-28 h-28 blur-md mix-blend-screen opacity-10 transition-colors duration-1000 ${
              darkMode ? 'bg-gradient-to-tr from-indigo-500 to-emerald-500' : 'bg-gradient-to-tr from-blue-300 to-teal-300'
            }`}
          />

          {/* Central Transmutation Block */}
          <div className="relative z-10 flex items-center justify-center w-20 h-20">
            <div className={`absolute inset-0 rounded-2xl border backdrop-blur-xl flex items-center justify-center transition-colors duration-1000 ${
              darkMode 
                ? 'border-slate-800 bg-slate-900/60 shadow-[0_0_25px_rgba(37,99,235,0.15)]' 
                : 'border-slate-200/80 bg-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)]'
            }`}>
              {/* Spinning active step color ring */}
              <div className="absolute inset-1.5 rounded-xl border border-dashed animate-[spin_15s_linear_infinite] border-indigo-500/20" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ scale: 0.7, opacity: 0, rotate: -20 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.7, opacity: 0, rotate: 20 }}
                  transition={{ duration: 0.25 }}
                  className={`${steps[currentStep]?.color || 'text-indigo-500'}`}
                >
                  <ActiveIcon className="w-8 h-8" strokeWidth={1.8} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Title Signature with elegant Persian letters */}
        <div className="text-center space-y-2 mb-10">
          <motion.h1 
            initial={{ letterSpacing: "0.1em", opacity: 0, y: 10 }}
            animate={{ letterSpacing: "0.22em", opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`text-2xl font-black tracking-widest ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}
          >
            PIMXMORPH
          </motion.h1>
          <p className={`text-xs tracking-wider transition-colors duration-150 font-medium ${
            darkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {lang === 'fa' ? 'امنیت مطلق • مبدل آفلاین فایل' : 'ABSOLUTE PRIVACY • OFFLINE SANDBOX'}
          </p>
        </div>

        {/* Dynamic status card */}
        <div className={`w-full border rounded-2xl p-5 mb-8 backdrop-blur-md transition-colors duration-1000 ${
          darkMode 
            ? 'border-slate-900/80 bg-slate-950/40 shadow-sm' 
            : 'border-slate-200/60 bg-white/40 shadow-sm'
        }`}>
          <div className="space-y-4">
            
            {/* Step label text changes */}
            <div className="h-5 flex items-center justify-between text-xs">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentStep}
                  initial={{ opacity: 0, x: lang === 'fa' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: lang === 'fa' ? -10 : 10 }}
                  transition={{ duration: 0.2 }}
                  className={`font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}
                >
                  {steps[currentStep]?.text}
                </motion.span>
              </AnimatePresence>
              
              <span className={`font-mono font-bold ${darkMode ? 'text-[#06b6d4]' : 'text-indigo-600'}`}>
                {progress}%
              </span>
            </div>

            {/* Glowing slick progress line */}
            <div className={`w-full h-1.5 rounded-full overflow-hidden relative ${
              darkMode ? 'bg-slate-900' : 'bg-slate-200'
            }`}>
              <motion.div 
                className={`h-full rounded-full transition-all duration-100 ${
                  darkMode
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                    : 'bg-gradient-to-r from-blue-500 via-indigo-600 to-teal-400'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Micro details panel */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/10 dark:border-slate-900/40 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[pulse_1.5s_infinite]" />
                {lang === 'fa' ? 'حریم شخصی محلی' : 'SANDBOXED'}
              </span>
              <span>128-BIT CLIENT TLS</span>
              <span>WASM_THREAD_SET</span>
            </div>

          </div>
        </div>

        {/* Tiny skip trigger for immediate experience of the app */}
        <button
          onClick={onComplete}
          className={`text-[11px] font-semibold tracking-wider hover:underline transition duration-150 cursor-pointer ${
            darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          {lang === 'fa' ? 'رد کردن انیمیشن ورود' : 'Skip loading animation'}
        </button>

      </div>
    </div>
  );
}
