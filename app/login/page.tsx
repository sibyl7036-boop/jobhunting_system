/**
 * /login 页面（登录 / 注册 · 马卡龙奶油风）
 *
 * 左：品牌文案 + 核心能力 4 大卡片（AI 求职小助手 · 多视图看板 · 周便签 · 数据隔离）
 * 右：卡片式表单（Tab 切换登录/注册）
 *
 * 设计取向：
 *   - 主色：奶油 #fdf9f3 + 低饱和马卡龙（粉 / 米 / 紫 / 薄荷绿）
 *   - 卡片：玻璃拟态（bg-white/70 + backdrop-blur），hover 微抬升
 *   - 卡片内"能力标签"采用 pill + 小圆点装饰，避免单调
 */

import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fdf9f3]">
      {/* 背景装饰色块 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-[#fae6ea] opacity-60 blur-3xl" />
        <div className="absolute top-[30%] -right-24 h-[360px] w-[360px] rounded-full bg-[#ede7f5] opacity-50 blur-3xl" />
        <div className="absolute bottom-[-120px] left-[20%] h-[300px] w-[300px] rounded-full bg-[#e8efe3] opacity-50 blur-3xl" />
      </div>

      {/* logo */}
      <div className="relative z-10 px-8 pt-8 md:px-12 md:pt-10">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fbebde] via-[#fae6ea] to-[#ede7f5] border border-[#f1e3d4]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4 text-[#b87a56]"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              stroke="currentColor"
            >
              <path d="M12 3v18M5 10l7-7 7 7" />
            </svg>
          </div>
          <span className="text-[14px] font-semibold tracking-wide text-[#6b574f]">
            Job Hunt Board
          </span>
        </div>
      </div>

      {/* 主体 */}
      <div className="relative z-10 flex items-center justify-center px-6 pb-16 pt-6 md:pt-10">
        <div className="grid w-full max-w-6xl gap-10 lg:grid-cols-2 lg:gap-16">
          {/* 左：文案 + 能力展示 */}
          <div className="flex items-center">
            <div className="w-full">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f1e3d4] bg-white/70 backdrop-blur px-3 py-1 text-[11px] font-semibold tracking-wider text-[#a88268]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e9b99a]" />
                AI · 求职申请看板
              </span>

              {/* 主标题 · 单行 */}
              <h1 className="mt-5 text-[40px] md:text-[52px] font-bold leading-[1.1] tracking-tight text-[#3d3230]">
                让每一次投递，
                <span className="relative inline-block">
                  <span className="relative z-10 text-gradient-cream">
                    都更从容
                  </span>
                  <span className="absolute inset-x-0 bottom-1 -z-0 h-3 rounded-full bg-[#fbebde]/70" />
                </span>
              </h1>
              <p className="mt-5 max-w-[480px] text-[14px] leading-relaxed text-[#7a6a63]">
                一站式整理邮件、JD、面试节点与复盘，AI 随时在侧。
                把心思留给表达，剩下的繁琐，交给看板。
              </p>

              {/* 核心能力 4 卡 */}
              <div className="mt-8 grid grid-cols-2 gap-3 max-w-[500px]">
                <Feature
                  icon="✨"
                  label="AI 求职小助手"
                  hint="邮件 / JD 解析 · 面试题 · 复盘"
                  tint="#fae6ea"
                  fg="#c86d85"
                  tags={["智能解析", "对话追问"]}
                />
                <Feature
                  icon="📊"
                  label="多视图看板"
                  hint="Dashboard · 日历 · 公司漏斗"
                  tint="#fbebde"
                  fg="#b87a56"
                  tags={["Offer 漏斗", "日程一览"]}
                />
                <Feature
                  icon="📝"
                  label="简历 & 随手记"
                  hint="多份 PDF · 本周便签 Todo"
                  tint="#ede7f5"
                  fg="#8a6fa5"
                  tags={["云端托管", "跨周结转"]}
                />
                <Feature
                  icon="🔒"
                  label="数据独立隔离"
                  hint="只属于你的求职进程"
                  tint="#e8efe3"
                  fg="#70876a"
                  tags={["端到端加密", "私密可靠"]}
                />
              </div>
            </div>
          </div>

          {/* 右：表单卡 */}
          <div className="flex items-center justify-center">
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon,
  label,
  hint,
  tint,
  fg,
  tags,
}: {
  icon: string;
  label: string;
  hint: string;
  tint: string;
  fg: string;
  tags?: string[];
}) {
  return (
    <div className="group relative rounded-2xl border border-[#f1e8e0] bg-white/75 backdrop-blur p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(199,165,149,0.15)] hover:border-[#e8d7c8]">
      {/* 右上角装饰：小圆点 */}
      <span
        aria-hidden
        className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full opacity-70 transition-all group-hover:scale-150"
        style={{ background: fg }}
      />

      <div
        className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl text-[16px] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
        style={{ background: tint }}
      >
        <span aria-hidden>{icon}</span>
      </div>
      <div className="text-[13px] font-bold leading-tight" style={{ color: fg }}>
        {label}
      </div>
      <div className="mt-1 text-[11px] leading-snug text-[#8a7972] line-clamp-2">
        {hint}
      </div>
      {tags && tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-full border px-1.5 py-[1px] text-[9px] font-semibold tracking-wide"
              style={{
                background: `${tint}80`,
                color: fg,
                borderColor: `${fg}22`,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
