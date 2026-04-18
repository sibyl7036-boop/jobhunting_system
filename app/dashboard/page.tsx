/**
 * /dashboard 首页
 *
 * Phase 3 Step 3.3 完整布局（UI.md 8.1）：
 *   12 栏栅格：左 8（EventTable + 底部 ResumeCard）/ 右 4（TomorrowReminder + DailyIntel + AICopilot 从上到下）
 *
 * 数据路径：
 *   - 事件：getDashboardEvents(7) → 序列化 Date → EventTable
 *   - 简历：getResumes() → 序列化 Date → ResumeCard
 *   - 其他三个卡片本步为占位（Phase 5.2 / 6.5 / 6.6 / 6.3 陆续接真实数据）
 */

import { getDashboardEvents, getResumes } from "@/lib/queries";
import {
  EventTable,
  type SerializedEvent,
} from "@/components/dashboard/EventTable";
import { TomorrowReminder } from "@/components/dashboard/TomorrowReminder";
import { DailyIntel } from "@/components/dashboard/DailyIntel";
import {
  ResumeCard,
  type SerializedResume,
} from "@/components/dashboard/ResumeCard";
import { AICopilot } from "@/components/dashboard/AICopilot";

// 数据依赖 DB，禁用静态缓存
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // 并发拉两份数据
  const [events, resumes] = await Promise.all([
    getDashboardEvents(7),
    getResumes(),
  ]);

  // Date → ISO 字符串（Server → Client 边界约定，见 architecture.md 关键契约点 14）
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

  const serializedResumes: SerializedResume[] = resumes.map((r) => ({
    id: r.id,
    name: r.name,
    tag: r.tag,
    createdAtIso: r.createdAt.toISOString(),
  }));

  return (
    <div className="py-6">
      {/* UI.md 8.1 · 12 栏栅格：左 8 右 4（断点 < lg 时自动单列堆叠） */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 左 8 栏：表格（上） + 简历（下） */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          <EventTable events={serializedEvents} />
          <ResumeCard resumes={serializedResumes} />
        </div>

        {/* 右 4 栏：明日提醒 / 今日动向 / AI Copilot 从上到下 */}
        <aside className="flex flex-col gap-6 lg:col-span-4">
          <TomorrowReminder />
          <DailyIntel />
          <AICopilot />
        </aside>
      </div>
    </div>
  );
}
