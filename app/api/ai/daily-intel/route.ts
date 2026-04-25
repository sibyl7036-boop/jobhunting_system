/**
 * GET /api/ai/daily-intel
 *
 * 今日大厂动向摘要（按用户 + 日期缓存）
 * [2026-04-25 auth-v1]
 *
 * 直接复用 lib/queries/intel.ts 的 getDailyIntelSummary，保证逻辑与首页 Server
 * Component 一致（缓存同库同 key）
 */

import { jsonOk, withApiHandler } from "@/lib/api";
import { getDailyIntelSummary } from "@/lib/queries";
import { requireCurrentUser } from "@/lib/auth";

export const GET = withApiHandler(async () => {
  const user = await requireCurrentUser();
  const result = await getDailyIntelSummary(user.id);
  return jsonOk(result);
});
