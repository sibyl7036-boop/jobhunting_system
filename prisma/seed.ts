/**
 * prisma/seed.ts
 *
 * [2026-04-25 auth-v1] 改造为按用户隔离后：
 *   - /companies 页的"10 家大厂"已由 COMPANY_ORDER 常量在前端保证展示
 *   - 不需要在数据库里预置"未投递"占位 Application
 *   - 保留此文件只为兼容 package.json 的 prisma.seed 脚本，运行后 noop
 *
 * 如需预置演示数据，可按 userId 创建（本脚本暂不涉及）。
 */

async function main() {
  console.log("▶ Seed: noop（数据按用户维度隔离，不需要全局预置）");
}

main().catch((e) => {
  console.error("❌ Seed 失败:", e);
  process.exit(1);
});
