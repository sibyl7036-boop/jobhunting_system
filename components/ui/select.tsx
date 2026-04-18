"use client";

/**
 * components/ui/select.tsx · 最简 native select 包一层 Tailwind
 *
 * 决策：不引入 @radix-ui/react-select（避免额外依赖 + 我们的枚举很少，
 * native select 足够）。视觉上与 Input 对齐。
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full appearance-none rounded-btn-sm border border-border-light bg-surface-bg px-3 py-2 pr-8",
        "text-body text-text-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/40",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-colors",
        "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%239B8F9D%22><path d=%22M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z%22/></svg>')] bg-no-repeat bg-[right_0.6rem_center] bg-[length:1rem_1rem]",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

export { Select };
