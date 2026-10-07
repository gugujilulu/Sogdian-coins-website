import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./atlas-visual.css";
import "./catalogue-visual.css";
import "./details-visual.css";
import "./controls-visual.css";
import "./detail-frames.css";
import "./catalogue-frames.css";
import "./research-visual.css";
import "./interaction-feedback.css";

export const viewport: Viewport = {width:"device-width",initialScale:1,maximumScale:1,userScalable:false};

export const metadata: Metadata = {
  title: "Central Asian Square-Hole Coinage Atlas",
  description: "A source-traceable map, catalogue and image corpus for Chinese-style square-hole coinage across Central Asia and related inland regions.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
