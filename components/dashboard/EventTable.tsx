"use client";

/**
 * components/dashboard/EventTable.tsx
 *
 * 首页主模块 · 时间维度流程表格（PRD 5.1.1 + UI.md 8.3）
 *
 * 外观要点：
 *   - 大白卡（radius 24px）+ shadow-soft + 顶部粉-黄渐变装饰线
 *   - 标题「未来 7 天流程安排」+ 右侧 tabs（今日 / 明日 / 本周，仅 UI，Phase 7 再接交互）
 *   - 浅分隔、无重线框；行高 64px；hover 背景 soft-panel + translateY(-1px)
 *   - 9 列：日期 / 时间 / 事件类型 / 公司 / 部门 / 岗位 / 当前状态 / 关联简历 / 操作
 *   - 操作列 Phase 3 只渲染占位表头，不放任何图标按钮（避免与 Phase 4.4 冲突）
 *   - 空态文案：未来 7 天暂无流程安排，可以先把简历准备好 🌸
 *
 * 交互约定：
 *   - 整行点击：console.log('row click', stageId)（Phase 4.3 再接 Drawer）
 */

import * as React from "react";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────────────────────────────
// 单元格视觉映射（严格按 UI.md 8.3 + Step 3.2 指令）
// ──────────────────────────────────────────────────────────────────────

/** 事件类型 → 胶囊底色/字色 */
function typeChipClass(type: string): string {
  // 面试类：一面/二面/三面/HR面 → 浅粉紫 + text-primary
  if (["一面", "二面", "三面", "HR面"].includes(type)) {
    return "bg-secondary-lilac text-text-primary";
  }
  // 笔试/测评 → 浅黄 + text-primary
  if (["笔试", "测评"].includes(type)) {
    return "bg-secondary-yellow text-text-primary";
  }
  // Offer（Stage.type 里是「Offer」；PRD 界面展示同义「Offer 沟通」）→ 浅绿 + success 深字
  if (type === "Offer") {
    return "bg-secondary-mint text-[#4A9970]";
  }
  // 其他（已投递 / 挂了）→ neutral 底 + text-secondary
  return "bg-neutral/60 text-text-secondary";
}

/** 当前状态 → 柔和小标签底色/字色（UI.md 4.7 状态使用规则 + Step 3.2 指令） */
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

// ──────────────────────────────────────────────────────────────────────
// 日期/时间格式化（本地时区；time 为 null 时容错）
// ──────────────────────────────────────────────────────────────────────

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
// Props
// ──────────────────────────────────────────────────────────────────────

interface EventTableProps {
  events: SerializedEvent[];
}

/**
 * Server → Client 边界上的序列化类型。
 * 父 Server Component 负责把 Date 转 string 传进来（避免 RSC 序列化 Date 时的歧义），
 * 列表项的 time 在 DB 里本就可空。
 */
export interface SerializedEvent {
  id: string;
  type: string;
  status: string;
  /** ISO 字符串，或 null */
  timeIso: string | null;
  application: {
    id: string;
    companyName: string;
    departmentName: string;
    roleName: string;
    linkedResume: { id: string; name: string } | null;
  };
}

// ──────────────────────────────────────────────────────────────────────
// 组件
// ──────────────────────────────────────────────────────────────────────

const TABS = ["今日", "明日", "本周"] as const;

export function EventTable({ events }: EventTableProps) {
  // tabs 仅渲染 UI，不切换数据（Phase 7 再接）
  const [activeTab, setActiveTab] = React.useState<(typeof TABS)[number]>(
    "本周"
  );

  const isEmpty = events.length === 0;

  return (
    <section className="relative overflow-hidden rounded-card-lg bg-surface-bg shadow-soft">
      {/* 顶部极淡的粉→黄渐变装饰线（UI.md 8.3） */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{
          background:
            "linear-gradient(90deg, #F3AFCB 0%, #FFD8E8 45%, #FFF0B8 100%)",
          opacity: 0.55,
        }}
      />

      {/* 卡片内容 */}
      <div className="px-6 py-6">
        {/* 卡片标题 + tabs */}
        <header className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-section-title text-text-primary">
            未来 7 天流程安排
          </h2>

          {/* tabs：仅 UI，点击暂不切换数据 */}
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
                  {/* 操作列：Phase 3 仅渲染表头占位，Phase 4.4 接入图标按钮 */}
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
  const time = e.timeIso ? new Date(e.timeIso) : null;
  const resume = e.application.linkedResume;

  const handleClick = () => {
    // Phase 4.3 改为打开 Drawer
    // eslint-disable-next-line no-console
    console.log("row click", e.id);
  };

  return (
    <tr
      onClick={handleClick}
      className={cn(
        // 行高 64px（UI.md 8.3 指定 60~68px 区间）
        "h-16 cursor-pointer align-middle transition-all duration-150",
        // hover 背景 + 轻微上浮
        "hover:bg-soft-panel hover:-translate-y-px hover:shadow-soft",
        // 浅分隔，不是重线框：底部 1px border-light
        "[&>td]:border-b [&>td]:border-border-light"
      )}
    >
      <Td className="whitespace-nowrap text-text-secondary">
        {formatDate(time)}
      </Td>
      <Td className="whitespace-nowrap font-medium text-text-primary">
        {formatTime(time)}
      </Td>

      {/* 事件类型胶囊 */}
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

      {/* 当前状态柔和标签 */}
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

      {/* 关联简历 */}
      <Td>
        {resume ? (
          <span className="inline-flex items-center rounded-pill bg-cool-panel px-3 py-1 text-caption text-text-primary">
            {resume.name}
          </span>
        ) : (
          <span className="text-caption text-text-tertiary">未关联</span>
        )}
      </Td>

      {/* 操作列：Phase 3 仅占位，Phase 4.4 接入 */}
      <Td className="text-right text-text-tertiary">—</Td>
    </tr>
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
  // UI.md 13.5 空态文案风格
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
