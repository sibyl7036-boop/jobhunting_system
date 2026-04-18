/**
 * /api/stages
 *
 * POST · 创建 Stage（必须带 applicationId，不存在则 404）
 *
 * 对应 PRD 7.3 / implementation_plan Step 2.3
 */

import { prisma } from "@/lib/db";
import {
  jsonOk,
  withApiHandler,
  notFound,
  parseJsonBody,
} from "@/lib/api";
import { stageCreateInputSchema } from "@/lib/schemas";

export const POST = withApiHandler(async (req) => {
  const body = await parseJsonBody(req);
  const input = stageCreateInputSchema.parse(body);

  // 外键校验
  const app = await prisma.application.findUnique({
    where: { id: input.applicationId },
    select: { id: true },
  });
  if (!app) throw notFound(`Application id=${input.applicationId} 不存在`);

  const created = await prisma.stage.create({
    data: {
      applicationId: input.applicationId,
      type: input.type,
      time: input.time ? new Date(input.time as string) : null,
      meetingLink: input.meetingLink ?? null,
      status: input.status ?? "待参加",
      reviewQuestionSummary: input.reviewQuestionSummary ?? null,
      reviewAnswerSummary: input.reviewAnswerSummary ?? null,
      reviewSuggestion: input.reviewSuggestion ?? null,
    },
  });

  return jsonOk(created, { status: 201 });
});
