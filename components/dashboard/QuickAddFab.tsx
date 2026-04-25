"use client";

/**
 * components/dashboard/QuickAddFab.tsx
 *
 * 右下角浮动 Quick Add 按钮：
 *   - 点击展开菜单：新增事件 / 新增岗位
 *   - 溢出菜单带小动画
 *   - 使用 drawer URL
 */

import * as React from "react";
import { Plus, Calendar, Briefcase, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOpenDrawer } from "@/lib/drawerUrl";

export function QuickAddFab() {
  const openDrawer = useOpenDrawer();
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-2"
    >
      {/* Menu */}
      <div
        className={cn(
          "flex flex-col items-end gap-2 transition-all duration-300 ease-out",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-2 pointer-events-none"
        )}
      >
        <FabItem
          label="新增面试 / 笔试"
          color="bg-[#fbebde] text-[#b87a56]"
          icon={<Calendar size={15} />}
          onClick={() => {
            setOpen(false);
            openDrawer({ type: "stage-new" });
          }}
        />
        <FabItem
          label="新增岗位申请"
          color="bg-[#ede7f5] text-[#8a6fa5]"
          icon={<Briefcase size={15} />}
          onClick={() => {
            setOpen(false);
            openDrawer({ type: "application-new" });
          }}
        />
      </div>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "关闭 Quick Add 菜单" : "打开 Quick Add 菜单"}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full",
          "bg-gradient-to-br from-[#e9b99a] to-[#c86d85]",
          "text-white shadow-[0_4px_12px_rgba(201,109,133,0.25),0_1px_3px_rgba(201,109,133,0.15)]",
          "transition-all duration-300 ease-out",
          "hover:shadow-[0_6px_20px_rgba(201,109,133,0.3)] hover:scale-105",
          "active:scale-95",
          open && "rotate-45"
        )}
      >
        {open ? <X size={20} strokeWidth={2.2} /> : <Plus size={20} strokeWidth={2.2} />}
      </button>
    </div>
  );
}

function FabItem({
  label,
  icon,
  color,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-2 animate-fade-in-up"
    >
      <span className="rounded-full bg-white/95 backdrop-blur px-3 py-1.5 text-[12px] font-semibold text-[#5b4a4a] shadow-soft border border-[#f1e8e0] transition-transform group-hover:-translate-x-0.5">
        {label}
      </span>
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full shadow-soft border border-white/50 transition-transform group-hover:scale-110",
          color
        )}
      >
        {icon}
      </span>
    </button>
  );
}
