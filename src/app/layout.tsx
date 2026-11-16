import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/lib/site";

const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jb = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jb", display: "swap" });

export const metadata: Metadata = { metadataBase: new URL(siteUrl) };
export const viewport: Viewport = { themeColor: "#07080d", colorScheme: "dark" };

/** Shared shell. The public site and the admin each add their own layout on top. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${space.variable} ${inter.variable} ${jb.variable}`}>
      <body>{children}</body>
    </html>
  );
}
