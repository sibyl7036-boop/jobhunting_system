/**
 * components/dashboard/DailyIntel.tsx · 极简奶油风
 */

import { TrendingUp, Sparkles } from "lucide-react";

interface DailyIntelProps {
  summary: string | null;
  fromCache?: boolean;
}

export function DailyIntel({ summary }: DailyIntelProps) {
  return (
    <section
      className="surface p-5 animate-fade-in-up"
      style={{ animationDelay: "0.05s" }}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E6EEF7]">
            <TrendingUp size={15} className="text-[#6b89a8]" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-card-title text-[#5b4a4a]">Industry Pulse</h3>
          <p className="text-[11px] text-[#b4a79e]">公司招聘雷达</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-[#f1e8e0] bg-[#fdfbf8] px-2 py-0.5 text-[10px] font-medium text-[#b4a79e]">
          <Sparkles size={8} />
          AI
        </span>
      </header>

      <p className="mt-4 text-body leading-relaxed text-[#6b574f]">
        {summary || "暂无最新动向"}
      </p>

      <div className="mt-3 flex items-center justify-between text-[11px] text-[#b4a79e]">
        <span>每日更新</span>
        <span className="inline-block h-1 w-1 rounded-full bg-[#d9c3b1]" />
      </div>
    </section>
  );
}
