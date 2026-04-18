"use client";

/**
 * components/common/ErrorState.tsx · 统一错误态
 *
 * Step 7.1：页面级 / 卡片级错误。
 *
 * 场景：
 *   - 首屏 SSR 抛错：由 app/**\/error.tsx 调用，注入 reset 函数做"重试"
 *   - 卡片内部 fetch 抛错：手动传 onRetry
 */

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  /** 点击"重试"会调用此函数。若未提供，按钮不显示 */
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

export function ErrorState({
  title = "加载失败",
  description = "刚刚开小差了，可以再试一次。",
  onRetry,
  className,
  compact = false,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-6" : "py-12",
        className
      )}
      role="alert"
    >
      <div
        className={cn(
          "mb-3 flex items-center justify-center rounded-full bg-danger/25",
          compact ? "h-10 w-10" : "h-14 w-14"
        )}
      >
        <AlertCircle
          className="text-primary-strong"
          size={compact ? 18 : 24}
          strokeWidth={1.6}
        />
      </div>
      <p className="text-body font-medium text-text-primary">{title}</p>
      <p className="mt-1 max-w-sm text-caption text-text-tertiary">
        {description}
      </p>
      {onRetry ? (
        <Button
          type="button"
          variant="ghost"
          className="mt-4"
          onClick={onRetry}
        >
          <RefreshCw size={14} className="mr-1.5" />
          重试
        </Button>
      ) : null}
    </div>
  );
}
