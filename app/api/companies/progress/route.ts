/**
 * GET /api/companies/progress
 *
 * 返回 10 家大厂全量数据（按 PRD 5.3.3 固定顺序），每家含 Application[]，每个 Application 含 Stage[]。
 * 每个 Application 附 isEmpty（currentStatus === "未投递" 为 true，便于前端空态展示）。
 *
 * 对应 PRD 7.4 / implementation_plan Step 2.4
 */

import { prisma } from "@/lib/db";
import { jsonOk, withApiHandler } from "@/lib/api";
import { serializeApplication } from "@/lib/serialize";

/** PRD 5.3.3 规定顺序，作为最终响应的公司顺序基准 */
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
  // 一次性拉所有 Application + 对应 Stage
  const all = await prisma.application.findMany({
    include: {
      stages: { orderBy: [{ time: "asc" }, { createdAt: "asc" }] },
    },
    orderBy: { createdAt: "asc" },
  });

  // 按公司聚合
  const byCompany = new Map<string, typeof all>();
  for (const app of all) {
    const arr = byCompany.get(app.companyName) ?? [];
    arr.push(app);
    byCompany.set(app.companyName, arr);
  }

  // 按 PRD 顺序输出
  const result = COMPANY_ORDER.map((companyName) => {
    const apps = byCompany.get(companyName) ?? [];
    const serialized = apps.map((a) => ({
      ...serializeApplication(a),
      // time 为 null 的 Stage 排最后（findMany 的 orderBy 已处理 null last）
      isEmpty: a.currentStatus === "未投递",
    }));
    return {
      companyName,
      applications: serialized,
    };
  });

  return jsonOk(result);
});
