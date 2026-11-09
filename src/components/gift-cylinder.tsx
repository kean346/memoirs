"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Pause, Play, ArrowUpRight } from "lucide-react";
import { gifts } from "@/lib/catalogue";
import { giftImages } from "./gift-preview";
import { useInView, useReducedMotion, wrap } from "./showcase-hooks";

// The supplied cylinder's magnetic dwell, smoothstep, 1350px perspective and layered thickness.
export default function GiftCylinder() {
  const { ref: root, visible } = useInView<HTMLElement>(.08);
  const reduced = useReducedMotion();
  const scene = useRef<HTMLDivElement>(null), cards = useRef<(HTMLDivElement | null)[]>([]);
  const motion = useRef({ progress: 0, target: 0, x: 0, y: 0, tx: 0, ty: 0 });
  const drag = useRef({ down: false, y: 0, progress: 0 });
  const wake = useRef<() => void>(() => {});
  const hover = useRef(false);
  const [paused, setPaused] = useState(false), [active, setActive] = useState(0);
  useEffect(() => {
    const el = scene.current;
    if (!el) return;
    let frame = 0, last = 0, height = el.clientHeight, cardH = 220, previous = -1;
    const state = motion.current, smooth = (v: number) => v * v * (3 - 2 * v);
    const tick = (now: number) => {
      frame = 0; const dt = Math.min(50, now - last) || 16; last = now;
      const automatic = !paused && !hover.current && !drag.current.down && !reduced;
      if (automatic) state.target += dt * .000096;
      state.progress = reduced ? state.target : state.progress + (state.target - state.progress) * (1 - Math.exp(-dt * .009));
      state.x += (state.tx - state.x) * .08; state.y += (state.ty - state.y) * .08;
      const rounded = Math.round(state.progress), diff = state.progress - rounded;
      const virtual = rounded + Math.sign(diff) * Math.pow(Math.abs(diff) * 2, 4.2) / 2;
      cards.current.forEach((card, i) => {
        if (!card) return;
        let offset = i - virtual; while (offset > gifts.length / 2) offset -= gifts.length; while (offset < -gifts.length / 2) offset += gifts.length;
        const abs = Math.abs(offset), sign = Math.sign(offset), gap = 30, D = 1350;
        let y = 0, z = 0, rot = 0;
        if (abs <= 1) { const t = smooth(abs); y = -sign * t * (cardH + gap); z = 400 + t * (220 - 400); rot = t * 132; }
        else { const t = smooth(Math.min(1, abs - 1)); const end = (height / 2 + 55) / (D / (D + 60)) - cardH / 2; y = -sign * ((cardH + gap) + t * (end - cardH - gap)); z = 220 + t * (-60 - 220); rot = 132 + t * (175 - 132); }
        const factor = Math.max(0, 1 - abs);
        card.style.transform = `translateY(${y.toFixed(2)}px) translateZ(${z.toFixed(2)}px) rotateX(${(-sign * rot - state.y * 12 * factor).toFixed(2)}deg) rotateY(${(state.x * 15 * factor).toFixed(2)}deg) rotateZ(-3deg)`;
        card.style.zIndex = String(Math.round(z + 500)); card.style.opacity = String(Math.min(1, (2.5 - abs) * 3));
        card.querySelectorAll<HTMLAnchorElement>("a").forEach(a => { a.tabIndex = factor > .6 ? 0 : -1; });
      });
      const index = wrap(rounded, gifts.length); if (index !== previous) { previous = index; setActive(index); }
      const settling = Math.abs(state.target - state.progress) > .0002 || Math.abs(state.tx - state.x) > .001 || Math.abs(state.ty - state.y) > .001;
      if (visible && !document.hidden && (automatic || settling)) frame = requestAnimationFrame(tick);
    };
    const start = () => { if (!frame && visible && !document.hidden) { last = performance.now(); frame = requestAnimationFrame(tick); } }; wake.current = start;
    const resize = () => { height = el.clientHeight; const width = Math.min(340, Math.max(190, el.clientWidth * .6)); cardH = width / 1.5925; el.style.setProperty("--cylinder-card-width", width + "px"); el.style.setProperty("--cylinder-card-height", cardH + "px"); start(); };
    const observer = new ResizeObserver(resize); observer.observe(el);
    const wheel = (e: WheelEvent) => { if (document.activeElement !== el && !e.shiftKey) return; e.preventDefault(); state.target += Math.max(-100, Math.min(100, e.deltaY)) / 300; start(); };
    el.addEventListener("wheel", wheel, { passive: false }); document.addEventListener("visibilitychange", start); resize();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); el.removeEventListener("wheel", wheel); document.removeEventListener("visibilitychange", start); wake.current = () => {}; };
  }, [visible, reduced, paused]);
  const advance = (step: number) => { motion.current.target = Math.round(motion.current.target) + step; setPaused(true); wake.current(); };
  return <section ref={root} className="gift-cylinder-section" id="keepsakes" aria-label="Three dimensional rotating keepsake cards">
    <div className="cylinder-editorial"><p className="eyebrow">OBJECTS OF AFFECTION / THE PERSONAL EDIT</p><h2>Small things.<br /><em>Extraordinary<br />meaning.</em></h2><p>A satin morning. A first toast. A name stitched into a memory. Turn through the little things that make it yours.</p><Link className="cylinder-cta" href={"/studio?request=gift&product=" + encodeURIComponent(gifts[active])}>Personalise {gifts[active].toLowerCase()} <ArrowUpRight size={17} /></Link><div className="cylinder-index" aria-live="polite"><span>0{active + 1} / 05</span><strong>{gifts[active]}</strong></div><p className="cylinder-note">Generated demonstration products · Price on request</p></div>
    <div ref={scene} className="cylinder-scene" tabIndex={0} role="group" aria-label="Gift carousel: drag the cards or use arrow keys"
      onPointerEnter={() => { hover.current = true; }}
      onPointerLeave={() => { hover.current = false; motion.current.tx = 0; motion.current.ty = 0; wake.current(); }}
      onPointerMove={e => { const r = e.currentTarget.getBoundingClientRect(); motion.current.tx = (e.clientX - r.left - r.width / 2) / (r.width / 2); motion.current.ty = (e.clientY - r.top - r.height / 2) / (r.height / 2); if (drag.current.down) motion.current.target = drag.current.progress + (drag.current.y - (e.pointerType === "touch" ? e.clientX : e.clientY)) / 180; wake.current(); }}
      onPointerDown={e => { if ((e.target as HTMLElement).closest("a,button")) return; e.currentTarget.focus({ preventScroll: true }); e.currentTarget.setPointerCapture(e.pointerId); drag.current = { down: true, y: e.pointerType === "touch" ? e.clientX : e.clientY, progress: motion.current.target }; }}
      onPointerUp={() => { drag.current.down = false; motion.current.target = Math.round(motion.current.target); wake.current(); }}
      onPointerCancel={() => { drag.current.down = false; wake.current(); }}
      onKeyDown={e => { if (["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(e.key)) { e.preventDefault(); advance(e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1); } }}>
      <div className="cylinder-camera"><div className="cylinder-axis">{gifts.map((gift, i) => <div ref={el => { cards.current[i] = el; }} className="cylinder-card" data-product={gift} key={gift}>
        {[-1.47, -.73, 0, .73, 1.47].map(z => <div key={z} className="cylinder-edge" style={{ transform: `translateZ(${z}px)` }} />)}
        <div className="cylinder-front"><div className="cylinder-card-top"><span>PRECIOUS MEMOIRS</span><span>0{i + 1}</span></div><img src={giftImages[gift]} alt={gift + " generated product"} draggable={false} /><div className="cylinder-card-bottom"><span>{gift}</span><Link aria-label={"Design " + gift} href={"/studio?request=gift&product=" + encodeURIComponent(gift)}><ArrowUpRight size={16} /></Link></div></div>
        <div className="cylinder-back"><span>MADE PERSONAL.</span><i>For your<br />precious moments.</i><p>Your lettering · Your colour · Your story</p><Link href={"/studio?request=gift&product=" + encodeURIComponent(gift)} tabIndex={-1}>Create your keepsake ↗</Link></div>
      </div>)}</div></div>
      <div className="cylinder-controls"><button aria-label="Previous gift" onClick={() => advance(-1)}><ArrowUp size={16} /></button><button aria-label={paused ? "Resume gift rotation" : "Pause gift rotation"} onClick={() => setPaused(!paused)}>{paused ? <Play size={14} /> : <Pause size={14} />}</button><button aria-label="Next gift" onClick={() => advance(1)}><ArrowDown size={16} /></button></div><span className="cylinder-drag-hint">DRAG TO TURN / HOVER TO HOLD</span>
    </div>
  </section>;
}
