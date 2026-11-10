"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { gifts } from "@/lib/catalogue";
import { giftImages } from "./gift-preview";
import { useInView, wrap } from "./showcase-hooks";

// The supplied cylinder's magnetic dwell, smoothstep, 1350px perspective and layered thickness.
export default function GiftCylinder() {
  const { ref: root, visible } = useInView<HTMLElement>(.08);
  const scene = useRef<HTMLDivElement>(null), cards = useRef<(HTMLDivElement | null)[]>([]);
  const motion = useRef({ elapsed: 0 });
  const wake = useRef<() => void>(() => {});
  const [active, setActive] = useState(0);
  useEffect(() => {
    const el = scene.current;
    if (!el) return;
    let frame = 0, last = 0, height = el.clientHeight, cardH = 220, previous = -1, disposed = false;
    const state = motion.current, smooth = (v: number) => v * v * (3 - 2 * v);
    const tick = (now: number) => {
      frame = 0; if (disposed) return; const dt = Math.min(50, now - last) || 16; last = now;
      // Hold each front card for two seconds, then move briskly to the next.
      const hold = 2000, transition = 800, cycle = hold + transition;
      state.elapsed += dt;
      const turn = Math.floor(state.elapsed / cycle);
      const phase = Math.max(0, (state.elapsed % cycle - hold) / transition);
      const virtual = turn + smooth(phase);
      const rounded = Math.round(virtual);
      cards.current.forEach((card, i) => {
        if (!card) return;
        let offset = i - virtual; while (offset > gifts.length / 2) offset -= gifts.length; while (offset < -gifts.length / 2) offset += gifts.length;
        const abs = Math.abs(offset), sign = Math.sign(offset), gap = 30, D = 1350;
        let y = 0, z = 0, rot = 0;
        if (abs <= 1) { const t = smooth(abs); y = -sign * t * (cardH + gap); z = 400 + t * (220 - 400); rot = t * 132; }
        else { const t = smooth(Math.min(1, abs - 1)); const end = (height / 2 + 55) / (D / (D + 60)) - cardH / 2; y = -sign * ((cardH + gap) + t * (end - cardH - gap)); z = 220 + t * (-60 - 220); rot = 132 + t * (175 - 132); }
        card.style.transform = `translateY(${y.toFixed(2)}px) translateZ(${z.toFixed(2)}px) rotateX(${(-sign * rot).toFixed(2)}deg) rotateZ(-3deg)`;
        card.style.zIndex = String(Math.round(z + 500)); card.style.opacity = String(Math.min(1, (2.5 - abs) * 3));
      });
      const index = wrap(rounded, gifts.length); if (index !== previous) { previous = index; setActive(index); }
      if (visible && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const start = () => { if (!disposed && !frame && visible && !document.hidden) { last = performance.now(); frame = requestAnimationFrame(tick); } }; wake.current = start;
    const resize = () => { if (disposed) return; height = el.clientHeight; const width = Math.min(340, Math.max(190, el.clientWidth * .6)); cardH = width / 1.5925; el.style.setProperty("--cylinder-card-width", width + "px"); el.style.setProperty("--cylinder-card-height", cardH + "px"); start(); };
    const observer = new ResizeObserver(resize); observer.observe(el);
    document.addEventListener("visibilitychange", start); resize();
    return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener("visibilitychange", start); wake.current = () => {}; };
  }, [visible]);
  return <section ref={root} className="gift-cylinder-section" id="keepsakes" aria-label="Three dimensional rotating keepsake cards">
    <div className="cylinder-editorial"><p className="eyebrow">OBJECTS OF AFFECTION / THE PERSONAL EDIT</p><h2>Small things.<br /><em>Extraordinary<br />meaning.</em></h2><p>A satin morning. A first toast. A name stitched into a memory. Little things with a personal meaning, gently coming into view.</p><Link className="cylinder-cta" href="/studio?request=gift">Personalise a keepsake <ArrowUpRight size={17} /></Link><div className="cylinder-index" aria-live="off"><span>0{active + 1} / 05</span><strong>{gifts[active]}</strong></div><p className="cylinder-note">Generated demonstration products · Price on request</p></div>
    <div ref={scene} className="cylinder-scene cylinder-autoplay" aria-hidden="true">
      <div className="cylinder-camera"><div className="cylinder-axis">{gifts.map((gift, i) => <div ref={el => { cards.current[i] = el; }} className="cylinder-card" data-product={gift} key={gift}>
        {[-1.47, -.73, 0, .73, 1.47].map(z => <div key={z} className="cylinder-edge" style={{ transform: `translateZ(${z}px)` }} />)}
        <div className="cylinder-front"><div className="cylinder-card-top"><span>PRECIOUS MEMOIRS</span><span>0{i + 1}</span></div><img src={giftImages[gift]} alt={gift + " generated product"} draggable={false} /><div className="cylinder-card-bottom"><span>{gift}</span></div></div>
        <div className="cylinder-back"><span>MADE PERSONAL.</span><i>For your<br />precious moments.</i><p>Your lettering · Your colour · Your story</p><span className="cylinder-back-signature">PRECIOUS MEMOIRS</span></div>
      </div>)}</div></div>

    </div>
  </section>;
}
