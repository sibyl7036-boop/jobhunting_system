/**
 * lib/api.ts · API route 通用工具
 *
 * 统一：
 *   - 响应结构：成功返数据、失败返 { error: { code, message, details? } } + HTTP 4xx/5xx
 *   - 错误 code：VALIDATION_ERROR / NOT_FOUND / CONFLICT / INTERNAL_ERROR
 *   - 高阶 withApiHandler：catch 未捕获异常 → 500 + console.error
 *   - zod 校验失败 → 自动返 400 VALIDATION_ERROR
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "FEATURE_UNAVAILABLE_IN_DEMO"
  | "INTERNAL_ERROR";

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
}

// ── 响应工具 ──
export function jsonOk<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}

export function jsonError(
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: unknown
): NextResponse<ApiErrorBody> {
  return NextResponse.json<ApiErrorBody>(
    { error: { code, message, details } },
    { status }
  );
}

// ── 已知错误类型：route 内部抛这些会被 withApiHandler 统一处理 ──
export class ApiError extends Error {
  code: ApiErrorCode;
  status: number;
  details?: unknown;

  constructor(
    code: ApiErrorCode,
    message: string,
    status: number,
    details?: unknown
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const notFound = (message = "Not Found") =>
  new ApiError("NOT_FOUND", message, 404);

export const conflict = (message: string, details?: unknown) =>
  new ApiError("CONFLICT", message, 409, details);

export const validationError = (message: string, details?: unknown) =>
  new ApiError("VALIDATION_ERROR", message, 400, details);

// ── 高阶：catch 未捕获异常、zod 错误 ──
type RouteHandler<TContext = unknown> = (
  req: Request,
  context: TContext
) => Promise<NextResponse>;

export function withApiHandler<TContext = unknown>(
  handler: RouteHandler<TContext>
): RouteHandler<TContext> {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (e) {
      // zod 校验失败 → 400
      if (e instanceof ZodError) {
        return jsonError(
          "VALIDATION_ERROR",
          "请求参数校验失败",
          400,
          e.issues.map((i) => ({ path: i.path.join("."), message: i.message }))
        );
      }
      // 已知 ApiError → 按声明的状态码返
      if (e instanceof ApiError) {
        return jsonError(e.code, e.message, e.status, e.details);
      }
      // 兜底未知异常 → 500
      console.error("[api] uncaught:", e);
      return jsonError(
        "INTERNAL_ERROR",
        "服务器内部错误，请稍后重试",
        500,
        process.env.NODE_ENV === "development"
          ? e instanceof Error
            ? e.message
            : String(e)
          : undefined
      );
    }
  };
}

// ── 请求体 JSON 解析 ──
export async function parseJsonBody<T = unknown>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw validationError("请求体必须是合法 JSON");
  }
}
