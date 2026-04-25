"use client";

/**
 * components/drawer/tabs/PersonalNotesTab.tsx
 *
 * Stage Drawer · 随手记 Tab
 *
 * 字段：Stage.personalNotes（单字段 plain text）
 * 纯用户自由输入；离开 tab 或点保存时落库。
 */

import * as React from "react";
import { toast } from "sonner";
import { NotebookPen, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { fetchJson } from "@/lib/fetcher";

interface Props {
  stageId: string;
  initial: string | null;
  onSaved?: () => void;
}

export function PersonalNotesTab({ stageId, initial, onSaved }: Props) {
  const [value, setValue] = React.useState(initial ?? "");
  const [saving, setSaving] = React.useState(false);
  const dirty = (initial ?? "") !== value;

  const save = async () => {
    setSaving(true);
    try {
      await fetchJson(`/api/stages/${stageId}`, {
        method: "PATCH",
        body: JSON.stringify({ personalNotes: value }),
      });
      toast.success("已保存 🍃");
      onSaved?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EDE7F5] text-[#8a6fa5]">
            <NotebookPen size={13} />
          </span>
          <div>
            <div className="text-[13px] font-semibold text-[#5b4a4a]">
              随手记
            </div>
            <div className="text-[11px] text-[#b4a79e]">
              给这场面试的私人笔记，面试官风格 / 线索 / 提醒都可以记
            </div>
          </div>
        </div>
        {dirty && (
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check size={13} />}
            保存
          </Button>
        )}
      </div>

      {/* 便签风输入 */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-[#dfd2ee] bg-gradient-to-br from-[#f7f4fb] to-[#ede7f5] p-4",
          "shadow-[0_1px_2px_rgba(138,111,165,0.06),0_6px_20px_rgba(138,111,165,0.06)]"
        )}
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, transparent 0 26px, rgba(138,111,165,0.08) 26px 27px)",
        }}
      >
        {/* 装饰 · 回形针 */}
        <div
          aria-hidden
          className="absolute -top-2.5 left-5 h-5 w-9 rounded-b-full border-b-2 border-l-2 border-r-2 border-[#c0afd9]/60 bg-[#e1d4f0]/40"
        />

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`例如：
· 面试官看起来很关注项目主导性
· 下次记得展开 XX 项目的「二次决策」故事
· 这家公司文化偏狼性，提问建议围绕加班节奏
· …`}
          rows={10}
          className="w-full resize-y bg-transparent font-[inherit] text-[13px] leading-7 text-[#5c463a] placeholder:text-[#a89bbd] focus:outline-none"
        />
      </div>

      <p className="text-[10px] italic text-[#b4a79e]">
        小提示：Ctrl/⌘ + S 可以快速保存
      </p>

      <SaveShortcut onSave={save} disabled={saving || !dirty} />
    </div>
  );
}

function SaveShortcut({
  onSave,
  disabled,
}: {
  onSave: () => void;
  disabled: boolean;
}) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (!disabled) onSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSave, disabled]);
  return null;
}
