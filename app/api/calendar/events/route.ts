/**
 * GET /api/calendar/events?start=YYYY-MM-DD&end=YYYY-MM-DD · 当前用户
 *
 * [2026-04-25 auth-v1]
 */

import { prisma } from "@/lib/db";
import { jsonOk, withApiHandler, validationError } from "@/lib/api";
import { parseDateStartLocal, parseDateEndLocal } from "@/lib/dates";
import { requireCurrentUser } from "@/lib/auth";

export const GET = withApiHandler(async (req) => {
  const user = await requireCurrentUser();
  const url = new URL(req.url);
  const startRaw = url.searchParams.get("start");
  const endRaw = url.searchParams.get("end");

  if (!startRaw || !endRaw)
    throw validationError("必须同时提供 start 和 end（YYYY-MM-DD）");

  let start: Date, end: Date;
  try {
    start = parseDateStartLocal(startRaw);
    end = parseDateEndLocal(endRaw);
  } catch (e) {
    throw validationError(e instanceof Error ? e.message : String(e));
  }

  if (start.getTime() > end.getTime())
    throw validationError(`start (${startRaw}) 不能晚于 end (${endRaw})`);

  const stages = await prisma.stage.findMany({
    where: {
      time: { gte: start, lte: end },
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
