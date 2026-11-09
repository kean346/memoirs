import type { CSSProperties } from "react";
import type { Config } from "@/lib/model";

export const giftImages: Record<string, string> = {
  "Bridal robe": "/images/bridal-robe.webp",
  "Champagne flute": "/images/bridal-flute.webp",
  "Bridal slippers": "/images/bridal-slippers.webp",
  "Gift box": "/images/bridal-gift-box.webp",
  "Personalised bridal hanger": "/images/bridal-hanger.webp",
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
  const label = c.message || "Your name";
  const slippers = c.product === "Bridal slippers";
  const y = c.product === "Bridal robe" ? 105 : c.product === "Champagne flute" ? 170 : c.product === "Gift box" ? 275 : c.product === "Personalised bridal hanger" ? 235 : 165;
  const maxText = slippers ? 68 : c.product === "Bridal robe" ? 130 : 160;
  const lettering = { fontFamily, fontStyle: c.lettering === "Cursive" ? "italic" : undefined } as CSSProperties;
  return <div className="gift-preview" data-style={c.style} style={{ "--preview-background": theme.background, "--preview-accent": theme.accent } as CSSProperties} aria-label="Live personalised gift preview">
    <div className="preview-heading"><p className="eyebrow">THE PERSONALISATION ATELIER</p><span className="preview-live"><i /> LIVE PREVIEW</span></div>
    <div className="preview-style" aria-live="polite"><span>{theme.decoration}</span> {c.style}</div>
    <svg viewBox="0 0 400 460" role="img" aria-label={`${c.product}, ${label}, ${c.lettering}, ${c.motif} motif`}>
      <defs><filter id="product-tint" colorInterpolationFilters="sRGB"><feFlood floodColor={c.productColour} result="colour"/><feComposite in="colour" in2="SourceGraphic" operator="in" result="tint"/><feBlend in="SourceGraphic" in2="tint" mode="multiply"/></filter></defs>
      <image href={giftImages[c.product]} x="35" y="0" width="330" height="460" filter="url(#product-tint)" />
      <g fill={c.textColour} style={lettering}>
        <text data-testid="preview-name" x={slippers ? 125 : 200} y={y} textAnchor="middle" fontSize={slippers ? 14 : label.length > 20 ? 14 : 20} textLength={label.length > (slippers ? 9 : 16) ? maxText : undefined} lengthAdjust="spacingAndGlyphs">{label}</text>
        {slippers && <text x="275" y={y} textAnchor="middle" fontSize="14" textLength={label.length > 9 ? maxText : undefined} lengthAdjust="spacingAndGlyphs">{label}</text>}
        {c.motif !== "None" && <text x={slippers ? 125 : 200} y={y + 24} textAnchor="middle" className="preview-motif" fontSize="18">{c.motif === "Heart" ? "♡" : "❧"}</text>}
        {slippers && c.motif !== "None" && <text x="275" y={y + 24} textAnchor="middle" className="preview-motif" fontSize="18">{c.motif === "Heart" ? "♡" : "❧"}</text>}
      </g>
    </svg>
    <div className="preview-product"><h2>{c.product}</h2><span>× {c.quantity}</span></div>
    <div className="preview-specs"><span style={{ color: c.textColour }}>Aa · {c.lettering}</span><span><i style={{ background: c.productColour }} /> Product colour</span><span>{c.motif === "None" ? "No motif" : c.motif + " motif"}</span></div>
    <p className="preview-caption">Fictional product · Your lettering, colour and details update here</p>
  </div>;
}
