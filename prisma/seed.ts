/**
 * prisma/seed.ts · 预置 10 家大厂占位 Application
 *
 * 目的：给 /companies 页的"未投递公司"逻辑兜底数据。
 * 每家大厂创建一条 currentStatus=未投递 的占位 Application（无 Stage）。
 *
 * 幂等：用 (companyName, departmentName, roleName) 作为自然键 upsert，重复跑不会产生重复数据。
 * 运行：pnpm exec prisma db seed
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PRD 5.3.3 规定的 10 家大厂，按 PRD 顺序
const BIG_COMPANIES = [
  "阿里",
  "腾讯",
  "字节",
  "美团",
  "百度",
  "京东",
  "拼多多",
  "小红书",
  "快手",
  "滴滴",
] as const;

async function main() {
  console.log("▶ Seed: 预置 10 家大厂占位 Application");

  for (const companyName of BIG_COMPANIES) {
    // 自然键：companyName + departmentName="" + roleName="待填"
    // findFirst + 分支 upsert（Prisma 不支持复合非唯一字段的 where unique，手写等价逻辑）
    const existing = await prisma.application.findFirst({
      where: {
        companyName,
        departmentName: "",
        roleName: "待填",
      },
    });

    if (existing) {
      console.log(`  [skip] ${companyName} 已存在 (id=${existing.id})`);
      continue;
    }

    const created = await prisma.application.create({
      data: {
        companyName,
        departmentName: "",
        roleName: "待填",
        currentStatus: "未投递",
      },
    });
    console.log(`  [create] ${companyName} (id=${created.id})`);
  }

  const total = await prisma.application.count();
  console.log(`✅ Seed 完成，Application 表共 ${total} 条记录`);
}

main()
  .catch((e) => {
    console.error("❌ Seed 失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
