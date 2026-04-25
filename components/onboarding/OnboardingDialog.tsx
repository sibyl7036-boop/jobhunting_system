/**
 * OnboardingDialog · 新手引导教程
 * ─────────────────────────────────────────
 * 以步骤式弹窗形式，快速带领用户掌握整个求职看板系统的核心玩法。
 * 设计要点：
 *  - 马卡龙奶油色系，与整站视觉一致
 *  - 6 步递进：欢迎 → 首页 → 日历 → 公司流程 → 侧边详情 → AI 小助手
 *  - 每步左侧文案，右侧用 emoji + 渐变色卡做图示，避免引入外部图片
 *  - 键盘左右方向键支持翻页，ESC 关闭
 *  - "不再提示" 存入 localStorage
 */
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
  LayoutDashboard,
  CalendarDays,
  Building2,
  PanelRightOpen,
  Bot,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

type OnboardingStep = {
  key: string;
  badge: string;
  title: string;
  subtitle: string;
  bullets: string[];
  visual: React.ReactNode;
  accent: string; // tailwind-friendly bg gradient class for illustration card
};

const STORAGE_KEY = "jobboard.onboarding.dismissed";

/* ----------------------------- 插图（右侧卡片） ----------------------------- */

function Illo({
  icon: Icon,
  label,
  gradient,
}: {
  icon: LucideIcon;
  label: string;
  gradient: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-[220px] w-full items-center justify-center overflow-hidden rounded-[24px] border border-[#f1e4d8]",
        gradient
      )}
    >
      {/* 背景柔光斑点 */}
      <div
        aria-hidden
        className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-white/40 blur-2xl"
      />
      <div
        aria-hidden
        className="absolute -right-6 bottom-0 h-28 w-28 rounded-full bg-white/30 blur-2xl"
      />
      {/* 图标气泡 */}
      <div className="relative flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/70 bg-white/70 shadow-[0_8px_24px_rgba(199,165,149,0.15)] backdrop-blur-md">
          <Icon size={28} strokeWidth={1.7} className="text-[#a56a4a]" />
        </div>
        <span className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-[11px] font-medium tracking-wide text-[#8a6d5f] backdrop-blur-md">
          {label}
        </span>
      </div>
    </div>
  );
}

function WelcomeIllo() {
  return (
    <div className="relative flex h-[220px] w-full items-center justify-center overflow-hidden rounded-[24px] border border-[#f1e4d8] bg-gradient-to-br from-[#fff4ea] via-[#fdeee8] to-[#f7e3ea]">
      <div aria-hidden className="absolute inset-0 opacity-60">
        <div className="absolute left-6 top-8 h-14 w-14 rounded-2xl border border-white/70 bg-white/60" />
        <div className="absolute right-10 top-4 h-10 w-10 rounded-full border border-white/70 bg-white/70" />
        <div className="absolute bottom-6 left-12 h-8 w-24 rounded-full border border-white/70 bg-white/60" />
        <div className="absolute bottom-10 right-6 h-12 w-12 rounded-2xl border border-white/70 bg-white/70" />
      </div>
      <div className="relative flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#fbebde] to-[#fae6ea] shadow-[0_8px_24px_rgba(199,165,149,0.2)]">
          <Sparkles size={28} className="text-[#c89070]" strokeWidth={1.7} />
        </div>
        <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-medium text-[#8a6d5f] backdrop-blur-md">
          Welcome aboard 🌸
        </span>
      </div>
    </div>
  );
}

/* ----------------------------- 步骤定义 ----------------------------- */

const STEPS: OnboardingStep[] = [
  {
    key: "welcome",
    badge: "欢迎",
    title: "你好呀，欢迎来到求职看板 🌷",
    subtitle:
      "这是一个专门为求职季设计的小工具，帮你把面试、笔试、Offer 沟通、简历、大厂流程集中管理，再配一个 AI 小助手帮你提效。",
    bullets: [
      "3 大视图：首页看板 · 日历 · 公司流程",
      "1 个侧边详情抽屉管理每场面试",
      "1 个 AI 小助手解析邮件 / JD / 出题 / 复盘",
    ],
    visual: <WelcomeIllo />,
    accent: "",
  },
  {
    key: "dashboard",
    badge: "第 1 站",
    title: "首页｜一眼看到近 7 天所有事件",
    subtitle:
      "首页是你的求职驾驶舱。近 7 天的面试 / 笔试 / 测评 / HR 面 / Offer 沟通都会出现在这里，按日期排序，今日事项与明日事项一目了然。",
    bullets: [
      "点击任意一行 → 右侧抽屉打开详情",
      "右上角 ➕ 手动新增事件",
      "状态列可直接切换「待参加 / 已完成 / 已通过 / 未通过」",
    ],
    visual: (
      <Illo
        icon={LayoutDashboard}
        label="/dashboard"
        gradient="bg-gradient-to-br from-[#fff4ea] to-[#fbe4d6]"
      />
    ),
    accent: "",
  },
  {
    key: "calendar",
    badge: "第 2 站",
    title: "日历｜按日期维度查看所有流程",
    subtitle:
      "同一份事件数据的日期视图。月历上每一天的事件色块一目了然，鼠标移上去会高亮，点进去就能查看与编辑。",
    bullets: [
      "每个日期格右上角 ➕ 可快速添加事件",
      "点击事件色块 → 侧边抽屉查看 / 编辑 / 删除",
      "支持跨月切换，查看历史或未来流程",
    ],
    visual: (
      <Illo
        icon={CalendarDays}
        label="/calendar"
        gradient="bg-gradient-to-br from-[#fde9ec] to-[#f7dfe7]"
      />
    ),
    accent: "",
  },
  {
    key: "companies",
    badge: "第 3 站",
    title: "公司｜以公司为轴看流程推进",
    subtitle:
      "按公司维度展示你的所有岗位申请，一行一个岗位，右侧是完整的流程节点：投递 → 笔试 → 一面 → ... → Offer / 挂了。",
    bullets: [
      "预置 10 家大厂，可自行添加 / 删除公司",
      "点击流程节点 → 抽屉查看该阶段详情",
      "点击整行岗位 → 新建下一个流程节点",
    ],
    visual: (
      <Illo
        icon={Building2}
        label="/companies"
        gradient="bg-gradient-to-br from-[#f4ece1] to-[#eadccb]"
      />
    ),
    accent: "",
  },
  {
    key: "drawer",
    badge: "第 4 站",
    title: "右侧抽屉｜每场面试的专属档案",
    subtitle:
      "点击任意一行事件 / 节点，右侧会滑出详情抽屉。基础信息、JD、关联简历、AI 面试题、面试复盘、随手记全都在这里。",
    bullets: [
      "4 个 Tab：基础 · 面试题 · 复盘 · 随手记",
      "所有字段都可手动编辑，点保存落库",
      "一键切换关联简历，并在线预览 PDF",
    ],
    visual: (
      <Illo
        icon={PanelRightOpen}
        label="Drawer"
        gradient="bg-gradient-to-br from-[#fcefe4] to-[#f4dfd0]"
      />
    ),
    accent: "",
  },
  {
    key: "ai",
    badge: "第 5 站",
    title: "求职小助手｜AI 帮你把重复的事做完",
    subtitle:
      "页面右下角的 AI 聊天框可以自然语言对话。贴上面试邮件它帮你建日程、粘上 JD 它帮你抽能力画像，面试前出题、面试后复盘都一句话搞定。",
    bullets: [
      "💌 解析面试邮件 → 自动生成流程事件（需确认后落库）",
      "📄 解析 JD → 抽取关键词 / 能力要求",
      "🧠 生成面试题 & 📝 AI 复盘记录在抽屉里，可继续编辑",
    ],
    visual: (
      <Illo
        icon={Bot}
        label="AI Copilot"
        gradient="bg-gradient-to-br from-[#f7e8ef] to-[#ecd8e3]"
      />
    ),
    accent: "",
  },
];

/* ----------------------------- 主组件 ----------------------------- */

export function OnboardingDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [index, setIndex] = React.useState(0);
  const total = STEPS.length;
  const step = STEPS[index];
  const isFirst = index === 0;
  const isLast = index === total - 1;

  // 打开时重置到第 1 页
  React.useEffect(() => {
    if (open) setIndex(0);
  }, [open]);

  // 键盘方向键翻页
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && !isLast) setIndex((i) => i + 1);
      if (e.key === "ArrowLeft" && !isFirst) setIndex((i) => i - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, isFirst, isLast]);

  const handleDone = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-[880px] overflow-hidden border-[#f1e4d8] bg-white/95 p-0",
          "rounded-[28px] shadow-[0_24px_60px_rgba(199,165,149,0.25)]"
        )}
      >
        <DialogTitle className="sr-only">新手引导</DialogTitle>
        <DialogDescription className="sr-only">
          带你快速了解求职看板系统的核心玩法
        </DialogDescription>

        {/* 顶部渐变装饰条 */}
        <div
          aria-hidden
          className="h-1.5 w-full bg-gradient-to-r from-[#fbebde] via-[#f7dfe7] to-[#ecd8e3]"
        />

        <div className="grid grid-cols-1 gap-0 md:grid-cols-[1.1fr_1fr]">
          {/* 左侧：文字区 */}
          <div className="flex flex-col p-8 md:p-10">
            {/* Badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-[#f3e2d6] bg-[#fbebde]/60 px-3 py-1 text-[11px] font-medium tracking-wide text-[#a56a4a]">
                <Sparkles size={12} className="text-[#c89070]" />
                {step.badge}
              </span>
              <span className="text-[11px] text-[#b4a79e]">
                {index + 1} / {total}
              </span>
            </div>

            {/* Title */}
            <h2 className="mt-4 text-[22px] font-semibold leading-snug tracking-tight text-[#5c463a]">
              {step.title}
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-[#8a7566]">
              {step.subtitle}
            </p>

            {/* Bullets */}
            <ul className="mt-5 space-y-2.5">
              {step.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-[5px] flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#fbebde] text-[#a56a4a]">
                    <Check size={10} strokeWidth={3} />
                  </span>
                  <span className="text-[13px] leading-relaxed text-[#6b5446]">
                    {b}
                  </span>
                </li>
              ))}
            </ul>

            {/* Spacer */}
            <div className="flex-1" />

            {/* 进度点 */}
            <div className="mt-8 flex items-center justify-center gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`跳到第 ${i + 1} 步`}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === index
                      ? "w-6 bg-[#c89070]"
                      : "w-1.5 bg-[#e8d7c8] hover:bg-[#d6bfae]"
                  )}
                />
              ))}
            </div>

            {/* 按钮区 */}
            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleDone(true)}
                className="text-[12px] text-[#b4a79e] transition-colors hover:text-[#8a7566]"
              >
                跳过引导，不再提示
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isFirst}
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  className={cn(
                    "flex h-9 items-center gap-1 rounded-full border px-4 text-[12.5px] transition-all",
                    isFirst
                      ? "cursor-not-allowed border-[#f1e8e0] text-[#d6c8bd]"
                      : "border-[#ebdfd3] text-[#8a6d5f] hover:bg-[#faf4ee]"
                  )}
                >
                  <ChevronLeft size={14} />
                  上一步
                </button>

                {isLast ? (
                  <button
                    type="button"
                    onClick={() => handleDone(true)}
                    className="flex h-9 items-center gap-1 rounded-full bg-gradient-to-r from-[#d9a688] to-[#c89070] px-5 text-[12.5px] font-medium text-white shadow-[0_4px_14px_rgba(200,144,112,0.35)] transition-transform hover:-translate-y-[1px]"
                  >
                    开启求职之旅
                    <Sparkles size={13} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
                    className="flex h-9 items-center gap-1 rounded-full bg-[#c89070] px-4 text-[12.5px] font-medium text-white shadow-[0_4px_14px_rgba(200,144,112,0.3)] transition-transform hover:-translate-y-[1px]"
                  >
                    下一步
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：可视化区 */}
          <div className="relative bg-gradient-to-br from-[#faf4ee] to-[#f6ebe0] p-8 md:p-10">
            <div className="flex h-full flex-col">
              <div className="flex-1">{step.visual}</div>

              {/* 步骤内容小卡片 */}
              <div className="mt-5 rounded-2xl border border-[#f1e4d8] bg-white/70 p-4 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c89070]" />
                  <span className="text-[11px] font-medium tracking-wide text-[#a56a4a]">
                    小贴士
                  </span>
                </div>
                <p className="mt-1.5 text-[12px] leading-relaxed text-[#8a7566]">
                  {index === 0 &&
                    "随时点击左下角 ✨ 按钮可以重新查看本教程。"}
                  {index === 1 &&
                    "状态切换后，会自动同步到日历页和公司流程页。"}
                  {index === 2 &&
                    "日历格右上角 ➕ 只在 hover 时出现，点格子不会误开抽屉。"}
                  {index === 3 &&
                    "节点颜色代表状态：深色=已通过，浅色=未开始，灰色=挂了。"}
                  {index === 4 &&
                    "抽屉所有字段可编辑，改完点右下角保存即刻生效。"}
                  {index === 5 &&
                    "AI 结果先给你草稿，确认无误再落库，不会乱动数据。"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- 辅助 hook ----------------------------- */

/** 读取是否已"不再提示"，用于首次访问自动弹出 */
export function hasDismissedOnboarding(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return true;
  }
}
