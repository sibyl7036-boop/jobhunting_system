/**
 * lib/queries/companies.ts
 *
 * 服务端直调 Prisma：返回 10 家大厂（按 PRD 5.3.3 固定顺序）+ 各自 Application + Stage。
 * 和 /api/companies/progress 逻辑一致。
 */

import "server-only";
import { prisma } from "@/lib/db";
import { serializeApplication } from "@/lib/serialize";

/** PRD 5.3.3 公司顺序 */
export const COMPANY_ORDER = [
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

export type CompanyName = (typeof COMPANY_ORDER)[number];

export async function getCompaniesProgress() {
  const all = await prisma.application.findMany({
    include: {
      stages: { orderBy: [{ time: "asc" }, { createdAt: "asc" }] },
    },
    orderBy: { createdAt: "asc" },
  });

  // 按公司名聚合
  const byCompany = new Map<string, typeof all>();
  for (const app of all) {
    const arr = byCompany.get(app.companyName) ?? [];
    arr.push(app);
    byCompany.set(app.companyName, arr);
  }

  // 按 PRD 顺序输出
  return COMPANY_ORDER.map((companyName) => {
    const apps = byCompany.get(companyName) ?? [];
    const serialized = apps.map((a) => ({
      ...serializeApplication(a),
      isEmpty: a.currentStatus === "未投递",
    }));
    return { companyName, applications: serialized };
  });
}

export type CompanyProgressRow = Awaited<
  ReturnType<typeof getCompaniesProgress>
>[number];
export type CompanyApplication = CompanyProgressRow["applications"][number];
export type CompanyStage = CompanyApplication["stages"][number];
