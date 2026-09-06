import type { Metadata } from "next";
import {
  Big_Shoulders,
  Instrument_Serif,
  Instrument_Sans,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";

const display = Big_Shoulders({
  weight: ["600", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});

const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
});

const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Ethan Roberts — I build the software I want to live with",
  description:
    "Partnerships at CET Sandbox, relocating to Boston in November 2026 to build health tech. Builder of an anticipatory music engine, an AI health coach that texts first, and a GPT from first principles.",
  metadataBase: new URL("https://portfolio-lac-eta-46.vercel.app"),
  openGraph: {
    title: "Ethan Roberts — I build the software I want to live with",
    description:
      "An anticipatory music engine, an AI health coach that texts first, and a GPT from first principles. Real, running, and mine.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scheme-dark">
      <body
        className={`${display.variable} ${serif.variable} ${sans.variable} ${mono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
