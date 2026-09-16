import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sogdian Cash Atlas",
  description: "Explore square-holed coinage across Semirechye and neighbouring regions through maps, time and research.",
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
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
