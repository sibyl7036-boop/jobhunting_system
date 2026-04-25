"use client";

/**
 * components/dashboard/EventTable.tsx · 极简奶油风
 *   - 白底细描边卡
 *   - 低饱和事件类型 / 状态 pill
 *   - 安静 hover（浅米色）
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Eye,
  Check,
  Pencil,
  Trash2,
  Plus,
  Calendar,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useOpenDrawer } from "@/lib/drawerUrl";
import { fetchJson } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";

// ──────────────────────────────────────────────────────────────────────
// 视觉映射 · 低饱和 pill
// ──────────────────────────────────────────────────────────────────────

function typeChipClass(type: string): string {
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

function statusChipClass(status: string): string {
  switch (status) {
    case "待参加":
      return "bg-[#FBEBDE] text-[#b87a56] border-[#f3e2d6]";
    case "已完成":
      return "bg-[#fdfbf8] text-[#8a7972] border-[#f1e8e0]";
    case "已通过":
      return "bg-[#E8EFE3] text-[#70876a] border-[#d7e2cd]";
    case "未通过":
      return "bg-[#FAE6EA] text-[#c86d85] border-[#f3d9df]";
    default:
      return "bg-[#fdfbf8] text-[#8a7972] border-[#f1e8e0]";
  }
}

function statusDotClass(status: string): string {
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

function formatDate(d: Date | null): string {
  if (!d) return "—";
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${m}.${day}`;
}

function formatTime(d: Date | null): string {
  if (!d) return "—";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function formatDay(d: Date | null): string {
  if (!d) return "";
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return names[d.getDay()];
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

const TABS = [
  { key: "今日", label: "今日" },
  { key: "明日", label: "明日" },
  { key: "本周", label: "近 7 天" },
] as const;

// ──────────────────────────────────────────────────────────────────────
// 主组件
// ──────────────────────────────────────────────────────────────────────

export function EventTable({ events }: EventTableProps) {
  const [activeTab, setActiveTab] =
    React.useState<(typeof TABS)[number]["key"]>("本周");
  const openDrawer = useOpenDrawer();

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const todayCount = events.filter(
    (e) => e.timeIso && e.timeIso.slice(0, 10) === todayStr
  ).length;
  const tomorrowCount = events.filter(
    (e) => e.timeIso && e.timeIso.slice(0, 10) === tomorrowStr
  ).length;

  const filteredEvents = React.useMemo(() => {
    if (activeTab === "今日") {
      return events.filter(
        (e) => e.timeIso && e.timeIso.slice(0, 10) === todayStr
      );
    }
    if (activeTab === "明日") {
      return events.filter(
        (e) => e.timeIso && e.timeIso.slice(0, 10) === tomorrowStr
      );
    }
    return events;
  }, [events, activeTab, todayStr, tomorrowStr]);

  const isEmpty = filteredEvents.length === 0;

  return (
    <section className="surface">
      <div className="px-6 py-6">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
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
                近 7 天流程
              </h2>
              <p className="text-[11px] text-[#b4a79e]">
                {todayCount > 0 ? (
                  <span className="font-semibold text-[#c86d85]">
                    今日 {todayCount} 场
                  </span>
                ) : (
                  <span>今日无安排</span>
                )}
                <span className="mx-1.5">·</span>
                {tomorrowCount > 0 ? (
                  <span className="font-semibold text-[#8a6fa5]">
                    明日 {tomorrowCount} 场
                  </span>
                ) : (
                  <span>明日无安排</span>
                )}
                <span className="mx-1.5">·</span>本周共 {events.length} 场
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tabs · 极简胶囊带计数 */}
            <div className="flex items-center gap-1 rounded-full border border-[#f1e8e0] bg-[#fdfbf8] p-1">
              {TABS.map((t) => {
                const cnt =
                  t.key === "今日"
                    ? todayCount
                    : t.key === "明日"
                    ? tomorrowCount
                    : events.length;
                const active = activeTab === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTab(t.key)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] transition-all duration-200",
                      active
                        ? "bg-white text-[#6b574f] shadow-[0_1px_2px_rgba(199,165,149,0.08)] font-semibold"
                        : "text-[#a69890] hover:text-[#8a6d5f]"
                    )}
                  >
                    {t.label}
                    <span
                      className={cn(
                        "inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 py-0 text-[10px] font-semibold",
                        active
                          ? t.key === "今日"
                            ? "bg-[#fae6ea] text-[#c86d85]"
                            : t.key === "明日"
                            ? "bg-[#ede7f5] text-[#8a6fa5]"
                            : "bg-[#fbebde] text-[#b87a56]"
                          : "bg-[#f1e8e0] text-[#a69890]"
                      )}
                    >
                      {cnt}
                    </span>
                  </button>
                );
              })}
            </div>

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
            <table className="w-full border-separate border-spacing-y-1 text-body">
              <thead>
                <tr className="text-[11px] text-[#b4a79e]">
                  <Th>DATE</Th>
                  <Th>TYPE</Th>
                  <Th>COMPANY</Th>
                  <Th>ROLE</Th>
                  <Th>STATUS</Th>
                  <Th>RESUME</Th>
                  <Th className="text-right">ACTION</Th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((e, idx) => (
                  <EventRow key={e.id} e={e} idx={idx} />
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
        "border-b border-[#f1e8e0] px-3 pb-3 pt-2 text-left font-semibold uppercase tracking-wider",
        className
      )}
    >
      {children}
    </th>
  );
}

function EventRow({ e, idx }: { e: SerializedEvent; idx: number }) {
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
          "group cursor-pointer align-middle transition-all duration-200 animate-fade-in-up",
          "[&>td]:bg-white [&>td]:transition-colors",
          "hover:[&>td]:bg-[#fdf9f3]",
          "[&>td:first-child]:rounded-l-xl [&>td:last-child]:rounded-r-xl",
          "[&>td]:border-y [&>td]:border-[#f4ece4]",
          "[&>td:first-child]:border-l [&>td:last-child]:border-r"
        )}
        style={{ animationDelay: `${Math.min(idx * 0.03, 0.24)}s` }}
      >
        <Td className="whitespace-nowrap py-3">
          <div>
            <div className="font-semibold text-[#5b4a4a]">
              {formatDate(time)}
            </div>
            <div className="text-[11px] text-[#b4a79e]">
              {formatDay(time)} · {formatTime(time)}
            </div>
          </div>
        </Td>

        <Td>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
              typeChipClass(e.type)
            )}
          >
            {e.type}
          </span>
        </Td>

        <Td className="font-medium text-[#5b4a4a]">
          {e.application.companyName}
          {e.application.departmentName && (
            <div className="text-[11px] font-normal text-[#b4a79e]">
              {e.application.departmentName}
            </div>
          )}
        </Td>
        <Td className="text-[#8a7972]">
          {e.application.roleName || "—"}
        </Td>

        <Td>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
              statusChipClass(e.status)
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                statusDotClass(e.status)
              )}
            />
            {e.status}
          </span>
        </Td>

        <Td>
          {resume ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#f1e8e0] bg-[#fdfbf8] px-2.5 py-0.5 text-[11px] text-[#6b574f]">
              {resume.name}
            </span>
          ) : (
            <span className="text-[11px] text-[#b4a79e]">未关联</span>
          )}
        </Td>

        <Td className="text-right">
          <div
            className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
            onClick={(ev) => ev.stopPropagation()}
          >
            <IconBtn
              label="查看详情"
              onClick={() => openDrawer({ type: "stage", id: e.id })}
            >
              <Eye size={13} />
            </IconBtn>
            <IconBtn
              label="标记完成"
              disabled={marking || e.status === "已完成"}
              onClick={handleMarkDone}
              variant="success"
            >
              <Check size={13} />
            </IconBtn>
            <IconBtn
              label="编辑"
              onClick={() => openDrawer({ type: "stage", id: e.id })}
            >
              <Pencil size={13} />
            </IconBtn>
            <IconBtn
              label="删除"
              variant="danger"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 size={13} />
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
  variant?: "default" | "danger" | "success";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200",
        variant === "danger"
          ? "text-[#b4a79e] hover:bg-[#fae6ea] hover:text-[#c86d85]"
          : variant === "success"
            ? "text-[#b4a79e] hover:bg-[#e8efe3] hover:text-[#70876a]"
            : "text-[#b4a79e] hover:bg-[#fbf4ee] hover:text-[#8a6d5f]",
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
  return <td className={cn("px-3 py-3", className)}>{children}</td>;
}

function EmptyState() {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#ead8c8] bg-[#fdf9f3]/60 py-12 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fbebde]">
        <Calendar size={18} className="text-[#b87a56]" />
      </div>
      <p className="text-body font-medium text-[#6b574f]">近期暂无流程安排</p>
      <p className="text-[11px] text-[#b4a79e]">
        先准备简历，或用 AI Copilot 解析面试邮件
      </p>
    </div>
  );
}
