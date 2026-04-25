"use client";

/**
 * components/dashboard/AIChatPanel.tsx · 求职助手聊天框（v2 前置主入口）
 *
 * 设计：
 *   - 类 ChatGPT 布局：上方会话、中部输入、底部 chips（能力组件）
 *   - 用户可以：
 *       a. 直接输入自然语言 → POST /api/ai/chat（通用对话）
 *       b. 先点一个 chip 激活能力 → 输入专属内容 → 走各自专用路由
 *   - 4 个能力：邮件解析 / JD 解析 / 面试题 / 面试复盘
 *       - 通用 chip 亮时，输入框上方出现"能力说明 + 关联岗位选择"
 *       - 解析结果以"AI 卡片"形式展示在会话里，并提供「去 Drawer 确认」按钮
 *
 * 为什么不用 Server Action：要做流式/多轮 + 不同能力路由分支，客户端更灵活
 */

import * as React from "react";
import useSWR from "swr";
import { toast } from "sonner";
import {
  SendHorizonal,
  Sparkles,
  Mail,
  FileSearch,
  ClipboardList,
  MessageSquareQuote,
  Loader2,
  Trash2,
  ChevronDown,
  CheckCircle2,
  ArrowUpRight,
  Zap,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { JobCombobox, type ComboAppOption } from "@/components/ui/JobCombobox";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { fetchJson } from "@/lib/fetcher";
import { useRouter } from "next/navigation";

type CapKey = "parse_email" | "parse_jd" | "generate_questions" | "review" | null;

interface CapMeta {
  key: Exclude<CapKey, null>;
  label: string;
  hint: string;
  Icon: typeof Mail;
  tone: string; // tailwind bg + text 色组
  ring: string;
  needsApp: boolean;
  needsStage: boolean;
  placeholder: string;
  tip: string;
}

const CAPS: CapMeta[] = [
  {
    key: "parse_email",
    label: "邮件解析",
    hint: "把面试邀请变成日程",
    Icon: Mail,
    tone: "bg-[#FAE6EA] text-[#c86d85]",
    ring: "ring-[#f3d9df]",
    needsApp: false,
    needsStage: false,
    placeholder:
      "粘贴面试邀请邮件 / 微信通知 / 短信全文，我会帮你抽取公司 · 岗位 · 时间 · 会议链接…",
    tip: "支持中英文混合；能识别「明天下午 2 点」这类相对时间",
  },
  {
    key: "parse_jd",
    label: "JD 解析",
    hint: "拆解岗位关键词与能力",
    Icon: FileSearch,
    tone: "bg-[#EDE7F5] text-[#8a6fa5]",
    ring: "ring-[#dfd2ee]",
    needsApp: true,
    needsStage: false,
    placeholder: "粘贴岗位 JD 原文（职责 / 要求 / 加分项都可以）…",
    tip: "先在下方选一个关联岗位；解析结果会写入该岗位的 JD 摘要 / 关键词 / 能力要求",
  },
  {
    key: "generate_questions",
    label: "面试题",
    hint: "预测可能的面试问题",
    Icon: ClipboardList,
    tone: "bg-[#FBF4D4] text-[#a08a3a]",
    ring: "ring-[#f0e5b0]",
    needsApp: true,
    needsStage: false,
    placeholder:
      "（可选）补充一些风格，例如：「偏 B 端 SaaS」「产品 + AI 优先」…不填也可以",
    tip: "需要关联岗位，AI 会结合该岗位的 JD 和简历文本",
  },
  {
    key: "review",
    label: "面试复盘",
    hint: "结构化输出你的复盘",
    Icon: MessageSquareQuote,
    tone: "bg-[#E8EFE3] text-[#70876a]",
    ring: "ring-[#d7e2cd]",
    needsApp: false,
    needsStage: true,
    placeholder:
      "粘贴面试的录音转写或笔记（问过什么问题 / 我怎么回答 / 现场氛围）…",
    tip: "需要关联具体一场面试；AI 会生成：面试问题概述 + 我的回答概述 + 简短建议",
  },
];

type MsgRole = "user" | "assistant" | "system";
interface ChatMsg {
  id: string;
  role: MsgRole;
  content: string;
  /** 标记这是否是"能力卡片"类型的特殊消息 */
  card?: {
    kind: Exclude<CapKey, null>;
    applicationId?: string;
    stageId?: string;
    payload: unknown; // 原始 draft
  };
}

/** 简单 uuid */
const rid = () => Math.random().toString(36).slice(2, 10);

/** 欢迎消息 */
const welcomeMsg: ChatMsg = {
  id: "welcome",
  role: "assistant",
  content:
    "你好呀～我是求职小助手 ☁️ 可以问我任何求职问题，也可以点下方的能力按钮解析邮件 / JD / 生成面试题 / 做复盘。",
};

const swrFetcher = <T,>(url: string) => fetchJson<T>(url);

/**
 * @param variant
 *   - "inline"（默认）：嵌入首页，紧凑高度，顶部提供"全屏"按钮
 *   - "modal"：作为全屏 Dialog 内容使用，撑满高度
 */
export function AIChatPanel({
  variant = "inline",
}: {
  variant?: "inline" | "modal";
} = {}) {
  const router = useRouter();
  const [messages, setMessages] = React.useState<ChatMsg[]>([welcomeMsg]);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [activeCap, setActiveCap] = React.useState<CapKey>(null);
  const [selectedAppId, setSelectedAppId] = React.useState<string>("");
  const [selectedStageId, setSelectedStageId] = React.useState<string>("");
  // 仅 inline 模式使用
  const [fullscreen, setFullscreen] = React.useState(false);

  // 滚动到底部
  const scrollRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  // 岗位列表（能力需要时用）
  const { data: appsRaw } = useSWR<
    Array<{
      id: string;
      companyName: string;
      departmentName: string;
      roleName: string;
      currentStatus: string;
    }>
  >("/api/applications", swrFetcher);
  const apps: ComboAppOption[] = (appsRaw ?? []).map((a) => ({
    id: a.id,
    companyName: a.companyName,
    departmentName: a.departmentName,
    roleName: a.roleName,
    currentStatus: a.currentStatus,
  }));

  // stage 列表（复盘用：该用户所有"有时间"的 stage）
  const { data: stagesData } = useSWR<
    Array<{
      id: string;
      applicationId: string;
      type: string;
      timeIso: string | null;
      companyName: string;
      roleName: string;
    }>
  >("/api/stages", swrFetcher);
  const stages = stagesData ?? [];

  const capMeta = CAPS.find((c) => c.key === activeCap) ?? null;

  // ── 发送 ──
  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    if (capMeta?.needsApp && !selectedAppId) {
      toast.error("请先在下方选择关联岗位");
      return;
    }
    if (capMeta?.needsStage && !selectedStageId) {
      toast.error("请先选择一场要复盘的面试");
      return;
    }

    const userMsg: ChatMsg = { id: rid(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      if (!activeCap) {
        // 通用对话：走 /api/ai/chat
        const history = [...messages, userMsg].filter((m) => m.id !== "welcome");
        const resp = await fetchJson<{ reply: string }>("/api/ai/chat", {
          method: "POST",
          body: JSON.stringify({
            messages: history.map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        setMessages((prev) => [
          ...prev,
          { id: rid(), role: "assistant", content: resp.reply },
        ]);
      } else {
        await runCapability(activeCap, text);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI 调用失败";
      setMessages((prev) => [
        ...prev,
        {
          id: rid(),
          role: "assistant",
          content: `⚠️ ${msg}`,
        },
      ]);
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  // ── 能力分支 ──
  async function runCapability(cap: Exclude<CapKey, null>, text: string) {
    if (cap === "parse_email") {
      const r = await fetchJson<{ draft: Record<string, unknown>; runId: string }>(
        "/api/ai/parse-email",
        { method: "POST", body: JSON.stringify({ inputText: text }) }
      );
      setMessages((prev) => [
        ...prev,
        {
          id: rid(),
          role: "assistant",
          content: "已帮你把邮件抽成事件草稿 👇 确认后会加入你的日程。",
          card: { kind: "parse_email", payload: r.draft },
        },
      ]);
      return;
    }
    if (cap === "parse_jd") {
      const r = await fetchJson<{ draft: Record<string, unknown>; runId: string }>(
        "/api/ai/parse-jd",
        { method: "POST", body: JSON.stringify({ jdText: text }) }
      );
      setMessages((prev) => [
        ...prev,
        {
          id: rid(),
          role: "assistant",
          content: "JD 拆解完成 👇",
          card: {
            kind: "parse_jd",
            applicationId: selectedAppId,
            payload: r.draft,
          },
        },
      ]);
      return;
    }
    if (cap === "generate_questions") {
      const r = await fetchJson<{
        draft: { questions: string[] };
        runId: string;
      }>("/api/ai/generate-questions", {
        method: "POST",
        body: JSON.stringify({
          applicationId: selectedAppId,
          customStyle: text || undefined,
        }),
      });
      setMessages((prev) => [
        ...prev,
        {
          id: rid(),
          role: "assistant",
          content: `为你生成了 ${r.draft.questions.length} 道面试题 👇`,
          card: {
            kind: "generate_questions",
            applicationId: selectedAppId,
            payload: r.draft,
          },
        },
      ]);
      return;
    }
    if (cap === "review") {
      const r = await fetchJson<{ draft: Record<string, unknown>; runId: string }>(
        "/api/ai/review",
        {
          method: "POST",
          body: JSON.stringify({
            stageId: selectedStageId,
            transcriptText: text,
          }),
        }
      );
      setMessages((prev) => [
        ...prev,
        {
          id: rid(),
          role: "assistant",
          content: "复盘整理好啦 👇",
          card: {
            kind: "review",
            stageId: selectedStageId,
            payload: r.draft,
          },
        },
      ]);
      return;
    }
  }

  // ── 清空 ──
  const clearChat = () => {
    setMessages([welcomeMsg]);
    setActiveCap(null);
    setInput("");
    setSelectedAppId("");
    setSelectedStageId("");
  };

  return (
    <>
    <section
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-[#f1e8e0]",
        "bg-gradient-to-br from-white via-[#fdfaf7] to-[#fcf3ef]",
        "shadow-[0_1px_2px_rgba(199,165,149,0.04),0_12px_30px_rgba(199,165,149,0.08)]",
        variant === "modal" && "flex h-full flex-col rounded-none border-0 shadow-none"
      )}
    >
      {/* 顶部栏 */}
      <div className="flex items-center justify-between border-b border-[#f3e8dd] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fae6ea] to-[#ede7f5] text-[#b8775b]">
            <Sparkles size={18} strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight text-[#5c463a]">
              求职小助手
            </h2>
            <p className="text-[12px] text-[#a69890]">
              {variant === "modal"
                ? "全屏专注模式 · 通用对话 + 4 个专项能力"
                : "通用对话 + 4 个专项能力"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {variant === "inline" && (
            <button
              type="button"
              onClick={() => setFullscreen(true)}
              className="flex items-center gap-1 rounded-full border border-[#f1e8e0] bg-white/60 px-3 py-1.5 text-[12px] text-[#a69890] transition hover:border-[#e9b99a] hover:bg-[#fbebde]/50 hover:text-[#8a6d5f]"
              title="在全屏弹窗中使用（内容更大，更好操作）"
            >
              <Maximize2 size={12} />
              展开
            </button>
          )}
          <button
            type="button"
            onClick={clearChat}
            className="flex items-center gap-1 rounded-full border border-[#f1e8e0] bg-white/60 px-3 py-1.5 text-[12px] text-[#a69890] transition hover:bg-white hover:text-[#8a6d5f]"
          >
            <Trash2 size={13} />
            清空
          </button>
        </div>
      </div>

      {/* 消息流 */}
      <div
        ref={scrollRef}
        className={cn(
          "overflow-y-auto px-6 py-5",
          variant === "modal"
            ? "flex-1 min-h-0"
            : "h-[240px] md:h-[280px]"
        )}
      >
        <div className="flex flex-col gap-4">
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              msg={m}
              apps={apps}
              onDone={() => router.refresh()}
            />
          ))}
          {sending && (
            <div className="flex items-center gap-2 self-start rounded-2xl bg-[#fbebde]/60 px-4 py-2.5 text-[13px] text-[#8a6d5f]">
              <Loader2 size={14} className="animate-spin" />
              <span>小助手思考中…</span>
            </div>
          )}
        </div>
      </div>

      {/* 能力条 · 动态上下文区 */}
      {capMeta && (
        <div
          className={cn(
            "relative z-20 mx-4 mb-3 flex flex-col gap-3 rounded-2xl border border-[#f3e8dd] bg-white p-4",
            "shadow-[0_6px_18px_rgba(199,165,149,0.08)]",
            "animate-[fadeInUp_.25s_ease-out]"
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-xl",
                capMeta.tone
              )}
            >
              <capMeta.Icon size={14} />
            </span>
            <span className="text-[13px] font-semibold text-[#5c463a]">
              {capMeta.label}
            </span>
            <span className="text-[12px] text-[#a69890]">· {capMeta.hint}</span>
            <button
              type="button"
              onClick={() => {
                setActiveCap(null);
                setSelectedAppId("");
                setSelectedStageId("");
              }}
              className="ml-auto flex h-6 w-6 items-center justify-center rounded-full text-[#b4a79e] hover:bg-[#fdf2e8] hover:text-[#8a6d5f]"
              aria-label="取消能力"
            >
              <X size={13} />
            </button>
          </div>
          <p className="text-[12px] leading-relaxed text-[#8a7972]">
            {capMeta.tip}
          </p>
          {capMeta.needsApp && (
            <JobCombobox
              value={selectedAppId}
              onChange={setSelectedAppId}
              options={apps}
              placeholder="选择关联岗位…"
            />
          )}
          {capMeta.needsStage && (
            <StagePicker
              stages={stages}
              value={selectedStageId}
              onChange={setSelectedStageId}
            />
          )}
        </div>
      )}

      {/* 能力 chips */}
      <div className="flex flex-wrap items-center gap-2 px-4 pb-2 pt-1">
        <span className="text-[11px] font-medium text-[#b4a79e]">试试这些能力：</span>
        {CAPS.map((c) => {
          const on = activeCap === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => {
                setActiveCap((prev) => (prev === c.key ? null : c.key));
                setInput("");
              }}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition-all",
                on
                  ? `${c.tone} border-transparent shadow-sm`
                  : "border-[#f1e8e0] bg-white/60 text-[#8a7972] hover:bg-white hover:text-[#5c463a]"
              )}
              title={c.hint}
            >
              <c.Icon size={12} />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* 输入区 */}
      <div className="border-t border-[#f3e8dd] bg-white/70 px-4 py-3 backdrop-blur">
        <div className="flex items-end gap-2 rounded-2xl border border-[#f1e8e0] bg-white px-3 py-2 focus-within:border-[#e9b99a] focus-within:ring-2 focus-within:ring-[#fbebde]">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={
              capMeta?.placeholder ??
              "问我任何求职问题… 按 Enter 发送，Shift + Enter 换行"
            }
            rows={2}
            className="flex-1 resize-none bg-transparent text-[14px] text-[#5c463a] placeholder:text-[#c7b5a8] focus:outline-none"
            disabled={sending}
          />
          <Button
            type="button"
            size="sm"
            onClick={send}
            disabled={sending || !input.trim()}
            className={cn(
              "h-9 shrink-0 rounded-xl bg-gradient-to-br from-[#e9b99a] to-[#c86d85] px-3 text-white shadow-sm hover:from-[#e0a988] hover:to-[#bd6078]"
            )}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizonal className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="mt-1.5 flex items-center justify-between px-1 text-[11px] text-[#b4a79e]">
          <span>
            {activeCap ? `能力模式：${capMeta?.label}` : "通用对话模式"}
          </span>
          <span>{input.length} 字</span>
        </div>
      </div>
    </section>

    {/* 全屏弹窗（仅 inline 模式） */}
    {variant === "inline" && (
      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent
          className={cn(
            "h-[90vh] w-[92vw] max-w-[1100px] overflow-hidden p-0",
            "rounded-[28px] border border-[#f1e4d8] bg-white/95",
            "shadow-[0_24px_60px_rgba(199,165,149,0.25)]"
          )}
        >
          <DialogTitle className="sr-only">求职小助手 · 全屏</DialogTitle>
          <DialogDescription className="sr-only">
            在全屏弹窗中与求职小助手对话
          </DialogDescription>
          <div className="flex h-full flex-col">
            <AIChatPanel variant="modal" />
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────

function MessageBubble({
  msg,
  apps,
  onDone,
}: {
  msg: ChatMsg;
  apps: ComboAppOption[];
  onDone: () => void;
}) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] rounded-2xl rounded-br-md bg-gradient-to-br from-[#fbebde] to-[#fae6ea] px-4 py-2.5 text-[13px] leading-relaxed text-[#5c463a] shadow-sm">
          {msg.content}
        </div>
      </div>
    );
  }

  // assistant / system
  return (
    <div className="flex justify-start gap-2">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#fae6ea] to-[#ede7f5] text-[#b8775b]">
        <Sparkles size={13} />
      </div>
      <div className="max-w-[82%] space-y-2">
        <div className="rounded-2xl rounded-bl-md border border-[#f3e8dd] bg-white/80 px-4 py-2.5 text-[13px] leading-relaxed text-[#5c463a] shadow-sm">
          <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
        </div>
        {msg.card && <AICard card={msg.card} apps={apps} onDone={onDone} />}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// AI 能力结果卡片
// ──────────────────────────────────────────────────────────────────────

function AICard({
  card,
  apps,
  onDone,
}: {
  card: NonNullable<ChatMsg["card"]>;
  apps: ComboAppOption[];
  onDone: () => void;
}) {
  const [saving, setSaving] = React.useState(false);

  if (card.kind === "parse_email") {
    const d = card.payload as {
      companyName?: string;
      departmentName?: string;
      roleName?: string;
      stageType?: string;
      time?: string;
      meetingLink?: string;
    };
    const save = async () => {
      setSaving(true);
      try {
        // 1. 创建 Application
        const app = await fetchJson<{ id: string }>("/api/applications", {
          method: "POST",
          body: JSON.stringify({
            companyName: d.companyName ?? "未知",
            departmentName: d.departmentName ?? "",
            roleName: d.roleName ?? "未知岗位",
            currentStatus: d.stageType ?? "已投递",
          }),
        });
        // 2. 创建 Stage
        await fetchJson("/api/stages", {
          method: "POST",
          body: JSON.stringify({
            applicationId: app.id,
            type: d.stageType ?? "一面",
            time: d.time
              ? (() => {
                  const dd = new Date(d.time);
                  return Number.isNaN(dd.getTime())
                    ? null
                    : dd.toISOString();
                })()
              : null,
            meetingLink: d.meetingLink ?? null,
          }),
        });
        toast.success("已加入日程 ✨");
        onDone();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "保存失败");
      } finally {
        setSaving(false);
      }
    };
    return (
      <div className="rounded-2xl border border-[#f3d9df] bg-[#fdf7f6] p-3">
        <div className="mb-2 flex items-center gap-1 text-[12px] font-semibold text-[#c86d85]">
          <Mail size={12} /> 抽取结果
        </div>
        <dl className="grid grid-cols-2 gap-2 text-[12px]">
          <KV k="公司" v={d.companyName} />
          <KV k="部门" v={d.departmentName} />
          <KV k="岗位" v={d.roleName} />
          <KV k="阶段" v={d.stageType} />
          <KV k="时间" v={d.time} />
          <KV k="链接" v={d.meetingLink} clamp />
        </dl>
        <div className="mt-3 flex justify-end">
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 size={12} />}
            确认加入日程
          </Button>
        </div>
      </div>
    );
  }

  if (card.kind === "parse_jd") {
    const d = card.payload as {
      jdSummary?: string;
      jdKeywords?: string[];
      expectedSkills?: string[];
    };
    const appId = card.applicationId;
    const appName = apps.find((a) => a.id === appId);
    const save = async () => {
      if (!appId) {
        toast.error("未关联岗位，无法保存");
        return;
      }
      setSaving(true);
      try {
        await fetchJson(`/api/applications/${appId}`, {
          method: "PATCH",
          body: JSON.stringify({
            jdSummary: d.jdSummary ?? "",
            jdKeywords: d.jdKeywords ?? [],
            expectedSkills: d.expectedSkills ?? [],
          }),
        });
        toast.success("已写入岗位档案 ✨");
        onDone();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "保存失败");
      } finally {
        setSaving(false);
      }
    };
    return (
      <div className="rounded-2xl border border-[#dfd2ee] bg-[#faf8fd] p-3">
        <div className="mb-2 flex items-center gap-1 text-[12px] font-semibold text-[#8a6fa5]">
          <FileSearch size={12} /> JD 解析
          {appName && (
            <span className="text-[11px] font-normal text-[#a69890]">
              · {appName.companyName} · {appName.roleName}
            </span>
          )}
        </div>
        {d.jdSummary && (
          <p className="mb-2 text-[12px] leading-relaxed text-[#5c463a]">
            {d.jdSummary}
          </p>
        )}
        {d.jdKeywords && d.jdKeywords.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {d.jdKeywords.slice(0, 12).map((k) => (
              <span
                key={k}
                className="rounded-full bg-[#ede7f5] px-2 py-0.5 text-[11px] text-[#8a6fa5]"
              >
                {k}
              </span>
            ))}
          </div>
        )}
        {d.expectedSkills && d.expectedSkills.length > 0 && (
          <ul className="mb-2 ml-4 list-disc text-[12px] text-[#5c463a]">
            {d.expectedSkills.slice(0, 6).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        )}
        <div className="flex justify-end">
          <Button size="sm" onClick={save} disabled={saving || !appId}>
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 size={12} />}
            写入岗位档案
          </Button>
        </div>
      </div>
    );
  }

  if (card.kind === "generate_questions") {
    const d = card.payload as { questions: string[] };
    const appId = card.applicationId;
    return (
      <div className="rounded-2xl border border-[#f0e5b0] bg-[#fdfbee] p-3">
        <div className="mb-2 flex items-center gap-1 text-[12px] font-semibold text-[#a08a3a]">
          <ClipboardList size={12} /> 面试题 ({d.questions?.length ?? 0})
        </div>
        <ol className="ml-4 list-decimal space-y-1 text-[12px] text-[#5c463a]">
          {(d.questions ?? []).map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ol>
        {appId && (
          <div className="mt-3 flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                setSaving(true);
                try {
                  await fetchJson(`/api/applications/${appId}`, {
                    method: "PATCH",
                    body: JSON.stringify({
                      interviewQuestions: d.questions ?? [],
                    }),
                  });
                  toast.success("已收藏到岗位题库");
                  onDone();
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "保存失败");
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
            >
              收藏到岗位题库
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (card.kind === "review") {
    const d = card.payload as {
      questionSummary?: string;
      answerSummary?: string;
      suggestion?: string;
    };
    const stageId = card.stageId;
    const save = async () => {
      if (!stageId) return;
      setSaving(true);
      try {
        await fetchJson(`/api/stages/${stageId}`, {
          method: "PATCH",
          body: JSON.stringify({
            reviewQuestionSummary: d.questionSummary ?? "",
            reviewAnswerSummary: d.answerSummary ?? "",
            reviewSuggestion: d.suggestion ?? "",
          }),
        });
        toast.success("复盘已保存到面试节点");
        onDone();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "保存失败");
      } finally {
        setSaving(false);
      }
    };
    return (
      <div className="rounded-2xl border border-[#d7e2cd] bg-[#f4f7f0] p-3">
        <div className="mb-2 flex items-center gap-1 text-[12px] font-semibold text-[#70876a]">
          <MessageSquareQuote size={12} /> 复盘整理
        </div>
        <Labeled label="问题概述" text={d.questionSummary} />
        <Labeled label="回答复述" text={d.answerSummary} />
        <Labeled label="建议" text={d.suggestion} />
        <div className="mt-3 flex justify-end">
          <Button size="sm" onClick={save} disabled={saving || !stageId}>
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 size={12} />}
            保存到面试节点
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

function KV({ k, v, clamp }: { k: string; v?: string; clamp?: boolean }) {
  return (
    <div className="flex items-start gap-1">
      <span className="min-w-[2.5em] text-[#a69890]">{k}</span>
      <span
        className={cn(
          "flex-1 text-[#5c463a]",
          clamp && "overflow-hidden text-ellipsis whitespace-nowrap"
        )}
        title={v}
      >
        {v || "—"}
      </span>
    </div>
  );
}
function Labeled({ label, text }: { label: string; text?: string }) {
  if (!text) return null;
  return (
    <div className="mb-1.5">
      <div className="text-[11px] font-semibold text-[#70876a]">{label}</div>
      <div className="text-[12px] leading-relaxed text-[#5c463a]">{text}</div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 面试场次选择器（复盘用）
// ──────────────────────────────────────────────────────────────────────

function StagePicker({
  stages,
  value,
  onChange,
}: {
  stages: Array<{
    id: string;
    type: string;
    timeIso: string | null;
    companyName: string;
    roleName: string;
  }>;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const picked = stages.find((s) => s.id === value);
  const fmt = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleString("zh-CN", {
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "未定时间";
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-[#f1e8e0] bg-white px-3 py-2 text-[12px] text-[#5c463a] hover:border-[#e9b99a]"
      >
        <span className={cn(!picked && "text-[#c7b5a8]")}>
          {picked
            ? `${picked.companyName} · ${picked.type} · ${fmt(picked.timeIso)}`
            : "选择一场要复盘的面试…"}
        </span>
        <ChevronDown size={14} className={cn("transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-10 max-h-52 overflow-auto rounded-xl border border-[#f1e8e0] bg-white p-1 shadow-lg">
          {stages.length === 0 ? (
            <div className="px-3 py-4 text-center text-[12px] text-[#a69890]">
              还没有面试节点
            </div>
          ) : (
            stages.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  onChange(s.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[12px] transition hover:bg-[#fbebde]/50",
                  value === s.id && "bg-[#fbebde]/60"
                )}
              >
                <span className="truncate text-[#5c463a]">
                  {s.companyName} · {s.roleName} · {s.type}
                </span>
                <span className="ml-2 shrink-0 text-[11px] text-[#a69890]">
                  {fmt(s.timeIso)}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
