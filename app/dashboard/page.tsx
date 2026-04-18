/**
 * /dashboard 首页
 *
 * Phase 3 阶段：只读展示。Step 3.2 实现时间维度流程表格（左侧主模块）。
 * Step 3.3 再补右侧 4 个卡片（明日提醒 / 今日动向 / 简历 / AI Copilot）。
 *
 * 数据路径：Server Component 直调 lib/queries/ → getDashboardEvents(7)
 *            → 序列化 Date 为 ISO 字符串后传给 Client Component EventTable
 */

import { getDashboardEvents } from "@/lib/queries";
import {
  EventTable,
  type SerializedEvent,
} from "@/components/dashboard/EventTable";

// 数据依赖 DB，禁用静态缓存，每次请求重新拉
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const events = await getDashboardEvents(7);

  // Server → Client 边界：Date 转 ISO 字符串（RSC 序列化 Date 容易踩坑）
  const serialized: SerializedEvent[] = events.map((e) => ({
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

  return (
    <div className="space-y-6 py-6">
      <EventTable events={serialized} />
    </div>
  );
}
