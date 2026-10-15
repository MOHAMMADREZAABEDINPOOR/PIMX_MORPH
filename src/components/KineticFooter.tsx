import { useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Language } from '../utils/translations';
import { copyFor } from '../utils/studioCopy';

function Letter({ letter, index, position, strength }: { letter: string; index: number; position: MotionValue<number>; strength: MotionValue<number> }) {
  const target = useTransform([position, strength], ([x, amount]: number[]) => -Math.exp(-Math.pow((x - (index + .5) / 5) * 4.5, 2)) * amount * 22);
  const y = useSpring(target, { stiffness: 135, damping: 23, mass: .8 });
  const rotate = useTransform(y, [-22, 0], [(index - 2) * 1.3, 0]);
  return <motion.span className="footer-glyph" style={{ y, rotate }}>{letter}</motion.span>;
}

export default function KineticFooter({ lang }: { lang: Language }) {
  const say = copyFor(lang), reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const position = useMotionValue(.5), strength = useMotionValue(0);
  return <div className="kinetic-footer" ref={ref} onPointerMove={event => {
    if (reduced) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    position.set((event.clientX - bounds.left) / bounds.width); strength.set(1);
    event.currentTarget.style.setProperty('--ink-x', `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty('--ink-y', `${event.clientY - bounds.top}px`);
  }} onPointerLeave={() => strength.set(0)} onFocusCapture={() => { if (!reduced) { position.set(.85); strength.set(.7); } }} onBlurCapture={() => strength.set(0)}>
    <div className="footer-word" aria-hidden="true" dir="ltr"><span className="footer-letters">{[...'MORPH'].map((letter, index) => <Letter key={letter} letter={letter} index={index} position={position} strength={strength}/>)}</span></div>
    <div className="footer-ink" aria-hidden="true" dir="ltr"><span className="footer-letters">{[...'MORPH'].map((letter, index) => <Letter key={letter} letter={letter} index={index} position={position} strength={strength}/>)}</span></div>
    <a className="footer-launch" href="/upload" aria-label={say('Open the conversion studio', 'باز کردن استودیوی تبدیل')}><ArrowUpRight strokeWidth={1.15}/></a>
  </div>;
}
