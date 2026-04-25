"use client";

/**
 * components/dashboard/FunnelBar.tsx
 *
 * 顶部求职漏斗条（Huntr 风格）：Wishlist → Applied → Interview → Offer → Rejected
 * 每段展示数量 + 占比，点击可跳 /companies 并 scroll 到对应状态
 *
 * 数据来自已存在的 stages + applications 聚合
 */

import * as React from "react";
import { Bookmark, Send, MessageSquare, Trophy, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FunnelStage {
  key: "wishlist" | "applied" | "interview" | "offer" | "rejected";
  label: string;
  count: number;
  Icon: typeof Bookmark;
  iconBg: string;
  iconColor: string;
  barFill: string;
  dot: string;
}

export interface FunnelBarProps {
  totalApplications: number;
  counts: {
    wishlist: number;
    applied: number;
    interview: number;
    offer: number;
    rejected: number;
  };
}

export function FunnelBar({ totalApplications, counts }: FunnelBarProps) {
  const stages: FunnelStage[] = [
    {
      key: "wishlist",
      label: "心愿单",
      count: counts.wishlist,
      Icon: Bookmark,
      iconBg: "bg-[#EDE7F5]",
      iconColor: "text-[#8a6fa5]",
      barFill: "bg-[#BEAED3]",
      dot: "bg-[#BEAED3]",
    },
    {
      key: "applied",
      label: "已投递",
      count: counts.applied,
      Icon: Send,
      iconBg: "bg-[#E6EEF7]",
      iconColor: "text-[#6b89a8]",
      barFill: "bg-[#8FAECB]",
      dot: "bg-[#8FAECB]",
    },
    {
      key: "interview",
      label: "面试中",
      count: counts.interview,
      Icon: MessageSquare,
      iconBg: "bg-[#FBEBDE]",
      iconColor: "text-[#b87a56]",
      barFill: "bg-[#E9B99A]",
      dot: "bg-[#E9B99A]",
    },
    {
      key: "offer",
      label: "Offer",
      count: counts.offer,
      Icon: Trophy,
      iconBg: "bg-[#E8EFE3]",
      iconColor: "text-[#70876a]",
      barFill: "bg-[#B0C3A3]",
      dot: "bg-[#B0C3A3]",
    },
    {
      key: "rejected",
      label: "已结束",
      count: counts.rejected,
      Icon: XCircle,
      iconBg: "bg-[#FAE6EA]",
      iconColor: "text-[#c86d85]",
      barFill: "bg-[#E9B1BF]",
      dot: "bg-[#E9B1BF]",
    },
  ];

  const hasData = totalApplications > 0;
  const max = Math.max(1, ...stages.map((s) => s.count));
  const conversionRate = hasData
    ? Math.round(((counts.offer) / totalApplications) * 100)
    : 0;

  return (
    <section className="surface relative overflow-hidden p-6">
      {/* 装饰层 */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#fbebde] opacity-30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-[#fae6ea] opacity-30 blur-3xl" />

      <header className="relative mb-5 flex items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#f1e3d4] bg-[#fdfbf8] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#b87a56]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E9B99A]" />
            Pipeline
          </div>
          <h2 className="mt-2 text-section-title text-[#5b4a4a]">
            求职漏斗 <span className="text-[#b4a79e]">· 全流程一览</span>
          </h2>
          <p className="mt-0.5 text-[11px] text-[#b4a79e]">
            跨 {totalApplications} 个岗位的进度分布
          </p>
        </div>
        <div className="flex items-center gap-5 text-right">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#b4a79e]">
              Conversion
            </div>
            <div className="mt-0.5 text-[22px] font-bold leading-none text-[#5b4a4a] tabular-nums">
              {conversionRate}
              <span className="text-[13px] text-[#b4a79e]">%</span>
            </div>
          </div>
          <div className="h-8 w-px bg-[#ead8c8]" />
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#b4a79e]">
              Total
            </div>
            <div className="mt-0.5 text-[22px] font-bold leading-none text-[#5b4a4a] tabular-nums">
              {totalApplications}
            </div>
          </div>
        </div>
      </header>

      {/* 漏斗段 */}
      <div className="relative grid grid-cols-2 gap-3 md:grid-cols-5">
        {stages.map((s, idx) => {
          const pct = hasData ? Math.round((s.count / max) * 100) : 0;
          return (
            <div
              key={s.key}
              className={cn(
                "group relative rounded-2xl border border-[#f1e8e0] bg-white/80 backdrop-blur p-4 transition-all duration-300",
                "hover:-translate-y-0.5 hover:border-[#e8d7c8] hover:shadow-soft cursor-default",
                "animate-fade-in-up"
              )}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                    s.iconBg
                  )}
                >
                  <s.Icon size={15} strokeWidth={2} className={s.iconColor} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[22px] font-bold leading-none text-[#5b4a4a] tabular-nums">
                      {s.count}
                    </span>
                    <span className="text-[11px] text-[#b4a79e]">个</span>
                  </div>
                  <div className="text-[11px] font-medium text-[#8a7972]">
                    {s.label}
                  </div>
                </div>
              </div>

              {/* 进度条 */}
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#f6ebe1]">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700 ease-out",
                    s.barFill
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* 连接小箭头（非最后一格） */}
              {idx < stages.length - 1 && (
                <div className="pointer-events-none absolute -right-2 top-1/2 hidden -translate-y-1/2 items-center md:flex">
                  <span className="h-1 w-1 rounded-full bg-[#ead8c8]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
