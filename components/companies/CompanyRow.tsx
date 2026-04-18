"use client";

/**
 * components/companies/CompanyRow.tsx
 *
 * 大厂进度 · 单家公司一行（UI.md 10.4 / 10.5 / 10.6）
 *
 * Step 3.5 外观 + Step 4.3 节点点击接入 Drawer + Step 4.4 MoreHorizontal 菜单（新增流程节点 / 删除岗位）
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useOpenDrawer } from "@/lib/drawerUrl";
import { fetchJson } from "@/lib/fetcher";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";

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

function nodeClass(state: NodeState): string {
  switch (state) {
    case "passed":
      return "bg-secondary-mint text-[#4A9970]";
    case "active":
      return "bg-primary text-text-on-primary shadow-[0_0_12px_rgba(243,175,203,0.4)]";
    case "failed":
      return "bg-danger/25 text-primary-strong";
    case "pending":
    default:
      return "bg-neutral/60 text-text-secondary";
  }
}

// ──────────────────────────────────────────────────────────────────────
// 组件
// ──────────────────────────────────────────────────────────────────────

interface CompanyRowProps {
  companyName: string;
  applications: SerializedAppForRow[];
}

export function CompanyRow({ companyName, applications }: CompanyRowProps) {
  const realApps = applications.filter((a) => !a.isEmpty);
  const isAllEmpty = realApps.length === 0;
  const openDrawer = useOpenDrawer();

  return (
    <div className="flex gap-6 py-4">
      <div className="w-[160px] flex-shrink-0">
        <h3 className="text-card-title text-text-primary">{companyName}</h3>
        {isAllEmpty && (
          <span className="mt-2 inline-flex items-center rounded-pill bg-neutral/40 px-2.5 py-0.5 text-caption text-text-tertiary">
            未投递
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {isAllEmpty ? (
          <p className="py-2 text-body text-text-tertiary">
            还没有在这家公司开始流程
          </p>
        ) : (
          <ul className="space-y-2.5">
            {realApps.map((app) => (
              <AppFlowBar
                key={app.id}
                app={app}
                onOpenDrawer={openDrawer}
              />
            ))}
          </ul>
        )}
      </div>
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

  // 点击外部关闭菜单
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
    <li className="flex items-center gap-3">
      <div className="w-[160px] flex-shrink-0">
        <p className="truncate text-body font-medium text-text-primary">
          {app.roleName || "（未填岗位）"}
        </p>
        {app.departmentName && (
          <p className="truncate text-caption text-text-tertiary">
            {app.departmentName}
          </p>
        )}
      </div>

      <div className="flex-1 min-w-0 overflow-x-auto">
        <div className="flex items-center gap-0">
          {STAGE_NODE_ORDER.map((type, idx) => {
            const state = nodeStateFor(app, type);
            const stage = app.stages.find((s) => s.type === type);
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
                    "inline-flex h-9 items-center whitespace-nowrap rounded-pill px-3 text-caption font-medium",
                    "transition-all duration-150",
                    "hover:-translate-y-0.5 hover:shadow-soft",
                    "active:scale-[1.02]",
                    nodeClass(state)
                  )}
                >
                  {type}
                </button>
                {idx < STAGE_NODE_ORDER.length - 1 && (
                  <span
                    aria-hidden
                    className="h-px w-4 flex-shrink-0 bg-border-light"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MoreHorizontal 菜单 */}
      <div ref={menuRef} className="relative flex-shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-btn-sm",
            "text-text-tertiary transition-colors hover:bg-soft-panel hover:text-text-primary",
            menuOpen && "bg-soft-panel text-text-primary"
          )}
          aria-label="更多操作"
        >
          <MoreHorizontal size={18} />
        </button>
        {menuOpen && (
          <div
            className={cn(
              "absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden",
              "rounded-card-md border border-border-light bg-surface-bg shadow-hover"
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
        "flex w-full items-center gap-2 px-3 py-2 text-body transition-colors",
        variant === "danger"
          ? "text-danger hover:bg-danger/10"
          : "text-text-primary hover:bg-soft-panel"
      )}
    >
      {icon}
      {children}
    </button>
  );
}
