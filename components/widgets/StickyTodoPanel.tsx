"use client";

/**
 * components/widgets/StickyTodoPanel.tsx · 便签式周 Todo
 *
 * 两种展示模式：
 *   - variant="bookmark"：在右侧固定成"书签"，点击展开为便签卡
 *   - variant="card"：直接嵌入为普通卡片
 *
 * 主流设计决策（为什么是"周"而非"日"）：
 *   1. 求职任务大多跨天（如"这周整理 3 家简历"）
 *   2. 日维度的 todo 在首页"今日事件"已经有了，不需要再重复
 *   3. 周边界清晰（周一~周日），天然支持"跨周结转"
 *
 * 便签纸质感：
 *   - 淡黄/淡粉交替底色（纸张感）
 *   - 顶部阴影 + 撕边 gap（用 css 模拟）
 *   - 角标"回形针"小装饰
 */

import * as React from "react";
import useSWR from "swr";
import { toast } from "sonner";
import {
  StickyNote,
  Plus,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CalendarRange,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { fetchJson } from "@/lib/fetcher";

interface TodoItem {
  id: string;
  content: string;
  done: boolean;
  sortOrder: number;
  createdAt: string;
}

interface WeeklyTodoResp {
  weekStart: string;
  items: TodoItem[];
}

const swrFetcher = <T,>(url: string) => fetchJson<T>(url);

/** 算本周一（本地时区 YYYY-MM-DD） */
function currentWeekMonday(base: Date = new Date()): string {
  const x = new Date(base);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function addDays(ymd: string, delta: number): string {
  const d = new Date(ymd + "T00:00:00");
  d.setDate(d.getDate() + delta);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function formatWeekRange(weekStart: string): string {
  const end = addDays(weekStart, 6);
  const s = weekStart.slice(5).replace("-", "/");
  const e = end.slice(5).replace("-", "/");
  return `${s} - ${e}`;
}

// ──────────────────────────────────────────────────────────────────────
// 主面板
// ──────────────────────────────────────────────────────────────────────

interface Props {
  variant?: "bookmark" | "card";
  className?: string;
}

export function StickyTodoPanel({ variant = "card", className }: Props) {
  const [weekStart, setWeekStart] = React.useState(() => currentWeekMonday());
  const [expanded, setExpanded] = React.useState(variant === "card");
  const [drafting, setDrafting] = React.useState("");

  const swrKey = `/api/weekly-todos?weekStart=${weekStart}`;
  const { data, isLoading, mutate } = useSWR<WeeklyTodoResp>(
    swrKey,
    swrFetcher
  );
  const items = data?.items ?? [];
  const todayWeek = currentWeekMonday();
  const isCurrent = weekStart === todayWeek;

  // 便签纸底色（交替黄/粉/绿/紫；按 weekStart 哈希决定基色）
  const paperTone = getPaperTone(weekStart);

  const addTodo = async () => {
    const content = drafting.trim();
    if (!content) return;
    const tmpId = "tmp-" + Math.random().toString(36).slice(2, 8);
    const optimistic: TodoItem = {
      id: tmpId,
      content,
      done: false,
      sortOrder: items.length,
      createdAt: new Date().toISOString(),
    };
    mutate(
      (prev) =>
        prev
          ? { ...prev, items: [...prev.items, optimistic] }
          : { weekStart, items: [optimistic] },
      false
    );
    setDrafting("");
    try {
      await fetchJson<TodoItem>("/api/weekly-todos", {
        method: "POST",
        body: JSON.stringify({ weekStart, content }),
      });
      await mutate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "添加失败");
      await mutate();
    }
  };

  const toggleDone = async (item: TodoItem) => {
    mutate(
      (prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((x) =>
                x.id === item.id ? { ...x, done: !x.done } : x
              ),
            }
          : prev,
      false
    );
    try {
      await fetchJson(`/api/weekly-todos/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ done: !item.done }),
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "更新失败");
      await mutate();
    }
  };

  const removeTodo = async (id: string) => {
    mutate(
      (prev) =>
        prev ? { ...prev, items: prev.items.filter((x) => x.id !== id) } : prev,
      false
    );
    try {
      await fetchJson(`/api/weekly-todos/${id}`, { method: "DELETE" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "删除失败");
      await mutate();
    }
  };

  const doneCount = items.filter((x) => x.done).length;

  // ── 书签模式：右侧固定 tab + 点击展开便签 ──
  if (variant === "bookmark") {
    return (
      <>
        {/* 点击展开 · 固定书签 */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "收起便签" : "展开便签"}
          className={cn(
            "fixed right-0 top-40 z-30 flex h-28 w-11 items-center justify-center",
            "rounded-l-2xl border border-r-0 text-[#8a6d5f] shadow-[-4px_6px_16px_rgba(199,165,149,0.15)]",
            "transition-all duration-300 ease-out hover:w-12",
            paperTone.bookmarkTab,
            expanded && "translate-x-[420px] opacity-0 pointer-events-none"
          )}
        >
          <div className="flex -rotate-90 items-center gap-1.5 text-[11px] font-semibold tracking-widest">
            <StickyNote size={12} />
            <span>本周待办</span>
            {doneCount > 0 && items.length > 0 && (
              <span className="text-[10px] opacity-70">
                {doneCount}/{items.length}
              </span>
            )}
          </div>
        </button>

        {/* 便签卡 · 从右侧滑出 */}
        <div
          className={cn(
            "fixed right-4 top-32 z-30 w-[360px]",
            "transition-all duration-300 ease-out",
            expanded
              ? "translate-x-0 opacity-100"
              : "pointer-events-none translate-x-[420px] opacity-0"
          )}
        >
          <StickyNoteCard
            weekStart={weekStart}
            setWeekStart={setWeekStart}
            isCurrent={isCurrent}
            items={items}
            isLoading={isLoading}
            drafting={drafting}
            setDrafting={setDrafting}
            addTodo={addTodo}
            toggleDone={toggleDone}
            removeTodo={removeTodo}
            paperTone={paperTone}
            onClose={() => setExpanded(false)}
            variant="bookmark"
          />
        </div>
      </>
    );
  }

  // ── card 模式 ──
  return (
    <div className={cn(className)}>
      <StickyNoteCard
        weekStart={weekStart}
        setWeekStart={setWeekStart}
        isCurrent={isCurrent}
        items={items}
        isLoading={isLoading}
        drafting={drafting}
        setDrafting={setDrafting}
        addTodo={addTodo}
        toggleDone={toggleDone}
        removeTodo={removeTodo}
        paperTone={paperTone}
        variant="card"
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 便签卡片
// ──────────────────────────────────────────────────────────────────────

function StickyNoteCard({
  weekStart,
  setWeekStart,
  isCurrent,
  items,
  isLoading,
  drafting,
  setDrafting,
  addTodo,
  toggleDone,
  removeTodo,
  paperTone,
  onClose,
  variant,
}: {
  weekStart: string;
  setWeekStart: (v: string) => void;
  isCurrent: boolean;
  items: TodoItem[];
  isLoading: boolean;
  drafting: string;
  setDrafting: (v: string) => void;
  addTodo: () => void;
  toggleDone: (item: TodoItem) => void;
  removeTodo: (id: string) => void;
  paperTone: ReturnType<typeof getPaperTone>;
  onClose?: () => void;
  variant: "bookmark" | "card";
}) {
  const doneCount = items.filter((x) => x.done).length;

  return (
    <div
      className={cn(
        "relative rounded-[20px] border p-5 shadow-lg",
        paperTone.paperBg,
        paperTone.paperBorder,
        // 便签纸质感：顶部撕边、右上 dog-ear 折角
        "before:absolute before:inset-x-5 before:top-0 before:h-1 before:rounded-b-full before:bg-black/5",
        "after:absolute after:right-3 after:top-3 after:h-4 after:w-4 after:rotate-45 after:rounded-sm after:bg-white/70"
      )}
      style={{
        backgroundImage:
          "repeating-linear-gradient(180deg, transparent 0 26px, rgba(0,0,0,0.025) 26px 27px)",
      }}
    >
      {/* 装饰回形针 */}
      <div
        aria-hidden
        className="absolute -top-3 left-6 h-6 w-10 rounded-b-full border-b-2 border-l-2 border-r-2 border-[#c8b9a9]/60 bg-[#e8ddd0]/40 backdrop-blur-sm"
      />
      {variant === "bookmark" && onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="收起"
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-[#8a6d5f] hover:bg-black/5"
        >
          <X size={12} />
        </button>
      )}

      {/* 头部 */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote size={14} className={paperTone.accentText} />
          <h3
            className={cn(
              "text-[14px] font-semibold tracking-tight",
              paperTone.accentText
            )}
          >
            本周随手记
          </h3>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[#8a6d5f]">
          <button
            type="button"
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-black/5"
          >
            <ChevronLeft size={12} />
          </button>
          <span className="flex items-center gap-1 px-1 font-medium">
            <CalendarRange size={11} />
            {formatWeekRange(weekStart)}
          </span>
          <button
            type="button"
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-black/5"
          >
            <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {!isCurrent && (
        <button
          type="button"
          onClick={() => setWeekStart(currentWeekMonday())}
          className="mb-2 rounded-full bg-white/60 px-2 py-0.5 text-[10px] text-[#8a6d5f] hover:bg-white"
        >
          ← 回到本周
        </button>
      )}

      {/* 进度 */}
      {items.length > 0 && (
        <div className="mb-3 flex items-center gap-2 text-[11px] text-[#8a6d5f]">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/5">
            <div
              className={cn("h-full rounded-full transition-all", paperTone.progressBar)}
              style={{
                width: `${items.length ? (doneCount / items.length) * 100 : 0}%`,
              }}
            />
          </div>
          <span>
            {doneCount}/{items.length}
          </span>
        </div>
      )}

      {/* 列表 */}
      <ul className="space-y-1.5">
        {isLoading ? (
          <li className="flex items-center justify-center py-6 text-[12px] text-[#8a6d5f]">
            <Loader2 size={12} className="mr-1 animate-spin" />
            加载中
          </li>
        ) : items.length === 0 ? (
          <li className="py-3 text-center text-[12px] italic text-[#a69890]">
            这一周还没有待办～ 写下第一条吧 ✏️
          </li>
        ) : (
          items.map((item) => (
            <li
              key={item.id}
              className={cn(
                "group flex items-start gap-2 rounded-lg px-1.5 py-1 transition hover:bg-black/[0.03]"
              )}
            >
              <button
                type="button"
                onClick={() => toggleDone(item)}
                className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition",
                  item.done
                    ? `${paperTone.checkBg} border-transparent text-white`
                    : "border-[#c8b9a9]/70 bg-white/50 hover:border-[#8a6d5f]"
                )}
                aria-label={item.done ? "标记未完成" : "标记完成"}
              >
                {item.done && <Check size={10} strokeWidth={3} />}
              </button>
              <span
                className={cn(
                  "flex-1 text-[13px] leading-relaxed text-[#5c463a]",
                  item.done && "text-[#a69890] line-through decoration-[1.5px]"
                )}
              >
                {item.content}
              </span>
              <button
                type="button"
                onClick={() => removeTodo(item.id)}
                className="hidden h-5 w-5 items-center justify-center rounded text-[#b4a79e] hover:bg-white/60 hover:text-[#c86d85] group-hover:flex"
                aria-label="删除"
              >
                <Trash2 size={11} />
              </button>
            </li>
          ))
        )}
      </ul>

      {/* 输入 */}
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/50 bg-white/60 px-2 py-1.5 backdrop-blur focus-within:bg-white/90 focus-within:shadow-sm">
        <Plus size={13} className="text-[#b4a79e]" />
        <input
          value={drafting}
          onChange={(e) => setDrafting(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTodo();
            }
          }}
          placeholder="写一条待办…"
          maxLength={200}
          className="flex-1 bg-transparent text-[13px] text-[#5c463a] placeholder:text-[#c7b5a8] focus:outline-none"
        />
        {drafting && (
          <button
            type="button"
            onClick={addTodo}
            className={cn(
              "rounded-md px-2 py-0.5 text-[11px] font-medium transition",
              paperTone.addBtn
            )}
          >
            添加
          </button>
        )}
      </div>

      {/* 底部小脚注 */}
      <p className="mt-2 text-[10px] italic text-[#b4a79e]">
        提示：Enter 快捷添加 · 跨周会自动回到当前周
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 便签配色：按 weekStart 字符串哈希选一种（黄 / 粉 / 绿 / 紫）
// ──────────────────────────────────────────────────────────────────────

function getPaperTone(weekStart: string) {
  const tones = [
    {
      paperBg: "bg-gradient-to-br from-[#fbf4d4] to-[#f4ea9f]",
      paperBorder: "border-[#ecdf88]",
      accentText: "text-[#a08a3a]",
      bookmarkTab: "bg-gradient-to-b from-[#fbf4d4] to-[#f4ea9f] border-[#ecdf88]",
      progressBar: "bg-[#c9a340]",
      checkBg: "bg-[#c9a340]",
      addBtn: "bg-[#c9a340] text-white hover:bg-[#b79127]",
    },
    {
      paperBg: "bg-gradient-to-br from-[#fae6ea] to-[#f5cdd4]",
      paperBorder: "border-[#f0b8c4]",
      accentText: "text-[#c86d85]",
      bookmarkTab: "bg-gradient-to-b from-[#fae6ea] to-[#f5cdd4] border-[#f0b8c4]",
      progressBar: "bg-[#c86d85]",
      checkBg: "bg-[#c86d85]",
      addBtn: "bg-[#c86d85] text-white hover:bg-[#b85976]",
    },
    {
      paperBg: "bg-gradient-to-br from-[#e8efe3] to-[#c8dcbc]",
      paperBorder: "border-[#b2cda1]",
      accentText: "text-[#5a7052]",
      bookmarkTab: "bg-gradient-to-b from-[#e8efe3] to-[#c8dcbc] border-[#b2cda1]",
      progressBar: "bg-[#70876a]",
      checkBg: "bg-[#70876a]",
      addBtn: "bg-[#70876a] text-white hover:bg-[#5e7659]",
    },
    {
      paperBg: "bg-gradient-to-br from-[#ede7f5] to-[#d6c9e8]",
      paperBorder: "border-[#c0afd9]",
      accentText: "text-[#725c94]",
      bookmarkTab: "bg-gradient-to-b from-[#ede7f5] to-[#d6c9e8] border-[#c0afd9]",
      progressBar: "bg-[#8a6fa5]",
      checkBg: "bg-[#8a6fa5]",
      addBtn: "bg-[#8a6fa5] text-white hover:bg-[#775b92]",
    },
  ];
  let h = 0;
  for (const c of weekStart) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return tones[h % tones.length];
}
