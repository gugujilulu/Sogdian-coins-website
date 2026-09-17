import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Central Asian Square-Hole Coinage Atlas",
  description: "A source-traceable map, catalogue and image corpus for Chinese-style square-hole coinage across Central Asia and related inland regions.",
  other: {
    "codex-preview": "development",
  },
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
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
