/**
 * /api/stages/[id]
 *
 * PATCH · 部分更新
 * DELETE · 删除单个 Stage
 *
 * 对应 PRD 7.3 / implementation_plan Step 2.3
 */

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  jsonOk,
  withApiHandler,
  notFound,
  parseJsonBody,
} from "@/lib/api";
import { stageUpdateInputSchema } from "@/lib/schemas";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ── PATCH ──
export const PATCH = withApiHandler<RouteContext>(async (req, ctx) => {
  const { id } = await ctx.params;
  const body = await parseJsonBody(req);
  const input = stageUpdateInputSchema.parse(body);

  const existing = await prisma.stage.findUnique({ where: { id } });
  if (!existing) throw notFound(`Stage id=${id} 不存在`);

  const data: Prisma.StageUpdateInput = {};
  if (input.type !== undefined) data.type = input.type;
  if (input.time !== undefined)
    data.time = input.time ? new Date(input.time as string) : null;
  if (input.meetingLink !== undefined) data.meetingLink = input.meetingLink;
  if (input.status !== undefined) data.status = input.status;
  if (input.reviewQuestionSummary !== undefined)
    data.reviewQuestionSummary = input.reviewQuestionSummary;
  if (input.reviewAnswerSummary !== undefined)
    data.reviewAnswerSummary = input.reviewAnswerSummary;
  if (input.reviewSuggestion !== undefined)
    data.reviewSuggestion = input.reviewSuggestion;

  const updated = await prisma.stage.update({ where: { id }, data });
  return jsonOk(updated);
});

// ── DELETE ──
export const DELETE = withApiHandler<RouteContext>(async (_req, ctx) => {
  const { id } = await ctx.params;
  const existing = await prisma.stage.findUnique({ where: { id } });
  if (!existing) throw notFound(`Stage id=${id} 不存在`);
  await prisma.stage.delete({ where: { id } });
  return jsonOk({ id, deleted: true });
});
