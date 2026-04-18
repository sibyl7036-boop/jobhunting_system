/**
 * /dashboard 首页
 *
 * 12 栏布局（UI.md 8.1）：左 8（EventTable + ResumeCard） / 右 4（TomorrowReminder + DailyIntel + AICopilot）
 *
 * 数据来源：
 *   - 事件：getDashboardEvents(7)
 *   - 简历：getResumes()
 *   - 今日动向：getDailyIntelSummary()（命中缓存直接返，否则调 AI，Step 6.5）
 */

import {
  getDashboardEvents,
  getResumes,
  getDailyIntelSummary,
  getTomorrowTip,
} from "@/lib/queries";
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

// 数据依赖 DB + AI，禁用静态缓存
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // 并发拉四份数据
  const [events, resumes, intel, tip] = await Promise.all([
    getDashboardEvents(7),
    getResumes(),
    getDailyIntelSummary(),
    getTomorrowTip(),
  ]);

  // Date → ISO 字符串（Server → Client 边界约定，见 architecture.md 契约点 14）
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-8">
          <EventTable events={serializedEvents} />
          <ResumeCard resumes={serializedResumes} />
        </div>

        <aside className="flex flex-col gap-6 lg:col-span-4">
          <TomorrowReminder
            tipText={tip.tipText}
            eventCount={tip.eventCount}
          />
          <DailyIntel summary={intel.summary} fromCache={intel.fromCache} />
          <AICopilot />
        </aside>
      </div>
    </div>
  );
}
