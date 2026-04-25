"use client";

/**
 * components/dashboard/AIWorkstation.tsx
 *
 * AI 工作站（首页黄金位）
 *
 * UI 升级点：
 *  - 顶部：功能切换 Tab（邮件解析 / JD 解析 / 面试题 / 复盘），每个 Tab 带自己的副标题与说明
 *  - 中部：大号富文本输入框 + 右侧情境说明面板（使用场景、输入示例、注意事项）
 *  - 关联岗位：使用统一 JobCombobox（带搜索/公司徽标/状态 pill）
 *  - 底部：生成按钮 + 清空 + 示例快捷填充
 *  - AI 结果：结构化卡片展示，可直接 [采纳保存 / 丢弃]
 *
 * 交互特色：
 *  - Tab 切换平滑
 *  - 输入框底部字数计数
 *  - AI 生成时顶部流动的 gradient bar
 *  - 按钮 active / hover 动效克制
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
  Info,
  Wand2,
  Trash2,
  Copy,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { JobCombobox, type ComboAppOption } from "@/components/ui/JobCombobox";
import { cn } from "@/lib/utils";
import { fetchJson } from "@/lib/fetcher";
import { useOpenDrawer } from "@/lib/drawerUrl";

export const SS_KEY_EMAIL_DRAFT = "jhb:emailDraft";

type Action = "parse_email" | "parse_jd" | "generate_questions" | "review";

interface ActionMeta {
  key: Action;
  label: string;
  subtitle: string;
  desc: string;
  Icon: typeof Mail;
  accent: string; // tailwind bg accent for tab active
  softBg: string;
  ring: string;
  iconColor: string;
  iconBg: string;
  needsApp: boolean;
  needsStage: boolean;
  inputPlaceholder: string;
  example: string;
  minInputLen: number;
  inputLabel: string;
  tips: string[];
}

const ACTIONS: ActionMeta[] = [
  {
    key: "parse_email",
    label: "邮件解析",
    subtitle: "一键把面试邮件变成日程",
    desc: "粘贴任何面试邀请邮件 / 微信通知 / 短信通知，AI 会抽出公司、岗位、时间、会议链接等结构化字段。",
    Icon: Mail,
    accent: "bg-[#fae6ea]",
    softBg: "bg-[#fdf2f2]",
    ring: "border-[#f3d9df]",
    iconColor: "text-[#c86d85]",
    iconBg: "bg-[#FAE6EA]",
    needsApp: false,
    needsStage: false,
    inputPlaceholder:
      "示例：\n「同学你好，邀请你参加腾讯 PCG 产品策划实习生一面，时间 11 月 20 日 14:30，会议链接 meeting.tencent.com/xxx」",
    example:
      "同学你好，邀请你参加字节跳动 TikTok 广告产品一面，时间 2026-05-06 19:00，会议链接：https://meeting.bytedance.com/s/abc123",
    minInputLen: 8,
    inputLabel: "面试邮件 / 通知正文",
    tips: [
      "支持中英文混合",
      "能识别相对时间（如「明天下午 2 点」）",
      "结果先展示草稿，你可以修改再创建事件",
    ],
  },
  {
    key: "parse_jd",
    label: "JD 解析",
    subtitle: "把岗位 JD 拆解成能力模型",
    desc: "粘贴岗位的 JD 原文，AI 会生成 JD 摘要、关键词标签、候选人所需能力清单，直接写入你的岗位档案。",
    Icon: FileSearch,
    accent: "bg-[#ede7f5]",
    softBg: "bg-[#f7f4fb]",
    ring: "border-[#dfd2ee]",
    iconColor: "text-[#8a6fa5]",
    iconBg: "bg-[#EDE7F5]",
    needsApp: true,
    needsStage: false,
    inputPlaceholder: "粘贴 JD 原文（岗位职责 / 任职要求 / 加分项都可以）…",
    example:
      "岗位职责：1. 负责 B 端 SaaS 产品规划\n2. 撰写 PRD\n任职要求：1. 本科及以上\n2. 有数据分析经验\n加分项：熟悉 AI 行业",
    minInputLen: 30,
    inputLabel: "JD 原文",
    tips: [
      "建议先在下方选择关联岗位",
      "解析结果会写入 JD 摘要 / 关键词 / 能力要求",
      "Drawer 里可以手动调整后再保存",
    ],
  },
  {
    key: "generate_questions",
    label: "面试题生成",
    subtitle: "基于 JD 生成可能的面试题",
    desc: "AI 结合你已保存的 JD 信息和岗位维度，生成行为面 / 专业面 / 技术面等可能的面试问题。",
    Icon: ClipboardList,
    accent: "bg-[#fbf4d4]",
    softBg: "bg-[#fdfbee]",
    ring: "border-[#f0e5b0]",
    iconColor: "text-[#a08a3a]",
    iconBg: "bg-[#FBF4D4]",
    needsApp: true,
    needsStage: false,
    inputPlaceholder:
      "（可选）补充一些面试风格 / 岗位特色，例如：「偏数据分析方向」「产品经理 · 有 AI 经验优先」",
    example:
      "偏 B 端 SaaS 方向，关注候选人的商业化思考、项目管理经验",
    minInputLen: 0,
    inputLabel: "自定义风格（可选）",
    tips: [
      "需先选择一个关联岗位",
      "岗位已保存 JD 时，生成更精准",
      "生成结果会保存到该岗位的题库",
    ],
  },
  {
    key: "review",
    label: "面试复盘",
    subtitle: "根据转录生成复盘笔记",
    desc: "粘贴面试的文字转录（录音 ASR / 手动记录均可），AI 会整理出被问到的问题、你的回答、改进建议。",
    Icon: MessageSquareQuote,
    accent: "bg-[#e8efe3]",
    softBg: "bg-[#f3f7f1]",
    ring: "border-[#d7e2cd]",
    iconColor: "text-[#70876a]",
    iconBg: "bg-[#E8EFE3]",
    needsApp: false,
    needsStage: true,
    inputPlaceholder:
      "示例：\n「面试官：请介绍一下你做过最有挑战的项目」\n「我：我在做 xxx 产品的时候…」",
    example:
      "面试官：请你自我介绍\n我：大家好，我是邱同学，目前在中南财经政法大学就读…",
    minInputLen: 30,
    inputLabel: "面试转录文本",
    tips: [
      "必须选一个面试节点作为归属",
      "文本越完整，复盘越有针对性",
      "复盘结果写入对应 Stage",
    ],
  },
];

// ── Draft 数据结构 ──
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

interface AppRow {
  id: string;
  companyName: string;
  departmentName: string;
  roleName: string;
  currentStatus?: string;
  stages?: Array<{ id: string; type: string; time: string | null }>;
}

interface EventRow {
  id: string;
  type: string;
  time: string | null;
  application: {
    companyName: string;
    departmentName?: string;
    roleName: string;
  };
}

interface AIWorkstationProps {
  defaultAction?: Action;
}

export function AIWorkstation({ defaultAction = "parse_email" }: AIWorkstationProps) {
  const router = useRouter();
  const openDrawer = useOpenDrawer();

  const [active, setActive] = React.useState<Action>(defaultAction);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState<Action | null>(null);
  const [draft, setDraft] = React.useState<AnyDraft | null>(null);
  const [appId, setAppId] = React.useState("");
  const [stageId, setStageId] = React.useState("");

  const { data: apps = [] } = useSWR<AppRow[]>(
    "/api/applications",
    (u: string) => fetchJson<AppRow[]>(u)
  );
  const { data: events = [] } = useSWR<EventRow[]>(
    "/api/dashboard/events?range=60d",
    (u: string) => fetchJson<EventRow[]>(u)
  );

  const meta = React.useMemo(
    () => ACTIONS.find((a) => a.key === active)!,
    [active]
  );

  const comboOptions: ComboAppOption[] = React.useMemo(
    () =>
      apps.map((a) => ({
        id: a.id,
        companyName: a.companyName,
        departmentName: a.departmentName,
        roleName: a.roleName,
        currentStatus: a.currentStatus,
      })),
    [apps]
  );

  // Switch tab → reset
  const switchTab = (k: Action) => {
    setActive(k);
    setDraft(null);
  };

  const fillExample = () => {
    setInput(meta.example);
  };

  const clearAll = () => {
    setInput("");
    setDraft(null);
  };

  const run = async () => {
    if (meta.needsApp && !appId) {
      toast.error("请先在下方选一个关联岗位");
      return;
    }
    if (meta.needsStage && !stageId) {
      toast.error("请先在下方选一个面试节点");
      return;
    }
    if (input.trim().length < meta.minInputLen) {
      toast.error(`请至少输入 ${meta.minInputLen} 字`);
      return;
    }

    setBusy(active);
    setDraft(null);
    try {
      if (active === "parse_email") {
        const res = await fetchJson<{ draft: DraftParseEmail }>(
          "/api/ai/parse-email",
          { method: "POST", body: JSON.stringify({ inputText: input }) }
        );
        setDraft({ kind: "parse_email", data: res.draft });
      } else if (active === "parse_jd") {
        const res = await fetchJson<{ draft: DraftParseJd }>(
          "/api/ai/parse-jd",
          { method: "POST", body: JSON.stringify({ jdText: input }) }
        );
        setDraft({ kind: "parse_jd", data: res.draft, applicationId: appId });
      } else if (active === "generate_questions") {
        const res = await fetchJson<{ draft: DraftQuestions }>(
          "/api/ai/generate-questions",
          { method: "POST", body: JSON.stringify({ applicationId: appId }) }
        );
        setDraft({
          kind: "generate_questions",
          data: res.draft,
          applicationId: appId,
        });
      } else if (active === "review") {
        const res = await fetchJson<{ draft: DraftReview }>("/api/ai/review", {
          method: "POST",
          body: JSON.stringify({ stageId, transcriptText: input }),
        });
        setDraft({ kind: "review", data: res.draft, stageId });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI 调用失败");
    } finally {
      setBusy(null);
    }
  };

  const adopt = async () => {
    if (!draft) return;
    if (draft.kind === "parse_email") {
      try {
        sessionStorage.setItem(SS_KEY_EMAIL_DRAFT, JSON.stringify(draft.data));
      } catch {
        /* ignore */
      }
      openDrawer({ type: "application-new" });
      setDraft(null);
      setInput("");
      return;
    }
    if (draft.kind === "parse_jd") {
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
      return;
    }
    if (draft.kind === "generate_questions") {
      await fetchJson(`/api/applications/${draft.applicationId}`, {
        method: "PATCH",
        body: JSON.stringify({ interviewQuestions: draft.data.questions }),
      });
      toast.success("面试题已保存到岗位题库");
      router.refresh();
      setDraft(null);
      return;
    }
    if (draft.kind === "review") {
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
      return;
    }
  };

  return (
    <section className="surface relative overflow-hidden">
      {/* 顶部流动进度条（busy 时） */}
      {busy && (
        <div className="absolute inset-x-0 top-0 z-20 h-0.5 overflow-hidden bg-[#f6ebe1]">
          <div className="h-full w-1/3 animate-[slide_1.2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[#e9b99a] to-transparent" />
          <style jsx>{`
            @keyframes slide {
              0% {
                transform: translateX(-100%);
              }
              100% {
                transform: translateX(400%);
              }
            }
          `}</style>
        </div>
      )}

      {/* 装饰背景 */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-[#ede7f5] opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#fbebde] opacity-25 blur-3xl" />

      {/* Header */}
      <div className="relative border-b border-[#f1e8e0] px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ede7f5] via-[#fae6ea] to-[#fbebde] border border-[#f1e3d4]">
                <Sparkles
                  size={18}
                  className="text-[#8a6fa5]"
                  strokeWidth={2}
                />
              </div>
              <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#c86d85] opacity-60" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[#e9b1bf]" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-section-title text-[#5b4a4a]">
                  AI Workstation
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-[#ede7f5] bg-[#f7f4fb] px-2 py-0.5 text-[10px] font-semibold text-[#8a6fa5]">
                  <Zap size={9} />
                  Powered by 豆包
                </span>
              </div>
              <p className="mt-0.5 text-[12px] text-[#8a7972]">
                {meta.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <nav
          role="tablist"
          aria-label="AI 能力切换"
          className="mt-5 flex flex-wrap gap-1.5 rounded-2xl border border-[#f1e8e0] bg-[#fdfbf8] p-1.5"
        >
          {ACTIONS.map((a) => {
            const on = active === a.key;
            return (
              <button
                key={a.key}
                role="tab"
                aria-selected={on}
                type="button"
                onClick={() => switchTab(a.key)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-semibold transition-all duration-200",
                  "active:scale-[0.97]",
                  on
                    ? "bg-white text-[#5b4a4a] shadow-[0_1px_2px_rgba(199,165,149,0.08),0_4px_12px_rgba(199,165,149,0.08)]"
                    : "text-[#8a7972] hover:text-[#5b4a4a] hover:bg-white/70"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-lg transition-colors",
                    on ? a.iconBg : "bg-transparent"
                  )}
                >
                  <a.Icon
                    size={13}
                    className={on ? a.iconColor : "text-[#a69890]"}
                    strokeWidth={on ? 2.2 : 1.8}
                  />
                </span>
                <span className="hidden md:inline">{a.label}</span>
                <span className="md:hidden">{a.label.slice(0, 2)}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Body */}
      <div className="relative grid gap-6 p-6 lg:grid-cols-[1fr_280px]">
        {/* 主输入区 */}
        <div className="flex flex-col gap-4">
          {/* 关联选择器 */}
          {(meta.needsApp || meta.needsStage) && (
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8a7972]">
                <span className="h-1 w-1 rounded-full bg-[#e9b99a]" />
                {meta.needsApp ? "关联岗位" : "关联面试节点"}
                <span className="text-[#c86d85]">*</span>
              </label>
              {meta.needsApp && (
                <JobCombobox
                  value={appId}
                  onChange={setAppId}
                  options={comboOptions}
                  placeholder="搜索并选择岗位 · 输入公司名 / 部门 / 岗位关键词"
                  onCreateNew={() => openDrawer({ type: "application-new" })}
                  emptyHint="还没有岗位档案"
                />
              )}
              {meta.needsStage && (
                <StageSelector
                  value={stageId}
                  onChange={setStageId}
                  events={events}
                />
              )}
            </div>
          )}

          {/* 输入框 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8a7972]">
                <span className="h-1 w-1 rounded-full bg-[#e9b99a]" />
                {meta.inputLabel}
                {meta.minInputLen > 0 && (
                  <span className="text-[#c86d85]">*</span>
                )}
              </label>
              <div className="flex items-center gap-1">
                <QuickBtn
                  onClick={fillExample}
                  label="填入示例"
                  icon={<Wand2 size={11} />}
                />
                <QuickBtn
                  onClick={() => setInput("")}
                  label="清空"
                  icon={<Trash2 size={11} />}
                  disabled={!input}
                />
              </div>
            </div>
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={8}
                placeholder={meta.inputPlaceholder}
                disabled={busy !== null}
                className={cn(
                  "w-full resize-none rounded-2xl border bg-[#fdfbf8] p-4",
                  "text-body text-[#5b4a4a] placeholder:text-[#b4a79e]",
                  "border-[#f1e8e0]",
                  "focus:border-[#e9b99a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fbebde]",
                  "transition-all",
                  "disabled:opacity-60"
                )}
              />
              <div className="absolute bottom-2.5 right-3 flex items-center gap-2 rounded-full bg-white/80 backdrop-blur px-2 py-0.5 text-[10px] font-semibold text-[#b4a79e] border border-[#f1e8e0]">
                <span className="tabular-nums">{input.length}</span>
                <span className="text-[#d9c3b1]">字</span>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={clearAll}
              disabled={busy !== null || (!input && !draft)}
              className="inline-flex items-center gap-1 text-[12px] text-[#b4a79e] transition-colors hover:text-[#8a7972] disabled:opacity-30"
            >
              <Trash2 size={11} />
              重置
            </button>
            <Button
              onClick={run}
              disabled={busy !== null}
              className="min-w-[180px]"
            >
              {busy ? (
                <>
                  <Loader2 className="animate-spin" />
                  AI 思考中…
                </>
              ) : (
                <>
                  <Sparkles />
                  生成 · {meta.label}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 右侧情境说明 */}
        <aside className="space-y-3">
          <div
            className={cn(
              "rounded-2xl border p-4",
              meta.softBg,
              meta.ring
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl",
                  meta.iconBg
                )}
              >
                <meta.Icon
                  size={14}
                  strokeWidth={2}
                  className={meta.iconColor}
                />
              </div>
              <h3 className="text-card-title text-[#5b4a4a]">{meta.label}</h3>
            </div>
            <p className="mt-2.5 text-[12px] leading-relaxed text-[#6b574f]">
              {meta.desc}
            </p>
          </div>

          <div className="rounded-2xl border border-[#f1e8e0] bg-white p-4">
            <div className="flex items-center gap-1.5">
              <Info size={12} className="text-[#b4a79e]" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8a7972]">
                Tips
              </span>
            </div>
            <ul className="mt-2 space-y-1.5">
              {meta.tips.map((t, i) => (
                <li
                  key={i}
                  className="flex items-start gap-1.5 text-[12px] text-[#6b574f]"
                >
                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[#d9c3b1]" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* Draft 结果区 */}
      {draft && (
        <div className="border-t border-[#f1e8e0] bg-gradient-to-b from-[#fdfbf8] to-white px-6 py-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#e8efe3]">
                <CheckCircle2 size={13} className="text-[#70876a]" />
              </div>
              <div>
                <h4 className="text-card-title text-[#5b4a4a]">AI 生成结果</h4>
                <p className="text-[11px] text-[#b4a79e]">
                  请确认无误后采纳保存
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="inline-flex items-center gap-1 rounded-full border border-[#f1e8e0] bg-white px-3 py-1 text-[12px] text-[#8a7972] transition hover:border-[#e8d7c8] hover:text-[#5b4a4a]"
              >
                丢弃
              </button>
              <Button size="sm" onClick={adopt}>
                <CheckCircle2 />
                {draft.kind === "parse_email" ? "去创建事件" : "采纳并保存"}
              </Button>
            </div>
          </div>
          <DraftPreview draft={draft} />
        </div>
      )}
    </section>
  );
}

/* ────────────────────── Stage Selector ────────────────────── */

function StageSelector({
  value,
  onChange,
  events,
}: {
  value: string;
  onChange: (v: string) => void;
  events: EventRow[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-[#f1e8e0] bg-white px-3.5 py-2.5 pr-8 text-body text-[#5b4a4a] hover:border-[#e8d7c8] focus:border-[#e9b99a] focus:outline-none focus:ring-2 focus:ring-[#fbebde] transition-all"
      >
        <option value="">— 选择面试节点 —</option>
        {events.map((e) => (
          <option key={e.id} value={e.id}>
            {e.application.companyName}
            {e.application.roleName ? ` · ${e.application.roleName}` : ""} · {e.type}
            {e.time ? ` · ${new Date(e.time).toLocaleDateString("zh-CN")}` : ""}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-[#b4a79e]"
        viewBox="0 0 12 12"
        fill="none"
      >
        <path
          d="M3 4.5 L6 7.5 L9 4.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/* ────────────────────── QuickBtn ────────────────────── */

function QuickBtn({
  onClick,
  label,
  icon,
  disabled,
}: {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-[#b4a79e] transition hover:bg-[#fdfbf8] hover:text-[#8a6d5f] disabled:opacity-30 disabled:pointer-events-none"
    >
      {icon}
      {label}
    </button>
  );
}

/* ────────────────────── Draft Preview ────────────────────── */

function DraftPreview({ draft }: { draft: AnyDraft }) {
  if (draft.kind === "parse_email") {
    const d = draft.data;
    return (
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <FieldCard label="公司">{d.companyName ?? "—"}</FieldCard>
        <FieldCard label="部门">{d.departmentName ?? "—"}</FieldCard>
        <FieldCard label="岗位">{d.roleName ?? "—"}</FieldCard>
        <FieldCard label="节点类型">{d.stageType ?? "—"}</FieldCard>
        <FieldCard label="时间">{d.time ?? "—"}</FieldCard>
        <FieldCard label="会议链接">
          {d.meetingLink ? (
            <span className="truncate text-[#6b89a8]">{d.meetingLink}</span>
          ) : (
            "—"
          )}
        </FieldCard>
      </div>
    );
  }
  if (draft.kind === "parse_jd") {
    const d = draft.data;
    return (
      <div className="space-y-3">
        <FieldCard label="JD 摘要" fullWidth>
          {d.jdSummary}
        </FieldCard>
        <div className="rounded-xl border border-[#f1e8e0] bg-white p-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#b4a79e]">
            关键词
          </div>
          <div className="flex flex-wrap gap-1.5">
            {d.jdKeywords.map((k) => (
              <span
                key={k}
                className="inline-flex items-center rounded-full border border-[#ede7f5] bg-[#f7f4fb] px-2 py-0.5 text-[11px] font-medium text-[#8a6fa5]"
              >
                #{k}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-[#f1e8e0] bg-white p-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#b4a79e]">
            期望能力
          </div>
          <ul className="space-y-1.5">
            {d.expectedSkills.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-body text-[#5b4a4a]"
              >
                <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-[#e9b99a]" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  if (draft.kind === "generate_questions") {
    return (
      <ol className="space-y-2">
        {draft.data.questions.map((q, i) => (
          <li
            key={i}
            className="group flex items-start gap-3 rounded-xl border border-[#f1e8e0] bg-white p-3 transition-colors hover:border-[#f0e5b0]"
          >
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#fbf4d4] text-[11px] font-bold text-[#a08a3a]">
              {i + 1}
            </span>
            <span className="flex-1 text-body text-[#5b4a4a]">{q}</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(q);
                toast.success("已复制");
              }}
              className="opacity-0 transition-opacity group-hover:opacity-100 text-[#b4a79e] hover:text-[#8a7972]"
              aria-label="复制"
            >
              <Copy size={12} />
            </button>
          </li>
        ))}
      </ol>
    );
  }
  if (draft.kind === "review") {
    const d = draft.data;
    return (
      <div className="grid gap-3 md:grid-cols-3">
        <ReviewCard label="问题概述" tint="bg-[#ede7f5]" fg="text-[#8a6fa5]">
          {d.questionSummary}
        </ReviewCard>
        <ReviewCard label="回答概述" tint="bg-[#fbf4d4]" fg="text-[#a08a3a]">
          {d.answerSummary}
        </ReviewCard>
        <ReviewCard label="改进建议" tint="bg-[#e8efe3]" fg="text-[#70876a]">
          {d.suggestion}
        </ReviewCard>
      </div>
    );
  }
  return null;
}

function FieldCard({
  label,
  children,
  fullWidth,
}: {
  label: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#f1e8e0] bg-white p-3",
        fullWidth && "md:col-span-3"
      )}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[#b4a79e]">
        {label}
      </div>
      <div className="mt-1 text-body text-[#5b4a4a]">{children}</div>
    </div>
  );
}

function ReviewCard({
  label,
  tint,
  fg,
  children,
}: {
  label: string;
  tint: string;
  fg: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-xl p-3.5", tint)}>
      <div className={cn("text-[11px] font-bold uppercase tracking-wider", fg)}>
        {label}
      </div>
      <p className="mt-2 text-body leading-relaxed text-[#5b4a4a]">{children}</p>
    </div>
  );
}
