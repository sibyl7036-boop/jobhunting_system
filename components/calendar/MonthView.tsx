"use client";

/**
 * components/calendar/MonthView.tsx · 极简奶油马卡龙风
 */

import * as React from "react";
import { ChevronLeft, ChevronRight, Calendar, Plus } from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fetchJson } from "@/lib/fetcher";
import { useOpenDrawer } from "@/lib/drawerUrl";

// ──────────────────────────────────────────────────────────────────────
// 事件颜色规则 · 低饱和 pill
// ──────────────────────────────────────────────────────────────────────

function chipClass(type: string): string {
  if (["一面", "二面", "三面"].includes(type)) {
    return "bg-[#F7F4FB] text-[#8a6fa5] border-[#ede7f5]";
  }
  if (type === "HR面") {
    return "bg-[#FAE6EA] text-[#c86d85] border-[#f3d9df]";
  }
  if (["笔试", "测评"].includes(type)) {
    return "bg-[#FBF4D4] text-[#a08a3a] border-[#f0e5b0]";
  }
  if (type === "Offer" || type === "Offer沟通") {
    return "bg-[#E8EFE3] text-[#70876a] border-[#d7e2cd]";
  }
  return "bg-[#fdfbf8] text-[#8a7972] border-[#f1e8e0]";
}

// ──────────────────────────────────────────────────────────────────────
// 类型
// ──────────────────────────────────────────────────────────────────────

export interface CalendarEventVM {
  id: string;
  type: string;
  status: string;
  timeIso: string;
  application: {
    id: string;
    companyName: string;
    departmentName: string;
    roleName: string;
  };
}

interface MonthViewProps {
  initial?: string;
  initialEvents: CalendarEventVM[];
  initialRange: { start: string; end: string };
}

// ──────────────────────────────────────────────────────────────────────
// 工具
// ──────────────────────────────────────────────────────────────────────

function ymd(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function buildGrid(anchor: Date): Date[] {
  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

// ──────────────────────────────────────────────────────────────────────
// 组件
// ──────────────────────────────────────────────────────────────────────

export function MonthView({
  initial,
  initialEvents,
  initialRange,
}: MonthViewProps) {
  const initialAnchor = React.useMemo(() => {
    if (initial) return new Date(initial);
    return new Date();
  }, [initial]);

  const [anchor, setAnchor] = React.useState<Date>(initialAnchor);
  const [events, setEvents] = React.useState<CalendarEventVM[]>(initialEvents);
  const [loading, setLoading] = React.useState(false);
  const [selectedDay, setSelectedDay] = React.useState<Date>(new Date());
  const openDrawer = useOpenDrawer();

  const currentRange = React.useRef(initialRange);

  React.useEffect(() => {
    const gridStart = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
    const gridEnd = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 });
    const start = ymd(gridStart);
    const end = ymd(gridEnd);

    if (
      currentRange.current.start === start &&
      currentRange.current.end === end
    ) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchJson<CalendarEventVM[] | RawEvent[]>(
      `/api/calendar/events?start=${start}&end=${end}`
    )
      .then((data) => {
        if (cancelled) return;
        const normalized: CalendarEventVM[] = (data as RawEvent[])
          .filter((e) => e.time)
          .map((e) => ({
            id: e.id,
            type: e.type,
            status: e.status,
            timeIso: e.time as string,
            application: {
              id: e.application.id,
              companyName: e.application.companyName,
              departmentName: e.application.departmentName,
              roleName: e.application.roleName,
            },
          }));
        setEvents(normalized);
        currentRange.current = { start, end };
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "加载事件失败";
        toast.error(msg);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [anchor]);

  const byDay = React.useMemo(() => {
    const map = new Map<string, CalendarEventVM[]>();
    for (const e of events) {
      const d = new Date(e.timeIso);
      const key = ymd(d);
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    }
    return map;
  }, [events]);

  const grid = buildGrid(anchor);
  const monthLabel = format(anchor, "yyyy · M");
  const selectedKey = ymd(selectedDay);
  const selectedEvents = byDay.get(selectedKey) ?? [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* 左 8 栏 */}
      <div className="lg:col-span-8">
        <section className="surface p-6">
          <header className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FBEBDE]">
                <Calendar
                  size={16}
                  className="text-[#b87a56]"
                  strokeWidth={2}
                />
              </div>
              <div>
                <h2 className="text-section-title text-[#5b4a4a]">
                  {monthLabel}
                </h2>
                <p className="text-[11px] text-[#b4a79e]">Monthly Calendar</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <NavBtn onClick={() => setAnchor((d) => subMonths(d, 1))} label="上一月">
                <ChevronLeft size={14} />
              </NavBtn>
              <button
                type="button"
                onClick={() => setAnchor(new Date())}
                className="rounded-full border border-[#f1e8e0] bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[#6b574f] transition-all hover:border-[#e8d7c8] hover:bg-[#fdfbf8]"
              >
                Today
              </button>
              <NavBtn onClick={() => setAnchor((d) => addMonths(d, 1))} label="下一月">
                <ChevronRight size={14} />
              </NavBtn>
              <div className="mx-1 h-5 w-px bg-[#f1e8e0]" />
              <button
                type="button"
                onClick={() =>
                  openDrawer({ type: "stage-new", date: ymd(selectedDay) })
                }
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-semibold text-white transition-all",
                  "bg-gradient-to-br from-[#e9b99a] to-[#d99a7a] shadow-[0_2px_8px_rgba(233,185,154,0.35)]",
                  "hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(233,185,154,0.45)]",
                  "active:translate-y-0"
                )}
                title={`在 ${format(selectedDay, "M 月 d 日")} 新建事件`}
              >
                <Plus size={13} strokeWidth={2.5} />
                新建事件
              </button>
            </div>
          </header>

          {/* 周标题 */}
          <div className="mb-2 grid grid-cols-7 gap-1.5 text-[11px]">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w, idx) => (
              <div
                key={w}
                className={cn(
                  "px-2 py-1.5 text-center font-semibold uppercase tracking-wider",
                  idx >= 5 ? "text-[#c86d85]" : "text-[#b4a79e]"
                )}
              >
                {w}
              </div>
            ))}
          </div>

          {/* 日期格 */}
          <div
            className={cn(
              "grid grid-cols-7 gap-1.5 transition-opacity",
              loading && "opacity-60"
            )}
          >
            {grid.map((day) => {
              const key = ymd(day);
              const dayEvents = byDay.get(key) ?? [];
              const inMonth = isSameMonth(day, anchor);
              const today = isToday(day);
              const selected = isSameDay(day, selectedDay);

              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => {
                    setSelectedDay(day);
                  }}
                  className={cn(
                    "group relative flex min-h-[92px] flex-col rounded-xl border p-2 text-left transition-all duration-200",
                    "hover:border-[#e8d7c8]",
                    inMonth
                      ? selected
                        ? "border-[#e9b99a] bg-[#fdf2ea]"
                        : today
                          ? "border-[#f1e3d4] bg-[#fdfbf8]"
                          : "border-[#f4ece4] bg-white"
                      : "border-transparent bg-[#fdfbf8]/40 opacity-50"
                  )}
                >
                  {/* 日期数字 */}
                  <div className="mb-1 flex items-center justify-between">
                    <span
                      className={cn(
                        "flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[12px] font-semibold tabular-nums",
                        today
                          ? "bg-[#e9b99a] text-white"
                          : selected
                            ? "text-[#b87a56]"
                            : "text-[#6b574f]",
                        !inMonth && "text-[#b4a79e]"
                      )}
                    >
                      {format(day, "d")}
                    </span>

                    {/* 日期格右上角的新建按钮：仅 hover 显示，不会挡内容 */}
                    {inMonth && (
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label="在该日新建事件"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          openDrawer({ type: "stage-new", date: ymd(day) });
                        }}
                        onKeyDown={(ev) => {
                          if (ev.key === "Enter" || ev.key === " ") {
                            ev.stopPropagation();
                            openDrawer({ type: "stage-new", date: ymd(day) });
                          }
                        }}
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full",
                          "text-[#e9b99a] opacity-0 transition-all",
                          "hover:bg-[#fdf2ea] hover:text-[#b87a56]",
                          "group-hover:opacity-100"
                        )}
                        title="新建事件"
                      >
                        <Plus size={11} strokeWidth={2.5} />
                      </span>
                    )}
                  </div>

                  {/* 事件 */}
                  <div className="flex flex-col gap-1">
                    {dayEvents.slice(0, 3).map((e) => (
                      <span
                        key={e.id}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          openDrawer({ type: "stage", id: e.id });
                        }}
                        className={cn(
                          "truncate rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-tight cursor-pointer",
                          "transition-all hover:-translate-y-0.5",
                          chipClass(e.type)
                        )}
                        title={`${e.type} · ${e.application.companyName}${e.application.roleName ? " · " + e.application.roleName : ""}`}
                      >
                        {e.type}
                      </span>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-[#b4a79e]">
                        +{dayEvents.length - 3}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* 右 4 栏：选中日期详情 */}
      <aside className="lg:col-span-4">
        <section className="surface sticky top-6 p-5">
          <header className="mb-4 flex items-start gap-3">
            <div className="flex h-11 w-11 flex-col items-center justify-center rounded-xl border border-[#f1e3d4] bg-[#fdfbf8] text-[#6b574f]">
              <span className="text-[9px] leading-none font-medium uppercase tracking-wider text-[#b4a79e]">
                {format(selectedDay, "MMM")}
              </span>
              <span className="mt-0.5 text-[15px] leading-none font-bold">
                {format(selectedDay, "d")}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-card-title text-[#5b4a4a]">
                {format(selectedDay, "yyyy 年 M 月 d 日")}
              </h3>
              <p className="text-[11px] text-[#b4a79e]">
                {selectedEvents.length
                  ? `当日 ${selectedEvents.length} 个事件`
                  : "当日暂无事件"}
              </p>
            </div>
          </header>

          {selectedEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#ead8c8] bg-[#fdfbf8]/60 py-10 text-center">
              <div className="mb-2 text-[24px] opacity-80">☕</div>
              <p className="text-body text-[#6b574f]">今天可以专心打磨简历</p>
              <p className="mt-1 text-[11px] text-[#b4a79e]">
                点击日期格也能新增事件
              </p>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-semibold text-[#b4a79e] uppercase tracking-wider">
                  Events · {selectedEvents.length}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    openDrawer({ type: "stage-new", date: ymd(selectedDay) })
                  }
                  className="inline-flex items-center gap-1 rounded-full border border-[#f1e8e0] bg-white px-2.5 py-1 text-[11px] font-medium text-[#8a7972] transition-all hover:-translate-y-0.5 hover:border-[#e9b99a] hover:bg-[#fdf2ea] hover:text-[#b87a56]"
                  title="在该日新建事件"
                >
                  <Plus size={11} strokeWidth={2.5} />
                  新建
                </button>
              </div>
              <ul className="space-y-2">
                {selectedEvents.map((e, idx) => {
                  const d = new Date(e.timeIso);
                  const hhmm = format(d, "HH:mm");
                  return (
                    <li
                      key={e.id}
                      onClick={() => {
                        openDrawer({ type: "stage", id: e.id });
                      }}
                      className="group cursor-pointer rounded-xl border border-[#f1e8e0] bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-[#e8d7c8] animate-fade-in-up"
                      style={{ animationDelay: `${idx * 0.04}s` }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex flex-shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                            chipClass(e.type)
                          )}
                        >
                          {e.type}
                        </span>
                        <span className="text-[12px] font-semibold text-[#6b574f] tabular-nums">
                          {hhmm}
                        </span>
                      </div>
                      <p className="mt-2 text-body font-medium text-[#5b4a4a]">
                        {e.application.companyName}
                        {e.application.roleName && (
                          <span className="text-[#8a7972]">
                            {" "}
                            · {e.application.roleName}
                          </span>
                        )}
                      </p>
                      {e.application.departmentName && (
                        <p className="mt-0.5 text-[11px] text-[#b4a79e]">
                          {e.application.departmentName}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>
      </aside>
    </div>
  );
}

function NavBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#f1e8e0] bg-white text-[#8a7972] transition-all hover:border-[#e8d7c8] hover:bg-[#fdfbf8] hover:text-[#6b574f]"
    >
      {children}
    </button>
  );
}

interface RawEvent {
  id: string;
  type: string;
  status: string;
  time: string | null;
  application: {
    id: string;
    companyName: string;
    departmentName: string;
    roleName: string;
    linkedResume: { id: string; name: string } | null;
  };
}