"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Config } from "@/lib/model";
import { giftImages, giftPlacement } from "./gift-preview";
import { useInView } from "./showcase-hooks";

export default function PersonalisationTeaser({ configure }: { configure: (patch: Partial<Config>) => void }) {
  const [name, setName] = useState("");
  const [product, setProduct] = useState("Bridesmaid proposal box");
  const placement = giftPlacement[product];
  const previewName = name || "Your name";
  const fittedLength = previewName.length > Math.floor(placement.max / 12) ? placement.max : undefined;
  const { ref, visible } = useInView<HTMLElement>(.1);
  return <section ref={ref} className={"personalisation-editorial" + (visible ? " is-visible" : "")} aria-labelledby="personal-touch-title">
    <div className="personalisation-copy"><p className="eyebrow">A LITTLE SOMETHING, ENTIRELY YOURS</p><h2 id="personal-touch-title">Your name.<br /><em>Your kind<br />of beautiful.</em></h2><p>Start with a keepsake. Add a personal touch. See it come together before sharing your brief.</p><div className="teaser-product-choices" role="group" aria-label="Choose a preview keepsake">{["Bridesmaid proposal box", "Monogrammed satin robe", "Engraved champagne duo"].map(item => <button aria-pressed={product === item} onClick={() => setProduct(item)} key={item}>{item}</button>)}</div><label className="teaser-name">Try your name<input value={name} maxLength={24} placeholder="Your name" onChange={e => setName(e.target.value)} /></label><Link className="teaser-studio-link" href="/studio" onClick={() => configure({ occasion: "Personalised Gift", product, message: name.trim() })}>Continue in the studio <ArrowUpRight size={18} /></Link><small>Illustrative preview · Final details confirmed on enquiry</small></div>
    <div className="personalisation-stage"><span className="teaser-stage-label">THE PERSONAL TOUCH / LIVE PREVIEW</span><div className="teaser-product-sculpture"><svg viewBox="0 0 400 460" role="img" aria-label={product + " with " + (name || "your name")}><image href={giftImages[product]} x="35" y="0" width="330" height="460" /><text x={giftPlacement[product].x} y={giftPlacement[product].y} textAnchor="middle" fontSize={placement.secondX ? 14 : 20} fill="#713f4a" fontFamily="var(--font-display)" textLength={fittedLength} lengthAdjust="spacingAndGlyphs">{name || "Your name"}</text>{giftPlacement[product].secondX && <text x={giftPlacement[product].secondX} y={giftPlacement[product].y} textAnchor="middle" fontSize="14" textLength={fittedLength} lengthAdjust="spacingAndGlyphs" fill="#713f4a" fontFamily="var(--font-display)">{name || "Your name"}</text>}</svg></div><div className="teaser-stage-caption"><span>01 / CHOOSE</span><span>02 / PERSONALISE</span><span>03 / ENQUIRE</span></div></div>
  </section>;
}
