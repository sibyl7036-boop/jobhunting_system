"use client";

/**
 * components/companies/CompanyRow.tsx
 *
 * 大厂进度 · 单家公司一行（UI.md 10.4 / 10.5 / 10.6）
 *
 * 一家公司包含 0~N 个 Application。未投递的（currentStatus === "未投递"）显示淡标签 + 浅灰提示。
 * 已投递的展示岗位流程条，左侧部门+岗位、右侧 9 个流程节点胶囊。
 */

import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────────────────────────────
// 类型
// ──────────────────────────────────────────────────────────────────────

/** 节点顺序（PRD 5.3.5 硬顺序；不能用 Object.keys 之类动态拿） */
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

/** 节点视觉态（4 态，UI.md 10.5） */
type NodeState = "passed" | "active" | "pending" | "failed";

export interface SerializedStageForRow {
  id: string;
  type: string; // 已投递 / 笔试 / ... / 挂了
  status: string; // 待参加 / 已完成 / 已通过 / 未通过
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

// ──────────────────────────────────────────────────────────────────────
// 节点态判定
// ──────────────────────────────────────────────────────────────────────

/**
 * 给定一个 Application 和某种 type（如 "一面"），返回该节点的视觉态
 *
 * - 已通过 Stage（status === 已通过）→ passed
 * - 未通过 Stage（status === 未通过）→ failed
 * - 待参加/已完成 Stage → active
 * - 该 Application 下没有对应 type 的 Stage → pending
 */
function nodeStateFor(
  app: SerializedAppForRow,
  type: string
): NodeState {
  // 一种 type 可能有多条记录（一般不会），取最近的一条
  const match = app.stages.find((s) => s.type === type);
  if (!match) return "pending";
  if (match.status === "已通过") return "passed";
  if (match.status === "未通过") return "failed";
  // 待参加 / 已完成 都算"进行中"（UI.md 10.5 只区分 4 态，不再细分已完成与待参加）
  return "active";
}

/** 节点态 → Tailwind class */
function nodeClass(state: NodeState): string {
  switch (state) {
    case "passed":
      return "bg-secondary-mint text-[#4A9970]";
    case "active":
      // 主粉色 + 白字 + 轻微 glow（UI.md 10.5）
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
  // 过滤"占位-未投递"的 Application：PRD 5.3.3 每家公司有一条 isEmpty 的 Application
  const realApps = applications.filter((a) => !a.isEmpty);
  const isAllEmpty = realApps.length === 0;

  return (
    <div
      className="flex gap-6 py-4"
      // 同公司行之间用间距 20px（UI.md 10.6），这里通过父容器的 space-y-5 控制
    >
      {/* 左侧公司列：固定宽 160px（UI.md 10.6 要求 140~180） */}
      <div className="w-[160px] flex-shrink-0">
        <h3 className="text-card-title text-text-primary">{companyName}</h3>
        {isAllEmpty && (
          <span className="mt-2 inline-flex items-center rounded-pill bg-neutral/40 px-2.5 py-0.5 text-caption text-text-tertiary">
            未投递
          </span>
        )}
      </div>

      {/* 右侧流程区 */}
      <div className="flex-1 min-w-0">
        {isAllEmpty ? (
          <p className="py-2 text-body text-text-tertiary">
            还没有在这家公司开始流程
          </p>
        ) : (
          <ul className="space-y-2.5">
            {/* 同公司不同岗位间距 10px（space-y-2.5 ≈ 10px） */}
            {realApps.map((app) => (
              <li key={app.id} className="flex items-center gap-3">
                {/* 部门 + 岗位 */}
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

                {/* 横向流程节点（允许溢出滚动；UI.md 10.6） */}
                <div className="flex-1 min-w-0 overflow-x-auto">
                  <div className="flex items-center gap-0">
                    {STAGE_NODE_ORDER.map((type, idx) => {
                      const state = nodeStateFor(app, type);
                      const stage = app.stages.find((s) => s.type === type);
                      return (
                        <div key={type} className="flex items-center">
                          {/* 节点胶囊 */}
                          <button
                            type="button"
                            onClick={() => {
                              if (stage) {
                                // eslint-disable-next-line no-console
                                console.log("node click", stage.id);
                              } else {
                                // eslint-disable-next-line no-console
                                console.log(
                                  "empty node click",
                                  app.id,
                                  "/",
                                  type
                                );
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
                          {/* 细线连接器（最后一个节点不画） */}
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

                {/* 右侧 MoreHorizontal：仅渲染，Phase 4.4 接菜单 */}
                <button
                  type="button"
                  disabled
                  title="即将开放（Phase 4.4 接入）"
                  className={cn(
                    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-btn-sm",
                    "text-text-tertiary transition-colors",
                    "disabled:opacity-60"
                  )}
                  aria-label="更多操作"
                >
                  <MoreHorizontal size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
