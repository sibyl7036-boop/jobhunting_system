/**
 * /api/stages/[id]
 *
 * PATCH  · 部分更新
 * DELETE · 删除单个 Stage
 *
 * [2026-04-25 auth-v1] 通过 Stage.application.userId 校验归属
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
import { requireCurrentUser } from "@/lib/auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function findOwnStage(id: string, userId: string) {
  const stage = await prisma.stage.findUnique({
    where: { id },
    include: { application: { select: { userId: true } } },
  });
  if (!stage || stage.application.userId !== userId) return null;
  return stage;
}

// ── PATCH ──
export const PATCH = withApiHandler<RouteContext>(async (req, ctx) => {
  const user = await requireCurrentUser();
  const { id } = await ctx.params;
  const existing = await findOwnStage(id, user.id);
  if (!existing) throw notFound(`Stage id=${id} 不存在`);

  const body = await parseJsonBody(req);
  const input = stageUpdateInputSchema.parse(body);

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
  // [2026-04-25 v2]
  if (input.interviewQuestions !== undefined)
    data.interviewQuestions =
      input.interviewQuestions === null
        ? null
        : JSON.stringify(input.interviewQuestions);
  if (input.personalNotes !== undefined)
    data.personalNotes = input.personalNotes;
  if (input.reviewTranscript !== undefined)
    data.reviewTranscript = input.reviewTranscript;

  const updated = await prisma.stage.update({ where: { id }, data });
  return jsonOk(updated);
});

// ── DELETE ──
export const DELETE = withApiHandler<RouteContext>(async (_req, ctx) => {
  const user = await requireCurrentUser();
  const { id } = await ctx.params;
  const existing = await findOwnStage(id, user.id);
  if (!existing) throw notFound(`Stage id=${id} 不存在`);
  await prisma.stage.delete({ where: { id } });
  return jsonOk({ id, deleted: true });
});
