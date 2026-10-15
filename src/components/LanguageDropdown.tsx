import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, ChevronDown, Globe2 } from "lucide-react";
import { Language, LANG_NAMES } from "../utils/translations";
const codes = Object.keys(LANG_NAMES) as Language[];
export default function LanguageDropdown({
  currentLang,
  onLanguageChange,
  isRtl,
}: {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  isRtl: boolean;
}) {
  const [open, setOpen] = useState(false),
    [active, setActive] = useState(codes.indexOf(currentLang));
  const root = useRef<HTMLDivElement>(null),
    trigger = useRef<HTMLButtonElement>(null),
    search = useRef(""),
    timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const id = useId(),
    reduced = useReducedMotion();
  const label = (code: Language) => LANG_NAMES[code].split(" (")[0];
  const select = (index: number) => {
    onLanguageChange(codes[index]);
    setOpen(false);
    trigger.current?.focus();
  };
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  useEffect(() => {
    if (open)
      document
        .getElementById(`${id}-${active}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [open, active, id]);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <div
      ref={root}
      className="language-picker"
      dir={isRtl ? "rtl" : "ltr"}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        className={`language-trigger ${open ? "is-open" : ""}`}
        type="button"
        role="combobox"
        aria-label="Language / زبان"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-haspopup="listbox"
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        onClick={() => {
          setActive(codes.indexOf(currentLang));
          setOpen(!open);
        }}
        onKeyDown={(event) => {
          if (
            [
              "ArrowDown",
              "ArrowUp",
              "Home",
              "End",
              "Enter",
              " ",
              "Escape",
            ].includes(event.key)
          )
            event.preventDefault();
          if (event.key === "Escape") {
            setOpen(false);
            return;
          }
          if (event.key === "Tab") {
            setOpen(false);
            return;
          }
          if (event.key === "Enter" || event.key === " ") {
            if (open) select(active);
            else {
              setActive(codes.indexOf(currentLang));
              setOpen(true);
            }
            return;
          }
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            if (!open) {
              setActive(codes.indexOf(currentLang));
              setOpen(true);
            } else
              setActive(
                (index) =>
                  (index +
                    (event.key === "ArrowDown" ? 1 : -1) +
                    codes.length) %
                  codes.length,
              );
            return;
          }
          if (event.key === "Home") {
            setOpen(true);
            setActive(0);
            return;
          }
          if (event.key === "End") {
            setOpen(true);
            setActive(codes.length - 1);
            return;
          }
          if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
            search.current += event.key.toLocaleLowerCase();
            clearTimeout(timer.current);
            timer.current = setTimeout(() => {
              search.current = "";
            }, 650);
            const match = codes.findIndex((code) =>
              label(code).toLocaleLowerCase().startsWith(search.current),
            );
            if (match >= 0) {
              setOpen(true);
              setActive(match);
            }
          }
        }}
      >
        <Globe2 size={16} />
        <span className="language-name">{label(currentLang)}</span>
        <span className="language-short" aria-hidden="true">
          {currentLang.toUpperCase()}
        </span>
        <ChevronDown size={13} className="language-chevron" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={id}
            role="listbox"
            aria-label="Language / زبان"
            className="language-menu"
            initial={{
              opacity: 0,
              y: reduced ? 0 : 7,
              scale: reduced ? 1 : 0.98,
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduced ? 0 : 3 }}
            transition={{
              duration: reduced ? 0 : 0.24,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {codes.map((code, index) => (
              <div
                key={code}
                id={`${id}-${index}`}
                role="option"
                aria-selected={currentLang === code}
                className={`language-option ${active === index ? "is-active" : ""} ${currentLang === code ? "is-selected" : ""}`}
                onPointerMove={() => setActive(index)}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => select(index)}
              >
                <span
                  lang={code}
                  dir={code === "fa" || code === "ar" ? "rtl" : "ltr"}
                >
                  {label(code)}
                </span>
                <span className="language-code">
                  {currentLang === code ? (
                    <Check size={16} />
                  ) : (
                    code.toUpperCase()
                  )}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
