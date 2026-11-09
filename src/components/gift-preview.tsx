import type { Config } from "@/lib/model";

/** Original 2D product illustrations; no product photography or stock is implied. */
export default function GiftPreview({ config: c }: { config: Config }) {
  const fill = c.productColour;
  const fontFamily = c.lettering === "Montserrat" ? "var(--font-sans)" : c.lettering === "Cursive" ? "cursive" : "var(--font-display)";
  const label = c.message || "Your name";
  return <div className="gift-preview" aria-label="Live personalised gift preview">
    <p className="eyebrow">YOUR PERSONALISED KEEPSAKE</p>
    <svg viewBox="0 0 400 460" role="img" aria-label={`${c.product}, ${label}, ${c.lettering}, ${c.motif} motif`}>
      <defs><filter id="gift-shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#713f4a" floodOpacity=".16" /></filter><linearGradient id="gift-sheen"><stop stopColor="#fff" stopOpacity=".5"/><stop offset=".5" stopColor="#fff" stopOpacity="0"/><stop offset="1" stopColor="#713f4a" stopOpacity=".12"/></linearGradient></defs>
      <g fill={fill} stroke="#bfae9f" strokeWidth="1.5" filter="url(#gift-shadow)">
        {c.product === "Bridal robe" && <><path d="M150 75L100 95 40 195 95 225 120 180 105 390Q200 415 295 390L280 180 305 225 360 195 300 95 250 75 200 145Z"/><path d="M150 75L218 260M250 75L190 260M112 260Q200 282 288 260" fill="none"/><path d="M203 270L230 360M203 270L180 345" fill="none"/></>}
        {c.product === "Champagne flute" && <><path d="M135 65H265L248 215Q240 265 200 265Q160 265 152 215Z"/><path d="M200 265V380M145 389Q200 365 255 389Z" fill="none" strokeWidth="4"/></>}
        {c.product === "Gift box" && <><path d="M75 175H325V360H75Z"/><path d="M60 140H340V192H60Z"/><path d="M182 140H218V360H182Z" fill="#c49a68" stroke="none"/><path d="M200 140Q115 50 120 115Q125 150 200 140Q285 50 280 115Q275 150 200 140" fill="none" stroke="#c49a68" strokeWidth="12"/></>}
        {c.product === "Bridal slippers" && <><path d="M90 110Q140 65 165 120L172 330Q170 380 120 380Q70 380 72 330Z"/><path d="M235 120Q260 65 310 110L328 330Q330 380 280 380Q230 380 228 330Z"/><path d="M80 190Q120 165 169 190L171 260Q120 240 77 260ZM231 190Q280 165 320 190L325 260Q280 240 230 260Z" fill="#fff" fillOpacity=".4"/></>}
        {c.product === "Personalised bridal hanger" && <><path d="M180 95Q180 60 210 65Q245 80 205 120V145" fill="none" stroke="#c49a68" strokeWidth="7"/><path d="M205 145L50 260Q40 280 65 285H335Q360 280 345 260Z" strokeWidth="12" strokeLinejoin="round"/></>}
        <path d="M0 0" fill="url(#gift-sheen)"/>
      </g>
      <g fill={c.textColour} style={{ fontFamily }}>
        <text data-testid="preview-name" x="200" y={c.product === "Champagne flute" ? 180 : c.product === "Personalised bridal hanger" ? 268 : c.product === "Bridal slippers" ? 225 : c.product === "Gift box" ? 310 : 215} textAnchor="middle" fontSize={label.length > 22 ? 15 : 24} textLength={label.length > 22 ? 190 : undefined} lengthAdjust="spacingAndGlyphs">{label}</text>
        {c.motif !== "None" && <text x="200" y={c.product === "Personalised bridal hanger" ? 235 : 340} textAnchor="middle" fontSize="28">{c.motif === "Heart" ? "♡" : "❧"}</text>}
      </g>
    </svg>
    <h2>{c.product}</h2><p>{c.quantity} {c.quantity === 1 ? "keepsake" : "keepsakes"} · Original illustrative preview</p>
  </div>;
}
