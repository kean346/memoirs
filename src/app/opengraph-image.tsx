import { ImageResponse } from "next/og";
export const alt = "Precious Memoirs — Every Detail. A Precious Memory.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(<div style={{ background: "#faf5f0", color: "#713f4a", display: "flex", flexDirection: "column", justifyContent: "center", padding: 90, width: "100%", height: "100%" }}><div style={{ fontSize: 22, letterSpacing: 6 }}>BRIDAL BOUTIQUE · GABORONE</div><div style={{ fontSize: 92, marginTop: 35 }}>Precious Memoirs</div><div style={{ fontSize: 32, marginTop: 30 }}>Every Detail. A Precious Memory.</div></div>, size);
}
