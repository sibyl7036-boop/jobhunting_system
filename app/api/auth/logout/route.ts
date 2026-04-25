/**
 * POST /api/auth/logout · 清 Cookie
 */

import { jsonOk, withApiHandler } from "@/lib/api";
import { clearSessionCookie } from "@/lib/auth";

export const POST = withApiHandler(async () => {
  await clearSessionCookie();
  return jsonOk({ ok: true });
});
