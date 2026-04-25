/**
 * GET /api/auth/me · 当前登录用户信息
 * 未登录 → 401
 */

import { jsonOk, withApiHandler } from "@/lib/api";
import { requireCurrentUser } from "@/lib/auth";

export const GET = withApiHandler(async () => {
  const user = await requireCurrentUser();
  return jsonOk(user);
});
