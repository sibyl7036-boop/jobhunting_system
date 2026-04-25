"use client";

/**
 * components/dashboard/MiniStatsColumn.tsx
 *
 * [v2] 去掉 Passed 维度；剩 3 个：今日 / 明日 / 本周
 * 竖向排列适合侧边栏
 */

import * as React from "react";
import { CalendarClock, CalendarCheck2, CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";

interface MiniStatsColumnProps {
  todayCount: number;
  tomorrowCount: number;
  weekCount: number;
}

interface Cell {
  label: string;
  hint: string;
  value: number;
  Icon: typeof CalendarClock;
  iconBg: string;
  iconColor: string;
  accent: string;
  delay: number;
}

export function MiniStatsColumn({
  todayCount,
  tomorrowCount,
  weekCount,
}: MiniStatsColumnProps) {
  const cells: Cell[] = [
    {
      label: "今日",
      hint: "Today",
      value: todayCount,
      Icon: CalendarClock,
      iconBg: "bg-[#FAE6EA]",
      iconColor: "text-[#c86d85]",
      accent: "from-[#fae6ea]/70",
      delay: 0,
    },
    {
      label: "明日",
      hint: "Tomorrow",
      value: tomorrowCount,
      Icon: CalendarCheck2,
      iconBg: "bg-[#EDE7F5]",
      iconColor: "text-[#8a6fa5]",
      accent: "from-[#ede7f5]/70",
      delay: 0.05,
    },
    {
      label: "本周",
      hint: "7 days",
      value: weekCount,
      Icon: CalendarRange,
      iconBg: "bg-[#FBEBDE]",
      iconColor: "text-[#b87a56]",
      accent: "from-[#fbebde]/70",
      delay: 0.1,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {cells.map((c) => (
        <MiniCell key={c.label} {...c} />
      ))}
    </div>
  );
}

function MiniCell({
  label,
  hint,
  value,
  Icon,
  iconBg,
  iconColor,
  accent,
  delay,
}: Cell) {
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    let raf = 0;
    const duration = 600;
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
        "group relative overflow-hidden rounded-2xl border border-[#f1e8e0] bg-white p-3",
        "transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-[#e8d7c8] hover:shadow-soft",
        "animate-fade-in-up"
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-gradient-to-br",
          accent,
          "to-transparent blur-2xl opacity-80"
        )}
      />
      <div className="relative flex items-center gap-1.5">
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-lg",
            iconBg
          )}
        >
          <Icon size={11} strokeWidth={2} className={iconColor} />
        </div>
        <span className="text-[10px] font-medium text-[#8a7972]">
          {label}
        </span>
      </div>
      <div className="relative mt-1.5 flex items-baseline gap-0.5">
        <span className="text-[20px] font-bold leading-none text-[#5b4a4a] tabular-nums">
          {display}
        </span>
      </div>
      <p className="relative mt-0.5 text-[9px] uppercase tracking-wider text-[#b4a79e]">
        {hint}
      </p>
    </div>
  );
}
