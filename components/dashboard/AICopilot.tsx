"use client";

/**
 * components/dashboard/AICopilot.tsx · 极简奶油风
 *
 * AI Copilot 卡片（UI.md 8.7 + PRD 5.1.5）
 *
 *   - 解析面试邮件：调 /api/ai/parse-email → 弹出 Stage Drawer 预填
 *   - 解析 JD：选 Application → 调 /api/ai/parse-jd → 内联展示 → 保存 PATCH
 *   - 生成面试题：选 Application → 调 /api/ai/generate-questions → 保存
 *   - 生成复盘：选 Stage → 调 /api/ai/review → 保存 PATCH
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useSWR from "swr";
import {
  Loader2,
  Sparkles,
  CheckCircle2,
  Mail,
  FileSearch,
  MessageSquareQuote,
  ClipboardList,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { fetchJson } from "@/lib/fetcher";
import { useOpenDrawer } from "@/lib/drawerUrl";

type Action = "parse_email" | "parse_jd" | "generate_questions" | "review";

const ACTIONS: Array<{
  key: Action;
  label: string;
  Icon: typeof Mail;
  tint: string;
  iconColor: string;
}> = [
  {
    key: "parse_email",
    label: "解析面试邮件",
    Icon: Mail,
    tint: "bg-[#FAE6EA] hover:bg-[#f5d5dd] border-[#f3d9df]",
    iconColor: "text-[#c86d85]",
  },
  {
    key: "parse_jd",
    label: "解析 JD",
    Icon: FileSearch,
    tint: "bg-[#EDE7F5] hover:bg-[#e3daf0] border-[#dfd2ee]",
    iconColor: "text-[#8a6fa5]",
  },
  {
    key: "generate_questions",
    label: "生成面试题",
    Icon: ClipboardList,
    tint: "bg-[#FBF4D4] hover:bg-[#f5ecc0] border-[#f0e5b0]",
    iconColor: "text-[#a08a3a]",
  },
  {
    key: "review",
    label: "生成复盘",
    Icon: MessageSquareQuote,
    tint: "bg-[#E8EFE3] hover:bg-[#dde7d6] border-[#d7e2cd]",
    iconColor: "text-[#70876a]",
  },
];

interface AppRow {
  id: string;
  companyName: string;
  departmentName: string;
  roleName: string;
  stages?: Array<{ id: string; type: string; time: string | null }>;
}

interface DraftParseEmail {
  companyName: string | null;
  departmentName: string | null;
  roleName: string | null;
  stageType: string | null;
  time: string | null;
  meetingLink: string | null;
  jdText: string | null;
}

interface DraftParseJd {
  jdSummary: string;
  jdKeywords: string[];
  expectedSkills: string[];
}

interface DraftQuestions {
  questions: string[];
}

interface DraftReview {
  questionSummary: string;
  answerSummary: string;
  suggestion: string;
}

type AnyDraft =
  | { kind: "parse_email"; data: DraftParseEmail }
  | { kind: "parse_jd"; data: DraftParseJd; applicationId: string }
  | {
      kind: "generate_questions";
      data: DraftQuestions;
      applicationId: string;
    }
  | { kind: "review"; data: DraftReview; stageId: string };

export const SS_KEY_EMAIL_DRAFT = "jhb:emailDraft";

export function AICopilot() {
  const router = useRouter();
  const openDrawer = useOpenDrawer();
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState<Action | null>(null);
  const [draft, setDraft] = React.useState<AnyDraft | null>(null);
  const [selectedAppId, setSelectedAppId] = React.useState("");
  const [selectedStageId, setSelectedStageId] = React.useState("");

  const { data: apps } = useSWR<AppRow[]>(
    "/api/applications",
    (url: string) => fetchJson<AppRow[]>(url)
  );
  type EventRow = {
    id: string;
    type: string;
    time: string | null;
    application: { companyName: string; roleName: string };
  };
  const { data: events } = useSWR<EventRow[]>(
    "/api/dashboard/events?range=60d",
    (url: string) => fetchJson<EventRow[]>(url)
  );

  const runAction = async (action: Action) => {
    setDraft(null);

    if (action === "parse_email") {
      if (input.trim().length < 5) {
        toast.error("请先在上方文本框粘贴面试邮件 / 通知文本");
        return;
      }
    }
    if (action === "parse_jd") {
      if (!selectedAppId) {
        toast.error("请先在下方选一个关联岗位");
        return;
      }
      if (input.trim().length < 20) {
        toast.error("请先在上方文本框粘贴岗位 JD");
        return;
      }
    }
    if (action === "generate_questions") {
      if (!selectedAppId) {
        toast.error("请先在下方选一个关联岗位");
        return;
      }
    }
    if (action === "review") {
      if (!selectedStageId) {
        toast.error("请先在下方选一个面试节点（Stage）");
        return;
      }
      if (input.trim().length < 30) {
        toast.error("请先在上方文本框粘贴面试转录内容（至少 30 字）");
        return;
      }
    }

    setBusy(action);
    try {
      if (action === "parse_email") {
        const res = await fetchJson<{ draft: DraftParseEmail }>(
          "/api/ai/parse-email",
          {
            method: "POST",
            body: JSON.stringify({ inputText: input }),
          }
        );
        setDraft({ kind: "parse_email", data: res.draft });
      } else if (action === "parse_jd") {
        const res = await fetchJson<{ draft: DraftParseJd }>(
          "/api/ai/parse-jd",
          {
            method: "POST",
            body: JSON.stringify({ jdText: input }),
          }
        );
        setDraft({
          kind: "parse_jd",
          data: res.draft,
          applicationId: selectedAppId,
        });
      } else if (action === "generate_questions") {
        const res = await fetchJson<{ draft: DraftQuestions }>(
          "/api/ai/generate-questions",
          {
            method: "POST",
            body: JSON.stringify({ applicationId: selectedAppId }),
          }
        );
        setDraft({
          kind: "generate_questions",
          data: res.draft,
          applicationId: selectedAppId,
        });
      } else if (action === "review") {
        const res = await fetchJson<{ draft: DraftReview }>(
          "/api/ai/review",
          {
            method: "POST",
            body: JSON.stringify({
              stageId: selectedStageId,
              transcriptText: input,
            }),
          }
        );
        setDraft({
          kind: "review",
          data: res.draft,
          stageId: selectedStageId,
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI 调用失败");
    } finally {
      setBusy(null);
    }
  };

  const applyDraft = async () => {
    if (!draft) return;

    if (draft.kind === "parse_email") {
      try {
        sessionStorage.setItem(
          SS_KEY_EMAIL_DRAFT,
          JSON.stringify(draft.data)
        );
      } catch {
        /* ignore */
      }
      openDrawer({ type: "application-new" });
      setDraft(null);
      return;
    }

    if (draft.kind === "parse_jd") {
      try {
        await fetchJson(`/api/applications/${draft.applicationId}`, {
          method: "PATCH",
          body: JSON.stringify({
            jdSummary: draft.data.jdSummary,
            jdKeywords: draft.data.jdKeywords,
            expectedSkills: draft.data.expectedSkills,
            jdText: input || undefined,
          }),
        });
        toast.success("JD 解析已写入岗位");
        router.refresh();
        setDraft(null);
        setInput("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "保存失败");
      }
      return;
    }

    if (draft.kind === "generate_questions") {
      try {
        await fetchJson(`/api/applications/${draft.applicationId}`, {
          method: "PATCH",
          body: JSON.stringify({ interviewQuestions: draft.data.questions }),
        });
        toast.success("面试题已保存到岗位题库");
        router.refresh();
        setDraft(null);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "保存失败");
      }
      return;
    }

    if (draft.kind === "review") {
      try {
        await fetchJson(`/api/stages/${draft.stageId}`, {
          method: "PATCH",
          body: JSON.stringify({
            reviewQuestionSummary: draft.data.questionSummary,
            reviewAnswerSummary: draft.data.answerSummary,
            reviewSuggestion: draft.data.suggestion,
          }),
        });
        toast.success("复盘已写入面试节点");
        router.refresh();
        setDraft(null);
        setInput("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "保存失败");
      }
      return;
    }
  };

  const needsAppSelect =
    busy === "parse_jd" ||
    busy === "generate_questions" ||
    draft?.kind === "parse_jd" ||
    draft?.kind === "generate_questions";
  const needsStageSelect = busy === "review" || draft?.kind === "review";

  return (
    <section
      className="surface p-5 animate-fade-in-up"
      style={{ animationDelay: "0.1s" }}
    >
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EDE7F5]">
            <Sparkles size={15} className="text-[#8a6fa5]" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-card-title text-[#5b4a4a]">AI Copilot</h3>
            <p className="text-[11px] text-[#b4a79e]">
              {busy ? "思考中…" : "粘贴文本，帮你整理"}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-[#f1e8e0] bg-[#fdfbf8] px-2 py-0.5 text-[10px] font-semibold text-[#b4a79e]">
          BETA
        </span>
      </header>

      {/* 输入框 */}
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
          placeholder="粘贴面试邮件、JD 或面试转录…"
          className={cn(
            "w-full resize-none rounded-2xl border border-[#f1e8e0] bg-[#fdfbf8] p-3.5",
            "text-body text-[#5b4a4a] placeholder:text-[#b4a79e]",
            "focus:outline-none focus:border-[#e9b99a] focus:bg-white",
            "transition-all"
          )}
          disabled={busy !== null}
        />
        <div className="absolute bottom-2 right-3 text-[11px] text-[#b4a79e]">
          {input.length} 字
        </div>
      </div>

      {/* 快捷按钮 · 2 列 · 极简彩色格 */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {ACTIONS.map(({ key, label, Icon, tint, iconColor }) => (
          <button
            key={key}
            type="button"
            disabled={busy !== null}
            onClick={() => runAction(key)}
            className={cn(
              "group inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5",
              "text-[12px] font-medium text-[#5b4a4a]",
              "transition-all duration-200",
              "active:scale-[0.97]",
              "disabled:pointer-events-none disabled:opacity-50",
              tint
            )}
          >
            {busy === key ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Icon size={13} className={iconColor} strokeWidth={2} />
            )}
            {label}
          </button>
        ))}
      </div>

      {/* 选岗位 / 选 Stage */}
      {(needsAppSelect ||
        (input === "" && apps && apps.length > 0)) && (
        <div className="mt-4 space-y-1.5">
          <Label>关联岗位（解析 JD / 生成面试题 需要）</Label>
          <Select
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
          >
            <option value="">— 选择岗位 —</option>
            {(apps ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.companyName}
                {a.departmentName ? ` · ${a.departmentName}` : ""}
                {a.roleName ? ` · ${a.roleName}` : ""}
              </option>
            ))}
          </Select>
        </div>
      )}
      {needsStageSelect && (
        <div className="mt-3 space-y-1.5">
          <Label>面试节点（生成复盘 需要）</Label>
          <Select
            value={selectedStageId}
            onChange={(e) => setSelectedStageId(e.target.value)}
          >
            <option value="">— 选择 Stage —</option>
            {(events ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.application.companyName}
                {s.application.roleName ? ` · ${s.application.roleName}` : ""}
                {" · "}
                {s.type}
                {s.time
                  ? ` · ${new Date(s.time).toLocaleDateString("zh-CN")}`
                  : ""}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* 草稿预览 */}
      {draft && (
        <div className="mt-4 rounded-2xl border border-[#f1e8e0] bg-[#fdfbf8] p-4">
          <DraftPreview draft={draft} />
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setDraft(null)}>
              放弃
            </Button>
            <Button size="sm" onClick={applyDraft}>
              <CheckCircle2 />
              {draft.kind === "parse_email" ? "去创建事件" : "采纳并保存"}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

function DraftPreview({ draft }: { draft: AnyDraft }) {
  if (draft.kind === "parse_email") {
    const d = draft.data;
    return (
      <div className="space-y-1 text-caption">
        <p className="text-card-title text-[#5b4a4a]">面试邮件解析结果</p>
        <Row k="公司">{d.companyName ?? "—"}</Row>
        <Row k="部门">{d.departmentName ?? "—"}</Row>
        <Row k="岗位">{d.roleName ?? "—"}</Row>
        <Row k="节点类型">{d.stageType ?? "—"}</Row>
        <Row k="时间">{d.time ?? "—"}</Row>
        <Row k="会议链接">{d.meetingLink ?? "—"}</Row>
        {d.jdText && (
          <p className="mt-2 text-[11px] text-[#b4a79e]">
            JD 片段：{d.jdText.slice(0, 80)}…
          </p>
        )}
      </div>
    );
  }
  if (draft.kind === "parse_jd") {
    const d = draft.data;
    return (
      <div className="space-y-2 text-caption">
        <p className="text-card-title text-[#5b4a4a]">JD 解析结果</p>
        <p className="text-body text-[#5b4a4a]">{d.jdSummary}</p>
        <div className="flex flex-wrap gap-1">
          {d.jdKeywords.map((k) => (
            <span
              key={k}
              className="inline-flex items-center rounded-full border border-[#ede7f5] bg-[#f7f4fb] px-2 py-0.5 text-[#8a6fa5]"
            >
              {k}
            </span>
          ))}
        </div>
        <ul className="ml-5 list-disc text-[#8a7972]">
          {d.expectedSkills.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
    );
  }
  if (draft.kind === "generate_questions") {
    return (
      <div className="space-y-2">
        <p className="text-card-title text-[#5b4a4a]">生成的面试题</p>
        <ol className="space-y-1.5 pl-0">
          {draft.data.questions.map((q, i) => (
            <li
              key={i}
              className="flex gap-2 rounded-xl border border-[#f1e8e0] bg-white p-2.5 text-body text-[#5b4a4a]"
            >
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#fbf4d4] text-[11px] font-bold text-[#a08a3a]">
                {i + 1}
              </span>
              <span>{q}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }
  if (draft.kind === "review") {
    const d = draft.data;
    return (
      <div className="space-y-2">
        <p className="text-card-title text-[#5b4a4a]">面试复盘</p>
        <ReviewCard title="问题概述" tint="bg-[#EDE7F5]">
          {d.questionSummary}
        </ReviewCard>
        <ReviewCard title="回答概述" tint="bg-[#FBF4D4]">
          {d.answerSummary}
        </ReviewCard>
        <ReviewCard title="建议" tint="bg-[#E8EFE3]">
          {d.suggestion}
        </ReviewCard>
      </div>
    );
  }
  return null;
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="w-16 flex-shrink-0 text-[#b4a79e]">{k}</span>
      <span className="flex-1 text-[#5b4a4a]">{children}</span>
    </div>
  );
}

function ReviewCard({
  title,
  tint,
  children,
}: {
  title: string;
  tint: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-xl p-3", tint)}>
      <p className="mb-1 text-[11px] font-semibold text-[#6b574f]">{title}</p>
      <p className="text-body text-[#5b4a4a]">{children}</p>
    </div>
  );
}

void Input;
