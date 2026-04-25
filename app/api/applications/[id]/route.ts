/**
 * /api/applications/[id]
 *
 * GET    · 含 stages + linkedResume
 * PATCH  · 部分更新
 * DELETE · 级联删除 Stage
 *
 * [2026-04-25 auth-v1] 归属校验：非本人 Application → 404 （不泄露存在性）
 */

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { jsonOk, withApiHandler, notFound, parseJsonBody } from "@/lib/api";
import { applicationUpdateInputSchema } from "@/lib/schemas";
import { stringifyStringArray, serializeApplication } from "@/lib/serialize";
import { requireCurrentUser } from "@/lib/auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** 拉一条属于当前用户的 Application；否则 404 */
async function findOwnApplication(id: string, userId: string) {
  const app = await prisma.application.findUnique({
    where: { id },
    include: {
      stages: { orderBy: { time: "asc" } },
      linkedResume: true,
    },
  });
  if (!app || app.userId !== userId) return null;
  return app;
}

// ── GET ──
export const GET = withApiHandler<RouteContext>(async (_req, ctx) => {
  const user = await requireCurrentUser();
  const { id } = await ctx.params;
  const app = await findOwnApplication(id, user.id);
  if (!app) throw notFound(`Application id=${id} 不存在`);
  return jsonOk(serializeApplication(app));
});

// ── PATCH ──
export const PATCH = withApiHandler<RouteContext>(async (req, ctx) => {
  const user = await requireCurrentUser();
  const { id } = await ctx.params;
  const existing = await findOwnApplication(id, user.id);
  if (!existing) throw notFound(`Application id=${id} 不存在`);

  const body = await parseJsonBody(req);
  const input = applicationUpdateInputSchema.parse(body);

  // linkedResumeId 归属校验
  if (input.linkedResumeId) {
    const r = await prisma.resume.findUnique({
      where: { id: input.linkedResumeId },
      select: { userId: true },
    });
    if (!r || r.userId !== user.id) throw notFound("关联的简历不存在");
  }

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
  const user = await requireCurrentUser();
  const { id } = await ctx.params;
  const existing = await findOwnApplication(id, user.id);
  if (!existing) throw notFound(`Application id=${id} 不存在`);

  await prisma.application.delete({ where: { id } });
  return jsonOk({ id, deleted: true });
});
