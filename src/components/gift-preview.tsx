import type { CSSProperties } from "react";
import type { Config } from "@/lib/model";

export const giftImages: Record<string, string> = {
  "Bridal morning gift set": "/images/curated-morning-set.webp",
  "Bridesmaid proposal box": "/images/curated-proposal-box.webp",
  "Engraved champagne duo": "/images/curated-champagne-duo.webp",
  "Pearl jewellery keepsake": "/images/curated-jewellery.webp",
  "Satin bridal robe": "/images/curated-satin-robe.webp",
  "Monogrammed satin robe": "/images/curated-satin-robe.webp",
  // Retained for historical browser-demo records; not selectable in the new collection.
  "Bridal robe": "/images/bridal-robe.webp",
  "Champagne flute": "/images/bridal-flute.webp",
  "Bridal slippers": "/images/bridal-slippers.webp",
  "Gift box": "/images/bridal-gift-box.webp",
  "Personalised bridal hanger": "/images/bridal-hanger.webp",
};
export const giftPlacement: Record<string, { x: number; y: number; secondX?: number; max: number }> = {
  "Bridal morning gift set": { x: 200, y: 200, max: 130 },
  "Bridesmaid proposal box": { x: 200, y: 350, max: 150 },
  "Engraved champagne duo": { x: 140, y: 160, secondX: 260, max: 75 },
  "Pearl jewellery keepsake": { x: 200, y: 280, max: 140 },
  "Satin bridal robe": { x: 245, y: 95, max: 65 },
};
const atmospheres = [
  { background: "#f5eee6", accent: "#a48162", decoration: "❧" },
  { background: "#f2deda", accent: "#a96770", decoration: "♡" },
  { background: "#eee0c9", accent: "#a77c46", decoration: "✦" },
  { background: "#e9cdd0", accent: "#92535e", decoration: "❧" },
  { background: "#dac0c6", accent: "#713f4a", decoration: "♡" },
  { background: "#f1efec", accent: "#57504a", decoration: "" },
];
const styleNames = ["Ivory Elegance", "Blush Romance", "Champagne Grace", "Dusty Rose", "Burgundy Detail", "Timeless Minimal"];

/** Generated fictional product bases with live, persistent personalisation overlays. */
export default function GiftPreview({ config: c }: { config: Config }) {
  const theme = atmospheres[Math.max(0, styleNames.indexOf(c.style))];
  const fontFamily = c.lettering === "Montserrat" ? "var(--font-sans)" : c.lettering === "Cursive" ? "cursive" : "var(--font-display)";
  const plainRobe = c.product === "Satin bridal robe" || c.product === "Monogrammed satin robe";
  const label = plainRobe ? "" : c.message || "Your name";
  const placement = giftPlacement[c.product] || { x: 200, y: 280, max: 140 };
  const paired = placement.secondX !== undefined;
  const y = placement.y;
  const maxText = placement.max;
  const nameSize = paired ? 14 : label.length > 20 ? 14 : 20;
  const fittedLength = label.length * nameSize * .55 > maxText ? maxText : undefined;
  const lettering = { fontFamily, fontStyle: c.lettering === "Cursive" ? "italic" : undefined } as CSSProperties;
  return <div className="gift-preview" data-style={c.style} style={{ "--preview-background": theme.background, "--preview-accent": theme.accent } as CSSProperties} aria-label="Live personalised gift preview">
    <div className="preview-heading"><p className="eyebrow">THE PERSONALISATION ATELIER</p><span className="preview-live"><i /> LIVE PREVIEW</span></div>
    <div className="preview-style" aria-live="polite"><span>{theme.decoration}</span> {c.style}</div>
    <svg viewBox="0 0 400 460" role="img" aria-label={`${c.product}, ${label}, ${c.lettering}, ${c.motif} motif`}>
      <defs><filter id="product-tint" colorInterpolationFilters="sRGB"><feFlood floodColor={c.productColour} result="colour"/><feComposite in="colour" in2="SourceGraphic" operator="in" result="tint"/><feBlend in="SourceGraphic" in2="tint" mode="multiply"/></filter></defs>
      <image href={giftImages[c.product]} x="35" y="0" width="330" height="460" filter="url(#product-tint)" />
      {!plainRobe && <g fill={c.textColour} style={lettering}>
        <text data-testid="preview-name" x={placement.x} y={y} textAnchor="middle" fontSize={nameSize} textLength={fittedLength} lengthAdjust="spacingAndGlyphs">{label}</text>
        {paired && <text x={placement.secondX} y={y} textAnchor="middle" fontSize="14" textLength={fittedLength} lengthAdjust="spacingAndGlyphs">{label}</text>}
        {c.motif !== "None" && <text x={placement.x} y={y + 24} textAnchor="middle" className="preview-motif" fontSize="18">{c.motif === "Heart" ? "♡" : "❧"}</text>}
        {paired && c.motif !== "None" && <text x={placement.secondX} y={y + 24} textAnchor="middle" className="preview-motif" fontSize="18">{c.motif === "Heart" ? "♡" : "❧"}</text>}
      </g>}
    </svg>
    <div className="preview-product"><h2>{c.product}</h2><span>× {c.quantity}</span></div>
    <div className="preview-specs">{!plainRobe && <span style={{ color: c.textColour }}>Aa · {c.lettering}</span>}<span><i style={{ background: c.productColour }} /> Product colour</span>{!plainRobe && <span>{c.motif === "None" ? "No motif" : c.motif + " motif"}</span>}</div>
    <p className="preview-caption">Fictional product · Colour and selected details update here</p>
  </div>;
}
