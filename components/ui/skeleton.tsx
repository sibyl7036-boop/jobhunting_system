/**
 * components/ui/skeleton.tsx · 骨架屏基础块（shadcn/ui new-york 变体）
 *
 * Step 7.1：统一所有 loading 态的骨架。
 *   - 浅粉底（soft-panel）+ pulse 动画
 *   - 圆角默认 rounded-card-md，外层可通过 className 覆盖
 */

import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-card-md bg-soft-panel/80",
        className
      )}
      {...props}
    />
  );
}
