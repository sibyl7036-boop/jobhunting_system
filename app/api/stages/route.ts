/**
 * /api/stages
 *
 * GET  · 列出当前用户所有 Stage（可选 ?all=1 返回精简字段给复盘 picker）
 * POST · 创建 Stage（校验 applicationId 属于当前用户）
 *
 * [2026-04-25 auth-v1]
 */

import { prisma } from "@/lib/db";
import {
  jsonOk,
  withApiHandler,
  notFound,
  parseJsonBody,
} from "@/lib/api";
import { stageCreateInputSchema } from "@/lib/schemas";
import { requireCurrentUser } from "@/lib/auth";

// [2026-04-25 v2] 列表 · 供 AIChatPanel StagePicker 用
export const GET = withApiHandler(async (req) => {
  const user = await requireCurrentUser();
  const rows = await prisma.stage.findMany({
    where: { application: { userId: user.id } },
    orderBy: [{ time: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      applicationId: true,
      type: true,
      status: true,
      time: true,
      application: {
        select: { companyName: true, roleName: true, departmentName: true },
      },
    },
    take: 100,
  });
  return jsonOk(
    rows.map((s) => ({
      id: s.id,
      applicationId: s.applicationId,
      type: s.type,
      status: s.status,
      timeIso: s.time ? s.time.toISOString() : null,
      companyName: s.application.companyName,
      roleName: s.application.roleName,
      departmentName: s.application.departmentName,
    }))
  );
});

export const POST = withApiHandler(async (req) => {
  const user = await requireCurrentUser();
  const body = await parseJsonBody(req);
  const input = stageCreateInputSchema.parse(body);

  // 外键 + 归属校验
  const app = await prisma.application.findUnique({
    where: { id: input.applicationId },
    select: { id: true, userId: true },
  });
  if (!app || app.userId !== user.id) {
    throw notFound(`Application id=${input.applicationId} 不存在`);
  }

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