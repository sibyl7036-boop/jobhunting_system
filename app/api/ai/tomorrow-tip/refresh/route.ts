/**
 * POST /api/ai/tomorrow-tip/refresh · 强制重算明日提醒
 *
 * 前端点 RefreshCw 按钮会调这个端点：先删当日 TomorrowTipCache，再调 getTomorrowTip 重算。
 * GET 版本其实 dashboard Server Component 就能直接用，不需要再建 route。
 */

import { jsonOk, jsonError, withApiHandler } from "@/lib/api";
import {
  clearTomorrowTipCache,
  getTomorrowTip,
} from "@/lib/queries/tomorrowTip";

export const runtime = "nodejs";

export const POST = withApiHandler(async () => {
  await clearTomorrowTipCache();
  try {
    const result = await getTomorrowTip({ force: true });
    return jsonOk(result);
  } catch (e) {
    return jsonError(
      "INTERNAL_ERROR",
      `tomorrow-tip refresh failed: ${e instanceof Error ? e.message : String(e)}`,
      502
    );
  }
});
