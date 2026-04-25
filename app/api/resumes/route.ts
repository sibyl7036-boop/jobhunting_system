/**
 * /api/resumes
 *
 * GET · 当前用户的简历列表
 * POST · 保留；上传在 /api/resumes/upload
 *
 * [2026-04-25 auth-v1]
 */

import { prisma } from "@/lib/db";
import { jsonOk, withApiHandler, validationError } from "@/lib/api";
import { requireCurrentUser } from "@/lib/auth";

export const GET = withApiHandler(async () => {
  const user = await requireCurrentUser();
  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return jsonOk(resumes);
});

export const POST = withApiHandler(async () => {
  throw validationError(
    "创建 Resume 需通过文件上传，请使用 POST /api/resumes/upload"
  );
});
