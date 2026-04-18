/**
 * components/dashboard/DailyIntel.tsx
 *
 * 今日大厂动向卡片（UI.md 8.5 + PRD 5.1.3）
 *
 * Step 6.5 实装：接入 /api/ai/daily-intel 的返回
 *   - 首屏由 Server Component 拉数据，Date 容器传 `summary` prop
 *   - AI 失败时显示友好兜底文案，卡片仍渲染
 */

import { Sparkles } from "lucide-react";

interface DailyIntelProps {
  summary: string | null;
  /** 首屏是否来自缓存（调试用，不在 UI 展示） */
  fromCache?: boolean;
}

export function DailyIntel({ summary }: DailyIntelProps) {
  return (
    <section
      className="relative overflow-hidden rounded-card-md p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-hover"
      style={{
        background: "linear-gradient(135deg, #F8F5FF 0%, #FFF8E8 100%)",
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
        {summary || "暂无动向"}
      </p>

      <footer className="mt-4">
        <span className="inline-flex items-center rounded-pill bg-surface-bg/70 px-2.5 py-0.5 text-caption text-text-tertiary">
          AI 摘要
        </span>
      </footer>
    </section>
  );
}
