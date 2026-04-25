/**
 * /calendar 日历页（UI.md 9）
 *
 * SSR 拉"当月对应网格（包含前月尾 + 下月头）"的事件数据，注入给 Client MonthView。
 * 之后切月由 Client 端直接 fetch /api/calendar/events，无需刷页。
 */

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
} from "date-fns";
import { redirect } from "next/navigation";
import { getCalendarEvents } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import {
  MonthView,
  type CalendarEventVM,
} from "@/components/calendar/MonthView";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/calendar");

  const today = new Date();
  const gridStart = startOfWeek(startOfMonth(today), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(today), { weekStartsOn: 1 });
  const startStr = format(gridStart, "yyyy-MM-dd");
  const endStr = format(gridEnd, "yyyy-MM-dd");

  const events = await getCalendarEvents(user.id, startStr, endStr);

  // 只保留有 time 的事件（月视图按日期格子放）
  const initialEvents: CalendarEventVM[] = events
    .filter((e) => e.time)
    .map((e) => ({
      id: e.id,
      type: e.type,
      status: e.status,
      timeIso: (e.time as Date).toISOString(),
      application: {
        id: e.application.id,
        companyName: e.application.companyName,
        departmentName: e.application.departmentName,
        roleName: e.application.roleName,
      },
    }));

  return (
    <div className="py-6">
      <MonthView
        initialEvents={initialEvents}
        initialRange={{ start: startStr, end: endStr }}
      />
    </div>
  );
}