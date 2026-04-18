"use client";

/**
 * components/dashboard/AICopilot.tsx
 *
 * AI Copilot 卡片（UI.md 8.7 + PRD 5.1.5）
 *
 * Step 6.3 实装：4 个快捷按钮全部接线
 *   - 解析面试邮件：调 /api/ai/parse-email → 弹出 Stage Drawer 预填
 *   - 解析 JD：选 Application → 调 /api/ai/parse-jd → 内联展示 → 保存 PATCH
 *   - 生成面试题：选 Application → 调 /api/ai/generate-questions → 展示可编辑列表 → 保存
 *   - 生成复盘：选 Stage → 调 /api/ai/review → 展示 3 个小卡片 → 保存 PATCH
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useSWR from "swr";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";

import { CatIcon } from "@/components/CatIcon";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { fetchJson } from "@/lib/fetcher";
import { useOpenDrawer } from "@/lib/drawerUrl";

type Action = "parse_email" | "parse_jd" | "generate_questions" | "review";

const ACTIONS: Array<{ key: Action; label: string }> = [
  { key: "parse_email", label: "解析面试邮件" },
  { key: "parse_jd", label: "解析 JD" },
  { key: "generate_questions", label: "生成面试题" },
  { key: "review", label: "生成复盘" },
];

interface AppRow {
  id: string;
  companyName: string;
  departmentName: string;
  roleName: string;
  stages?: Array<{ id: string; type: string; time: string | null }>;
}

// ──────────────────────────────────────────────────────────────────────
// AI 结果类型
// ──────────────────────────────────────────────────────────────────────

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

// Step 6.3 · sessionStorage key：解析邮件草稿跨 Drawer 传递
export const SS_KEY_EMAIL_DRAFT = "jhb:emailDraft";

// ──────────────────────────────────────────────────────────────────────
// 主组件
// ──────────────────────────────────────────────────────────────────────

export function AICopilot() {
  const router = useRouter();
  const openDrawer = useOpenDrawer();
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState<Action | null>(null);
  const [draft, setDraft] = React.useState<AnyDraft | null>(null);
  const [selectedAppId, setSelectedAppId] = React.useState("");
  const [selectedStageId, setSelectedStageId] = React.useState("");

  // 拉 Application 下拉（排除"未投递"占位）
  const { data: apps } = useSWR<AppRow[]>(
    "/api/applications",
    (url: string) => fetchJson<AppRow[]>(url)
  );
  // 复盘需要 Stage 列表：用 dashboard events（近 60 天）充当一个"所有有时间的 Stage"源
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

  // 采纳草稿
  const applyDraft = async () => {
    if (!draft) return;

    if (draft.kind === "parse_email") {
      // 把草稿写进 sessionStorage，打开"新增申请" Drawer 自动预填
      // 面试邮件一般指向一个新岗位，走 application-new（公司+部门+岗位+第一个 Stage 一起建）
      try {
        sessionStorage.setItem(
          SS_KEY_EMAIL_DRAFT,
          JSON.stringify(draft.data)
        );
      } catch {
        /* sessionStorage 可能被禁用，忽略 */
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
            jdText: input || undefined, // 顺便把原始 JD 也存
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
      className="relative overflow-hidden rounded-card-lg p-6 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-hover"
      style={{
        background: "linear-gradient(135deg, #FFF1F7 0%, #F8F5FF 100%)",
      }}
    >
      <header className="mb-4 flex items-center gap-3">
        <CatIcon size={34} />
        <h3 className="text-section-title text-text-primary">AI Copilot</h3>
        <Sparkles
          size={16}
          className="ml-auto text-primary-strong"
          strokeWidth={1.8}
        />
      </header>

      {/* 统一输入框 */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={5}
        placeholder="粘贴面试邮件、JD 或面试转录，我来帮你整理 ✨"
        className={cn(
          "w-full resize-none border border-border-light bg-surface-bg p-4",
          "text-body text-text-primary placeholder:text-text-tertiary",
          "focus:outline-none focus:ring-2 focus:ring-primary/40",
          "transition-colors"
        )}
        style={{ borderRadius: 18 }}
        disabled={busy !== null}
      />

      {/* 快捷按钮 */}
      <div className="mt-3 flex flex-wrap gap-2">
        {ACTIONS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            disabled={busy !== null}
            onClick={() => runAction(key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-pill bg-surface-bg/80 px-4 py-2",
              "text-caption font-medium text-text-primary",
              "transition-all hover:bg-secondary-pink/60 hover:-translate-y-px",
              "active:scale-[0.98]",
              "disabled:pointer-events-none disabled:opacity-50"
            )}
          >
            {busy === key ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : null}
            {label}
          </button>
        ))}
      </div>

      {/* 选岗位 / 选 Stage：按需显示 */}
      {(needsAppSelect ||
        // 即便还没点按钮，如果用户选了 parse_jd / generate_questions 的动作前想先选岗位，也允许
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

      {/* 草稿结果卡片 */}
      {draft && (
        <div className="mt-4 rounded-card-md bg-surface-bg/90 p-4 shadow-soft">
          <DraftPreview draft={draft} />
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDraft(null)}
            >
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

// ──────────────────────────────────────────────────────────────────────
// 草稿预览
// ──────────────────────────────────────────────────────────────────────

function DraftPreview({ draft }: { draft: AnyDraft }) {
  if (draft.kind === "parse_email") {
    const d = draft.data;
    return (
      <div className="space-y-1 text-caption">
        <p className="text-card-title text-text-primary">面试邮件解析结果</p>
        <Row k="公司">{d.companyName ?? "—"}</Row>
        <Row k="部门">{d.departmentName ?? "—"}</Row>
        <Row k="岗位">{d.roleName ?? "—"}</Row>
        <Row k="节点类型">{d.stageType ?? "—"}</Row>
        <Row k="时间">{d.time ?? "—"}</Row>
        <Row k="会议链接">{d.meetingLink ?? "—"}</Row>
        {d.jdText && (
          <p className="mt-2 text-caption text-text-tertiary">
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
        <p className="text-card-title text-text-primary">JD 解析结果</p>
        <p className="text-body text-text-primary">{d.jdSummary}</p>
        <div className="flex flex-wrap gap-1">
          {d.jdKeywords.map((k) => (
            <span
              key={k}
              className="inline-flex items-center rounded-pill bg-secondary-lilac px-2 py-0.5 text-text-primary"
            >
              {k}
            </span>
          ))}
        </div>
        <ul className="ml-5 list-disc text-text-secondary">
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
        <p className="text-card-title text-text-primary">生成的面试题</p>
        <ol className="space-y-1.5 pl-0">
          {draft.data.questions.map((q, i) => (
            <li
              key={i}
              className="flex gap-2 rounded-card-md bg-app-bg-secondary p-2 text-body text-text-primary"
            >
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-secondary-pink text-caption font-bold text-primary-strong">
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
        <p className="text-card-title text-text-primary">面试复盘</p>
        <ReviewCard title="问题概述" color="bg-secondary-lilac">
          {d.questionSummary}
        </ReviewCard>
        <ReviewCard title="回答概述" color="bg-secondary-yellow">
          {d.answerSummary}
        </ReviewCard>
        <ReviewCard title="建议" color="bg-secondary-mint">
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
      <span className="w-16 flex-shrink-0 text-text-tertiary">{k}</span>
      <span className="flex-1 text-text-primary">{children}</span>
    </div>
  );
}

function ReviewCard({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-card-md p-3", color, "bg-opacity-40")}>
      <p className="mb-1 text-caption font-semibold text-text-primary">
        {title}
      </p>
      <p className="text-body text-text-primary">{children}</p>
    </div>
  );
}

/**
 * 也许以后不再直接用 Input（只做占位依赖）；保留以避免 tree-shaking 警告
 */
void Input;
