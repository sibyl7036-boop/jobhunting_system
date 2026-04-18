"use client";

/**
 * components/dashboard/EventTable.tsx
 *
 * 首页主模块 · 时间维度流程表格（PRD 5.1.1 + UI.md 8.3）
 *
 * Step 3.2 外观 + Step 4.3 行点击打开 Drawer + Step 4.4 操作列（Eye/Check/Pencil/Trash2）+ 新增事件按钮
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, Check, Pencil, Trash2, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { useOpenDrawer } from "@/lib/drawerUrl";
import { fetchJson } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";

// ──────────────────────────────────────────────────────────────────────
// 视觉映射
// ──────────────────────────────────────────────────────────────────────

function typeChipClass(type: string): string {
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

function statusChipClass(status: string): string {
  switch (status) {
    case "待参加":
      return "bg-neutral/50 text-text-secondary";
    case "已完成":
      return "bg-[#EEEAF0] text-text-secondary";
    case "已通过":
      return "bg-secondary-mint text-[#4A9970]";
    case "未通过":
      return "bg-danger/25 text-primary-strong";
    default:
      return "bg-neutral/40 text-text-secondary";
  }
}

function formatDate(d: Date | null): string {
  if (!d) return "—";
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function formatTime(d: Date | null): string {
  if (!d) return "—";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

// ──────────────────────────────────────────────────────────────────────
// 类型
// ──────────────────────────────────────────────────────────────────────

export interface SerializedEvent {
  id: string;
  type: string;
  status: string;
  timeIso: string | null;
  application: {
    id: string;
    companyName: string;
    departmentName: string;
    roleName: string;
    linkedResume: { id: string; name: string } | null;
  };
}

interface EventTableProps {
  events: SerializedEvent[];
}

const TABS = ["今日", "明日", "本周"] as const;

// ──────────────────────────────────────────────────────────────────────
// 主组件
// ──────────────────────────────────────────────────────────────────────

export function EventTable({ events }: EventTableProps) {
  const [activeTab, setActiveTab] = React.useState<(typeof TABS)[number]>(
    "本周"
  );
  const openDrawer = useOpenDrawer();
  const isEmpty = events.length === 0;

  return (
    <section className="relative overflow-hidden rounded-card-lg bg-surface-bg shadow-soft">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{
          background:
            "linear-gradient(90deg, #F3AFCB 0%, #FFD8E8 45%, #FFF0B8 100%)",
          opacity: 0.55,
        }}
      />

      <div className="px-6 py-6">
        <header className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-section-title text-text-primary">
            未来 7 天流程安排
          </h2>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-pill bg-soft-panel p-1">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  className={cn(
                    "rounded-pill px-4 py-1.5 text-caption transition-colors",
                    activeTab === t
                      ? "bg-surface-bg text-text-primary shadow-soft"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Step 4.4 · 新增事件按钮 */}
            <Button
              variant="default"
              size="sm"
              onClick={() => openDrawer({ type: "stage-new" })}
            >
              <Plus />
              新增事件
            </Button>
          </div>
        </header>

        {isEmpty ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 text-body">
              <thead>
                <tr className="text-caption text-text-tertiary">
                  <Th>日期</Th>
                  <Th>时间</Th>
                  <Th>事件类型</Th>
                  <Th>公司</Th>
                  <Th>部门</Th>
                  <Th>岗位</Th>
                  <Th>当前状态</Th>
                  <Th>关联简历</Th>
                  <Th className="text-right">操作</Th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <EventRow key={e.id} e={e} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 子组件
// ──────────────────────────────────────────────────────────────────────

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b border-border-light px-3 py-2 text-left font-medium",
        className
      )}
    >
      {children}
    </th>
  );
}

function EventRow({ e }: { e: SerializedEvent }) {
  const router = useRouter();
  const time = e.timeIso ? new Date(e.timeIso) : null;
  const resume = e.application.linkedResume;
  const openDrawer = useOpenDrawer();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [marking, setMarking] = React.useState(false);

  const handleRowClick = () => {
    openDrawer({ type: "stage", id: e.id });
  };

  const handleMarkDone = async () => {
    setMarking(true);
    try {
      await fetchJson(`/api/stages/${e.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "已完成" }),
      });
      toast.success("已标记完成");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "标记失败");
    } finally {
      setMarking(false);
    }
  };

  const handleDelete = async () => {
    await fetchJson(`/api/stages/${e.id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <>
      <tr
        onClick={handleRowClick}
        className={cn(
          "h-16 cursor-pointer align-middle transition-all duration-150",
          "hover:bg-soft-panel hover:-translate-y-px hover:shadow-soft",
          "[&>td]:border-b [&>td]:border-border-light"
        )}
      >
        <Td className="whitespace-nowrap text-text-secondary">
          {formatDate(time)}
        </Td>
        <Td className="whitespace-nowrap font-medium text-text-primary">
          {formatTime(time)}
        </Td>

        <Td>
          <span
            className={cn(
              "inline-flex items-center rounded-pill px-3 py-1 text-caption font-medium",
              typeChipClass(e.type)
            )}
          >
            {e.type}
          </span>
        </Td>

        <Td className="font-medium text-text-primary">
          {e.application.companyName}
        </Td>
        <Td className="text-text-secondary">
          {e.application.departmentName || "—"}
        </Td>
        <Td className="text-text-secondary">{e.application.roleName}</Td>

        <Td>
          <span
            className={cn(
              "inline-flex items-center rounded-pill px-2.5 py-0.5 text-caption",
              statusChipClass(e.status)
            )}
          >
            {e.status}
          </span>
        </Td>

        <Td>
          {resume ? (
            <span className="inline-flex items-center rounded-pill bg-cool-panel px-3 py-1 text-caption text-text-primary">
              {resume.name}
            </span>
          ) : (
            <span className="text-caption text-text-tertiary">未关联</span>
          )}
        </Td>

        {/* Step 4.4 操作列：4 个 icon 按钮（阻止冒泡） */}
        <Td className="text-right">
          <div
            className="flex items-center justify-end gap-1"
            onClick={(ev) => ev.stopPropagation()}
          >
            <IconBtn
              label="查看详情"
              onClick={() => openDrawer({ type: "stage", id: e.id })}
            >
              <Eye size={16} />
            </IconBtn>
            <IconBtn
              label="标记完成"
              disabled={marking || e.status === "已完成"}
              onClick={handleMarkDone}
            >
              <Check size={16} />
            </IconBtn>
            <IconBtn
              label="编辑"
              onClick={() => openDrawer({ type: "stage", id: e.id })}
            >
              <Pencil size={16} />
            </IconBtn>
            <IconBtn
              label="删除"
              variant="danger"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 size={16} />
            </IconBtn>
          </div>
        </Td>
      </tr>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="确认删除该流程节点？"
        description={`将删除「${e.application.companyName} · ${e.application.roleName} · ${e.type}」，此操作不可撤销。`}
        onConfirm={handleDelete}
      />
    </>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
  variant,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-btn-sm transition-colors",
        variant === "danger"
          ? "text-text-tertiary hover:bg-danger/15 hover:text-danger"
          : "text-text-tertiary hover:bg-soft-panel hover:text-primary-strong",
        "disabled:pointer-events-none disabled:opacity-40"
      )}
    >
      {children}
    </button>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("px-3", className)}>{children}</td>;
}

function EmptyState() {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-card-md bg-app-bg-secondary py-10 text-center">
      <p className="text-body text-text-secondary">
        未来 7 天暂无流程安排，可以先把简历准备好 🌸
      </p>
      <p className="text-caption text-text-tertiary">
        有新流程时，这里会按时间顺序展示
      </p>
    </div>
  );
}
