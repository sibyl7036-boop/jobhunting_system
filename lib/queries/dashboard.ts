/**
 * lib/queries/dashboard.ts
 *
 * 服务端（Server Component）直调 Prisma 的 query 函数。
 * 不经过 HTTP/fetch，和 /api/dashboard/events 的逻辑保持一致。
 *
 * 时间语义：半开区间 [今天 00:00, 今天 + N 天 00:00)，本地时区
 * 对应 architecture.md 关键契约点 13。
 */

import "server-only";
import { prisma } from "@/lib/db";
import { startOfToday, startOfDayOffset } from "@/lib/dates";

/**
 * 获取 dashboard 事件列表。
 *
 * @param days 往后看 N 天（默认 7）；传进来前应已校验 1~365
 * @returns 按 time asc 排序的 Stage[]，带 application 的公司/部门/岗位 + 关联简历名
 */
export async function getDashboardEvents(days: number = 7) {
  const start = startOfToday();
  const end = startOfDayOffset(days);

  return prisma.stage.findMany({
    where: { time: { gte: start, lt: end } },
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
