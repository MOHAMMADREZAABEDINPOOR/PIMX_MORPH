import { useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowUpRight, MoveRight } from 'lucide-react';
import { Language } from '../utils/translations';
import { copyFor } from '../utils/studioCopy';
import './WorkspaceExtras.css';

export default function StudioExtras({ lang }: { lang: Language }) {
  const say = copyFor(lang);
  const [format, setFormat] = useState('webp');
  const [quality, setQuality] = useState(80);
  const [result, setResult] = useState<{ url: string; bytes: number; format: string; quality: number } | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true, url = '';
    const timer = setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 900; canvas.height = 620;
      const ctx = canvas.getContext('2d');
      if (!ctx) { setFailed(true); return; }
      ctx.fillStyle = '#eceee5'; ctx.fillRect(0, 0, 900, 620);
      ctx.fillStyle = '#2349e8'; ctx.fillRect(60, 60, 520, 500);
      ctx.fillStyle = '#ed8058'; ctx.beginPath(); ctx.arc(620, 310, 210, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f5f5f0'; ctx.font = 'bold 105px sans-serif'; ctx.fillText('MORPH', 100, 345);
      ctx.fillStyle = '#22241f'; ctx.font = '20px sans-serif'; ctx.fillText('900 × 620 / FORMAT STUDY', 65, 595);
      canvas.toBlob(blob => {
        if (!active) return;
        if (!blob || blob.type !== `image/${format}`) { setFailed(true); setResult(null); return; }
        url = URL.createObjectURL(blob); setResult({ url, bytes: blob.size, format, quality }); setFailed(false);
      }, `image/${format}`, quality / 100);
    }, 70);
    return () => { active = false; clearTimeout(timer); if (url) URL.revokeObjectURL(url); };
  }, [format, quality]);
  return <div className="studio-extras page-inset">
    <section className="format-lab" aria-labelledby="format-lab-title">
      <div className="lab-controls"><h2 id="format-lab-title">{say('A little room to experiment.', 'کمی جا برای تجربه.')}</h2><p>{say('Same image. Different possibilities. Change the format and quality to see the actual size of this sample.', 'یک تصویر، چند امکان متفاوت. فرمت و کیفیت را عوض کن و حجم واقعی همین نمونه را ببین.')}</p>
        <div className="lab-formats" role="group" aria-label={say('Sample format', 'فرمت نمونه')}>{['webp', 'jpeg', 'png'].map(item => <button key={item} aria-pressed={format === item} onClick={() => setFormat(item)}>{item === 'jpeg' ? 'JPG' : item.toUpperCase()}</button>)}</div>
        <label className="lab-quality">{say('Quality', 'کیفیت')}<output>{format === 'png' ? say('Lossless', 'بدون افت') : `${quality}%`}</output><input type="range" min="10" max="100" value={quality} disabled={format === 'png'} onChange={event => setQuality(Number(event.target.value))}/></label>
        <p className="lab-format-note">{format === 'png' ? say('PNG preserves every pixel. The quality slider does not affect this format.', 'PNG تمام پیکسل‌ها را حفظ می‌کند. تنظیم کیفیت روی این فرمت اثری ندارد.') : say('Lower quality usually means a smaller file. The result depends on the image.', 'کیفیت کمتر معمولاً فایل کوچک‌تری می‌سازد. نتیجه به خود تصویر بستگی دارد.')}</p>
        <a href="#studio" className="lab-own-file">{say('Now try your own file', 'حالا فایل خودت را امتحان کن')}<ArrowUpRight size={19}/></a>
      </div>
      <div className="lab-preview"><div className="lab-preview-image">{result && <img src={result.url} alt={say('Geometric sample encoded in the selected format', 'نمونهٔ هندسی با فرمت انتخاب‌شده')} width="900" height="620"/>}</div><div className="lab-receipt"><span>{say('Sample output', 'خروجی نمونه')}<strong dir="ltr">{result ? `${(result.bytes / 1024).toFixed(1)} KB` : '—'}</strong></span><span dir="ltr">900 × 620</span>{result && !failed && result.format === format && result.quality === quality && <a href={result.url} download={`morph-sample.${result.format}`} aria-label={say('Download sample', 'دانلود نمونه')}><ArrowDownToLine size={20}/></a>}</div>{failed && <p role="status">{say('This browser cannot encode that format. Try another.', 'مرورگر نمی‌تواند این فرمت را بسازد؛ فرمت دیگری را امتحان کن.')}</p>}</div>
    </section>
    <section className="studio-materials" aria-labelledby="studio-materials-title"><h2 id="studio-materials-title">{say('What are you making?', 'چه چیزی می‌سازی؟')}</h2><div className="material-routes">{[
      ['image-to-pdf', say('A document from photos', 'یک سند از چند عکس'), 'IMG', 'PDF', say('Gather your images in one file.', 'عکس‌هایت را در یک فایل جمع کن.')],
      ['audio-convert', say('A new version of a sound', 'نسخهٔ تازه‌ای از یک صدا'), 'WAV', 'MP3', say('Choose a format for your player.', 'فرمت مناسب پخش‌کننده‌ات را انتخاب کن.')],
      ['json-csv', say('Data ready for a spreadsheet', 'دادهٔ آماده برای صفحه‌گسترده'), 'JSON', 'CSV', say('Move between structured formats.', 'بین فرمت‌های ساختاریافته جابه‌جا شو.')],
    ].map(([id, title, from, to, note]) => <a href={`/upload?tool=${id}#studio`} key={id}><span className="material-format" dir="ltr"><span>{from}</span><MoveRight aria-hidden="true"/><strong>{to}</strong></span><h3>{title}</h3><p>{note}</p><ArrowUpRight className="material-arrow" size={22}/></a>)}</div></section>
  </div>;
}
