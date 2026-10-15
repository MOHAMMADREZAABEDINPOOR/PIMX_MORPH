import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useSpring,
  useScroll,
  useTransform,
} from "motion/react";
import { ArrowUpRight, ArrowRight, ShieldCheck } from "lucide-react";
import { Language } from "../utils/translations";
import { homeCopy } from "../utils/homeCopy";
import { copyFor } from '../utils/studioCopy';
import BrandMark from "./BrandMark";
import "./HomeSections.css";

type Family = "images" | "documents" | "media";

function Chapter({
  children,
  className,
  paused,
  id,
}: {
  children: ReactNode;
  className: string;
  paused: boolean;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "120px" });
  const [hidden, setHidden] = useState(() => typeof document !== 'undefined' && document.hidden);
  useEffect(() => {
    const change = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", change);
    return () => document.removeEventListener("visibilitychange", change);
  }, []);
  return (
    <section
      ref={ref}
      id={id}
      className={`home-chapter ${className}`}
      data-still={paused || !inView || hidden}
    >
      {children}
    </section>
  );
}

// Exact vector geometry: a folded sheet becomes image, text or sound.
function SheetArt({
  kind,
  className = "",
}: {
  kind: Family;
  className?: string;
}) {
  return (
    <svg
      className={`sheet-art ${className}`}
      viewBox="0 0 260 320"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 0H202L260 58V300Q260 320 240 320H20Q0 320 0 300V20Q0 0 20 0Z"
        fill="var(--sheet-fill)"
      />
      <path d="M202 0V42Q202 58 218 58H260Z" fill="var(--sheet-fold)" />
      {kind === "images" ? (
        <g>
          <rect x="26" y="78" width="208" height="148" rx="8" fill="#dbe3ff" />
          <circle cx="182" cy="112" r="19" fill="#ed8058" />
          <path d="M26 202L87 124L161 226H34Q26 226 26 218Z" fill="#2349e8" />
          <path
            d="M112 226L173 159L234 207V218Q234 226 226 226Z"
            fill="#8199f5"
          />
          <path
            d="M27 253H128M27 270H89"
            stroke="var(--sheet-ink)"
            strokeWidth="8"
            strokeLinecap="round"
            opacity=".3"
          />
        </g>
      ) : kind === "documents" ? (
        <g stroke="var(--sheet-ink)" strokeLinecap="round">
          <path d="M30 91H125" strokeWidth="16" />
          <path
            d="M30 128H222M30 149H222M30 170H181M30 204H222M30 225H222M30 246H156"
            strokeWidth="7"
            opacity=".35"
          />
          <path
            d="M174 285C190 262 198 264 195 275C204 261 211 267 206 275L230 270"
            stroke="#2349e8"
            strokeWidth="4"
          />
        </g>
      ) : (
        <g>
          <circle cx="130" cy="152" r="65" fill="#2349e8" />
          <path d="M114 124L154 152L114 180Z" fill="#fff" />
          {Array.from({ length: 23 }, (_, i) => (
            <rect
              key={i}
              x={29 + i * 9}
              y={260 - Math.sin(i * 1.7) ** 2 * 22}
              width="4"
              height={10 + Math.sin(i * 1.7) ** 2 * 44}
              rx="2"
              fill="var(--sheet-ink)"
            />
          ))}
        </g>
      )}
    </svg>
  );
}

function FormatGallery({ lang, paused }: { lang: Language; paused: boolean }) {
  const [family, setFamily] = useState<Family>("images");
  const reduce = useReducedMotion();
  const tiltX = useSpring(0, { stiffness: 100, damping: 24 });
  const tiltY = useSpring(0, { stiffness: 100, damping: 24 });
  const art = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: art,
    offset: ["start end", "end start"],
  });
  const unfolding = useTransform(scrollYProgress, [0, 0.45, 1], [26, 0, -12]);
  const unfoldY = useSpring(unfolding, { stiffness: 90, damping: 26 });
  const text = (key: Parameters<typeof homeCopy>[1]) => homeCopy(lang, key);
  const paths = {
    images: ["PNG", "WEBP", "JPG · GIF · BMP · PDF"],
    documents: ["PDF", "TXT", "DOCX · PNG · JPG"],
    media: ["WAV", "MP3", "FLAC · OGG · AAC · MP4"],
  };
  return (
    <Chapter className="format-gallery" id="format-world" paused={paused}>
      <div className="gallery-copy">
        <h2>{text("title")}</h2>
        <p>{text("intro")}</p>
        <div className="family-picker" role="group" aria-label={text("title")}>
          {(["images", "documents", "media"] as const).map((kind) => (
            <button
              key={kind}
              aria-pressed={family === kind}
              onClick={() => {
                setFamily(kind);
                tiltX.set(0);
                tiltY.set(0);
              }}
            >
              <span>{text(kind)}</span>
              <ArrowUpRight size={23} />
            </button>
          ))}
        </div>
        <p className="family-description" aria-live="polite">
          {text(
            family === "images"
              ? "imageNote"
              : family === "documents"
                ? "documentNote"
                : "mediaNote",
          )}
        </p>
        <a href="/upload" className="home-link">
          {text("explore")}
          <ArrowUpRight size={19} />
        </a>
      </div>
      <div
        ref={art}
        className="gallery-art"
        onPointerMove={(event) => {
          if (reduce || paused || event.pointerType !== "mouse") return;
          const bounds = event.currentTarget.getBoundingClientRect();
          tiltX.set(
            ((event.clientY - bounds.top - bounds.height / 2) / bounds.height) *
              -12,
          );
          tiltY.set(
            ((event.clientX - bounds.left - bounds.width / 2) / bounds.width) *
              14,
          );
        }}
        onPointerLeave={() => {
          tiltX.set(0);
          tiltY.set(0);
        }}
      >
        <motion.div
          className="gallery-perspective"
          style={{ rotateX: tiltX, rotateY: tiltY }}
        >
          <div className="folder-back" />
          <div className="folder-tab" />
          <motion.div
            className="paper-fan"
            style={{ y: reduce || paused ? 0 : unfoldY }}
            data-family={family}
          >
            <div className="fan-sheet fan-back">
              <SheetArt kind="documents" />
            </div>
            <div className="fan-sheet fan-middle">
              <SheetArt kind="media" />
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={family}
                className="fan-sheet fan-front"
                initial={{
                  opacity: 0.5,
                  y: reduce ? 0 : 24,
                  rotateY: reduce ? 0 : -12,
                }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -15 }}
                transition={{ duration: 0.35 }}
              >
                <SheetArt kind={family} />
                <strong className="fan-format">.{paths[family][0]}</strong>
              </motion.div>
            </AnimatePresence>
          </motion.div>
          <div className="folder-front">
            <BrandMark />
            <span>MORPH</span>
            <span className="folder-hole" />
          </div>
        </motion.div>
        <div className="format-route" aria-live="polite">
          <span>{paths[family][0]}</span>
          <ArrowRight size={22} />
          <strong>{paths[family][1]}</strong>
        </div>
        <p className="format-alternatives" dir="ltr">
          {paths[family][2]}
        </p>
      </div>
    </Chapter>
  );
}

function Journey({ lang, paused }: { lang: Language; paused: boolean }) {
  const text = (key: Parameters<typeof homeCopy>[1]) => homeCopy(lang, key);
  return (
    <Chapter className="file-journey" paused={paused}>
      <div className="journey-heading">
        <h2>{text("journey")}</h2>
        <p>{text("journeyNote")}</p>
      </div>
      <div className="journey-track">
        <div className="journey-stop journey-source">
          <div className="journey-sheet">
            <SheetArt kind="images" />
            <strong>.PNG</strong>
          </div>
          <p>{text("choose")}</p>
        </div>
        <div className="journey-machine">
          <div className="machine-rings">
            <i />
            <i />
            <i />
          </div>
          <div className="machine-core">
            <BrandMark />
          </div>
          <p>{text("change")}</p>
        </div>
        <div className="journey-stop journey-output">
          <div className="journey-sheet">
            <SheetArt kind="images" />
            <strong>.WEBP</strong>
            <span className="sheet-check">
              <ShieldCheck size={24} />
            </span>
          </div>
          <p>{text("keep")}</p>
        </div>
        <svg
          className="journey-path"
          viewBox="0 0 1000 300"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M100 160C280 160 290 80 500 80S760 160 900 160" />
          <path
            className="travelling-path"
            d="M100 160C280 160 290 80 500 80S760 160 900 160"
          />
        </svg>
      </div>
    </Chapter>
  );
}

function LocalWorkshop({ lang, paused }: { lang: Language; paused: boolean }) {
  const text = (key: Parameters<typeof homeCopy>[1]) => homeCopy(lang, key);
  return (
    <Chapter className="local-workshop" paused={paused}>
      <motion.div
        className="local-art"
        aria-hidden="true"
        initial={false}
        whileInView={{ rotateY: [0, -6, 0] }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.1 }}
      >
        <div className="local-platform">
          <svg viewBox="0 0 580 380" fill="none">
            <path
              d="M60 265L290 138L530 265L300 395Z"
              fill="var(--blue-pale)"
            />
            <path d="M60 265V278L300 408V395Z" fill="var(--line)" />
            <path d="M300 395L530 265V278L300 408Z" fill="var(--muted)" />
          </svg>
        </div>
        <div className="local-file local-file-one">
          <SheetArt kind="images" />
        </div>
        <div className="local-file local-file-two">
          <SheetArt kind="documents" />
        </div>
        <div className="local-vault">
          <div className="vault-top" />
          <div className="vault-side" />
          <div className="vault-face">
            <svg viewBox="0 0 100 110" fill="none">
              <path
                d="M22 47V32A28 28 0 0 1 78 32V47"
                stroke="currentColor"
                strokeWidth="9"
              />
              <rect
                x="10"
                y="43"
                width="80"
                height="62"
                rx="13"
                fill="currentColor"
              />
              <circle cx="50" cy="69" r="7" fill="var(--blue)" />
              <path
                d="M50 73V87"
                stroke="var(--blue)"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
        <div className="local-file local-file-three">
          <SheetArt kind="media" />
        </div>
      </motion.div>
      <div className="local-copy">
        <h2>{text("local")}</h2>
        <p>{text("localNote")}</p>
        <a href="/offline" className="home-link">
          {text("offline")}
          <ArrowUpRight size={20} />
        </a>
      </div>
    </Chapter>
  );
}

export default function HomeSections({
  lang,
  paused,
}: {
  lang: Language;
  paused: boolean;
}) {
  return (
    <div className="home-expansion">
      <FormatGallery lang={lang} paused={paused} />
      <Journey lang={lang} paused={paused} />
      <LocalWorkshop lang={lang} paused={paused} />
    </div>
  );
}

export function HomeFinale({
  lang,
  paused,
}: {
  lang: Language;
  paused: boolean;
}) {
  const say = copyFor(lang);
  const routes = [
    { from: 'PNG', to: 'WEBP', tool: 'image-convert', label: say('Images for the web', 'تصویر برای وب') },
    { from: 'PDF', to: 'TXT', tool: 'pdf-to-txt', label: say('Text from your documents', 'متن از سندهایت') },
    { from: 'WAV', to: 'MP3', tool: 'audio-convert', label: say('Audio for your player', 'صدا برای پخش‌کننده‌ات') },
  ];
  return (
    <Chapter className="home-finale handoff-section" paused={paused}>
      <div className="handoff-copy">
        <h2>{say('Have a file?', 'یک فایل داری؟')}<br/>{say('Give it a new format.', 'تبدیلش کن.')}</h2>
        <p>{say('Pick a starting point. Your file stays on your device, and its next version lands in your library.', 'از یکی از این مسیرها شروع کن. فایل روی دستگاهت می‌ماند و خروجی تازه‌اش در تاریخچه ذخیره می‌شود.')}</p>
        <a href="/upload" className="button button-dark">
          {homeCopy(lang, "explore")}
          <ArrowUpRight size={22} />
        </a>
      </div>
      <div className="handoff-routes">
        {routes.map(route => <a className="handoff-route" href={`/upload?tool=${route.tool}`} key={route.from}>
          <span className="handoff-label">{route.label}</span>
          <span className="handoff-formats" dir="ltr"><span>{route.from}</span><ArrowRight size={28}/><strong>{route.to}</strong></span>
          <ArrowUpRight className="handoff-arrow" size={24}/>
        </a>)}
      </div>
    </Chapter>
  );
}
