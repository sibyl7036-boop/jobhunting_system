"use client";

/**
 * components/drawer/tabs/InterviewQuestionsTab.tsx
 *
 * Stage Drawer · 面试题 Tab
 *
 * 功能：
 *   - 展示已保存的面试题（来自 Stage.interviewQuestions，JSON 字符串）
 *   - 可编辑：增删单条
 *   - 可粘贴大段文本批量导入（按行拆分）
 *   - 快捷调用 AI 一键生成（POST /api/ai/generate-questions）
 */

import * as React from "react";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  ClipboardList,
  Copy,
  Check,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { fetchJson } from "@/lib/fetcher";

interface Props {
  stageId: string;
  applicationId: string;
  initialQuestions: string[] | null;
  onSaved?: () => void;
}

export function InterviewQuestionsTab({
  stageId,
  applicationId,
  initialQuestions,
  onSaved,
}: Props) {
  const [list, setList] = React.useState<string[]>(
    () => initialQuestions ?? []
  );
  const [draft, setDraft] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [customStyle, setCustomStyle] = React.useState("");
  const [copiedIdx, setCopiedIdx] = React.useState<number | null>(null);
  const [dirty, setDirty] = React.useState(false);

  // 保存整个 list 到后端
  const save = async (next: string[]) => {
    setSaving(true);
    try {
      await fetchJson(`/api/stages/${stageId}`, {
        method: "PATCH",
        body: JSON.stringify({ interviewQuestions: next }),
      });
      setList(next);
      setDirty(false);
      toast.success("已保存");
      onSaved?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const addOne = () => {
    const v = draft.trim();
    if (!v) return;
    const next = [...list, v];
    setList(next);
    setDraft("");
    setDirty(true);
  };

  const removeOne = (i: number) => {
    setList((prev) => prev.filter((_, idx) => idx !== i));
    setDirty(true);
  };

  const batchImport = () => {
    const text = draft.trim();
    if (!text) return;
    const lines = text
      .split(/\r?\n|；|;/)
      .map((x) => x.replace(/^\s*[-\d.、]+\s*/, "").trim())
      .filter((x) => x.length > 0);
    if (lines.length === 0) return;
    setList((prev) => [...prev, ...lines]);
    setDraft("");
    setDirty(true);
  };

  const generateWithAI = async () => {
    setGenerating(true);
    try {
      const r = await fetchJson<{ draft: { questions: string[] } }>(
        "/api/ai/generate-questions",
        {
          method: "POST",
          body: JSON.stringify({
            applicationId,
            customStyle: customStyle || undefined,
          }),
        }
      );
      const qs = r.draft?.questions ?? [];
      if (qs.length === 0) {
        toast.error("AI 没有生成有效题目");
        return;
      }
      setList((prev) => [...prev, ...qs]);
      setDirty(true);
      toast.success(`AI 追加了 ${qs.length} 道题，记得点保存`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI 生成失败");
    } finally {
      setGenerating(false);
    }
  };

  const copyOne = async (q: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(q);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1200);
    } catch {
      toast.error("复制失败，请手动选择");
    }
  };

  return (
    <div className="space-y-4">
      {/* 小统计 + AI 生成 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[12px]">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FBF4D4] text-[#a08a3a]">
            <ClipboardList size={13} />
          </span>
          <div>
            <div className="font-semibold text-[#5b4a4a]">面试题 {list.length}</div>
            <div className="text-[11px] text-[#b4a79e]">
              手动录入 + AI 生成，按场面试独立保存
            </div>
          </div>
        </div>
        {dirty && (
          <Button size="sm" onClick={() => save(list)} disabled={saving}>
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check size={13} />}
            保存变更
          </Button>
        )}
      </div>

      {/* AI 快捷生成 */}
      <div className="rounded-xl border border-[#f0e5b0] bg-[#fdfbee] p-3">
        <div className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-[#a08a3a]">
          <Sparkles size={12} />
          AI 生成候选题
        </div>
        <div className="flex gap-2">
          <input
            value={customStyle}
            onChange={(e) => setCustomStyle(e.target.value)}
            placeholder="（可选）风格要求：如「偏数据分析」「产品经理 · AI 方向」"
            maxLength={200}
            className="flex-1 rounded-lg border border-[#efdfa8] bg-white px-3 py-1.5 text-[12px] text-[#5c463a] placeholder:text-[#c7b5a8] focus:border-[#c9a340] focus:outline-none"
          />
          <Button
            type="button"
            size="sm"
            onClick={generateWithAI}
            disabled={generating}
            className="shrink-0"
          >
            {generating ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Sparkles size={13} />
            )}
            生成
          </Button>
        </div>
        <p className="mt-1.5 text-[10px] text-[#b4a79e]">
          AI 会结合该岗位 JD + 关联简历内容，生成题目**追加**到下方列表（不会覆盖已有）
        </p>
      </div>

      {/* 题目列表 */}
      <ol className="space-y-1.5">
        {list.length === 0 && (
          <li className="rounded-xl border border-dashed border-[#f1e8e0] px-4 py-8 text-center text-[12px] text-[#b4a79e]">
            还没有题目。可以用 AI 生成，或在下方自己写一条。
          </li>
        )}
        {list.map((q, i) => (
          <li
            key={i}
            className={cn(
              "group relative flex items-start gap-2 rounded-xl border border-[#f1e8e0] bg-white px-3 py-2.5 transition",
              "hover:border-[#e8d7c8] hover:shadow-sm"
            )}
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#fbf4d4] text-[10px] font-semibold text-[#a08a3a]">
              {i + 1}
            </span>
            <EditableText
              value={q}
              onChange={(v) => {
                setList((prev) => prev.map((x, idx) => (idx === i ? v : x)));
                setDirty(true);
              }}
            />
            <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
              <button
                type="button"
                onClick={() => copyOne(q, i)}
                className="flex h-6 w-6 items-center justify-center rounded text-[#b4a79e] hover:bg-[#fbf4d4] hover:text-[#a08a3a]"
                aria-label="复制"
                title="复制"
              >
                {copiedIdx === i ? <Check size={11} /> : <Copy size={11} />}
              </button>
              <button
                type="button"
                onClick={() => removeOne(i)}
                className="flex h-6 w-6 items-center justify-center rounded text-[#b4a79e] hover:bg-[#fae6ea] hover:text-[#c86d85]"
                aria-label="删除"
              >
                <Trash2 size={11} />
              </button>
            </div>
          </li>
        ))}
      </ol>

      {/* 新增输入 */}
      <div className="rounded-xl border border-[#f1e8e0] bg-white p-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              addOne();
            }
          }}
          placeholder="输入一道题，Enter 添加；粘贴多行文本后可点「批量导入」"
          rows={2}
          className="w-full resize-none bg-transparent text-[13px] text-[#5c463a] placeholder:text-[#c7b5a8] focus:outline-none"
        />
        <div className="mt-1.5 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={batchImport}
            disabled={!draft.trim()}
          >
            批量导入（按行）
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={addOne}
            disabled={!draft.trim()}
          >
            <Plus size={12} />
            添加
          </Button>
        </div>
      </div>
    </div>
  );
}

function EditableText({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  React.useEffect(() => setDraft(value), [value]);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex-1 text-left text-[13px] leading-relaxed text-[#5c463a] hover:text-[#a08a3a]"
      >
        {value}
      </button>
    );
  }
  return (
    <textarea
      value={draft}
      autoFocus
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        setEditing(false);
        if (draft.trim() && draft !== value) onChange(draft.trim());
        else setDraft(value);
      }}
      rows={2}
      className="flex-1 resize-none rounded-md border border-[#efdfa8] bg-white px-2 py-1 text-[13px] text-[#5c463a] focus:outline-none focus:ring-2 focus:ring-[#f0e5b0]"
    />
  );
}
