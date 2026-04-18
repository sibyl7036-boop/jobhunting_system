import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client 单例（Next.js dev 模式防 HMR 连接泄漏）
 *
 * 生产环境每次 `new PrismaClient()` 只会跑一次；
 * 开发环境因为 Next.js 热更新会反复加载模块，不做单例会导致连接数飙升。
 * 参考：https://pris.ly/d/help/next-js-best-practices
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
