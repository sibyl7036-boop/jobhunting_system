/**
 * lib/queries/companies.ts · 按用户隔离
 */

import "server-only";
import { prisma } from "@/lib/db";
import { serializeApplication } from "@/lib/serialize";

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

/**
 * @param userId
 * @param extraCompanies 用户自定义公司名（与预置合并，放在预置之后）
 */
export async function getCompaniesProgress(
  userId: string,
  extraCompanies: readonly string[] = []
) {
  const all = await prisma.application.findMany({
    where: { userId },
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

  // 预置 + 自定义（去重，custom 不重复预置里已有的）
  const presetSet = new Set<string>(COMPANY_ORDER);
  const uniqueCustom = extraCompanies.filter((c) => !presetSet.has(c));
  const finalOrder: string[] = [...COMPANY_ORDER, ...uniqueCustom];

  return finalOrder.map((companyName) => {
    const apps = byCompany.get(companyName) ?? [];
    const serialized = apps.map((a) => ({
      ...serializeApplication(a),
      isEmpty: a.currentStatus === "未投递",
    }));
    return {
      companyName,
      isCustom: !presetSet.has(companyName),
      applications: serialized,
    };
  });
}

export type CompanyProgressRow = Awaited<
  ReturnType<typeof getCompaniesProgress>
>[number];
export type CompanyApplication = CompanyProgressRow["applications"][number];
export type CompanyStage = CompanyApplication["stages"][number];
