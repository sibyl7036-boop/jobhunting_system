/**
 * /api/applications
 *
 * GET  · 列表（当前用户）
 * POST · 创建 Application（归属当前用户）
 *
 * [2026-04-25 auth-v1] 按用户隔离
 */

import { prisma } from "@/lib/db";
import { jsonOk, withApiHandler, parseJsonBody, notFound } from "@/lib/api";
import { applicationCreateInputSchema } from "@/lib/schemas";
import { stringifyStringArray, serializeApplication } from "@/lib/serialize";
import { requireCurrentUser } from "@/lib/auth";

export const GET = withApiHandler(async (req) => {
  const user = await requireCurrentUser();
  const url = new URL(req.url);
  const includeEmpty = url.searchParams.get("includeEmpty") === "true";

  const rows = await prisma.application.findMany({
    where: {
      userId: user.id,
      ...(includeEmpty ? {} : { NOT: { currentStatus: "未投递" } }),
    },
    orderBy: [{ companyName: "asc" }, { createdAt: "asc" }],
  });

  return jsonOk(rows.map(serializeApplication));
});

export const POST = withApiHandler(async (req) => {
  const user = await requireCurrentUser();
  const body = await parseJsonBody(req);
  const input = applicationCreateInputSchema.parse(body);

  // 若带 linkedResumeId，校验简历归属
  if (input.linkedResumeId) {
    const resume = await prisma.resume.findUnique({
      where: { id: input.linkedResumeId },
      select: { userId: true },
    });
    if (!resume || resume.userId !== user.id) {
      throw notFound("关联的简历不存在");
    }
  }

  const created = await prisma.application.create({
    data: {
      userId: user.id,
      companyName: input.companyName,
      departmentName: input.departmentName ?? "",
      roleName: input.roleName,
      jdText: input.jdText ?? null,
      jdSummary: input.jdSummary ?? null,
      jdKeywords: stringifyStringArray(input.jdKeywords),
      expectedSkills: stringifyStringArray(input.expectedSkills),
      interviewQuestions: stringifyStringArray(input.interviewQuestions),
      linkedResumeId: input.linkedResumeId ?? null,
      currentStatus: input.currentStatus ?? "未投递",
    },
  });

  return jsonOk(serializeApplication(created), { status: 201 });
});
