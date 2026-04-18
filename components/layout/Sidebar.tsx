/**
 * Sidebar · 左侧固定导航栏（UI.md 6.2）
 *
 * 严格规格：
 * - 宽度 88px
 * - 半透明白 + 轻微模糊背景
 * - 圆角 28px
 * - 竖向胶囊感、半悬浮
 * - 导航项：Dashboard / Calendar / Companies
 * - 底部 AI Copilot 小猫入口
 * - 选中态：淡粉底色（soft-panel） + scale(1.04) + icon/文字略深
 * - hover 态：背景稍亮 + 阴影轻微增强
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CatIcon } from "@/components/CatIcon";

const NAV_ITEMS = [
  { href: "/dashboard", label: "首页", Icon: LayoutDashboard },
  { href: "/calendar", label: "日历", Icon: CalendarDays },
  { href: "/companies", label: "大厂", Icon: Building2 },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-4 top-4 bottom-4 z-40",
        "w-[88px]",
        "flex flex-col items-center",
        "bg-white/70 backdrop-blur-md",
        "rounded-[28px]",
        "border border-border-light",
        "shadow-soft",
        "py-6"
      )}
    >
      {/* 品牌 / Logo 占位 */}
      <Link
        href="/dashboard"
        className="mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-text-on-primary text-card-title"
        aria-label="回到首页"
      >
        求
      </Link>

      {/* 导航项 */}
      <nav className="flex flex-1 flex-col items-center gap-3">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex w-[68px] flex-col items-center gap-1 rounded-[20px] px-2 py-3 transition-all duration-150",
                active
                  ? "bg-soft-panel text-primary-strong shadow-soft scale-[1.04]"
                  : "text-text-secondary hover:bg-soft-panel/60 hover:shadow-soft"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.2 : 1.8}
                className="transition-transform"
              />
              <span className={cn("text-caption", active && "font-semibold")}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* 底部 AI Copilot 小猫入口（UI.md 6.2） */}
      <div
        className="mt-4 rounded-full p-1 transition-transform hover:scale-105"
        aria-label="AI Copilot"
        title="AI Copilot"
      >
        <CatIcon size={40} />
      </div>
    </aside>
  );
}
