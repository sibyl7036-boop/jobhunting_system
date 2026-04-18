/**
 * GET /api/stages/:id/detail
 *
 * Drawer 专用：一次性返 stage + application(含 linkedResume) + jdKeywords 等数组反序列化。
 */

import { prisma } from "@/lib/db";
import { jsonOk, withApiHandler, notFound } from "@/lib/api";
import { serializeApplication } from "@/lib/serialize";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const GET = withApiHandler<RouteContext>(async (_req, ctx) => {
  const { id } = await ctx.params;

  const stage = await prisma.stage.findUnique({
    where: { id },
    include: {
      application: {
        include: {
          linkedResume: { select: { id: true, name: true, tag: true } },
        },
      },
    },
  });

  if (!stage) throw notFound(`Stage ${id} 不存在`);

  const { application: app, ...stageRest } = stage;
  return jsonOk({
    stage: stageRest,
    application: serializeApplication(app),
  });
});
