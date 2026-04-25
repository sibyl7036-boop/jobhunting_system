/**
 * Sidebar · 极简奶油马卡龙风
 * ─────────────────────────────────────────
 * - 窄 76px，白底细描边胶囊
 * - 激活态：柔和奶油色块 + 深奶茶色文字（不发光不彩虹）
 * - hover：极细底色变化
 * - 左上：花朵图标 Logo（Flower2）
 * - 左下：新手引导按钮（Sparkles），点击弹出 OnboardingDialog
 */
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Building2,
  Flower2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  OnboardingDialog,
  hasDismissedOnboarding,
} from "@/components/onboarding/OnboardingDialog";

const NAV_ITEMS = [
  { href: "/dashboard", label: "首页", Icon: LayoutDashboard },
  { href: "/calendar", label: "日历", Icon: CalendarDays },
  { href: "/companies", label: "公司", Icon: Building2 },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [onboardingOpen, setOnboardingOpen] = React.useState(false);

  // 首次访问自动弹一次新手引导
  React.useEffect(() => {
    if (!hasDismissedOnboarding()) {
      // 稍微延迟让首屏渲染完毕，避免抢焦
      const timer = setTimeout(() => setOnboardingOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      <aside
        className={cn(
          "fixed left-5 top-5 bottom-5 z-40",
          "w-[76px]",
          "flex flex-col items-center",
          "bg-white/70 backdrop-blur-xl",
          "border border-[#f1e8e0]",
          "rounded-[28px]",
          "py-6",
          "shadow-[0_1px_2px_rgba(199,165,149,0.04),0_8px_24px_rgba(199,165,149,0.06)]"
        )}
      >
        {/* Brand · 花朵图标 Logo */}
        <Link
          href="/dashboard"
          aria-label="回到首页"
          className={cn(
            "group mb-8 flex h-11 w-11 items-center justify-center rounded-2xl",
            "border border-[#f3e2d6] bg-gradient-to-br from-[#fbebde] to-[#fae6ea]",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_4px_14px_rgba(199,165,149,0.12)]",
            "transition-all duration-300 hover:scale-105 hover:rotate-[8deg]"
          )}
        >
          <Flower2
            size={20}
            strokeWidth={1.8}
            className="text-[#c07e5a] transition-transform duration-500 group-hover:rotate-[-15deg]"
          />
        </Link>

        {/* Nav items */}
        <nav className="flex flex-1 flex-col items-center gap-2">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex w-[60px] flex-col items-center gap-1 rounded-2xl py-2.5",
                  "transition-all duration-200 ease-out",
                  active
                    ? "bg-[#fbebde]/80 text-[#a56a4a]"
                    : "text-[#a69890] hover:bg-[#faf4ee] hover:text-[#8a6d5f]"
                )}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.2 : 1.7}
                  className="transition-transform duration-200 group-hover:-translate-y-0.5"
                />
                <span
                  className={cn(
                    "text-[11px]",
                    active ? "font-semibold" : "font-medium"
                  )}
                >
                  {label}
                </span>
                {/* 激活小圆点 */}
                {active && (
                  <span
                    aria-hidden
                    className="absolute bottom-1 h-1 w-1 rounded-full bg-[#c89070]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* 底部 · 新手引导按钮 */}
        <button
          type="button"
          onClick={() => setOnboardingOpen(true)}
          aria-label="查看新手引导"
          title="新手引导"
          className={cn(
            "group relative flex h-10 w-10 items-center justify-center rounded-2xl",
            "border border-[#f3e2d6] bg-white/70",
            "transition-all duration-200 hover:-translate-y-[1px]",
            "hover:border-[#e8cdb8] hover:bg-[#fbebde]/70",
            "hover:shadow-[0_6px_18px_rgba(200,144,112,0.18)]"
          )}
        >
          <Sparkles
            size={15}
            strokeWidth={1.9}
            className="text-[#c89070] transition-transform duration-300 group-hover:scale-110"
          />
          {/* hover 小 tooltip */}
          <span
            className={cn(
              "pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2",
              "whitespace-nowrap rounded-lg border border-[#f1e4d8] bg-white/95 px-2.5 py-1 text-[11px] font-medium text-[#8a6d5f]",
              "opacity-0 shadow-[0_6px_18px_rgba(199,165,149,0.18)] transition-all duration-200",
              "group-hover:translate-x-0 group-hover:opacity-100"
            )}
          >
            新手引导
          </span>
        </button>
      </aside>

      {/* 新手引导弹窗 */}
      <OnboardingDialog
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
      />
    </>
  );
}
