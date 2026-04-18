/**
 * Header · 顶部 Header（UI.md 6.3）
 *
 * 严格规格：
 * - 薄、轻、通透
 * - 不要重边框
 * - 左侧：页面标题 + 一句小副标题
 * - 右侧：日期 pill + 小头像占位（Phase 0.5 先放占位）
 */
"use client";

import { usePathname } from "next/navigation";
import { format } from "date-fns";

const TITLE_MAP: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "今天也离理想 offer 更近一点",
    subtitle: "把面试、流程和投递节奏整理得更轻松一点",
  },
  "/calendar": {
    title: "日历",
    subtitle: "从日期视角看见未来的每一场面试",
  },
  "/companies": {
    title: "大厂进度",
    subtitle: "从公司维度查看你的所有流程推进情况",
  },
};

export function Header() {
  const pathname = usePathname();
  const key = Object.keys(TITLE_MAP).find((p) => pathname.startsWith(p));
  const { title, subtitle } = key
    ? TITLE_MAP[key]
    : { title: "求职流程管理看板", subtitle: "" };

  // 日期 pill 用客户端当前日期（UI.md 8.2）
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <header className="flex items-start justify-between gap-6 pt-7 pb-4">
      <div>
        <h1 className="text-page-title text-text-primary">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-body text-text-tertiary">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-surface-bg px-4 py-1.5 text-caption text-text-secondary shadow-soft">
          {today}
        </span>
        <div
          className="h-9 w-9 rounded-full bg-secondary-peach"
          aria-label="用户头像占位"
        />
      </div>
    </header>
  );
}
