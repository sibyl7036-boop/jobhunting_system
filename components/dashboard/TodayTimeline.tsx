"use client";

/**
 * components/dashboard/TodayTimeline.tsx
 *
 * 今日时间轴：把当日事件以"时间竖线 + 时间块"的形式展示
 * 左侧：时刻（10:00、14:30…）
 * 右侧：事件卡（公司徽标 + 岗位 + 类型 pill + 会议链接）
 * 无事件时：空态 + Quick CTA
 */

import * as React from "react";
import { Clock, ChevronRight, Video, Sun, Moon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOpenDrawer } from "@/lib/drawerUrl";
import { CompanyBadge } from "@/components/ui/JobCombobox";

export interface TimelineEvent {
  id: string;
  type: string;
  status: string;
  timeIso: string | null;
  companyName: string;
  departmentName: string;
  roleName: string;
  meetingLink?: string | null;
}

interface TodayTimelineProps {
  events: TimelineEvent[];
  /** 今日事件数（可能 props.events 已含明日，用于展示） */
  todayCount: number;
}

function typeChip(type: string): string {
  if (["一面", "二面", "三面"].includes(type))
    return "bg-[#F7F4FB] text-[#8a6fa5] border-[#ede7f5]";
  if (type === "HR面") return "bg-[#FAE6EA] text-[#c86d85] border-[#f3d9df]";
  if (["笔试", "测评"].includes(type))
    return "bg-[#FBF4D4] text-[#a08a3a] border-[#f0e5b0]";
  if (type === "Offer" || type === "Offer沟通")
    return "bg-[#E8EFE3] text-[#70876a] border-[#d7e2cd]";
  return "bg-[#fdfbf8] text-[#8a7972] border-[#f1e8e0]";
}

function statusDot(status: string): string {
  switch (status) {
    case "待参加":
      return "bg-[#E9B99A]";
    case "已完成":
      return "bg-[#b4a79e]";
    case "已通过":
      return "bg-[#B0C3A3]";
    case "未通过":
      return "bg-[#E9B1BF]";
    default:
      return "bg-[#d9c3b1]";
  }
}

function formatHm(d: Date | null): string {
  if (!d) return "全天";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function dayPeriod(d: Date | null): { text: string; Icon: typeof Sun } {
  if (!d) return { text: "全天", Icon: Sun };
  const h = d.getHours();
  if (h < 12) return { text: "Morning", Icon: Sun };
  if (h < 18) return { text: "Afternoon", Icon: Sun };
  return { text: "Evening", Icon: Moon };
}

export function TodayTimeline({ events, todayCount }: TodayTimelineProps) {
  const openDrawer = useOpenDrawer();
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const todayEvents = events
    .filter((e) => e.timeIso && e.timeIso.slice(0, 10) === todayStr)
    .sort((a, b) => (a.timeIso ?? "").localeCompare(b.timeIso ?? ""));

  const isEmpty = todayEvents.length === 0;
  const currentHour = now.getHours() * 60 + now.getMinutes();

  return (
    <section className="surface relative overflow-hidden">
      {/* 顶部带渐变色的 header */}
      <div className="relative border-b border-[#f1e8e0] bg-gradient-to-r from-[#fdf6ef] via-white to-[#f3f7fa] px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fbebde] to-[#fae6ea] border border-[#f1e3d4]">
                <Clock size={16} className="text-[#b87a56]" strokeWidth={2} />
              </div>
              {todayCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c86d85] text-[9px] font-bold text-white">
                  {todayCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-section-title text-[#5b4a4a]">
                  Today
                </h2>
                <span className="text-[12px] text-[#b4a79e]">
                  · {now.getMonth() + 1} 月 {now.getDate()} 日
                </span>
              </div>
              <p className="text-[11px] text-[#b4a79e]">
                {isEmpty
                  ? "今天没安排，放松一下吧 ☕"
                  : `${todayCount} 个日程待完成`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openDrawer({ type: "stage-new", date: todayStr })}
            className="inline-flex items-center gap-1 rounded-full border border-[#f1e3d4] bg-white/70 backdrop-blur px-3 py-1.5 text-[12px] font-semibold text-[#8a6d5f] transition hover:bg-white hover:border-[#e8d7c8]"
          >
            <Plus size={12} />
            新增
          </button>
        </div>
      </div>

      <div className="p-5">
        {isEmpty ? (
          <EmptyDay onCreate={() => openDrawer({ type: "stage-new", date: todayStr })} />
        ) : (
          <ol className="relative space-y-3">
            {/* 左侧竖线 */}
            <span
              aria-hidden
              className="pointer-events-none absolute left-[54px] top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-[#ead8c8] to-transparent"
            />
            {todayEvents.map((e, idx) => {
              const d = e.timeIso ? new Date(e.timeIso) : null;
              const hm = formatHm(d);
              const { text: period, Icon: PIcon } = dayPeriod(d);
              const isPast = d && d.getHours() * 60 + d.getMinutes() < currentHour;
              return (
                <li
                  key={e.id}
                  className="group relative flex items-stretch gap-4 animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.06}s` }}
                >
                  {/* 左侧时间 */}
                  <div className="w-[48px] flex-shrink-0 pt-1 text-right">
                    <div
                      className={cn(
                        "text-[14px] font-bold leading-none tabular-nums",
                        isPast ? "text-[#b4a79e]" : "text-[#5b4a4a]"
                      )}
                    >
                      {hm}
                    </div>
                    <div className="mt-1 inline-flex items-center gap-0.5 text-[9px] uppercase tracking-wider text-[#b4a79e]">
                      <PIcon size={8} />
                      {period}
                    </div>
                  </div>

                  {/* 中间圆点 */}
                  <div className="relative flex flex-col items-center">
                    <span
                      className={cn(
                        "z-10 mt-2 h-3 w-3 rounded-full border-[3px] border-white shadow-[0_0_0_1.5px_#ead8c8]",
                        statusDot(e.status)
                      )}
                    />
                  </div>

                  {/* 右侧事件卡 */}
                  <button
                    type="button"
                    onClick={() => openDrawer({ type: "stage", id: e.id })}
                    className={cn(
                      "group/item flex flex-1 items-center gap-3 rounded-2xl border border-[#f1e8e0] bg-white p-3 text-left",
                      "transition-all duration-200 hover:-translate-y-0.5 hover:border-[#e8d7c8] hover:shadow-soft",
                      isPast && "opacity-75"
                    )}
                  >
                    <CompanyBadge name={e.companyName} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-body font-semibold text-[#5b4a4a]">
                          {e.companyName}
                        </span>
                        <span
                          className={cn(
                            "flex-shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                            typeChip(e.type)
                          )}
                        >
                          {e.type}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#8a7972]">
                        <span className="truncate">
                          {e.roleName || "未命名岗位"}
                        </span>
                        {e.departmentName && (
                          <>
                            <span className="text-[#d9c3b1]">·</span>
                            <span className="truncate text-[#b4a79e]">
                              {e.departmentName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {e.meetingLink && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-[#e6eef7] px-2 py-0.5 text-[10px] font-medium text-[#6b89a8]"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          window.open(e.meetingLink ?? "", "_blank");
                        }}
                      >
                        <Video size={10} />
                        会议
                      </span>
                    )}
                    <ChevronRight
                      size={14}
                      className="flex-shrink-0 text-[#d9c3b1] transition-transform group-hover/item:translate-x-0.5 group-hover/item:text-[#8a7972]"
                    />
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}

function EmptyDay({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#ead8c8] bg-[#fdf9f3]/60 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fbebde] to-[#fae6ea]">
        <Sun size={20} className="text-[#b87a56]" />
      </div>
      <div>
        <p className="text-body font-semibold text-[#6b574f]">
          今天是个空白的好日子
        </p>
        <p className="mt-1 text-[11px] text-[#b4a79e]">
          可以用 AI Copilot 解析刚收到的面试邮件
        </p>
      </div>
      <button
        type="button"
        onClick={onCreate}
        className="mt-1 inline-flex items-center gap-1 rounded-full border border-[#f1e3d4] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#8a6d5f] transition hover:bg-[#fdfbf8]"
      >
        <Plus size={12} />
        手动新增事件
      </button>
    </div>
  );
}
