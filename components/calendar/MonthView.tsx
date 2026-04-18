"use client";

/**
 * components/calendar/MonthView.tsx
 *
 * 月视图日历（UI.md 9）
 *
 * 决策（Step 3.4）：不用 react-day-picker，手写 7×N grid。
 *   - 我们的需求是"展示事件"而非"选日期"，react-day-picker 的强项用不上
 *   - 手写只依赖已有的 date-fns + Tailwind grid
 *   - UI.md 9.3 "每格足够留白"需要精细控制，自己布局更直接
 *
 * 外观：
 *   - 月份切换 + 大卡片容器
 *   - 7 列（周一~周日）× 5~6 行，每格 min-h 108px
 *   - 事件用胶囊小标签，颜色规则同 EventTable（UI.md 9.4）
 *   - 一格最多 3 条，超出用 +N 省略
 *   - 点击日期格：右侧 ListView 展示当日事件
 *   - 点击事件：console.log（Phase 4.3 接 Drawer）
 */

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { fetchJson } from "@/lib/fetcher";
import { useOpenDrawer } from "@/lib/drawerUrl";

// ──────────────────────────────────────────────────────────────────────
// 事件颜色规则（UI.md 9.4，与 EventTable 8.3 视觉一致）
// ──────────────────────────────────────────────────────────────────────

function chipClass(type: string): string {
  if (["一面", "二面", "三面", "HR面"].includes(type)) {
    return "bg-secondary-lilac text-text-primary";
  }
  if (["笔试", "测评"].includes(type)) {
    return "bg-secondary-yellow text-text-primary";
  }
  if (type === "Offer") {
    return "bg-secondary-mint text-[#4A9970]";
  }
  return "bg-neutral/60 text-text-secondary";
}

// ──────────────────────────────────────────────────────────────────────
// 类型
// ──────────────────────────────────────────────────────────────────────

/** Server → Client 边界上的事件类型（Date 已序列化，和 EventTable 的 SerializedEvent 对齐） */
export interface CalendarEventVM {
  id: string;
  type: string;
  status: string;
  timeIso: string; // 月视图里 time 必有（保留 string，Date.parse 后本地时区解释）
  application: {
    id: string;
    companyName: string;
    departmentName: string;
    roleName: string;
  };
}

interface MonthViewProps {
  /** 初始展示月份的任一天（默认当天） */
  initial?: string;
  /** 初始数据（SSR 注入），避免首屏空白 */
  initialEvents: CalendarEventVM[];
  /** 初始 start / end（YYYY-MM-DD） */
  initialRange: { start: string; end: string };
}

// ──────────────────────────────────────────────────────────────────────
// 工具
// ──────────────────────────────────────────────────────────────────────

function ymd(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

/** 生成日历网格的 42 或 35 天（周一起始） */
function buildGrid(anchor: Date): Date[] {
  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);
  // 周一起始（UI.md 没强制，但中文日历习惯周一）
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

  // 切换月份时重新拉数据
  React.useEffect(() => {
    const gridStart = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
    const gridEnd = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 });
    const start = ymd(gridStart);
    const end = ymd(gridEnd);

    // 首屏已有数据且 range 一致，跳过
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
        // 后端返回的是 Prisma 原生结构（time 是 ISO 字符串、有嵌套 application），适配一下
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
        // eslint-disable-next-line no-console
        console.error("[calendar] 加载事件失败：", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [anchor]);

  // 按日期分组事件（YYYY-MM-DD → Event[]）
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
  const monthLabel = format(anchor, "yyyy 年 M 月");
  const selectedKey = ymd(selectedDay);
  const selectedEvents = byDay.get(selectedKey) ?? [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* 左 8 栏：月视图 */}
      <div className="lg:col-span-8">
        <section className="rounded-card-lg bg-surface-bg p-6 shadow-soft">
          {/* 月份切换 */}
          <header className="mb-5 flex items-center justify-between">
            <h2 className="text-section-title text-text-primary">
              {monthLabel}
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAnchor((d) => subMonths(d, 1))}
                className="flex h-9 w-9 items-center justify-center rounded-btn-sm bg-soft-panel text-text-primary transition-colors hover:bg-secondary-pink"
                aria-label="上一月"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setAnchor(new Date())}
                className="rounded-btn-sm bg-soft-panel px-3 py-1.5 text-caption text-text-primary transition-colors hover:bg-secondary-pink"
              >
                今天
              </button>
              <button
                type="button"
                onClick={() => setAnchor((d) => addMonths(d, 1))}
                className="flex h-9 w-9 items-center justify-center rounded-btn-sm bg-soft-panel text-text-primary transition-colors hover:bg-secondary-pink"
                aria-label="下一月"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </header>

          {/* 周标题 */}
          <div className="mb-2 grid grid-cols-7 gap-2 text-caption text-text-tertiary">
            {["一", "二", "三", "四", "五", "六", "日"].map((w) => (
              <div key={w} className="px-2 py-1 text-center">
                周{w}
              </div>
            ))}
          </div>

          {/* 日期格 */}
          <div
            className={cn(
              "grid grid-cols-7 gap-2 transition-opacity",
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
                    // Step 4.4 · 日期格子本身的点击：若当日无事件，打开新建 Drawer 并预填日期
                    if (dayEvents.length === 0) {
                      openDrawer({ type: "stage-new", date: ymd(day) });
                    }
                  }}
                  className={cn(
                    "flex min-h-[108px] flex-col rounded-card-md p-2 text-left transition-colors",
                    inMonth
                      ? "bg-app-bg-secondary hover:bg-soft-panel"
                      : "bg-surface-bg/50 text-text-tertiary hover:bg-soft-panel/60",
                    today && "ring-2 ring-primary/40",
                    selected && "bg-soft-panel ring-2 ring-primary"
                  )}
                >
                  {/* 日期数字 */}
                  <div className="mb-1 flex items-center justify-between">
                    <span
                      className={cn(
                        "text-caption font-medium",
                        today ? "text-primary-strong" : "text-text-secondary",
                        !inMonth && "text-text-tertiary"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </div>

                  {/* 事件小胶囊（最多 3 条，超出 +N） */}
                  <div className="flex flex-col gap-1">
                    {dayEvents.slice(0, 3).map((e) => (
                      <span
                        key={e.id}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          openDrawer({ type: "stage", id: e.id });
                        }}
                        className={cn(
                          "truncate rounded-pill px-2 py-0.5 text-[11px] leading-tight",
                          chipClass(e.type)
                        )}
                        title={`${e.type} · ${e.application.companyName}${e.application.roleName ? " · " + e.application.roleName : ""}`}
                      >
                        {e.type}
                      </span>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[11px] text-text-tertiary">
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

      {/* 右 4 栏：选中日期的事件列表 */}
      <aside className="lg:col-span-4">
        <section className="rounded-card-lg bg-surface-bg p-5 shadow-soft">
          <header className="mb-4">
            <h3 className="text-card-title text-text-primary">
              {format(selectedDay, "M 月 d 日")}
            </h3>
            <p className="mt-1 text-caption text-text-tertiary">
              {selectedEvents.length
                ? `当日 ${selectedEvents.length} 个事件`
                : "当日暂无事件"}
            </p>
          </header>

          {selectedEvents.length === 0 ? (
            <div className="rounded-card-md bg-app-bg-secondary py-8 text-center text-body text-text-secondary">
              今天可以专心把简历磨一磨 🌸
            </div>
          ) : (
            <ul className="space-y-2">
              {selectedEvents.map((e) => {
                const d = new Date(e.timeIso);
                const hhmm = format(d, "HH:mm");
                return (
                  <li
                    key={e.id}
                    onClick={() => {
                      openDrawer({ type: "stage", id: e.id });
                    }}
                    className="cursor-pointer rounded-card-md bg-app-bg-secondary p-3 transition-all hover:-translate-y-0.5 hover:bg-soft-panel hover:shadow-soft"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex flex-shrink-0 items-center rounded-pill px-2.5 py-0.5 text-caption",
                          chipClass(e.type)
                        )}
                      >
                        {e.type}
                      </span>
                      <span className="text-caption font-medium text-text-primary">
                        {hhmm}
                      </span>
                    </div>
                    <p className="mt-1.5 text-body text-text-primary">
                      {e.application.companyName}
                      {e.application.roleName && ` · ${e.application.roleName}`}
                    </p>
                    {e.application.departmentName && (
                      <p className="text-caption text-text-tertiary">
                        {e.application.departmentName}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </aside>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 后端 raw shape（来自 /api/calendar/events，time 为 ISO string）
// ──────────────────────────────────────────────────────────────────────

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
