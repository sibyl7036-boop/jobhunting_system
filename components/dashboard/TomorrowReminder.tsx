"use client";

/**
 * components/dashboard/TomorrowReminder.tsx · 极简奶油风
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RefreshCw, Loader2, Bell } from "lucide-react";

import { cn } from "@/lib/utils";
import { fetchJson } from "@/lib/fetcher";

interface TomorrowReminderProps {
  tipText: string;
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
    <section className="surface p-5 animate-fade-in-up">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FBEBDE]">
            <Bell size={15} className="text-[#b87a56]" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-card-title text-[#5b4a4a]">Tomorrow</h3>
            <p className="text-[11px] text-[#b4a79e]">
              {eventCount > 0 ? `明天有 ${eventCount} 个事项` : "明日暂无安排"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing || eventCount === 0}
          title={eventCount === 0 ? "明天无事件" : "重新生成"}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg",
            "text-[#b4a79e] transition-all",
            "hover:bg-[#fbf4ee] hover:text-[#8a6d5f]",
            "disabled:opacity-30 disabled:pointer-events-none"
          )}
          aria-label="重新生成明日提醒"
        >
          {refreshing ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <RefreshCw size={13} />
          )}
        </button>
      </header>

      <p className="mt-4 text-body leading-relaxed text-[#6b574f]">{tipText}</p>
    </section>
  );
}
