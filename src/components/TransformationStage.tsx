import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, useSpring } from 'motion/react';
import { ArrowUpRight, ArrowRight, Pause, Play, Image, AudioLines, Film } from 'lucide-react';
import { Language } from '../utils/translations';
import { copyFor } from '../utils/studioCopy';

const examples = [
  { from: 'PNG', to: 'WEBP', name: ['Images', 'تصویر'], tool: 'image-convert', icon: Image },
  { from: 'WAV', to: 'MP3', name: ['Audio', 'صدا'], tool: 'audio-convert', icon: AudioLines },
  { from: 'MOV', to: 'MP4', name: ['Video', 'ویدئو'], tool: 'video-convert', icon: Film },
];

export default function TransformationStage({ lang, paused, onPause }: { lang: Language; paused: boolean; onPause: () => void }) {
  const say = copyFor(lang), reduced = useReducedMotion();
  const [selected, select] = useState(0), [hidden, setHidden] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const visible = useInView(stage, { margin: '100px' });
  const tiltX = useSpring(0, { stiffness: 90, damping: 24 });
  const tiltY = useSpring(0, { stiffness: 90, damping: 24 });
  const example = examples[selected], Icon = example.icon;
  const still = paused || reduced || !visible || hidden;
  useEffect(() => {
    const change = () => setHidden(document.hidden);
    change(); document.addEventListener('visibilitychange', change);
    return () => document.removeEventListener('visibilitychange', change);
  }, []);
  useEffect(() => { if (still) { tiltX.set(0); tiltY.set(0); } }, [still, tiltX, tiltY]);
  return <div className="transform-stage sculpture-stage" ref={stage} data-paused={paused} data-still={still} data-ui>
    <div className="transform-desk" onPointerMove={event => {
      if (still || event.pointerType === 'touch') return;
      const bounds = event.currentTarget.getBoundingClientRect();
      tiltX.set(-((event.clientY - bounds.top) / bounds.height - .5) * 8);
      tiltY.set(((event.clientX - bounds.left) / bounds.width - .5) * 12);
    }} onPointerLeave={() => { tiltX.set(0); tiltY.set(0); }}>
      <motion.div className="transform-papers" style={{ rotateX: tiltX, rotateY: tiltY }}>
        <div className="sample-file sample-source" dir="ltr">
          <span className="sample-corner"/><span className="sample-file-label">{say('Original file', 'فایل ورودی')}</span>
          <Icon size={42} strokeWidth={1.2}/><strong>{example.from}</strong><span className="sample-file-bottom">{say('On your device', 'روی دستگاه تو')}</span>
        </div>
        <div className="sample-file sample-output" dir="ltr" key={example.to}>
          <span className="sample-corner"/><span className="sample-file-label">{say('Next format', 'فرمت بعدی')}</span>
          <Icon size={42} strokeWidth={1.2}/><strong>{example.to}</strong><span className="sample-file-bottom">{say('Made for what’s next', 'آمادهٔ قدم بعد')}</span>
          <span className="specimen-sweep" aria-hidden="true"/>
        </div>
        <div className="paper-connector" aria-hidden="true"><ArrowRight size={25}/></div>
      </motion.div>
      <span className="desk-caption">{say('One file. A different way to use it.', 'همان فایل، برای یک کار تازه.')}</span>
    </div>
    <div className="transform-editorial">
      <div className="transform-options" role="group" aria-label={say('Explore file families', 'انتخاب خانوادهٔ فایل')}>{examples.map((item, index) => <button key={item.from} aria-label={`${item.from} to ${item.to}`} aria-pressed={selected === index} onClick={() => select(index)}>{say(item.name[0], item.name[1])}</button>)}</div>
      <div className="conversion-specimen" aria-live="polite"><strong dir="ltr">{example.from}<ArrowRight size={30}/>{example.to}</strong></div>
      <p>{say('A photo for your website. A track for your player. A clip you can share. Start with the file you already have.', 'عکس برای سایتت، صدا برای پخش‌کننده‌ات، ویدئو برای اشتراک‌گذاری. از همان فایلی که داری شروع کن.')}</p>
      <a className="transform-action" href={`/upload?tool=${example.tool}`}>{say('Convert your file', 'فایلت را تبدیل کن')}<ArrowUpRight size={23}/></a>
      <span className="transform-note">{say('Choose a file to see its compatible outputs.', 'با انتخاب فایل، خروجی‌های سازگار را می‌بینی.')}</span>
    </div>
    <button className="motion-toggle" onClick={onPause} aria-pressed={paused}>{paused ? say('Play motion', 'پخش حرکت') : say('Pause motion', 'توقف حرکت')}{paused ? <Play size={14}/> : <Pause size={14}/>}</button>
  </div>;
}
