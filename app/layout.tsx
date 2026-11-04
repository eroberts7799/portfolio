import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";
import TopBar from "./components/TopBar";
import { site } from "./site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description: site.bio,
  metadataBase: new URL(site.url),
  openGraph: {
    title: site.name,
    description: site.bio,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable}`}>
        <TopBar />
        <main className="relative isolate mx-auto flex min-h-svh w-full min-w-0">
          <div className="flex flex-1 flex-col">
            <div className="flex-1">
              <div className="mx-auto flex max-w-2xl flex-1 flex-col gap-16 py-16 leading-[1.6] text-primary sm:py-32">
                {children}
              </div>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
