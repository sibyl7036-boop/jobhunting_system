/**
 * /dashboard 首页
 *
 * Step 3.1 阶段：临时把 getDashboardEvents('7d') 的返回打印到 server log，
 * 用于验证 Server Component 直调 Prisma 的数据请求路径。
 * Phase 3.2 会替换为真实的"时间维度流程表格"。
 */

import { getDashboardEvents } from "@/lib/queries";

export const dynamic = "force-dynamic"; // 避免 SSR 缓存干扰调试

export default async function DashboardPage() {
  const events = await getDashboardEvents(7);

  // Step 3.1 验证用：让 server log 看到数据形状
  console.log(
    "[dashboard] getDashboardEvents(7) →",
    events.length,
    "条 Stage；首条预览：",
    events[0]
      ? {
          id: events[0].id,
          type: events[0].type,
          status: events[0].status,
          time: events[0].time?.toISOString() ?? null,
          company: events[0].application.companyName,
        }
      : "（空）"
  );

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <p className="text-section-title text-text-secondary">
        首页占位（Phase 3.2 即将实现真实表格）
      </p>
      <p className="text-caption text-text-tertiary">
        当前 dashboard 事件数：<b>{events.length}</b>
      </p>
    </div>
  );
}
