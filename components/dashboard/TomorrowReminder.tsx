"use client";

/**
 * components/dashboard/TomorrowReminder.tsx
 *
 * 明日 AI 提醒卡片（UI.md 8.4）
 *
 * Step 3.3 占位：
 *   - 粉黄渐变背景 linear-gradient(135deg, #FFF7D8, #FFF3FA)
 *   - 左上角：小猫 icon（沿用 CatIcon 占位，Phase 7.2 换极简 SVG）
 *   - 右上角：Bell 铃铛 icon
 *   - 标题：明日提醒
 *   - 内容：硬编码"明天暂无流程安排，可以安心休息一下。"
 *   - Phase 6.6 接真实 TomorrowTip 接口 + eventsHash 缓存
 */

import { Bell } from "lucide-react";
import { CatIcon } from "@/components/CatIcon";

export function TomorrowReminder() {
  return (
    <section
      className="relative overflow-hidden rounded-card-md p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-hover"
      style={{
        // UI.md 8.4 原文渐变
        background: "linear-gradient(135deg, #FFF7D8, #FFF3FA)",
      }}
    >
      <header className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <CatIcon size={34} />
          <h3 className="text-card-title text-text-primary">明日提醒</h3>
        </div>
        <Bell
          size={18}
          strokeWidth={1.8}
          className="mt-1 text-text-tertiary"
        />
      </header>

      <p className="mt-4 text-body leading-relaxed text-text-secondary">
        明天暂无流程安排，可以安心休息一下。
      </p>
    </section>
  );
}
