/**
 * middleware.ts · 登录态路由保护
 *
 * 规则：
 *   - 未登录访问 /dashboard /calendar /companies /api/... (白名单除外) → 302 /login (业务页) 或 401 (API)
 *   - 已登录访问 /login → 302 /dashboard
 *
 * 运行在 Edge，用 jose 验签（不能用 Prisma / bcryptjs Node 原生库）
 *
 * 白名单（无需登录）：
 *   - /login, /api/auth/**, /_next, /favicon, public 静态资源, /api/resumes/:id/file (不做保护会泄露?)
 *
 * 实际：/api/resumes/:id/file 需要登录才看，保持一致性
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "jhb_session";
const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ||
    "jhb-macaron-dev-secret-change-in-prod-2026-04-25-" +
      "this-string-must-be-at-least-32-bytes-for-HS256"
);

// 无需登录的路径前缀
const PUBLIC_PREFIXES = [
  "/login",
  "/api/auth/",
  "/_next/",
  "/favicon",
];

// API 路径需要返 401 而不是重定向
function isApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p)) ||
    pathname === "/" ||
    pathname === "/login";
}

async function isAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return !!payload.sub;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 已登录访问 /login → 去 dashboard
  if (pathname === "/login") {
    const authed = await isAuthed(req);
    if (authed) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 公共路径
  if (isPublic(pathname)) return NextResponse.next();

  // 其他路径全部校验登录
  const authed = await isAuthed(req);
  if (authed) return NextResponse.next();

  // 未登录 API → 401 JSON
  if (isApiPath(pathname)) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "请先登录",
        },
      },
      { status: 401 }
    );
  }

  // 未登录业务页 → 重定向到 /login?redirect=<原路径>
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("redirect", pathname);
  return NextResponse.redirect(url);
}

/**
 * 匹配所有业务路径，跳过静态资源。
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)",
  ],
};
