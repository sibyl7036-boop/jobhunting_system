/**
 * GET /api/companies/progress · 当前用户
 *
 * [2026-04-25 auth-v1]
 */

import { prisma } from "@/lib/db";
import { jsonOk, withApiHandler } from "@/lib/api";
import { serializeApplication } from "@/lib/serialize";
import { requireCurrentUser } from "@/lib/auth";

const COMPANY_ORDER = [
  "阿里",
  "腾讯",
  "字节",
  "美团",
  "百度",
  "京东",
  "拼多多",
  "小红书",
  "快手",
  "滴滴",
] as const;

export const GET = withApiHandler(async () => {
  const user = await requireCurrentUser();
  const all = await prisma.application.findMany({
    where: { userId: user.id },
    include: {
      stages: { orderBy: [{ time: "asc" }, { createdAt: "asc" }] },
    },
    orderBy: { createdAt: "asc" },
  });

  const byCompany = new Map<string, typeof all>();
  for (const app of all) {
    const arr = byCompany.get(app.companyName) ?? [];
    arr.push(app);
    byCompany.set(app.companyName, arr);
  }

  const result = COMPANY_ORDER.map((companyName) => {
    const apps = byCompany.get(companyName) ?? [];
    const serialized = apps.map((a) => ({
      ...serializeApplication(a),
      isEmpty: a.currentStatus === "未投递",
    }));
    return { companyName, applications: serialized };
  });

  return jsonOk(result);
});
