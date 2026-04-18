/**
 * /api/applications/[id]
 *
 * GET    · 含 stages（time asc）+ linkedResume
 * PATCH  · 部分更新
 * DELETE · 级联删除 Stage（由 schema Cascade 保证）
 *
 * 对应 PRD 7.2 / implementation_plan Step 2.2
 */

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { jsonOk, withApiHandler, notFound, parseJsonBody } from "@/lib/api";
import { applicationUpdateInputSchema } from "@/lib/schemas";
import { stringifyStringArray, serializeApplication } from "@/lib/serialize";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ── GET ──
export const GET = withApiHandler<RouteContext>(async (_req, ctx) => {
  const { id } = await ctx.params;
  const app = await prisma.application.findUnique({
    where: { id },
    include: {
      stages: { orderBy: { time: "asc" } },
      linkedResume: true,
    },
  });
  if (!app) throw notFound(`Application id=${id} 不存在`);
  return jsonOk(serializeApplication(app));
});

// ── PATCH ──
export const PATCH = withApiHandler<RouteContext>(async (req, ctx) => {
  const { id } = await ctx.params;
  const body = await parseJsonBody(req);
  const input = applicationUpdateInputSchema.parse(body);

  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing) throw notFound(`Application id=${id} 不存在`);

  const data: Prisma.ApplicationUpdateInput = {};
  if (input.companyName !== undefined) data.companyName = input.companyName;
  if (input.departmentName !== undefined)
    data.departmentName = input.departmentName;
  if (input.roleName !== undefined) data.roleName = input.roleName;
  if (input.jdText !== undefined) data.jdText = input.jdText;
  if (input.jdSummary !== undefined) data.jdSummary = input.jdSummary;
  if (input.jdKeywords !== undefined)
    data.jdKeywords = stringifyStringArray(input.jdKeywords);
  if (input.expectedSkills !== undefined)
    data.expectedSkills = stringifyStringArray(input.expectedSkills);
  if (input.interviewQuestions !== undefined)
    data.interviewQuestions = stringifyStringArray(input.interviewQuestions);
  if (input.linkedResumeId !== undefined) {
    // Prisma 外键 update 要用 nested write（connect / disconnect）
    data.linkedResume = input.linkedResumeId
      ? { connect: { id: input.linkedResumeId } }
      : { disconnect: true };
  }
  if (input.currentStatus !== undefined)
    data.currentStatus = input.currentStatus;

  const updated = await prisma.application.update({
    where: { id },
    data,
  });
  return jsonOk(serializeApplication(updated));
});

// ── DELETE ──
export const DELETE = withApiHandler<RouteContext>(async (_req, ctx) => {
  const { id } = await ctx.params;
  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing) throw notFound(`Application id=${id} 不存在`);

  await prisma.application.delete({ where: { id } });
  return jsonOk({ id, deleted: true });
});
