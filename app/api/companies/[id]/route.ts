/**
 * /api/companies/[id]
 *
 * DELETE · 删除用户自定义的公司条目（不影响历史 Application 数据）
 */

import { prisma } from "@/lib/db";
import { jsonOk, withApiHandler, notFound } from "@/lib/api";
import { requireCurrentUser } from "@/lib/auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const DELETE = withApiHandler<RouteContext>(async (_req, ctx) => {
  const user = await requireCurrentUser();
  const { id } = await ctx.params;
  const existing = await prisma.customCompany.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    throw notFound(`公司条目 id=${id} 不存在`);
  }
  await prisma.customCompany.delete({ where: { id } });
  return jsonOk({ id, deleted: true });
});
