"use client";

/**
 * components/dashboard/DailyIntel.tsx
 *
 * 今日大厂动向卡片（UI.md 8.5）
 *
 * Step 3.3 占位：
 *   - 浅粉紫→浅黄的非常淡渐变背景
 *   - 标题：今日动向
 *   - 右上角 Sparkles icon
 *   - 内容占位：暂无动向
 *   - 底部小标签：AI 摘要
 *   - Phase 6.5 接 GET /api/ai/daily-intel
 */

import { Sparkles } from "lucide-react";

export function DailyIntel() {
  return (
    <section
      className="relative overflow-hidden rounded-card-md p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-hover"
      style={{
        // UI.md 8.5 粉紫 → 浅黄 非常淡
        background:
          "linear-gradient(135deg, #F8F5FF 0%, #FFF8E8 100%)",
      }}
    >
      <header className="flex items-start justify-between">
        <h3 className="text-card-title text-text-primary">今日动向</h3>
        <Sparkles
          size={18}
          strokeWidth={1.8}
          className="mt-1 text-primary-strong"
        />
      </header>

      <p className="mt-4 text-body leading-relaxed text-text-secondary">
        暂无动向
      </p>

      <footer className="mt-4">
        <span className="inline-flex items-center rounded-pill bg-surface-bg/70 px-2.5 py-0.5 text-caption text-text-tertiary">
          AI 摘要
        </span>
      </footer>
    </section>
  );
}
