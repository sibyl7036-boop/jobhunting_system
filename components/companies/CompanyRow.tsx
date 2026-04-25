"use client";

/**
 * components/companies/CompanyRow.tsx · 极简奶油马卡龙风
 * 大厂进度 · 单家公司一行
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreHorizontal, Plus, Trash2, ChevronRight, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useOpenDrawer } from "@/lib/drawerUrl";
import { fetchJson } from "@/lib/fetcher";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import {
  HIDDEN_PRESET_STORAGE_KEY,
  readHiddenPresetCompanies,
  writeHiddenPresetCompanies,
} from "@/components/companies/hiddenPresetStore";

// ──────────────────────────────────────────────────────────────────────
// 节点定义
// ──────────────────────────────────────────────────────────────────────

export const STAGE_NODE_ORDER = [
  "已投递",
  "笔试",
  "测评",
  "一面",
  "二面",
  "三面",
  "HR面",
  "Offer",
  "挂了",
] as const;

type NodeState = "passed" | "active" | "pending" | "failed";

export interface SerializedStageForRow {
  id: string;
  type: string;
  status: string;
}

export interface SerializedAppForRow {
  id: string;
  companyName: string;
  departmentName: string;
  roleName: string;
  currentStatus: string;
  isEmpty: boolean;
  stages: SerializedStageForRow[];
}

function nodeStateFor(app: SerializedAppForRow, type: string): NodeState {
  const match = app.stages.find((s) => s.type === type);
  if (!match) return "pending";
  if (match.status === "已通过") return "passed";
  if (match.status === "未通过") return "failed";
  return "active";
}

/** 节点样式 · 低饱和 pill */
function nodeClass(state: NodeState, _isLast: boolean, type: string): string {
  if (type === "Offer" && (state === "passed" || state === "active")) {
    return "bg-[#FBF4D4] text-[#a08a3a] border-[#f0e5b0]";
  }
  if (type === "挂了" && state !== "pending") {
    return "bg-[#FAE6EA] text-[#c86d85] border-[#f3d9df]";
  }
  switch (state) {
    case "passed":
      return "bg-[#E8EFE3] text-[#70876a] border-[#d7e2cd]";
    case "active":
      return "bg-[#FBEBDE] text-[#b87a56] border-[#f3e2d6]";
    case "failed":
      return "bg-[#FAE6EA] text-[#c86d85] border-[#f3d9df]";
    case "pending":
    default:
      return "bg-white text-[#b4a79e] border-[#f1e8e0] hover:border-[#e8d7c8]";
  }
}

/** 公司 logo 背景色（基于名字 hash） · 低饱和 */
function companyTint(name: string): { bg: string; fg: string } {
  const palette: Array<{ bg: string; fg: string }> = [
    { bg: "#FAE6EA", fg: "#c86d85" },
    { bg: "#EDE7F5", fg: "#8a6fa5" },
    { bg: "#FBF4D4", fg: "#a08a3a" },
    { bg: "#E8EFE3", fg: "#70876a" },
    { bg: "#E6EEF7", fg: "#6b89a8" },
    { bg: "#FBEBDE", fg: "#b87a56" },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return palette[Math.abs(hash) % palette.length];
}

// ──────────────────────────────────────────────────────────────────────
// 组件
// ──────────────────────────────────────────────────────────────────────

interface CompanyRowProps {
  companyName: string;
  applications: SerializedAppForRow[];
  index?: number;
  isCustom?: boolean;
}

export function CompanyRow({
  companyName,
  applications,
  index = 0,
  isCustom = false,
}: CompanyRowProps) {
  const router = useRouter();
  const realApps = applications.filter((a) => !a.isEmpty);
  const isAllEmpty = realApps.length === 0;
  const openDrawer = useOpenDrawer();
  const tint = companyTint(companyName);
  const [hideConfirmOpen, setHideConfirmOpen] = React.useState(false);
  const [hiddenPresets, setHiddenPresets] = React.useState<string[]>([]);

  // 挂载后读本地隐藏名单；并订阅变化
  React.useEffect(() => {
    setHiddenPresets(readHiddenPresetCompanies());
    const onChange = (ev: Event) => {
      const detail = (ev as CustomEvent<string[]>).detail;
      setHiddenPresets(Array.isArray(detail) ? detail : readHiddenPresetCompanies());
    };
    window.addEventListener(HIDDEN_PRESET_STORAGE_KEY, onChange);
    return () => window.removeEventListener(HIDDEN_PRESET_STORAGE_KEY, onChange);
  }, []);

  // 预置公司被用户隐藏 → 直接不渲染
  // 注意：自定义公司走 API 删除，不在这里判
  if (!isCustom && hiddenPresets.includes(companyName)) {
    return null;
  }

  // 预置公司：通过 localStorage 隐藏；自定义公司：走 API 删除
  const hidePresetCompany = () => {
    if (isCustom) return;
    const cur = readHiddenPresetCompanies();
    if (!cur.includes(companyName)) {
      writeHiddenPresetCompanies([...cur, companyName]);
      window.dispatchEvent(
        new CustomEvent(HIDDEN_PRESET_STORAGE_KEY, {
          detail: [...cur, companyName],
        })
      );
    }
    toast.success(`已从清单中隐藏「${companyName}」`);
    router.refresh();
  };

  return (
    <div
      className="group/row flex gap-4 py-4 animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index * 0.04, 0.32)}s` }}
    >
      {/* 左侧：公司 logo + 名称 */}
      <div className="w-[140px] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl font-semibold text-[15px]"
            style={{ background: tint.bg, color: tint.fg }}
          >
            {companyName.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h3 className="text-card-title text-[#5b4a4a] truncate max-w-[88px]" title={companyName}>
                {companyName}
              </h3>
              {isCustom && (
                <span
                  className="inline-flex items-center rounded-full bg-[#fbebde] px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wider text-[#b87a56]"
                  title="自定义添加的公司"
                >
                  custom
                </span>
              )}
              {/* 隐藏按钮（所有公司都可以隐藏 / 删除；自定义走 API，预置走 local） */}
              <button
                type="button"
                aria-label={isCustom ? "删除公司" : "从清单中移除"}
                title={isCustom ? "删除公司" : "从清单中移除（数据不会丢）"}
                onClick={(ev) => {
                  ev.stopPropagation();
                  setHideConfirmOpen(true);
                }}
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full",
                  "text-[#c7b5a8] opacity-0 transition-all",
                  "hover:bg-[#fae6ea] hover:text-[#c86d85]",
                  "group-hover/row:opacity-100"
                )}
              >
                <X size={11} />
              </button>
            </div>
            {isAllEmpty ? (
              <span className="mt-0.5 inline-flex items-center rounded-full border border-[#f1e8e0] bg-[#fdfbf8] px-2 py-0.5 text-[10px] text-[#b4a79e]">
                未投递
              </span>
            ) : (
              <span
                className="mt-0.5 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium"
                style={{
                  background: tint.bg,
                  color: tint.fg,
                  borderColor: "transparent",
                }}
              >
                {realApps.length} 个岗位
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 右侧：岗位流程列表 */}
      <div className="flex-1 min-w-0">
        {isAllEmpty ? (
          <button
            type="button"
            onClick={() =>
              openDrawer({ type: "application-new", companyName })
            }
            className={cn(
              "flex h-full w-full items-center justify-between gap-3 rounded-xl border border-dashed border-[#ead8c8] bg-[#fdfbf8]/60 px-4 py-3",
              "transition-all hover:-translate-y-0.5 hover:border-[#e9b99a] hover:bg-[#fdf2ea]"
            )}
          >
            <span className="text-body text-[#b4a79e] italic transition-colors group-hover/row:text-[#8a7972]">
              还没有在这家公司开始流程
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-[#fbebde] to-[#f3e2d6] px-3 py-1 text-[11px] font-semibold text-[#b87a56] shadow-sm">
              <Plus size={11} strokeWidth={2.5} />
              新增岗位
            </span>
          </button>
        ) : (
          <div className="space-y-2">
            <ul className="space-y-2">
              {realApps.map((app) => (
                <AppFlowBar
                  key={app.id}
                  app={app}
                  onOpenDrawer={openDrawer}
                />
              ))}
            </ul>
            {/* 已有岗位下方放一个淡淡的"继续新增"按钮 */}
            <button
              type="button"
              onClick={() =>
                openDrawer({ type: "application-new", companyName })
              }
              className={cn(
                "flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-[#f1e8e0] bg-transparent px-3 py-1.5 text-[11px] font-medium text-[#b4a79e] transition-all",
                "hover:border-[#e9b99a] hover:bg-[#fdf2ea] hover:text-[#b87a56]"
              )}
            >
              <Plus size={11} strokeWidth={2.5} />
              在这家公司再新增一个岗位
            </button>
          </div>
        )}
      </div>

      {/* 删除/隐藏公司确认 */}
      <ConfirmDeleteDialog
        open={hideConfirmOpen}
        onOpenChange={setHideConfirmOpen}
        title={isCustom ? `删除公司「${companyName}」？` : `从清单中移除「${companyName}」？`}
        description={
          isCustom
            ? "自定义公司会被删除。已投递的历史岗位数据不会被删除（但会脱离该公司归类）。"
            : "这家预置公司会从你的清单里消失。已有的岗位数据保留，不会丢。你可以随时通过「重置预置列表」恢复。"
        }
        onConfirm={async () => {
          if (isCustom) {
            // 自定义公司：调 API 删除
            // 由上层的 CustomCompanyManager 负责实际删除（走 /api/companies/[id]）
            // 为通用，这里改用直接 dispatch 事件让管理器处理
            window.dispatchEvent(
              new CustomEvent("jhb:requestDeleteCustomCompany", {
                detail: { name: companyName },
              })
            );
          } else {
            hidePresetCompany();
          }
        }}
        successMessage={false}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 单个 Application 流程条
// ──────────────────────────────────────────────────────────────────────

function AppFlowBar({
  app,
  onOpenDrawer,
}: {
  app: SerializedAppForRow;
  onOpenDrawer: ReturnType<typeof useOpenDrawer>;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (ev: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(ev.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  const handleDeleteApplication = async () => {
    await fetchJson(`/api/applications/${app.id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <li
      className={cn(
        "group relative flex items-center gap-3 rounded-xl p-3",
        "border border-[#f1e8e0] bg-white/70 backdrop-blur",
        "transition-all hover:border-[#e8d7c8] hover:bg-white"
      )}
    >
      <div className="w-[140px] flex-shrink-0">
        <p className="truncate text-body font-semibold text-[#5b4a4a]">
          {app.roleName || "（未填岗位）"}
        </p>
        {app.departmentName && (
          <p className="truncate text-[11px] text-[#b4a79e]">
            {app.departmentName}
          </p>
        )}
      </div>

      <div className="flex-1 min-w-0 overflow-x-auto">
        <div className="flex items-center gap-0">
          {STAGE_NODE_ORDER.map((type, idx) => {
            const state = nodeStateFor(app, type);
            const stage = app.stages.find((s) => s.type === type);
            const isLast = idx === STAGE_NODE_ORDER.length - 1;
            return (
              <div key={type} className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (stage) {
                      onOpenDrawer({ type: "stage", id: stage.id });
                    } else {
                      onOpenDrawer({
                        type: "stage-new",
                        applicationId: app.id,
                      });
                    }
                  }}
                  className={cn(
                    "inline-flex h-7 items-center whitespace-nowrap rounded-full border px-2.5 text-[11px] font-semibold",
                    "transition-all duration-200",
                    "hover:-translate-y-0.5",
                    "active:scale-[0.97]",
                    nodeClass(state, isLast, type)
                  )}
                >
                  {type}
                </button>
                {!isLast && (
                  <ChevronRight
                    size={11}
                    className="mx-0.5 flex-shrink-0 text-[#ead8c8]"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div ref={menuRef} className="relative flex-shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg",
            "text-[#b4a79e] transition-all hover:bg-[#fbf4ee] hover:text-[#8a6d5f]",
            menuOpen && "bg-[#fbf4ee] text-[#8a6d5f]"
          )}
          aria-label="更多操作"
        >
          <MoreHorizontal size={14} />
        </button>
        {menuOpen && (
          <div
            className={cn(
              "absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden",
              "rounded-xl border border-[#f1e8e0] bg-white shadow-soft"
            )}
            role="menu"
          >
            <MenuItem
              onClick={() => {
                onOpenDrawer({ type: "stage-new", applicationId: app.id });
                setMenuOpen(false);
              }}
              icon={<Plus size={14} />}
            >
              新增流程节点
            </MenuItem>
            <MenuItem
              onClick={() => {
                setMenuOpen(false);
                setConfirmOpen(true);
              }}
              icon={<Trash2 size={14} />}
              variant="danger"
            >
              删除该岗位
            </MenuItem>
          </div>
        )}
      </div>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="确认删除该岗位？"
        description={`将删除「${app.companyName} · ${app.roleName}」及其全部流程节点，此操作不可撤销。`}
        onConfirm={async () => {
          await handleDeleteApplication();
          toast.success("岗位已删除");
        }}
        successMessage={false}
      />
    </li>
  );
}

function MenuItem({
  children,
  icon,
  onClick,
  variant,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="menuitem"
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-[13px] transition-colors",
        variant === "danger"
          ? "text-[#c86d85] hover:bg-[#fae6ea]"
          : "text-[#5b4a4a] hover:bg-[#fdfbf8]"
      )}
    >
      {icon}
      {children}
    </button>
  );
}