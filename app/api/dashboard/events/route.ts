/**
 * GET /api/dashboard/events?range=Nd · 当前用户
 *
 * [2026-04-25 auth-v1]
 */

import { prisma } from "@/lib/db";
import { jsonOk, withApiHandler, validationError } from "@/lib/api";
import { startOfToday, startOfDayOffset, parseRangeDays } from "@/lib/dates";
import { requireCurrentUser } from "@/lib/auth";

export const GET = withApiHandler(async (req) => {
  const user = await requireCurrentUser();
  const url = new URL(req.url);
  const rangeRaw = url.searchParams.get("range");

  let days: number;
  try {
    days = parseRangeDays(rangeRaw);
  } catch (e) {
    throw validationError(e instanceof Error ? e.message : String(e));
  }

  const start = startOfToday();
  const end = startOfDayOffset(days);

  const stages = await prisma.stage.findMany({
    where: {
      time: { gte: start, lt: end },
      application: { userId: user.id },
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
