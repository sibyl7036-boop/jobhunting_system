import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "求职流程管理看板",
  description: "Job Hunt Flow Board · Vibe Coding",
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
