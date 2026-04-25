/**
 * POST /api/auth/register
 *
 * body: { email, password, nickname }
 *
 * - 校验字段 → 409 邮箱已注册 / 400 校验错
 * - hash 密码 → 建 User → 签 JWT → 写 Cookie
 * - 返回 { id, email, nickname }
 */

import { prisma } from "@/lib/db";
import { jsonOk, withApiHandler, parseJsonBody, validationError, conflict } from "@/lib/api";
import {
  hashPassword,
  signSession,
  setSessionCookie,
  validateEmail,
  validatePassword,
  validateNickname,
  normalizeEmail,
} from "@/lib/auth";

interface RegisterBody {
  email?: string;
  password?: string;
  nickname?: string;
}

export const POST = withApiHandler(async (req) => {
  const body = (await parseJsonBody<RegisterBody>(req)) ?? {};
  const emailErr = validateEmail(body.email ?? "");
  if (emailErr) throw validationError(emailErr);
  const pwErr = validatePassword(body.password ?? "");
  if (pwErr) throw validationError(pwErr);
  const nnErr = validateNickname(body.nickname ?? "");
  if (nnErr) throw validationError(nnErr);

  const email = normalizeEmail(body.email!);
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw conflict("该邮箱已注册，请直接登录");

  const passwordHash = await hashPassword(body.password!);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      nickname: body.nickname!.trim(),
    },
    select: { id: true, email: true, nickname: true },
  });

  const token = await signSession(user);
  await setSessionCookie(token);

  return jsonOk(user, { status: 201 });
});
