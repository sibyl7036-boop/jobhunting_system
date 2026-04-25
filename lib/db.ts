import { PrismaClient, Prisma } from "@prisma/client";

/**
 * Prisma Client 单例（Next.js dev 模式防 HMR 连接泄漏）
 *
 * 生产环境每次 `new PrismaClient()` 只会跑一次；
 * 开发环境因为 Next.js 热更新会反复加载模块，不做单例会导致连接数飙升。
 * 参考：https://pris.ly/d/help/next-js-best-practices
 *
 * [2026-04-25 neon-pooler-retry]
 * Neon pooler(pgbouncer) 对 idle 连接会主动关，偶发 `Connection Closed` 错误。
 * 用 $extends 对所有查询加一层"一次性自动重试"，把短暂的连接中断对业务透明化。
 */

const TRANSIENT_ERRORS = [
  "Connection closed",
  "Closed",
  "Connection reset",
  "Timed out",
  "kind: Closed",
  "Server has closed the connection",
];

function isTransient(err: unknown): boolean {
  const msg =
    err instanceof Error
      ? err.message
      : typeof err === "string"
      ? err
      : "";
  return TRANSIENT_ERRORS.some((k) =>
    msg.toLowerCase().includes(k.toLowerCase())
  );
}

function createPrismaClient() {
  const base = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });

  return base.$extends({
    query: {
      $allOperations: async ({ args, query }) => {
        try {
          return await query(args);
        } catch (err) {
          if (isTransient(err)) {
            // 给池子 100ms 恢复再重试一次
            await new Promise((r) => setTimeout(r, 100));
            return await query(args);
          }
          throw err;
        }
      },
    },
  });
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

export const prisma: ExtendedPrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// 保留原类型导出便于其他文件引用
export type { Prisma };
