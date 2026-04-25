/**
 * POST /api/auth/login
 *
 * body: { email, password }
 * - 邮箱/密码错 → 401（统一返 "邮箱或密码错误"）
 * - 成功 → 签 JWT、写 Cookie、返 user
 */

import { prisma } from "@/lib/db";
import {
  jsonOk,
  withApiHandler,
  parseJsonBody,
  validationError,
  ApiError,
} from "@/lib/api";
import {
  verifyPassword,
  signSession,
  setSessionCookie,
  validateEmail,
  normalizeEmail,
} from "@/lib/auth";

interface LoginBody {
  email?: string;
  password?: string;
}

export const POST = withApiHandler(async (req) => {
  const body = (await parseJsonBody<LoginBody>(req)) ?? {};
  const emailErr = validateEmail(body.email ?? "");
  if (emailErr) throw validationError(emailErr);
  if (!body.password) throw validationError("请输入密码");

  const email = normalizeEmail(body.email!);
  const user = await prisma.user.findUnique({ where: { email } });

  const genericError = new ApiError(
    "UNAUTHORIZED",
    "邮箱或密码错误",
    401
  );

  if (!user) throw genericError;
  const ok = await verifyPassword(body.password, user.passwordHash);
  if (!ok) throw genericError;

  const token = await signSession(user);
  await setSessionCookie(token);

  return jsonOk({
    id: user.id,
    email: user.email,
    nickname: user.nickname,
  });
});
