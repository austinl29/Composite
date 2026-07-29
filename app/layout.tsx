import type { Metadata } from "next";
import { Newsreader, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Premium visual redesign (2026-07-29) — navy/gold/verified design system.
// Newsreader (serif headlines) + JetBrains Mono (labels/eyebrows/buttons),
// self-hosted via next/font to avoid a Google Fonts <link> layout shift.
// Body copy uses the system font stack directly (no web font needed) — see
// font-editorial in globals.css. Scoped via font-display/font-editorial/
// font-eyebrow utility tokens.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Composite",
  description: "Growth techniques from other industries, matched to your home-service business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
