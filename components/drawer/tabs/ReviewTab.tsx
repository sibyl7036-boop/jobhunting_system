"use client";

/**
 * components/drawer/tabs/ReviewTab.tsx
 *
 * Stage Drawer · 面试复盘 Tab
 *
 * 字段绑定：
 *   - reviewTranscript     → 复盘原始转录（用户输入区）
 *   - reviewQuestionSummary → 问题概述
 *   - reviewAnswerSummary   → 回答复述
 *   - reviewSuggestion      → 建议
 *
 * 交互：
 *   - 手写/手改三段摘要
 *   - 调 AI 一键解析（POST /api/ai/review），结果**填入表单**（不直接落库）
 *   - 有变更时顶部出现保存按钮
 */

import * as React from "react";
import { toast } from "sonner";
import {
  MessageSquareQuote,
  Sparkles,
  Loader2,
  Check,
  RotateCcw,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { fetchJson } from "@/lib/fetcher";

interface Props {
  stageId: string;
  initial: {
    reviewTranscript: string | null;
    reviewQuestionSummary: string | null;
    reviewAnswerSummary: string | null;
    reviewSuggestion: string | null;
  };
  onSaved?: () => void;
}

export function ReviewTab({ stageId, initial, onSaved }: Props) {
  const [transcript, setTranscript] = React.useState(
    initial.reviewTranscript ?? ""
  );
  const [qs, setQs] = React.useState(initial.reviewQuestionSummary ?? "");
  const [ans, setAns] = React.useState(initial.reviewAnswerSummary ?? "");
  const [sug, setSug] = React.useState(initial.reviewSuggestion ?? "");
  const [saving, setSaving] = React.useState(false);
  const [parsing, setParsing] = React.useState(false);

  const dirty =
    (initial.reviewTranscript ?? "") !== transcript ||
    (initial.reviewQuestionSummary ?? "") !== qs ||
    (initial.reviewAnswerSummary ?? "") !== ans ||
    (initial.reviewSuggestion ?? "") !== sug;

  const runAI = async () => {
    if (transcript.trim().length < 30) {
      toast.error("复盘原文至少 30 字");
      return;
    }
    setParsing(true);
    try {
      const r = await fetchJson<{
        draft: {
          questionSummary?: string;
          answerSummary?: string;
          suggestion?: string;
        };
      }>("/api/ai/review", {
        method: "POST",
        body: JSON.stringify({ stageId, transcriptText: transcript }),
      });
      setQs(r.draft.questionSummary ?? "");
      setAns(r.draft.answerSummary ?? "");
      setSug(r.draft.suggestion ?? "");
      toast.success("AI 解析完成，检查后记得保存");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI 解析失败");
    } finally {
      setParsing(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await fetchJson(`/api/stages/${stageId}`, {
        method: "PATCH",
        body: JSON.stringify({
          reviewTranscript: transcript,
          reviewQuestionSummary: qs,
          reviewAnswerSummary: ans,
          reviewSuggestion: sug,
        }),
      });
      toast.success("复盘已保存");
      onSaved?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setTranscript(initial.reviewTranscript ?? "");
    setQs(initial.reviewQuestionSummary ?? "");
    setAns(initial.reviewAnswerSummary ?? "");
    setSug(initial.reviewSuggestion ?? "");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8EFE3] text-[#70876a]">
            <MessageSquareQuote size={13} />
          </span>
          <div>
            <div className="text-[13px] font-semibold text-[#5b4a4a]">复盘</div>
            <div className="text-[11px] text-[#b4a79e]">
              记录本场面试，AI 辅助生成结构化总结
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1 rounded-full border border-[#f1e8e0] bg-white px-2.5 py-1 text-[11px] text-[#a69890] hover:text-[#8a6d5f]"
            >
              <RotateCcw size={11} />
              撤销
            </button>
          )}
          {dirty && (
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check size={13} />}
              保存
            </Button>
          )}
        </div>
      </div>

      {/* 转录原文 */}
      <div>
        <label className="mb-1 block text-[11px] font-semibold text-[#8a7972]">
          复盘原文（录音转写 / 笔记 ≥ 30 字）
        </label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="粘贴面试录音转写，或自己写下问过什么问题、我怎么回答、现场氛围等…"
          rows={6}
          maxLength={30000}
          className="w-full resize-y rounded-xl border border-[#d7e2cd] bg-white px-3 py-2 text-[13px] leading-relaxed text-[#5c463a] placeholder:text-[#b4a79e] focus:border-[#70876a] focus:outline-none focus:ring-2 focus:ring-[#e8efe3]"
        />
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#b4a79e]">
          <span>{transcript.length} / 30000</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={runAI}
            disabled={parsing || transcript.trim().length < 30}
          >
            {parsing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            AI 解析复盘
          </Button>
        </div>
      </div>

      {/* 三段结构 */}
      <ReviewField
        label="面试问题概述"
        value={qs}
        onChange={setQs}
        color="text-[#70876a]"
        placeholder="AI 解析后这里会出现问题总结，也可以手动写。"
      />
      <ReviewField
        label="我的回答复述"
        value={ans}
        onChange={setAns}
        color="text-[#70876a]"
        placeholder="我的主要回答 / 失分点 / 亮点…"
      />
      <ReviewField
        label="简短建议"
        value={sug}
        onChange={setSug}
        color="text-[#70876a]"
        placeholder="下次可以改进什么，值得保留的亮点。"
      />
    </div>
  );
}

function ReviewField({
  label,
  value,
  onChange,
  color,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  color: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className={cn("mb-1 block text-[11px] font-semibold", color)}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-y rounded-xl border border-[#f1e8e0] bg-white px-3 py-2 text-[13px] leading-relaxed text-[#5c463a] placeholder:text-[#c7b5a8] focus:border-[#70876a] focus:outline-none focus:ring-2 focus:ring-[#e8efe3]"
      />
    </div>
  );
}
