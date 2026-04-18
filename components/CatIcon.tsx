/**
 * CatIcon · 小猫头像占位（UI.md 8.4 / 12.3）
 *
 * Step 0.5 占位版：用 lucide `Cat` 图标先顶住。
 * Phase 7.2 将替换为 UI.md 规定的极简自定义 SVG（圆脸 + 两耳 + 两眼 + 简单嘴巴，主色 primary，浅粉圆底）。
 */
"use client";

import { Cat } from "lucide-react";
import { cn } from "@/lib/utils";

interface CatIconProps {
  className?: string;
  size?: number;
}

export function CatIcon({ className, size = 28 }: CatIconProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-secondary-pink text-primary-strong",
        className
      )}
      style={{ width: size, height: size }}
      aria-label="AI Copilot 小猫"
    >
      <Cat size={Math.round(size * 0.6)} strokeWidth={1.8} />
    </span>
  );
}
