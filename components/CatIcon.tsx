"use client";

/**
 * CatIcon · 小猫头像（UI.md 8.4 / 12.3 / 13.4）
 *
 * Step 7.2 正式版：极简自定义 SVG
 *   - 圆脸 + 两只尖耳 + 两个圆眼 + 简单弧嘴（W 形小胡须可选，本版不加）
 *   - 主色 primary（#F3AFCB），底色 secondary-pink（#FFD8E8）
 *   - 尺寸由 size prop 控制（默认 32，建议 24/32/40）
 *
 * 动效（CSS keyframes，不引入 framer-motion，符合 "能用一个绝不用两个"）
 *   - 默认：cat-breathe（scale 1→1.03→1，2.4s ease-in-out infinite）
 *   - hover：上浮 -2px（Tailwind hover:-translate-y-0.5）
 *   - AI 处理中：cat-wobble（轻微左右晃动）——通过 busy prop 切换
 */

import { cn } from "@/lib/utils";

interface CatIconProps {
  className?: string;
  size?: number;
  /** AI 处理中，切换为晃动动画 */
  busy?: boolean;
  /** 关闭呼吸动画（默认开启） */
  staticIcon?: boolean;
}

export function CatIcon({
  className,
  size = 32,
  busy = false,
  staticIcon = false,
}: CatIconProps) {
  return (
    <span
      className={cn(
        "inline-flex flex-shrink-0 items-center justify-center rounded-full bg-secondary-pink",
        "transition-transform hover:-translate-y-0.5",
        !staticIcon && !busy && "animate-cat-breathe",
        busy && "animate-cat-wobble",
        className
      )}
      style={{ width: size, height: size }}
      aria-label="AI 小猫"
      role="img"
    >
      <svg
        viewBox="0 0 32 32"
        width={Math.round(size * 0.72)}
        height={Math.round(size * 0.72)}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* 两只耳朵：三角形 */}
        <path
          d="M7 9 L10 3 L13.5 7 Z"
          fill="#F3AFCB"
          stroke="#DD85AE"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <path
          d="M25 9 L22 3 L18.5 7 Z"
          fill="#F3AFCB"
          stroke="#DD85AE"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* 耳内小粉 */}
        <path d="M9 7.4 L10.4 4.8 L11.8 6.8 Z" fill="#FFD8E8" />
        <path d="M23 7.4 L21.6 4.8 L20.2 6.8 Z" fill="#FFD8E8" />

        {/* 圆脸 */}
        <circle
          cx="16"
          cy="17"
          r="10"
          fill="#F3AFCB"
          stroke="#DD85AE"
          strokeWidth="1"
        />

        {/* 两个眼睛（圆点） */}
        <circle cx="12.4" cy="16" r="1.3" fill="#47384A" />
        <circle cx="19.6" cy="16" r="1.3" fill="#47384A" />
        {/* 眼睛高光 */}
        <circle cx="12.7" cy="15.6" r="0.4" fill="#FFFFFF" />
        <circle cx="19.9" cy="15.6" r="0.4" fill="#FFFFFF" />

        {/* 小鼻子 */}
        <path
          d="M15.2 18.6 L16.8 18.6 L16 19.4 Z"
          fill="#DD85AE"
        />

        {/* 简单弧嘴（两个半圆组合） */}
        <path
          d="M13.5 20 Q14.8 21.4 16 20 Q17.2 21.4 18.5 20"
          fill="none"
          stroke="#47384A"
          strokeWidth="0.9"
          strokeLinecap="round"
        />

        {/* 两撇腮红 */}
        <ellipse cx="10.4" cy="19.2" rx="1.3" ry="0.8" fill="#FFB7D0" opacity="0.7" />
        <ellipse cx="21.6" cy="19.2" rx="1.3" ry="0.8" fill="#FFB7D0" opacity="0.7" />
      </svg>
    </span>
  );
}
