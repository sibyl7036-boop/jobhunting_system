/**
 * lib/queries/dashboard.ts · 按用户隔离
 *
 * [2026-04-25 auth-v1] 所有 query 接收 userId 参数
 */

import "server-only";
import { prisma } from "@/lib/db";
import { startOfToday, startOfDayOffset } from "@/lib/dates";

export async function getDashboardEvents(userId: string, days: number = 7) {
  const start = startOfToday();
  const end = startOfDayOffset(days);

  return prisma.stage.findMany({
    where: {
      time: { gte: start, lt: end },
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

export type DashboardEvent = Awaited<
  ReturnType<typeof getDashboardEvents>
>[number];
