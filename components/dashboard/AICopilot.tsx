"use client";

/**
 * components/dashboard/AICopilot.tsx
 *
 * AI Copilot 卡片（UI.md 8.7）
 *
 * Step 3.3 占位：
 *   - 粉紫渐变大卡 + 小猫 icon + 标题 AI Copilot
 *   - 多行输入框（radius 18px，偏白背景，浅边框）
 *     placeholder："粘贴面试邮件、JD 或面试转录，我来帮你整理 ✨"
 *   - 4 个胶囊快捷按钮：解析面试邮件 / 解析 JD / 生成面试题 / 生成复盘（本步不绑逻辑）
 *   - Phase 6.3 接 4 个 AI API
 */

import * as React from "react";
import { CatIcon } from "@/components/CatIcon";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  "解析面试邮件",
  "解析 JD",
  "生成面试题",
  "生成复盘",
] as const;

export function AICopilot() {
  const [input, setInput] = React.useState("");

  return (
    <section
      className="relative overflow-hidden rounded-card-lg p-6 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-hover"
      style={{
        // UI.md 8.7 非常淡的粉紫渐变
        background:
          "linear-gradient(135deg, #FFF1F7 0%, #F8F5FF 100%)",
      }}
    >
      <header className="mb-4 flex items-center gap-3">
        <CatIcon size={34} />
        <h3 className="text-section-title text-text-primary">AI Copilot</h3>
      </header>

      {/* 多行输入框 */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={4}
        placeholder="粘贴面试邮件、JD 或面试转录，我来帮你整理 ✨"
        className={cn(
          "w-full resize-none border border-border-light bg-surface-bg p-4",
          "text-body text-text-primary placeholder:text-text-tertiary",
          "focus:outline-none focus:ring-2 focus:ring-primary/40",
          "transition-colors"
        )}
        // UI.md 8.7 指定输入框圆角 18px
        style={{ borderRadius: 18 }}
      />

      {/* 4 个胶囊快捷按钮 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              // Phase 6.3 接 AI 调用
              // eslint-disable-next-line no-console
              console.log("copilot quick-action:", label);
            }}
            className={cn(
              "inline-flex items-center rounded-pill bg-surface-bg/80 px-4 py-2",
              "text-caption font-medium text-text-primary",
              "transition-all hover:bg-secondary-pink/60 hover:-translate-y-px",
              "active:scale-[0.98]"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
