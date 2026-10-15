import { useId, useState } from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';
import StudioExtras from './StudioExtras';
import { Language } from '../utils/translations';
import { copyFor } from '../utils/studioCopy';
import './RouteSections.css';

export default function RouteSections({ lang, surface }: { lang: Language; surface: 'studio' | 'offline' }) {
  const say = copyFor(lang);
  if (surface === 'studio') return <StudioExtras lang={lang} />;

  return <div className="route-supplement page-inset">
    <section className="route-split" aria-labelledby="offline-formats-title"><div className="route-section-copy"><h2 id="offline-formats-title">{say('Know what travels with you.', 'بدان چه چیزهایی همراهت هستند.')}</h2><p>{say('Prepare while you’re connected. Check the kit above before you leave, then try a small conversion with your connection turned off.', 'وقتی اینترنت داری آماده شو. پیش از قطع اتصال، وضعیت بستهٔ بالا را بررسی کن و یک تبدیل کوچک را بدون اینترنت امتحان کن.')}</p><a className="route-text-link" href="/upload">{say('Try in the studio', 'امتحان در استودیو')}<ArrowUpRight size={18}/></a></div>
      <div className="route-capabilities"><div className="route-capability-head"><span>{say('Tools', 'ابزارها')}</span><span>{say('What to prepare', 'آماده‌سازی لازم')}</span></div>{[
        [say('Images & HEIC', 'تصویر و HEIC'), 'JPG · PNG · WebP', say('Everyday tools cached', 'ذخیره‌شدن ابزارهای روزمره')],
        [say('PDF & documents', 'PDF و سند'), 'PDF · DOCX · TXT', say('Everyday tools cached', 'ذخیره‌شدن ابزارهای روزمره')],
        [say('Structured data', 'داده‌های ساختاریافته'), 'JSON ↔ CSV', say('Everyday tools cached', 'ذخیره‌شدن ابزارهای روزمره')],
        [say('Audio & video', 'صدا و ویدئو'), 'MP3 · WAV · MP4 · WebM', say('Save the media engine too', 'موتور رسانه را هم ذخیره کن')],
        [say('Extra image formats', 'فرمت‌های بیشتر تصویر'), 'TIFF · GIF · BMP', say('Save the media engine too', 'موتور رسانه را هم ذخیره کن')],
      ].map(([title, formats, requirement]) => <div className="route-capability-row" key={title}><div><h3>{title}</h3><small dir="ltr">{formats}</small></div><p>{requirement}</p></div>)}</div>
    </section>
    <RouteQuestions lang={lang} items={[
      [say('Do I need to install the app?', 'برای کار آفلاین باید برنامه را نصب کنم؟'), say('Installation gives MORPH its own window or home-screen shortcut. Offline conversion depends on saved tools, so check the offline kit even if the app is installed.', 'نصب، یک پنجرهٔ مستقل یا میان‌بر در صفحهٔ اصلی به MORPH می‌دهد. تبدیل آفلاین به ذخیره‌شدن ابزارها بستگی دارد؛ حتی پس از نصب هم وضعیت بستهٔ آفلاین را بررسی کن.')],
      [say('What if offline tools stop working?', 'اگر ابزارهای آفلاین کار نکردند چه کنم؟'), say('Reconnect and reopen MORPH. Clearing browser data or low storage can remove cached tools. Check readiness above and download the media engine again if needed.', 'دوباره به اینترنت وصل شو و MORPH را باز کن. پاک‌کردن داده‌های مرورگر یا کمبود فضا ممکن است ابزارهای ذخیره‌شده را حذف کند. وضعیت بالا را بررسی کن و در صورت نیاز موتور رسانه را دوباره دریافت کن.')],
      [say('Will every media file convert?', 'آیا همهٔ فایل‌های رسانه‌ای تبدیل می‌شوند؟'), say('Codec support and available memory vary. A saved media engine enables offline processing, but cannot guarantee every input or output. Try a small representative file before travelling.', 'پشتیبانی کدک‌ها و حافظهٔ آزاد دستگاه متفاوت است. ذخیرهٔ موتور رسانه پردازش آفلاین را ممکن می‌کند، اما همهٔ ورودی‌ها و خروجی‌ها تضمین نمی‌شوند. پیش از سفر یک فایل کوچک از نوع موردنیازت را امتحان کن.')],
    ]}/>
  </div>;
}

function RouteQuestions({ lang, items }: { lang: Language; items: string[][] }) {
  const say = copyFor(lang);
  return <section className="route-questions"><h2>{say('A few useful answers.', 'چند پاسخ کاربردی.')}</h2><div>{items.map(([question, answer]) => <Question key={question} question={question} answer={answer}/>)}</div></section>;
}

function Question({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return <article className="route-question" data-open={open}>
    <h3><button id={`${id}-trigger`} aria-expanded={open} aria-controls={`${id}-answer`} onClick={() => setOpen(value => !value)}>{question}<Plus size={18} aria-hidden="true"/></button></h3>
    <div id={`${id}-answer`} className="question-reveal" role="region" aria-labelledby={`${id}-trigger`} aria-hidden={!open} inert={!open || undefined}><div><p>{answer}</p></div></div>
  </article>;
}
