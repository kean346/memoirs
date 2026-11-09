"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { gowns, gifts } from "@/lib/catalogue";
import { giftImages } from "./gift-preview";
import { useInView, useReducedMotion, wrap } from "./showcase-hooks";

// Depth stops and interpolation from the supplied Maison Vell reference.
const KX = [1.2, .744, .496, .346, .2, .085];
const KF = [1.14, .89, .777, .704, .64, .59];
const KH = [1.18, .832, .574, .436, .29, .19];
const KB = [0, 0, 1.5, 4, 8, 12];
const KO = [0, 1, 1, 1, .65, 0];
const pieces = gowns.flatMap((gown, i) => [
  { name: gown, image: "/images/gown-" + i + ".webp", href: "/collections/" + ["seraphina", "aurelia", "celeste", "vivienne", "elara"][i], kind: "THE SILHOUETTE" },
  { name: gifts[i], image: giftImages[gifts[i]], href: "/studio?request=gift&product=" + encodeURIComponent(gifts[i]), kind: "THE FINISHING TOUCH" },
]);
export default function RunwayLookbook({ select, page = false }: { select: (name: string) => void; page?: boolean }) {
  const { ref: root, visible } = useInView<HTMLElement>(.05);
  const reduced = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null), rail = useRef<HTMLDivElement>(null);
  const models = useRef<(HTMLDivElement | null)[]>([]), cards = useRef<(HTMLAnchorElement | null)[]>([]);
  const roll = useRef<HTMLDivElement>(null), ring = useRef<HTMLDivElement>(null);
  const motion = useRef({ p: 0, target: 0, x: 0, y: 0, cx: 0, cy: 0 });
  const wake = useRef<() => void>(() => {});
  const drag = useRef({ down: false, x: 0, start: 0, moved: 0 });
  const [active, setActive] = useState(0), [dragging, setDragging] = useState(false);
  useEffect(() => {
    const el = stage.current, track = rail.current, rootEl = root.current;
    if (!el || !track || !rootEl) return;
    let disposed = false;
    let frame = 0, last = 0, width = 0, height = 0, base = 0, cardSize = 0, mobile = false, previous = -1, timer: ReturnType<typeof setTimeout>;
    const state = motion.current;
    const paint = () => {
      models.current.forEach((model, i) => {
        if (!model) return;
        let d = wrap(i - state.p, gowns.length); if (d > gowns.length - 1) d -= gowns.length;
        const k = Math.max(0, Math.min(5, d + 1)), a = Math.floor(k), b = Math.min(5, a + 1), t = k - a;
        const mix = (values: number[]) => values[a] + (values[b] - values[a]) * t;
        const ratio = Number(model.dataset.ratio || 2 / 3);
        model.style.width = base * ratio + "px";
        const h = mix(KH) * height, scale = h / base, w = h * ratio;
        const x = mix(KX) * width - w / 2, y = mix(KF) * height - h;
        model.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) scale(${scale.toFixed(4)})`;
        // Limit distant blur on mobile to avoid oversized paint surfaces.
        model.style.filter = mix(KB) < .2 ? "none" : `blur(${(Math.min(mobile ? 5 : 12, mix(KB)) / scale).toFixed(1)}px)`;
        model.style.opacity = mix(KO).toFixed(3);
        model.style.zIndex = String(100 - Math.round(d * 10));
      });
      const all = cardSize * pieces.length;
      cards.current.forEach((card, i) => {
        if (!card) return;
        let y = wrap(i * cardSize - state.p * 2 * cardSize, all);
        if (y > all - cardSize) y -= all;
        card.style.transform = mobile ? `translate3d(${y.toFixed(1)}px,0,0)` : `translate3d(0,${y.toFixed(1)}px,0)`;
        // Off-track products must not become invisible keyboard stops.
        const onTrack = y > -cardSize + 1 && y < (mobile ? track.clientWidth : track.clientHeight);
        card.tabIndex = onTrack ? 0 : -1; card.setAttribute("aria-hidden", String(!onTrack));
      });
      if (roll.current) roll.current.style.transform = `translate3d(0,${-wrap(state.p, gowns.length) * 44}px,0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${state.cx}px,${state.cy}px,0)`;
      const index = wrap(Math.round(state.p), gowns.length);
      if (index !== previous) { previous = index; setActive(index); }
    };
    const tick = (now: number) => {
      frame = 0;
      if (disposed) return;
      const dt = Math.min(50, now - last) || 16; last = now;
      state.p = reduced ? state.target : state.p + (state.target - state.p) * (1 - Math.exp(-dt * .0072));
      if (Math.abs(state.target - state.p) < .0004) state.p = state.target;
      state.cx += (state.x - state.cx) * .32; state.cy += (state.y - state.cy) * .32;
      paint();
      if (visible && !document.hidden && (Math.abs(state.target - state.p) > .0001 || Math.abs(state.cx - state.x) > .2 || Math.abs(state.cy - state.y) > .2)) frame = requestAnimationFrame(tick);
    };
    const start = () => { if (!disposed && !frame && visible && !document.hidden) { last = performance.now(); frame = requestAnimationFrame(tick); } };
    wake.current = start;
    const resize = () => {
      if (disposed) return;
      width = el.clientWidth; height = el.clientHeight;
      if (!width || !height) return;
      base = height * 1.2;
      mobile = rootEl.clientWidth <= 820;
      cardSize = mobile ? 175 : track.clientHeight / 3;
      models.current.forEach(model => { if (model) { model.style.width = base * Number(model.dataset.ratio || 2 / 3) + "px"; model.style.height = base + "px"; } });
      cards.current.forEach(card => { if (card) { card.style.height = mobile ? "100%" : cardSize + "px"; card.style.width = mobile ? cardSize + "px" : "100%"; } });
      paint(); start();
    };
    const wheel = (event: WheelEvent) => {
      if (document.activeElement !== el && !event.shiftKey && Math.abs(event.deltaX) < Math.abs(event.deltaY)) return;
      event.preventDefault(); state.target += Math.max(-120, Math.min(120, event.deltaY + event.deltaX)) / 420; start();
      clearTimeout(timer); timer = setTimeout(() => { state.target = Math.round(state.target); start(); }, 150);
    };
    const observer = new ResizeObserver(resize); observer.observe(el); observer.observe(track);
    el.addEventListener("wheel", wheel, { passive: false });
    document.addEventListener("visibilitychange", start); resize();
    return () => { disposed = true; observer.disconnect(); cancelAnimationFrame(frame); clearTimeout(timer); el.removeEventListener("wheel", wheel); document.removeEventListener("visibilitychange", start); wake.current = () => {}; };
  }, [visible, reduced, root]);
  const advance = (n: number) => { motion.current.target = Math.round(motion.current.target) + n; wake.current(); };
  return <section ref={root} className={"runway-lookbook collection-section" + (page ? " runway-page" : "")} aria-label="Bridal runway depth lookbook">
    <header className="runway-top"><div><span className="eyebrow">PRECIOUS MEMOIRS / THE BRIDAL EDIT</span>{page ? <h1>The collection.</h1> : <h2>Meet your next chapter.</h2>}</div><span className="runway-edition">FIVE SILHOUETTES<br />ONE PRECIOUS MEMORY</span></header>
    <div className="runway-layout">
      <div ref={stage} className={"runway-stage" + (dragging ? " is-dragging" : "")} tabIndex={0} role="group" aria-label="Drag dresses, use arrow keys or focus and scroll to explore"
        onKeyDown={e => { if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key)) { e.preventDefault(); advance(e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1); } }}
        onPointerDown={e => { if ((e.target as HTMLElement).closest("a,button")) return; e.currentTarget.focus({ preventScroll: true }); drag.current = { down: true, x: e.clientX, start: motion.current.target, moved: 0 }; e.currentTarget.setPointerCapture(e.pointerId); setDragging(true); }}
        onPointerMove={e => { const bounds = e.currentTarget.getBoundingClientRect(); motion.current.x = e.clientX - bounds.left; motion.current.y = e.clientY - bounds.top; if (drag.current.down) { const dx = e.clientX - drag.current.x; drag.current.moved = Math.max(drag.current.moved, Math.abs(dx)); motion.current.target = drag.current.start + dx / Math.max(150, bounds.width * .2); } wake.current(); }}
        onPointerUp={e => { if (!drag.current.down) return; drag.current.down = false; setDragging(false); if (drag.current.moved < 6) { const hit = document.elementsFromPoint(e.clientX, e.clientY).find(x => x.hasAttribute("data-look")); if (hit) motion.current.target += wrap(Number(hit.getAttribute("data-look")) - motion.current.target, gowns.length); } motion.current.target = Math.round(motion.current.target); wake.current(); }}
        onPointerCancel={() => { drag.current.down = false; setDragging(false); motion.current.target = Math.round(motion.current.target); wake.current(); }}>
        <div className="runway-intro"><span>THE ART OF AN ENTRANCE</span><p>Satin, lace, and a little possibility.<br />Bring your favourite silhouette into focus.</p></div>
        <div className="runway-line">{gowns.map((name, i) => <div ref={el => { models.current[i] = el; }} data-look={i} className="runway-model" key={name}><img src={"/images/runway-" + i + ".webp"} alt={name + " generated gown"} draggable={false} onLoad={e => { if (models.current[i]) models.current[i]!.dataset.ratio = String(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight); wake.current(); }} /><i /></div>)}</div>
        <div className="runway-caption"><div className="runway-look-number"><span>LOOK</span><div><div ref={roll}>{[...gowns, gowns[0]].map((_, i) => <b key={i}>{String(i % gowns.length + 1).padStart(2, "0")}</b>)}</div></div></div><h3 aria-live="polite">{gowns[active].split(" — ")[0]}<em>{gowns[active].split(" — ")[1]}</em></h3><Link href="/studio" onClick={() => select(gowns[active])}>Request this silhouette <ArrowUpRight size={15} /></Link></div>
        <div ref={ring} className="runway-ring" aria-hidden="true">↔</div>
        <div className="runway-controls"><button aria-label="Previous gown" onClick={() => advance(-1)}><ArrowLeft size={17} /></button><span>DRAG TO DISCOVER</span><button aria-label="Next gown" onClick={() => advance(1)}><ArrowRight size={17} /></button></div>
      </div>
      <aside className="runway-rail" aria-label="Pieces paired with the runway looks"><div className="runway-rail-label">THE LOOK / THE DETAIL</div><div ref={rail} className="runway-rail-track">{pieces.map((piece, i) => <Link ref={el => { cards.current[i] = el; }} href={piece.href} className="runway-piece" key={piece.name}><span>{piece.kind}</span><img src={piece.image} alt="" draggable={false} /><div><strong>{piece.name.split(" — ")[0]}</strong><span>↗</span></div><small>Price on request</small></Link>)}</div></aside>
    </div>
    <div className="runway-foot"><span>FICTIONAL COLLECTION / GENERATED IMAGERY</span><span>DRAG · ARROWS · FOCUS + SCROLL</span><Link href="/collections">View the bridal edit ↗</Link></div>
  </section>;
}
