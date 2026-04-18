"use client";

/**
 * components/dashboard/TomorrowReminder.tsx
 *
 * 明日 AI 提醒卡片（UI.md 8.4 + PRD 5.1.2）
 *
 * Step 6.6 实装：
 *   - 首屏由 Server Component 把 tipText 作 prop 传入
 *   - 右上 RefreshCw 按钮：POST /api/ai/tomorrow-tip/refresh 强制重算
 *   - 失败时 fallback 兜底文本
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bell, RefreshCw, Loader2 } from "lucide-react";

import { CatIcon } from "@/components/CatIcon";
import { cn } from "@/lib/utils";
import { fetchJson } from "@/lib/fetcher";

interface TomorrowReminderProps {
  tipText: string;
  /** 明日事件数（用于禁用空日重算、降低无意义 AI 消耗） */
  eventCount: number;
}

export function TomorrowReminder({
  tipText,
  eventCount,
}: TomorrowReminderProps) {
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    if (eventCount === 0) {
      toast.info("明天没有流程事件，无需刷新");
      return;
    }
    setRefreshing(true);
    try {
      await fetchJson("/api/ai/tomorrow-tip/refresh", { method: "POST" });
      toast.success("已重新生成明日提醒");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "刷新失败");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <section
      className="relative overflow-hidden rounded-card-md p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-hover"
      style={{
        background: "linear-gradient(135deg, #FFF7D8, #FFF3FA)",
      }}
    >
      <header className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <CatIcon size={34} busy={refreshing} />
          <h3 className="text-card-title text-text-primary">明日提醒</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing || eventCount === 0}
            title={eventCount === 0 ? "明天无事件，无需刷新" : "重新生成"}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-btn-sm",
              "text-text-tertiary transition-colors",
              "hover:bg-surface-bg/50 hover:text-primary-strong",
              "disabled:opacity-40 disabled:pointer-events-none"
            )}
            aria-label="重新生成明日提醒"
          >
            {refreshing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
          </button>
          <Bell
            size={18}
            strokeWidth={1.8}
            className="mt-0.5 text-text-tertiary"
          />
        </div>
      </header>

      <p className="mt-4 text-body leading-relaxed text-text-secondary">
        {tipText}
      </p>
    </section>
  );
}
