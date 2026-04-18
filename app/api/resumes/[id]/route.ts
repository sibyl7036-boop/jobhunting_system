/**
 * /api/resumes/[id]
 *
 * PATCH · 改名 / 改 tag
 * DELETE · 删除；若被某 Application.linkedResumeId 引用则返 409；成功后同步清掉 uploads/<id>.pdf
 *
 * 对应 PRD 7.1 / implementation_plan Step 2.1 + Step 5.1
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

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ── PATCH ──
export const PATCH = withApiHandler<RouteContext>(async (req, ctx) => {
  const { id } = await ctx.params;
  const body = await parseJsonBody(req);
  const data = resumeUpdateInputSchema.parse(body);

  const existing = await prisma.resume.findUnique({ where: { id } });
  if (!existing) throw notFound(`Resume id=${id} 不存在`);

  const updated = await prisma.resume.update({
    where: { id },
    data,
  });
  return jsonOk(updated);
});

// ── DELETE ──
export const DELETE = withApiHandler<RouteContext>(async (_req, ctx) => {
  const { id } = await ctx.params;
  const existing = await prisma.resume.findUnique({ where: { id } });
  if (!existing) throw notFound(`Resume id=${id} 不存在`);

  // 引用校验
  const refs = await prisma.application.findMany({
    where: { linkedResumeId: id },
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

  // 同步清理物理文件（失败不阻断，只 log）
  const filePath = path.join(UPLOADS_DIR, `${id}.pdf`);
  try {
    await fs.unlink(filePath);
  } catch (e) {
    // 文件可能本来就不存在；log 但不抛
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn(`[resumes] 删除文件失败 ${filePath}:`, e);
    }
  }

  return jsonOk({ id, deleted: true });
});
