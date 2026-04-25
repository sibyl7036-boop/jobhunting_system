/**
 * /dashboard 首页 · v2
 *
 * v2 变化：
 *   1. 去掉 TodayTimeline / TomorrowReminder（用 EventTable 的今日/明日 tab 替代）
 *   2. 去掉 Passed 维度（MiniStatsColumn 只剩 3 格）
 *   3. AI 聊天面板 AIChatPanel **前置到漏斗下方**，成为视觉和功能主角
 *   4. EventTable 保留但精简（今日/明日 chips 自带提醒作用）
 *   5. 右栏新增便签式 StickyTodoPanel，简历块更迷你
 *   6. 右侧还挂一个 book-mark 样式的 StickyTodoPanel（由 Layout 提供 fixed）
 */

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  getDashboardEvents,
  getResumes,
  getDailyIntelSummary,
} from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import {
  EventTable,
  type SerializedEvent,
} from "@/components/dashboard/EventTable";
import { DailyIntel } from "@/components/dashboard/DailyIntel";
import { AIChatPanel } from "@/components/dashboard/AIChatPanel";
import { FunnelBar } from "@/components/dashboard/FunnelBar";
import {
  MiniResumePanel,
  type MiniResume,
} from "@/components/dashboard/MiniResumePanel";
import { QuickAddFab } from "@/components/dashboard/QuickAddFab";
import { MiniStatsColumn } from "@/components/dashboard/MiniStatsColumn";
import { StickyTodoPanel } from "@/components/widgets/StickyTodoPanel";

export const dynamic = "force-dynamic";

/** 根据 currentStatus 把 application 归到漏斗五个阶段 */
function classifyFunnel(currentStatus: string) {
  if (currentStatus === "未投递") return "wishlist";
  if (currentStatus === "已投递") return "applied";
  if (
    ["笔试", "测评", "一面", "二面", "三面", "HR面"].includes(currentStatus)
  )
    return "interview";
  if (currentStatus === "Offer") return "offer";
  if (currentStatus === "挂了") return "rejected";
  return "applied";
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard");

  const [events, resumes, intel, allApps] = await Promise.all([
    getDashboardEvents(user.id, 7),
    getResumes(user.id),
    getDailyIntelSummary(user.id),
    prisma.application.findMany({
      where: { userId: user.id },
      select: { currentStatus: true },
    }),
  ]);

  const serializedEvents: SerializedEvent[] = events.map((e) => ({
    id: e.id,
    type: e.type,
    status: e.status,
    timeIso: e.time ? e.time.toISOString() : null,
    application: {
      id: e.application.id,
      companyName: e.application.companyName,
      departmentName: e.application.departmentName,
      roleName: e.application.roleName,
      linkedResume: e.application.linkedResume
        ? {
            id: e.application.linkedResume.id,
            name: e.application.linkedResume.name,
          }
        : null,
    },
  }));

  const miniResumes: MiniResume[] = resumes.map((r) => ({
    id: r.id,
    name: r.name,
    tag: r.tag,
    createdAtIso: r.createdAt.toISOString(),
  }));

  // ── 统计 ──
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todayYmd = now.toISOString().slice(0, 10);
  const tomorrowYmd = tomorrow.toISOString().slice(0, 10);

  const todayCount = serializedEvents.filter(
    (e) => e.timeIso && e.timeIso.slice(0, 10) === todayYmd
  ).length;
  const tomorrowCount = serializedEvents.filter(
    (e) => e.timeIso && e.timeIso.slice(0, 10) === tomorrowYmd
  ).length;
  const weekCount = serializedEvents.length;

  // ── 漏斗聚合 ──
  const totalApps = allApps.length;
  const funnelCounts = {
    wishlist: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
  };
  for (const a of allApps) {
    const bucket = classifyFunnel(a.currentStatus);
    funnelCounts[bucket as keyof typeof funnelCounts]++;
  }

  return (
    <div className="pb-16">
      {/* 顶部：求职漏斗 */}
      <FunnelBar totalApplications={totalApps} counts={funnelCounts} />

      {/* ── 主区：事件主轴 + AI 紧凑入口 + 侧栏辅助 ── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 左 8 栏 */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          {/* 近 7 天流程事件（含今日/明日高亮 tab）· 前置为视觉主角 */}
          <EventTable events={serializedEvents} />

          {/* AI 求职小助手 · 紧凑卡 · 顶部"展开"按钮可进入全屏弹窗 */}
          <AIChatPanel />
        </div>

        {/* 右 4 栏 */}
        <aside className="flex flex-col gap-4 lg:col-span-4">
          <MiniStatsColumn
            todayCount={todayCount}
            tomorrowCount={tomorrowCount}
            weekCount={weekCount}
          />

          {/* 便签式周 Todo · 卡片形态嵌入 */}
          <StickyTodoPanel variant="card" />

          <DailyIntel summary={intel.summary} fromCache={intel.fromCache} />

          <MiniResumePanel resumes={miniResumes} />
        </aside>
      </div>

      {/* 全局浮动新增按钮 */}
      <QuickAddFab />
    </div>
  );
}
