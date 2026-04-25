/**
 * lib/auth.ts · 认证基础设施
 *
 * 职责：
 *   - 密码哈希 / 校验（bcryptjs）
 *   - JWT 签发 / 验证（jose · HS256）
 *   - Cookie Session 读写（httpOnly / sameSite=lax / 7d 过期）
 *   - getCurrentUser()：服务端读取当前登录用户（Server Component / Route Handler）
 *   - requireCurrentUser()：强制登录，否则抛 401 ApiError
 *
 * [2026-04-25 auth-v1]
 */

import "server-only";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/api";

export const AUTH_COOKIE_NAME = "jhb_session";
const SESSION_DAYS = 7;
const SESSION_MAX_AGE_SEC = SESSION_DAYS * 24 * 60 * 60;

// ── JWT 密钥：生产部署时务必通过 env 注入 AUTH_SECRET ──
const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ||
    "jhb-macaron-dev-secret-change-in-prod-2026-04-25-" +
      "this-string-must-be-at-least-32-bytes-for-HS256"
);

// ── 密码 ──
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ── JWT ──
export interface SessionPayload extends JWTPayload {
  sub: string; // userId
  nickname: string;
  email: string;
}

export async function signSession(
  user: { id: string; nickname: string; email: string }
): Promise<string> {
  return new SignJWT({
    nickname: user.nickname,
    email: user.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(SECRET);
}

export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, SECRET);
    if (!payload.sub) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Cookie 读写（Server Component / Route Handler 用） ──
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

// ── 当前用户（Server 侧） ──
export interface CurrentUser {
  id: string;
  email: string;
  nickname: string;
}

/** 返回当前登录用户；未登录返 null */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifySession(token);
  if (!payload) return null;

  // 校验用户仍存在（防止账号被删后 cookie 还活着）
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, nickname: true },
  });
  return user;
}

/** 必登录：API / Route Handler 用；未登录抛 401 */
export async function requireCurrentUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new ApiError("UNAUTHORIZED", "请先登录", 401);
  }
  return user;
}

// ── 邮箱 / 密码 / 昵称 基础校验（供 API 用） ──
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  if (!email || typeof email !== "string") return "请输入邮箱";
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length > 120) return "邮箱过长";
  if (!EMAIL_RE.test(trimmed)) return "邮箱格式不正确";
  return null;
}

export function validatePassword(pw: string): string | null {
  if (!pw || typeof pw !== "string") return "请输入密码";
  if (pw.length < 8) return "密码至少 8 位";
  if (pw.length > 200) return "密码过长";
  if (!/[a-zA-Z]/.test(pw) || !/\d/.test(pw))
    return "密码需包含字母和数字";
  return null;
}

export function validateNickname(n: string): string | null {
  if (!n || typeof n !== "string") return "请填写昵称";
  const trimmed = n.trim();
  if (trimmed.length < 1) return "昵称不能为空";
  if (trimmed.length > 20) return "昵称不超过 20 字";
  return null;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
