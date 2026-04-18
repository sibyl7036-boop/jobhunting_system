/**
 * components/common/EmptyState.tsx · 统一空态
 *
 * Step 7.1：所有页面 / 卡片 / 表格的空态都走这里。
 *
 * 设计：lucide 图标（浅粉圆底）+ 标题 + 副文案（可选）+ 可选 CTA slot
 * UI.md 2.6（空态："今天可以专心准备简历哦~"语气）
 */

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  /** 紧凑模式，用于小卡片内部 */
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-6" : "py-12",
        className
      )}
    >
      {Icon ? (
        <div
          className={cn(
            "mb-3 flex items-center justify-center rounded-full bg-secondary-pink",
            compact ? "h-10 w-10" : "h-14 w-14"
          )}
        >
          <Icon
            className="text-primary-strong"
            size={compact ? 18 : 24}
            strokeWidth={1.6}
          />
        </div>
      ) : null}
      <p
        className={cn(
          "text-text-secondary",
          compact ? "text-body" : "text-body font-medium"
        )}
      >
        {title}
      </p>
      {description ? (
        <p className="mt-1 max-w-sm text-caption text-text-tertiary">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
