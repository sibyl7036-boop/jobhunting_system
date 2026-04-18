/**
 * /api/resumes
 *
 * GET · 返回所有 Resume，按 createdAt desc
 * POST · 保留（upload 在 Phase 5.1 实现，本阶段不开放）
 *
 * 对应 PRD 7.1 / implementation_plan Step 2.1
 */

import { prisma } from "@/lib/db";
import { jsonOk, withApiHandler, validationError } from "@/lib/api";

export const GET = withApiHandler(async () => {
  const resumes = await prisma.resume.findMany({
    orderBy: { createdAt: "desc" },
  });
  return jsonOk(resumes);
});

export const POST = withApiHandler(async () => {
  // Phase 5.1 会在 /api/resumes/upload 实现；本 route 只接 JSON 创建不合理（没文件）
  throw validationError(
    "创建 Resume 需通过文件上传，请使用 POST /api/resumes/upload（Phase 5.1）"
  );
});
