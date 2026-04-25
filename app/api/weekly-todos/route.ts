/**
 * /api/weekly-todos
 *
 * GET  ?weekStart=YYYY-MM-DD · 查该周的 todo 列表（不传则默认当前周一）
 * POST · 新增一条（body: { weekStart, content }）
 *
 * 便签贴纸风格随手记（主流方案：周维度）
 */

import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  jsonOk,
  withApiHandler,
  parseJsonBody,
  validationError,
} from "@/lib/api";
import { requireCurrentUser } from "@/lib/auth";

const weekStartRegex = /^\d{4}-\d{2}-\d{2}$/;

const createBodySchema = z.object({
  weekStart: z.string().regex(weekStartRegex, "weekStart 必须是 YYYY-MM-DD"),
  content: z.string().trim().min(1, "内容不能为空").max(200, "最多 200 字"),
});

/** 给定日期算当周周一（本地时区） */
function weekStartOf(d: Date): string {
  const x = new Date(d);
  const day = x.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export const GET = withApiHandler(async (req) => {
  const user = await requireCurrentUser();
  const url = new URL(req.url);
  const weekStartParam = url.searchParams.get("weekStart");
  const weekStart =
    weekStartParam && weekStartRegex.test(weekStartParam)
      ? weekStartParam
      : weekStartOf(new Date());

  const items = await prisma.weeklyTodo.findMany({
    where: { userId: user.id, weekStart },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      content: true,
      done: true,
      sortOrder: true,
      createdAt: true,
    },
  });
  return jsonOk({ weekStart, items });
});

export const POST = withApiHandler(async (req) => {
  const user = await requireCurrentUser();
  const body = await parseJsonBody(req);
  const parsed = createBodySchema.safeParse(body);
  if (!parsed.success) {
    throw validationError(parsed.error.issues[0]?.message ?? "参数非法");
  }

  // sortOrder = 该周最大 sortOrder + 1
  const maxRow = await prisma.weeklyTodo.findFirst({
    where: { userId: user.id, weekStart: parsed.data.weekStart },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  const sortOrder = (maxRow?.sortOrder ?? -1) + 1;

  const created = await prisma.weeklyTodo.create({
    data: {
      userId: user.id,
      weekStart: parsed.data.weekStart,
      content: parsed.data.content,
      sortOrder,
    },
    select: {
      id: true,
      content: true,
      done: true,
      sortOrder: true,
      createdAt: true,
    },
  });
  return jsonOk(created, { status: 201 });
});
