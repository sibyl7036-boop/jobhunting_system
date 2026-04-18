/**
 * lib/fetcher.ts · 最小化客户端 fetch 封装
 *
 * 使用场景：
 *   - Client Component 里调 /api/* 做 CRUD（Phase 4 Drawer 开始用）
 *   - 如果是 Server Component 首屏数据，优先走 lib/queries/ 直调 Prisma，不用本文件
 *
 * 约定：
 *   - 成功：返 T（已是 API 的 data 部分；{ data } 结构自动剥壳）
 *   - 失败：抛 FetchError，前端 catch 后展示 message
 *
 * 对齐 architecture.md 关键契约点 12 的错误结构：
 *   { error: { code, message, details? } }
 */

export class FetchError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "FetchError";
  }
}

interface ApiErrorEnvelope {
  error: { code: string; message: string; details?: unknown };
}

export async function fetchJson<T>(
  input: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, {
    // 默认带 Content-Type：POST / PATCH 请求体是 JSON
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers || {}),
    },
    ...init,
  });

  // 204 之类无 body 的响应
  const text = await res.text();
  const body = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const env = body as Partial<ApiErrorEnvelope> | null;
    const err = env?.error;
    throw new FetchError(
      res.status,
      err?.code ?? "UNKNOWN_ERROR",
      err?.message ?? `请求失败（HTTP ${res.status}）`,
      err?.details
    );
  }

  return body as T;
}
