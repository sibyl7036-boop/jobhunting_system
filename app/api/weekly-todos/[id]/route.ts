/**
 * /api/weekly-todos/[id]
 *
 * PATCH  · 更新 content / done
 * DELETE · 删除
 */

import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  jsonOk,
  withApiHandler,
  parseJsonBody,
  validationError,
  notFound,
} from "@/lib/api";
import { requireCurrentUser } from "@/lib/auth";

const patchBodySchema = z
  .object({
    content: z.string().trim().min(1).max(200).optional(),
    done: z.boolean().optional(),
  })
  .refine((v) => v.content !== undefined || v.done !== undefined, {
    message: "至少传一个字段",
  });

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function findOwn(id: string, userId: string) {
  const row = await prisma.weeklyTodo.findUnique({ where: { id } });
  if (!row || row.userId !== userId) return null;
  return row;
}

export const PATCH = withApiHandler<RouteContext>(async (req, ctx) => {
  const user = await requireCurrentUser();
  const { id } = await ctx.params;
  const existing = await findOwn(id, user.id);
  if (!existing) throw notFound(`todo id=${id} 不存在`);

  const body = await parseJsonBody(req);
  const parsed = patchBodySchema.safeParse(body);
  if (!parsed.success) {
    throw validationError(parsed.error.issues[0]?.message ?? "参数非法");
  }

  const updated = await prisma.weeklyTodo.update({
    where: { id },
    data: {
      ...(parsed.data.content !== undefined && { content: parsed.data.content }),
      ...(parsed.data.done !== undefined && { done: parsed.data.done }),
    },
    select: {
      id: true,
      content: true,
      done: true,
      sortOrder: true,
      createdAt: true,
    },
  });
  return jsonOk(updated);
});

export const DELETE = withApiHandler<RouteContext>(async (_req, ctx) => {
  const user = await requireCurrentUser();
  const { id } = await ctx.params;
  const existing = await findOwn(id, user.id);
  if (!existing) throw notFound(`todo id=${id} 不存在`);
  await prisma.weeklyTodo.delete({ where: { id } });
  return jsonOk({ id, deleted: true });
});
