import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { DetailDrawer } from "@/components/drawer/DetailDrawer";
import { Toaster } from "sonner";

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
 * - 全局 DetailDrawer（Phase 4.1）：由 URL search param 驱动，三个页面共用
 * - 全局 Toaster（sonner）：保存成功 / 失败 / 删除成功等提示
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
        {/* Drawer 依赖 useSearchParams，必须放 Suspense 边界 */}
        <Suspense fallback={null}>
          <DetailDrawer />
        </Suspense>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: 18,
              border: "1px solid #F3E4EC",
              boxShadow: "0 8px 24px rgba(214,164,187,0.10)",
            },
          }}
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
