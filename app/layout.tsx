import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";

import { AppShell } from "@/components/layout/AppShell";
import { DetailDrawer } from "@/components/drawer/DetailDrawer";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "求职流程管理看板",
  description: "Job Hunt Flow Board · Vibe Coding · 浅色马卡龙粉",
};

/**
 * 全局根布局（docs/ui-guide.md 6.1 页面结构）
 *
 * - 左侧固定导航栏（88px 宽，半悬浮胶囊，docs/ui-guide.md 6.2）
 * - 顶部 Header（薄、轻、通透，docs/ui-guide.md 6.3）
 * - 主内容区（最大宽度 1440~1600px，左右 padding 32px，docs/ui-guide.md 5.3 / 15.1）
 * - 全局 DetailDrawer（Phase 4.1）：由 URL search param 驱动，三个页面共用
 * - 全局 Toaster（sonner）：保存成功 / 失败 / 删除成功等提示
 *
 * [2026-04-25 auth-v1] Sidebar/Header 抽到 AppShell 中按 pathname 条件渲染：
 *   /login 等全屏页不渲染，其他业务页正常渲染
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <AppShell>{children}</AppShell>
        {/* Drawer 依赖 useSearchParams，必须放 Suspense 边界 */}
        <Suspense fallback={null}>
          <DetailDrawer />
        </Suspense>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: 14,
              border: "1px solid #f1e8e0",
              boxShadow: "0 8px 24px rgba(199,165,149,0.1)",
            },
          }}
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
