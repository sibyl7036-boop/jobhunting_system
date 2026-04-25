"use client";

/**
 * components/layout/AppShell.tsx · 根布局壳
 *
 * 职责：根据当前 pathname 决定是否渲染业务 Shell（Sidebar + Header + 主容器）。
 * 鉴权页（/login）直接裸渲染 children，不带 Shell。
 */

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 无 Shell 路径（全屏页）
  const FULLSCREEN_PREFIXES = ["/login"];
  const isFullscreen = FULLSCREEN_PREFIXES.some((p) => pathname.startsWith(p));

  if (isFullscreen) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <div className="ml-[108px] pr-8">
        <main className="mx-auto max-w-[1440px] min-h-screen px-6">
          <Header />
          {children}
        </main>
      </div>
    </>
  );
}
