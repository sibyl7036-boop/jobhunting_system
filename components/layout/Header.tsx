/**
 * Header · 极简奶油马卡龙风 + 用户菜单
 * [2026-04-25 auth-v1] 右侧 🌿 头像替换为昵称首字 + 悬浮菜单（昵称/邮箱/退出登录）
 */
"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { format } from "date-fns";
import { LogOut, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TITLE_MAP: Record<
  string,
  { title: string; subtitle: string; tag: string }
> = {
  "/dashboard": {
    title: "Know your Offer Journey",
    subtitle: "把面试、投递、复盘都安排在一个温柔的小宇宙里。",
    tag: "Dashboard",
  },
  "/calendar": {
    title: "Every Day, One Step",
    subtitle: "从日期视角，看见未来的每一场面试。",
    tag: "Calendar",
  },
  "/companies": {
    title: "Companies on Your Radar",
    subtitle: "从公司视角追踪你的所有流程推进节奏。",
    tag: "Companies",
  },
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface MeResp {
  id: string;
  email: string;
  nickname: string;
}

/** 基于昵称取一个稳定低饱和色对 */
const AVATAR_TINTS: Array<{ bg: string; fg: string }> = [
  { bg: "linear-gradient(135deg,#fae6ea,#e9b1bf)", fg: "#c86d85" },
  { bg: "linear-gradient(135deg,#ede7f5,#beaed3)", fg: "#8a6fa5" },
  { bg: "linear-gradient(135deg,#fbebde,#e9b99a)", fg: "#b87a56" },
  { bg: "linear-gradient(135deg,#e8efe3,#b0c3a3)", fg: "#70876a" },
  { bg: "linear-gradient(135deg,#e6eef7,#8faecb)", fg: "#6b89a8" },
  { bg: "linear-gradient(135deg,#fbf4d4,#edd26e)", fg: "#a08a3a" },
];
function pickTint(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return AVATAR_TINTS[Math.abs(h) % AVATAR_TINTS.length];
}

export function Header() {
  const pathname = usePathname();
  const key = Object.keys(TITLE_MAP).find((p) => pathname.startsWith(p));
  const { title, subtitle, tag } = key
    ? TITLE_MAP[key]
    : { title: "Job Hunt Board", subtitle: "", tag: "Overview" };

  const now = new Date();
  const today = format(now, "yyyy.MM.dd");
  const weekday = WEEKDAYS[now.getDay()];

  const [me, setMe] = React.useState<MeResp | null>(null);

  React.useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) return;
        const data = (await res.json()) as MeResp;
        if (!abort) setMe(data);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      abort = true;
    };
  }, []);

  return (
    <header className="relative z-[60] flex items-start justify-between gap-6 pt-10 pb-8 animate-fade-in">
      <div className="flex flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#f1e3d4] bg-white/80 px-3 py-1 text-[11px] font-medium tracking-wide text-[#a88268] backdrop-blur">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#e9b99a]" />
          {tag}
        </span>

        <div>
          <h1 className="text-page-title">
            <span className="text-gradient-cream">{title}</span>
          </h1>
          {subtitle && (
            <p className="mt-2 max-w-[560px] text-body text-[#8a7972]">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        {/* 日期 pill */}
        <div className="flex items-center gap-2 rounded-full border border-[#f1e3d4] bg-white/80 px-4 py-2 backdrop-blur">
          <span className="text-[11px] font-medium tracking-wider text-[#b4a79e] uppercase">
            {weekday}
          </span>
          <span className="h-3 w-px bg-[#ead8c8]" />
          <span className="text-caption font-semibold tracking-wide text-[#6b574f]">
            {today}
          </span>
        </div>

        {/* 用户菜单 */}
        <UserMenu me={me} />
      </div>
    </header>
  );
}

function UserMenu({ me }: { me: MeResp | null }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      window.location.href = "/login";
    }
    // router 兜底
    void router;
  };

  const nickname = me?.nickname ?? "";
  const letter = (nickname || me?.email || "U").slice(0, 1).toUpperCase();
  const tint = pickTint(nickname || me?.email || "user");

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="用户菜单"
        className={cn(
          "group flex items-center gap-2 rounded-full border border-[#f1e3d4] bg-white/80 pr-3 pl-1 py-1 backdrop-blur",
          "transition-all duration-200 hover:border-[#e8d7c8] hover:shadow-soft",
          open && "border-[#e8d7c8] shadow-soft"
        )}
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold border border-white/60"
          style={{ background: tint.bg, color: tint.fg }}
          aria-hidden
        >
          {letter}
        </span>
        <span className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-[12px] font-semibold text-[#5b4a4a] max-w-[140px] truncate">
            {nickname || "未登录"}
          </span>
          {me?.email && (
            <span className="text-[9px] text-[#b4a79e] max-w-[140px] truncate">
              {me.email}
            </span>
          )}
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          className={cn(
            "text-[#b4a79e] transition-transform",
            open && "rotate-180"
          )}
          fill="none"
        >
          <path
            d="M2.5 3.75 5 6.25 7.5 3.75"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* 下拉 */}
      {open && (
        <div
          className={cn(
            "absolute right-0 top-full z-[70] mt-2 w-[260px] overflow-hidden rounded-2xl",
            "border border-[#f1e8e0] bg-white shadow-[0_12px_36px_rgba(199,165,149,0.14)]",
            "animate-fade-in"
          )}
        >
          {/* 用户信息 */}
          <div className="flex items-center gap-3 border-b border-[#f1e8e0] bg-gradient-to-br from-[#fdfbf8] to-white px-4 py-3.5">
            <span
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-[16px] font-bold border border-white/60 shadow-inner"
              style={{ background: tint.bg, color: tint.fg }}
            >
              {letter}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-body font-semibold text-[#5b4a4a]">
                {nickname || "未登录"}
              </div>
              {me?.email && (
                <div className="truncate text-[11px] text-[#b4a79e]">
                  {me.email}
                </div>
              )}
            </div>
          </div>

          {/* 菜单项 */}
          <div className="p-1.5">
            <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] text-[#8a7972]">
              <UserIcon size={13} className="text-[#b4a79e]" />
              <span className="flex-1">数据独立隔离</span>
              <span className="inline-flex items-center rounded-full bg-[#e8efe3] px-1.5 py-0.5 text-[9px] font-semibold text-[#70876a]">
                ✓ 已加密
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[12px] text-[#c86d85] transition-colors hover:bg-[#fae6ea] hover:text-[#b05771]"
            >
              <LogOut size={13} />
              <span className="flex-1 text-left">退出登录</span>
            </button>
          </div>

          <div className="border-t border-[#f1e8e0] bg-[#fdfbf8]/80 px-4 py-2 text-center text-[9px] tracking-wider text-[#b4a79e] uppercase">
            Job Hunt Board · v2.0
          </div>
        </div>
      )}
    </div>
  );
}
