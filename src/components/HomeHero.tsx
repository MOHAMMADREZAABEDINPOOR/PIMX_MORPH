import TransformationStage from "./TransformationStage";
import { ArrowUpRight, ArrowDown, ShieldCheck,  } from 'lucide-react';
import { Language } from '../utils/translations';
import { copyFor } from '../utils/studioCopy';
function LiveLine({ text, rtl }: { text: string; rtl: boolean }) {
  let index = 0;
  return <span className="kinetic-line">{text.split(' ').map((word, w) => <span className="kinetic-word" key={w}>{w > 0 && ' '}{rtl ? <span className="kinetic-letter" style={{ animationDelay: `${w * 80}ms` }}>{word}</span> : [...word].map((letter, i) => <span className="kinetic-letter" key={i} style={{ animationDelay: `${index++ * 24}ms` }}>{letter}</span>)}</span>)}</span>;
}
export default function HomeHero({ lang, paused, onPause }: { lang: Language; paused: boolean; onPause: () => void }) {
  const say = copyFor(lang);
  return <section className="new-hero" aria-labelledby="hero-title">
    <div className="hero-statement"><h1 id="hero-title" tabIndex={-1}><LiveLine text={say('Same file.', 'همان فایل.')} rtl={lang === "fa" || lang === "ar"}/><br/><LiveLine text={say('New possibilities.', 'هزار امکان تازه.')} rtl={lang === "fa" || lang === "ar"}/></h1><div className="hero-description"><p>{say('A private studio for files that need a change. Convert images, documents and media right on your device.', 'استودیوی شخصی فایل‌های تو. تصویر، سند، صدا و ویدئو را روی دستگاه خودت به فرمت تازه تبدیل کن.')}</p><a href="/upload" className="button button-dark">{say('Make something new', 'یک چیز تازه بساز')}<ArrowUpRight size={22}/></a><span className="hero-reassurance"><ShieldCheck size={17}/>{say('Your files never leave your device.', 'فایل‌ها از دستگاهت خارج نمی‌شوند.')}</span></div></div>
    <TransformationStage lang={lang} paused={paused} onPause={onPause}/>
    <div className="hero-baseline"><span><span className="status-dot"/>{say('No account. No cloud. All yours.', 'بدون حساب. بدون فضای ابری. تماماً برای تو.')}</span><a href="#format-world">{say('Explore the possibilities', 'امکان‌ها را کشف کن')}<ArrowDown size={17}/></a></div>
  </section>;
}
