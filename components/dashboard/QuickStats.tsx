/**
 * components/dashboard/QuickStats.tsx
 * 极简奶油风：白底细边卡，柔和的小徽标点缀不同色系
 */
"use client";

import * as React from "react";
import {
  CalendarClock,
  CalendarCheck2,
  CalendarRange,
  Trophy,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickStatsProps {
  todayCount: number;
  tomorrowCount: number;
  weekCount: number;
  passedCount: number;
  resumeCount: number;
}

interface StatCardDef {
  label: string;
  hint: string;
  value: number;
  suffix: string;
  Icon: typeof CalendarClock;
  dot: string;
  iconBg: string;
  iconColor: string;
  delay: number;
}

export function QuickStats({
  todayCount,
  tomorrowCount,
  weekCount,
  passedCount,
  resumeCount,
}: QuickStatsProps) {
  const cards: StatCardDef[] = [
    {
      label: "Today",
      hint: "今日事项",
      value: todayCount,
      suffix: "场",
      Icon: CalendarClock,
      dot: "bg-[#E9B1BF]",
      iconBg: "bg-[#FAE6EA]",
      iconColor: "text-[#c86d85]",
      delay: 0,
    },
    {
      label: "Tomorrow",
      hint: "明日事项",
      value: tomorrowCount,
      suffix: "场",
      Icon: CalendarCheck2,
      dot: "bg-[#E9B99A]",
      iconBg: "bg-[#FBEBDE]",
      iconColor: "text-[#b87a56]",
      delay: 0.06,
    },
    {
      label: "This Week",
      hint: "本周安排",
      value: weekCount,
      suffix: "场",
      Icon: CalendarRange,
      dot: "bg-[#EDD26E]",
      iconBg: "bg-[#FBF4D4]",
      iconColor: "text-[#a08a3a]",
      delay: 0.12,
    },
    {
      label: "Passed",
      hint: "已通过",
      value: passedCount,
      suffix: "个",
      Icon: Trophy,
      dot: "bg-[#B0C3A3]",
      iconBg: "bg-[#E8EFE3]",
      iconColor: "text-[#70876a]",
      delay: 0.18,
    },
    {
      label: "Resumes",
      hint: "我的简历",
      value: resumeCount,
      suffix: "份",
      Icon: FileText,
      dot: "bg-[#B1C8DE]",
      iconBg: "bg-[#E6EEF7]",
      iconColor: "text-[#6b89a8]",
      delay: 0.24,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {cards.map((c) => (
        <StatCard key={c.label} {...c} />
      ))}
    </div>
  );
}

function StatCard({
  label,
  hint,
  value,
  suffix,
  Icon,
  dot,
  iconBg,
  iconColor,
  delay,
}: StatCardDef) {
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    let raf = 0;
    const duration = 650;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <div
      className={cn(
        "group relative rounded-2xl bg-white/90 backdrop-blur p-5",
        "border border-[#f1e8e0]",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-0.5 hover:shadow-soft hover:border-[#e8d7c8]",
        "animate-fade-in-up cursor-default"
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#b4a79e]">
              {label}
            </p>
          </div>
          <p className="mt-2 flex items-baseline gap-1">
            <span className="text-[30px] font-bold leading-none text-[#5b4a4a] tracking-tight tabular-nums">
              {display}
            </span>
            <span className="text-caption text-[#b4a79e]">{suffix}</span>
          </p>
          <p className="mt-1 text-[11px] text-[#b4a79e]">{hint}</p>
        </div>

        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            iconBg,
            "transition-transform duration-300 group-hover:scale-105"
          )}
        >
          <Icon size={16} strokeWidth={1.8} className={iconColor} />
        </div>
      </div>
    </div>
  );
}
