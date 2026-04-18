/**
 * lib/queries/calendar.ts
 *
 * 服务端直调 Prisma：拉日历月视图所需的 Stage 列表。
 * 闭区间 [start 00:00, end 23:59:59.999]，与 /api/calendar/events 一致。
 */

import "server-only";
import { prisma } from "@/lib/db";
import { parseDateStartLocal, parseDateEndLocal } from "@/lib/dates";

/**
 * @param startStr YYYY-MM-DD（含）
 * @param endStr   YYYY-MM-DD（含）
 */
export async function getCalendarEvents(startStr: string, endStr: string) {
  const start = parseDateStartLocal(startStr);
  const end = parseDateEndLocal(endStr);
  if (start.getTime() > end.getTime()) {
    throw new Error(`start (${startStr}) 不能晚于 end (${endStr})`);
  }

  return prisma.stage.findMany({
    where: { time: { gte: start, lte: end } },
    orderBy: { time: "asc" },
    include: {
      application: {
        select: {
          id: true,
          companyName: true,
          departmentName: true,
          roleName: true,
          linkedResume: { select: { id: true, name: true } },
        },
      },
    },
  });
}

export type CalendarEvent = Awaited<
  ReturnType<typeof getCalendarEvents>
>[number];
