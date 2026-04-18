/**
 * /api/applications
 *
 * GET  · 列表（按 createdAt desc，不含占位的"未投递"空白行）
 * POST · 创建 Application；currentStatus 默认 "未投递"
 *
 * 对应 PRD 7.2 / implementation_plan Step 2.2 / Step 4.4
 */

import { prisma } from "@/lib/db";
import { jsonOk, withApiHandler, parseJsonBody } from "@/lib/api";
import { applicationCreateInputSchema } from "@/lib/schemas";
import { stringifyStringArray, serializeApplication } from "@/lib/serialize";

export const GET = withApiHandler(async (req) => {
  const url = new URL(req.url);
  const includeEmpty = url.searchParams.get("includeEmpty") === "true";

  const rows = await prisma.application.findMany({
    where: includeEmpty
      ? undefined
      : { NOT: { currentStatus: "未投递" } },
    orderBy: [{ companyName: "asc" }, { createdAt: "asc" }],
  });

  return jsonOk(rows.map(serializeApplication));
});

export const POST = withApiHandler(async (req) => {
  const body = await parseJsonBody(req);
  const input = applicationCreateInputSchema.parse(body);

  const created = await prisma.application.create({
    data: {
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
