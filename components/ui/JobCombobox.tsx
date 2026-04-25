"use client";

/**
 * components/ui/JobCombobox.tsx
 *
 * 通用「岗位选择器」：
 *   - 搜索：公司名 / 部门 / 岗位 / 状态
 *   - 每条含：公司首字母徽标（低饱和色）、公司 · 部门 · 岗位、状态 pill
 *   - 键盘：↑↓ Enter Esc
 *   - 空态：引导去新建
 *   - 返回值：application.id
 *
 * 供 AI Workstation、抽屉、Drawer 等多处复用。
 */

import * as React from "react";
import { Search, ChevronDown, X, Briefcase, Plus, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComboAppOption {
  id: string;
  companyName: string;
  departmentName: string;
  roleName: string;
  currentStatus?: string;
}

interface JobComboboxProps {
  value: string;
  onChange: (id: string) => void;
  options: ComboAppOption[];
  placeholder?: string;
  emptyHint?: string;
  onCreateNew?: () => void;
  className?: string;
  disabled?: boolean;
}

/* 6 档低饱和色，基于公司名哈希分配 */
const TINTS: Array<{ bg: string; fg: string; border: string }> = [
  { bg: "#FAE6EA", fg: "#c86d85", border: "#f3d9df" },
  { bg: "#EDE7F5", fg: "#8a6fa5", border: "#dfd2ee" },
  { bg: "#FBF4D4", fg: "#a08a3a", border: "#f0e5b0" },
  { bg: "#E8EFE3", fg: "#70876a", border: "#d7e2cd" },
  { bg: "#E6EEF7", fg: "#6b89a8", border: "#cfdfec" },
  { bg: "#FBEBDE", fg: "#b87a56", border: "#f3e2d6" },
];

function pickTint(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h << 5) - h + name.charCodeAt(i);
    h |= 0;
  }
  return TINTS[Math.abs(h) % TINTS.length];
}

function statusColor(status?: string): string {
  switch (status) {
    case "已投递":
      return "bg-[#EDE7F5] text-[#8a6fa5] border-[#dfd2ee]";
    case "面试中":
    case "笔试中":
    case "测评中":
      return "bg-[#FBEBDE] text-[#b87a56] border-[#f3e2d6]";
    case "已通过":
    case "Offer":
      return "bg-[#E8EFE3] text-[#70876a] border-[#d7e2cd]";
    case "挂了":
    case "未通过":
      return "bg-[#FAE6EA] text-[#c86d85] border-[#f3d9df]";
    default:
      return "bg-[#fdfbf8] text-[#8a7972] border-[#f1e8e0]";
  }
}

export function JobCombobox({
  value,
  onChange,
  options,
  placeholder = "搜索公司 / 岗位 / 部门…",
  emptyHint = "还没有岗位，去公司流程页新建一个吧",
  onCreateNew,
  className,
  disabled,
}: JobComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [highlight, setHighlight] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selected = React.useMemo(
    () => options.find((o) => o.id === value) ?? null,
    [options, value]
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) =>
      [o.companyName, o.departmentName, o.roleName, o.currentStatus ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [options, query]);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  React.useEffect(() => {
    if (open) {
      setHighlight(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(filtered.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = filtered[highlight];
      if (pick) {
        onChange(pick.id);
        setOpen(false);
        setQuery("");
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div
      ref={rootRef}
      className={cn("relative w-full", open && "z-[60]", className)}
    >
      {/* 触发器 */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group flex w-full items-center gap-2.5 rounded-xl border bg-white px-3.5 py-2.5 text-left transition-all",
          "border-[#f1e8e0] hover:border-[#e8d7c8]",
          open && "border-[#e9b99a] ring-2 ring-[#fbebde]",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        {selected ? (
          <>
            <CompanyBadge name={selected.companyName} size={28} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-body font-semibold text-[#5b4a4a]">
                  {selected.companyName}
                </span>
                {selected.departmentName && (
                  <>
                    <span className="text-[11px] text-[#d9c3b1]">·</span>
                    <span className="truncate text-[12px] text-[#8a7972]">
                      {selected.departmentName}
                    </span>
                  </>
                )}
              </div>
              <div className="truncate text-[11px] text-[#b4a79e]">
                {selected.roleName || "未命名岗位"}
              </div>
            </div>
            {selected.currentStatus && (
              <span
                className={cn(
                  "flex-shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                  statusColor(selected.currentStatus)
                )}
              >
                {selected.currentStatus}
              </span>
            )}
          </>
        ) : (
          <>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fdfbf8] text-[#b4a79e]">
              <Briefcase size={14} />
            </div>
            <span className="flex-1 text-body text-[#b4a79e]">
              {placeholder}
            </span>
          </>
        )}
        <ChevronDown
          size={14}
          className={cn(
            "flex-shrink-0 text-[#b4a79e] transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {/* 下拉 */}
      {open && (
        <div
          className={cn(
            "absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden",
            "rounded-2xl border border-[#f1e8e0] bg-white shadow-soft",
            "animate-fade-in"
          )}
        >
          {/* 搜索条 */}
          <div className="flex items-center gap-2 border-b border-[#f1e8e0] px-3 py-2">
            <Search size={14} className="text-[#b4a79e]" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入关键字筛选…"
              className="flex-1 bg-transparent text-body text-[#5b4a4a] placeholder:text-[#b4a79e] focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-[#b4a79e] hover:text-[#8a7972]"
                aria-label="清空"
              >
                <X size={13} />
              </button>
            )}
            <kbd className="hidden items-center gap-1 rounded border border-[#f1e8e0] bg-[#fdfbf8] px-1.5 py-0.5 text-[10px] text-[#b4a79e] sm:flex">
              ↑↓
            </kbd>
          </div>

          {/* 列表 */}
          <div className="max-h-[280px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fdfbf8]">
                  <Building2 size={16} className="text-[#b4a79e]" />
                </div>
                <p className="text-body text-[#8a7972]">
                  {options.length === 0 ? emptyHint : "没找到匹配的岗位"}
                </p>
                {onCreateNew && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onCreateNew();
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-[#f1e3d4] bg-[#fbebde] px-3 py-1 text-[12px] font-semibold text-[#b87a56] transition hover:bg-[#f5dfca]"
                  >
                    <Plus size={12} />
                    新建岗位
                  </button>
                )}
              </div>
            ) : (
              filtered.map((o, i) => {
                const active = i === highlight;
                const isSelected = o.id === value;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => {
                      onChange(o.id);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "group flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors",
                      active && "bg-[#fdfbf8]",
                      isSelected && "bg-[#fbebde]/50"
                    )}
                  >
                    <CompanyBadge name={o.companyName} size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-body font-semibold text-[#5b4a4a]">
                          {o.companyName}
                        </span>
                        {o.departmentName && (
                          <>
                            <span className="text-[11px] text-[#d9c3b1]">·</span>
                            <span className="truncate text-[12px] text-[#8a7972]">
                              {o.departmentName}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="truncate text-[11px] text-[#b4a79e]">
                        {o.roleName || "未命名岗位"}
                      </div>
                    </div>
                    {o.currentStatus && (
                      <span
                        className={cn(
                          "flex-shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                          statusColor(o.currentStatus)
                        )}
                      >
                        {o.currentStatus}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {onCreateNew && filtered.length > 0 && (
            <div className="border-t border-[#f1e8e0] p-1.5">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onCreateNew();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] text-[#8a7972] transition-colors hover:bg-[#fdfbf8] hover:text-[#6b574f]"
              >
                <Plus size={12} />
                新建岗位…
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** 公司徽标 · 低饱和 · 首字母 */
export function CompanyBadge({
  name,
  size = 32,
}: {
  name: string;
  size?: number;
}) {
  const tint = pickTint(name);
  const fontSize = Math.round(size * 0.42);
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center rounded-xl font-semibold"
      style={{
        width: size,
        height: size,
        background: tint.bg,
        color: tint.fg,
        fontSize,
      }}
    >
      {name.slice(0, 1)}
    </div>
  );
}
