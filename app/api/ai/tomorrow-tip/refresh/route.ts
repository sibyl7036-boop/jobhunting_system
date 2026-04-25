/**
 * POST /api/ai/tomorrow-tip/refresh
 *
 * 强制清空明日提醒缓存并重新生成
 * [2026-04-25 auth-v1] 按当前用户隔离
 */

import { jsonOk, withApiHandler } from "@/lib/api";
import { clearTomorrowTipCache, getTomorrowTip } from "@/lib/queries";
import { requireCurrentUser } from "@/lib/auth";

export const POST = withApiHandler(async () => {
  const user = await requireCurrentUser();
  await clearTomorrowTipCache(user.id);
  const result = await getTomorrowTip(user.id, { force: true });
  return jsonOk(result);
});
