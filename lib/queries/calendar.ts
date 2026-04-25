/**
 * lib/queries/calendar.ts · 按用户隔离
 */

import "server-only";
import { prisma } from "@/lib/db";
import { parseDateStartLocal, parseDateEndLocal } from "@/lib/dates";

export async function getCalendarEvents(
  userId: string,
  startStr: string,
  endStr: string
) {
  const start = parseDateStartLocal(startStr);
  const end = parseDateEndLocal(endStr);
  if (start.getTime() > end.getTime()) {
    throw new Error(`start (${startStr}) 不能晚于 end (${endStr})`);
  }

  return prisma.stage.findMany({
    where: {
      time: { gte: start, lte: end },
      application: { userId },
    },
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
