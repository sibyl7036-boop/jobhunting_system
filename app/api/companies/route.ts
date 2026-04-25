/**
 * /api/companies
 *
 * GET  · 拿到用户的自定义公司列表
 * POST · 添加一家（body: { name }），返回完整列表
 *
 * [2026-04-25 v2] 预置 10 家大厂名单写在 lib/queries/companies.ts（COMPANY_ORDER），
 * 这里只管用户自定义那部分（CustomCompany 表）。前端 merge 展示。
 */

import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  jsonOk,
  withApiHandler,
  parseJsonBody,
  validationError,
  conflict,
} from "@/lib/api";
import { requireCurrentUser } from "@/lib/auth";
import { COMPANY_ORDER } from "@/lib/queries/companies";

const bodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "公司名不能为空")
    .max(20, "公司名过长（≤20 字）"),
});

export const GET = withApiHandler(async () => {
  const user = await requireCurrentUser();
  const list = await prisma.customCompany.findMany({
    where: { userId: user.id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, createdAt: true },
  });
  return jsonOk({
    presets: COMPANY_ORDER as readonly string[],
    custom: list,
  });
});

export const POST = withApiHandler(async (req) => {
  const user = await requireCurrentUser();
  const body = await parseJsonBody(req);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    throw validationError(parsed.error.issues[0]?.message ?? "参数非法");
  }
  const name = parsed.data.name;

  // 与预置名单重复时 409 友好提示
  if ((COMPANY_ORDER as readonly string[]).includes(name)) {
    throw conflict(`"${name}" 已在预置名单内，无需自定义`);
  }

  // 同用户下唯一
  const existed = await prisma.customCompany.findUnique({
    where: { userId_name: { userId: user.id, name } },
  });
  if (existed) {
    throw conflict(`"${name}" 已在你的列表里`);
  }

  const created = await prisma.customCompany.create({
    data: { userId: user.id, name },
    select: { id: true, name: true, createdAt: true },
  });
  return jsonOk(created, { status: 201 });
});
