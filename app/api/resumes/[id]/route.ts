/**
 * /api/resumes/[id]
 *
 * PATCH · 改名 / 改 tag
 * DELETE · 删除；若被 Application 引用则 409
 *
 * [2026-04-25 auth-v1] 归属校验
 */

import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";
import {
  jsonOk,
  withApiHandler,
  notFound,
  conflict,
  parseJsonBody,
} from "@/lib/api";
import { resumeUpdateInputSchema } from "@/lib/schemas";
import { requireCurrentUser } from "@/lib/auth";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function findOwnResume(id: string, userId: string) {
  const r = await prisma.resume.findUnique({ where: { id } });
  if (!r || r.userId !== userId) return null;
  return r;
}

export const PATCH = withApiHandler<RouteContext>(async (req, ctx) => {
  const user = await requireCurrentUser();
  const { id } = await ctx.params;
  const existing = await findOwnResume(id, user.id);
  if (!existing) throw notFound(`Resume id=${id} 不存在`);

  const body = await parseJsonBody(req);
  const data = resumeUpdateInputSchema.parse(body);

  const updated = await prisma.resume.update({ where: { id }, data });
  return jsonOk(updated);
});

export const DELETE = withApiHandler<RouteContext>(async (_req, ctx) => {
  const user = await requireCurrentUser();
  const { id } = await ctx.params;
  const existing = await findOwnResume(id, user.id);
  if (!existing) throw notFound(`Resume id=${id} 不存在`);

  const refs = await prisma.application.findMany({
    where: { linkedResumeId: id, userId: user.id },
    select: { id: true, companyName: true, roleName: true },
  });
  if (refs.length > 0) {
    const names = refs
      .map((r) => `${r.companyName}-${r.roleName}`)
      .slice(0, 3)
      .join(", ");
    const more = refs.length > 3 ? ` 等 ${refs.length} 个岗位` : "";
    throw conflict(`该简历被 ${names}${more} 使用，无法删除`, {
      applicationIds: refs.map((r) => r.id),
    });
  }

  await prisma.resume.delete({ where: { id } });

  const filePath = path.join(UPLOADS_DIR, `${id}.pdf`);
  try {
    await fs.unlink(filePath);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn(`[resumes] 删除文件失败 ${filePath}:`, e);
    }
  }

  return jsonOk({ id, deleted: true });
});
