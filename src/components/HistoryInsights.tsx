import { ArrowUpRight, CalendarDays, Layers } from 'lucide-react';
import { Language } from '../utils/translations';
import { LibraryFile } from '../utils/library';
import { copyFor } from '../utils/studioCopy';
import './WorkspaceExtras.css';

export const dayKey = (time: number) => { const date = new Date(time); return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`; };
export interface HistoryFilter { day?: string; extension?: string }

export default function HistoryInsights({ lang, files, loading, filter, onFilter }: { lang: Language; files: LibraryFile[]; loading: boolean; filter: HistoryFilter; onFilter: (filter: HistoryFilter) => void }) {
  const say = copyFor(lang);
  const days = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setHours(12, 0, 0, 0); date.setDate(date.getDate() - 6 + index); return date; });
  const groups = Object.entries(files.reduce<Record<string, { count: number; bytes: number }>>((all, file) => {
    const ext = file.name.includes('.') ? file.name.split('.').pop()!.toUpperCase() : say('Other', 'سایر');
    all[ext] ||= { count: 0, bytes: 0 }; all[ext].count++; all[ext].bytes += file.blob.size; return all;
  }, {})).sort((a, b) => b[1].count - a[1].count);
  return <div className="history-insights">
    <section className="history-week" aria-labelledby="history-week-title"><div className="history-section-heading"><h2 id="history-week-title"><CalendarDays size={21}/>{say('Your week in files.', 'هفته‌ات به روایت فایل‌ها.')}</h2><span>{loading ? say('Loading…', 'در حال دریافت…') : say('Saved outputs · last 7 days', 'خروجی‌های ذخیره‌شده · ۷ روز اخیر')}</span></div>
      <div className="history-calendar">{days.map(date => { const key = dayKey(date.getTime()), count = files.filter(file => dayKey(file.created) === key).length; return <button key={key} className="history-day" data-active={!!count} aria-pressed={filter.day === key} onClick={() => onFilter({ ...filter, day: filter.day === key ? undefined : key })} disabled={loading || !count} aria-label={`${new Intl.DateTimeFormat(lang, { dateStyle: 'full' }).format(date)}: ${new Intl.NumberFormat(lang).format(count)} ${say('files', 'فایل')}`}><span>{new Intl.DateTimeFormat(lang, { weekday: 'short' }).format(date)}</span><strong>{new Intl.DateTimeFormat(lang, { day: 'numeric' }).format(date)}</strong><small>{loading ? '—' : count ? `${new Intl.NumberFormat(lang).format(count)} ${say('files', 'فایل')}` : say('No files', 'بدون فایل')}</small><span className="day-mark" aria-hidden="true"/></button>; })}</div>
      <p className="history-week-note">{say('Select a day with saved files to revisit its outputs.', 'یک روز دارای فایل را انتخاب کن تا خروجی‌های همان روز را ببینی.')}</p>
    </section>
    <section className="history-shelf" aria-labelledby="history-shelf-title"><div className="history-shelf-intro"><Layers size={25}/><h2 id="history-shelf-title">{say('The shape of your collection.', 'رنگ‌وبوی مجموعه‌ات.')}</h2><p>{say('Your saved formats, grouped together. Select a format to find its files.', 'فرمت‌های ذخیره‌شده، کنار هم. یک فرمت را انتخاب کن تا فایل‌هایش را پیدا کنی.')}</p></div>
      <div className="history-format-shelf">{groups.length ? groups.map(([ext, group], index) => <button className="history-format-folder" data-tone={index % 3} key={ext} aria-pressed={filter.extension === ext} onClick={() => onFilter({ ...filter, extension: filter.extension === ext ? undefined : ext })}><span className="history-folder-tab" aria-hidden="true"/><strong>{ext}</strong><span>{new Intl.NumberFormat(lang).format(group.count)} {say('files', 'فایل')}</span><small dir="ltr">{(group.bytes / 1024).toFixed(1)} KB</small></button>) : <div className="history-shelf-empty"><span className="empty-file-outline" aria-hidden="true"><Layers size={35}/></span><p>{loading ? say('Reading saved formats…', 'در حال خواندن فرمت‌ها…') : say('Your first output gives this shelf its first format.', 'اولین خروجی، اولین فرمت این قفسه را می‌سازد.')}</p><a href="/upload">{say('Create the first one', 'اولین فایل را بساز')}<ArrowUpRight size={18}/></a></div>}</div>
    </section>
  </div>;
}
