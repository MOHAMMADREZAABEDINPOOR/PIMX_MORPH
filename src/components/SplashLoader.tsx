import { motion, useReducedMotion } from "motion/react";
import { Sun, Moon } from "lucide-react";
import BrandMark from "./BrandMark";
import LanguageDropdown from "./LanguageDropdown";
import { Language } from "../utils/translations";
import { flowCopy } from "../utils/flowCopy";
import { copyFor } from "../utils/studioCopy";
export default function SplashLoader({
  lang,
  theme,
  ready,
  onEntered,
  onLanguageChange,
  onToggleTheme,
}: {
  lang: Language;
  theme: string;
  ready: boolean;
  onEntered: () => void;
  onLanguageChange: (lang: Language) => void;
  onToggleTheme: () => void;
}) {
  const reduced = useReducedMotion(),
    say = copyFor(lang);
  return (
    <motion.div
      className="boot-screen"
      role="region"
      aria-label={flowCopy(lang, "loadingAria")}
      dir={lang === "fa" || lang === "ar" ? "rtl" : "ltr"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: reduced ? "blur(0px)" : "blur(5px)" }}
      transition={{ duration: reduced ? 0 : 0.44, ease: [0.16, 1, 0.3, 1] }}
      onAnimationComplete={onEntered}
    >
      <div className="boot-controls">
        <LanguageDropdown
          currentLang={lang}
          onLanguageChange={onLanguageChange}
          isRtl={lang === "fa" || lang === "ar"}
        />
        <button
          className="icon-button"
          onClick={onToggleTheme}
          aria-label={say("Switch color theme", "تغییر حالت روشن و تیره")}
        >
          {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
        </button>
      </div>
      <div className="boot-content">
        <div className="boot-mark">
          <BrandMark />
        </div>
        <span className="boot-brand" dir="ltr">
          PIMX MORPH
        </span>
        <h1>{flowCopy(lang, "loadingTitle")}</h1>
        <p role="status" aria-live="polite">
          {flowCopy(lang, ready ? "loadingReady" : "loadingNote")}
        </p>
        <span className="boot-indicator" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </div>
      <p className="boot-footnote">{flowCopy(lang, "localHint")}</p>
    </motion.div>
  );
}
