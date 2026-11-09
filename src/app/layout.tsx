import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
const display = localFont({
  src: [{ path: "../../public/fonts/playfair.ttf", weight: "400 900" }],
  variable: "--font-display",
  display: "swap",
});
const sans = localFont({
  src: [{ path: "../../public/fonts/montserrat.ttf", weight: "100 900" }],
  variable: "--font-sans",
  display: "swap",
});
const siteOrigin =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL
    : process.env.VERCEL_URL
      ? "https://" + process.env.VERCEL_URL
      : "http://localhost:3000");
export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  openGraph: {
    title: "Precious Memoirs — The Bridal Studio",
    description:
      "Luxury bridal gowns, personalised gifts and bridal consultations in Block 8, Gaborone, Botswana.",
    siteName: "Precious Memoirs",
    type: "website",
    locale: "en_BW",
  },
  twitter: {
    card: "summary_large_image",
    title: "Precious Memoirs — The Bridal Studio",
    description: "Every Detail. A Precious Memory.",
    images: ["/opengraph-image"],
  },
  title: "Precious Memoirs — The Bridal Studio",
  description:
    "Luxury bridal elegance and personalised gifts in Gaborone, Botswana. Browser-local demonstration.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-BW" className={display.variable + " " + sans.variable}>
      <body>{children}</body>
    </html>
  );
}
