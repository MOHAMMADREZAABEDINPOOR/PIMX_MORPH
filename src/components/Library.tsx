import { useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowUpRight, File, Search, Trash2, FolderOpen, ShieldCheck } from 'lucide-react';
import { Language } from '../utils/translations';
import { copyFor } from '../utils/studioCopy';
import { LibraryFile, readLibrary, removeLibraryFile } from '../utils/library';
import { tools } from '../utils/catalog';
import HistoryInsights, { dayKey, HistoryFilter } from './HistoryInsights';

export default function Library({ lang }: { lang: Language }) {
  const say = copyFor(lang);
  const [files, setFiles] = useState<LibraryFile[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<HistoryFilter>({});
  const [tab, setTab] = useState<'files' | 'tools'>('files');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const load = () => readLibrary().then(items => { if (active) setFiles(items.sort((a,b) => b.created-a.created)); }).catch(() => { if(active) setError(say('Your browser could not open local storage. Check its storage permissions.', 'مرورگر نتوانست حافظهٔ محلی را باز کند. دسترسی ذخیره‌سازی را بررسی کن.')); }).finally(() => { if(active) setLoading(false); });
    load(); window.addEventListener('morph-library-change', load);
    return () => { active = false; window.removeEventListener('morph-library-change', load); };
  }, [lang]);
  const filtered = files.filter(file => file.name.toLowerCase().includes(query.toLowerCase()) && (!filter.day || dayKey(file.created) === filter.day) && (!filter.extension || file.name.toUpperCase().endsWith(`.${filter.extension}`)));
  const hasFilter = !!(filter.day || filter.extension);
  const download = (file: LibraryFile) => {
    const url = URL.createObjectURL(file.blob), a = document.createElement('a');
    a.href = url; a.download = file.name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 30000);
  };
  return <section className="library-page page-inset" aria-labelledby="library-title" data-ui>
    <div className="page-intro"><h1 id="library-title" tabIndex={-1}>{say('Your next chapter.', 'فایل‌هایت، همین‌جا.')}</h1><p>{say('A home for your converted files. Saved in this browser, ready when you are.', 'خانه‌ای برای فایل‌های تبدیل‌شده؛ ذخیره در همین مرورگر، آماده برای دانلود دوباره.')}</p></div>
    <div id="library-browse" className="library-toolbar"><div className="library-tabs" role="group" aria-label={say('Library view', 'نمای تاریخچه')}><button aria-pressed={tab==='files'} onClick={() => setTab('files')}>{say('My files', 'فایل‌های من')} <span>{files.length}</span></button><button aria-pressed={tab==='tools'} onClick={() => setTab('tools')}>{say('Tool library', 'کتابخانهٔ ابزارها')}</button></div><label className="library-search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder={say('Find a file or tool', 'جست‌وجوی فایل یا ابزار')} aria-label={say('Search library', 'جست‌وجو در تاریخچه')}/></label></div>
    {tab === 'files' && hasFilter && <div className="history-active-filter"><span>{say('Showing selected outputs', 'نمایش خروجی‌های انتخاب‌شده')}{filter.extension && <bdi> · {filter.extension}</bdi>}</span><button onClick={() => setFilter({})}>{say('Show all files', 'نمایش همهٔ فایل‌ها')}</button></div>}
    {error && <p role="alert" className="error-message">{error}</p>}
    {tab==='files' ? loading ? <p role="status">{say('Opening your library…', 'در حال باز کردن تاریخچه…')}</p> : filtered.length ? <div className="library-list">{filtered.map(file => <article className="library-row" key={file.id}><span className="library-file-icon"><File size={25}/><small>{file.name.split('.').pop()}</small></span><div><h2 dir="auto">{file.name}</h2><p>{new Intl.DateTimeFormat(lang, { dateStyle: 'medium' }).format(file.created)} · {(file.blob.size/1024).toFixed(1)} KB</p></div><button className="icon-button" onClick={() => download(file)} aria-label={`${say('Download', 'دانلود')} ${file.name}`}><ArrowDownToLine size={20}/></button><button className="icon-button library-delete" onClick={async () => { try { await removeLibraryFile(file.id); setFiles(items=>items.filter(item=>item.id!==file.id)); } catch { setError(say('Could not delete this file. Try again.', 'حذف فایل انجام نشد. دوباره امتحان کن.')); } }} aria-label={`${say('Delete', 'حذف')} ${file.name}`}><Trash2 size={18}/></button></article>)}</div> : <div className="library-empty"><FolderOpen size={72} strokeWidth={1}/><h2>{query || hasFilter ? say('No matches yet.', 'نتیجه‌ای پیدا نشد.') : say('Room for something new.', 'جا برای یک فایل تازه.')}</h2><p>{query || hasFilter ? say('Try another name.', 'نام دیگری را جست‌وجو کن.') : say('Convert your first file. Its finished version will appear here automatically.', 'اولین فایلت را تبدیل کن. خروجی به‌صورت خودکار اینجا ذخیره می‌شود.')}</p><a href="/upload" className="button button-dark">{say('Open the studio', 'باز کردن استودیو')}<ArrowUpRight size={20}/></a></div> : <div className="tool-library">{tools.filter(tool=>`${tool.en} ${tool.fa} ${tool.input} ${tool.output}`.toLowerCase().includes(query.toLowerCase())).map(tool=><a className="tool-library-row" href={`/upload?tool=${tool.id}`} key={tool.id}><h2>{lang==='fa' ? tool.fa : tool.en}</h2><p dir="ltr">{tool.input} → {tool.output}</p><ArrowUpRight size={22}/></a>)}</div>}
    <p className="library-privacy"><ShieldCheck size={18}/>{say('Only on this device. Clearing browser data removes these files. Keep a download of anything important.', 'فقط روی همین دستگاه. پاک‌کردن داده‌های مرورگر این فایل‌ها را حذف می‌کند؛ فایل‌های مهم را دانلود کن.')}</p>
    <HistoryInsights lang={lang} files={files} loading={loading || !!error} filter={filter} onFilter={next => { setFilter(next); setTab('files'); requestAnimationFrame(() => document.getElementById('library-browse')?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })); }} />


  </section>;
}
