import type { Metadata } from "next";
import "./globals.css";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "求职流程管理看板",
  description: "Job Hunt Flow Board · Vibe Coding · 浅色马卡龙粉",
};

/**
 * 全局根布局（UI.md 6.1 页面结构）
 *
 * - 左侧固定导航栏（88px 宽，半悬浮胶囊，UI.md 6.2）
 * - 顶部 Header（薄、轻、通透，UI.md 6.3）
 * - 主内容区（最大宽度 1440~1600px，左右 padding 32px，UI.md 5.3 / 15.1）
 * - 未来 Phase 4 的全局 Drawer 也挂在这一层
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <Sidebar />
        <div className="ml-[112px] pr-8">
          <main className="mx-auto max-w-[1600px] min-h-screen px-8">
            <Header />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
