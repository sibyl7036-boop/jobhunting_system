/**
 * GET /api/dashboard/events?range=Nd
 *
 * 返回今天起 N 天内所有 Stage（默认 7 天），按 time asc。
 * 时间窗：[今天 00:00:00.000, 今天 + N 天 00:00:00.000)（半开，本地时区）
 * range 非法返 400。
 *
 * 对应 PRD 7.3 / implementation_plan Step 2.3
 */

import { prisma } from "@/lib/db";
import { jsonOk, withApiHandler, validationError } from "@/lib/api";
import { startOfToday, startOfDayOffset, parseRangeDays } from "@/lib/dates";

export const GET = withApiHandler(async (req) => {
  const url = new URL(req.url);
  const rangeRaw = url.searchParams.get("range");

  let days: number;
  try {
    days = parseRangeDays(rangeRaw);
  } catch (e) {
    throw validationError(e instanceof Error ? e.message : String(e));
  }

  const start = startOfToday();
  const end = startOfDayOffset(days); // 半开区间：< end

  const stages = await prisma.stage.findMany({
    where: {
      time: { gte: start, lt: end },
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

  return jsonOk(stages);
});
