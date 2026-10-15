import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Language } from '../utils/translations';
import { copyFor } from '../utils/studioCopy';
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  return (
    <div className="faq-item" data-expanded={expanded}>
      <h3 className="faq-question">
        <button id={`${id}-question`} type="button" aria-expanded={expanded} aria-controls={`${id}-answer`} onClick={() => setExpanded(value => !value)}>
          <ChevronDown className="faq-chevron" size={18} aria-hidden="true" />
          <span>{question}</span>
        </button>
      </h3>
      <div id={`${id}-answer`} className="faq-answer" role="region" aria-labelledby={`${id}-question`} aria-hidden={!expanded} inert={!expanded || undefined}>
        <div className="faq-answer-clip"><p>{answer}</p></div>
      </div>
    </div>
  );
}
export default function HomeFAQ({ lang }: { lang: Language }) {
  const say = copyFor(lang);
  const questions = [
    [say('What is PIMX MORPH?', 'PIMX MORPH چیست؟'), say('A browser-based file conversion studio. Choose a file, select a compatible output, then convert and download it on your device. No account is required.', 'استودیوی تبدیل فایل در مرورگر است. فایل را انتخاب کن، فرمت سازگار را مشخص کن و خروجی را روی دستگاهت بساز و دانلود کن. نیازی به حساب کاربری نیست.')],
    [say('Are my files uploaded?', 'فایل‌هایم آپلود می‌شوند؟'), say('No. Selecting a file gives the browser local access to process it. Your file contents are never sent to a conversion server. The library stores finished files in this browser only.', 'نه. انتخاب فایل فقط به مرورگر اجازهٔ پردازش محلی می‌دهد. محتوای فایل به سرور تبدیل ارسال نمی‌شود. تاریخچه هم خروجی‌ها را فقط در همین مرورگر نگه می‌دارد.')],
    [say('Which formats can I convert?', 'چه فرمت‌هایی را می‌توانم تبدیل کنم؟'), say('MORPH includes image and HEIC conversion, PDF tools, documents, structured data, audio and video. Compatible outputs appear after you select a file. Media support depends on the available codecs and your device’s memory.', 'MORPH ابزارهای تصویر و HEIC، PDF، سند، داده، صدا و ویدئو دارد. پس از انتخاب فایل، خروجی‌های سازگار نمایش داده می‌شوند. پشتیبانی رسانه به کدک‌ها و حافظهٔ دستگاه بستگی دارد.')],
    [say('Does it work offline?', 'بدون اینترنت هم کار می‌کند؟'), say('Open the Offline page to check which tools are saved. Everyday tools are cached after the app loads; the media engine is an additional download. Save it before disconnecting.', 'در صفحهٔ آفلاین وضعیت ذخیرهٔ ابزارها را ببین. ابزارهای روزمره پس از بارگذاری برنامه کش می‌شوند؛ موتور رسانه دانلود جداگانه دارد. پیش از قطع اینترنت آن را ذخیره کن.')],
  ];
  return <section className="home-faq" aria-labelledby="faq-title"><h2 id="faq-title">{say('A few things to know.', 'چند نکته، پیش از شروع.')}</h2><div>{questions.map(([q,a], index)=><FAQItem key={index} question={q} answer={a}/>)}</div></section>;
}
