import type { CSSProperties } from "react";
import { styles } from "@/lib/model";
export const stylePalette = [
  ["#f7f0e6", "#d5c4aa", "#fffdf9"],
  ["#e8c9c5", "#faf5f0", "#b97d82"],
  ["#c49a68", "#eee0c9", "#faf5f0"],
  ["#a96770", "#e8c9c5", "#f4e8e2"],
  ["#713f4a", "#c49a68", "#faf5f0"],
  ["#eeece8", "#aaa7a0", "#fffdf9"],
];
export const styleBackgroundPosition = (style: string) => ["0% 0%", "50% 0%", "100% 0%", "0% 100%", "50% 100%", "100% 100%"][Math.max(0, styles.indexOf(style))];
export default function StyleReference({ style }: { style: string }) {
  const index = Math.max(0, styles.indexOf(style));
  return <figure className="style-reference" data-style={style} aria-label={style + " visual style reference"} style={{ "--style-accent": stylePalette[index][0] } as CSSProperties}><div className="style-reference-image" role="img" aria-label={style + " fabric and colour moodboard"} style={{ backgroundPosition: styleBackgroundPosition(style) }} /><figcaption><span>STYLE REFERENCE</span><strong>{style}</strong><div className="style-reference-swatches">{stylePalette[index].map(colour => <i style={{ background: colour }} key={colour} />)}</div><small>Inspiration for your brief</small></figcaption></figure>;
}
