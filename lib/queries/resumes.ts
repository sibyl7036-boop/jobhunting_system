/**
 * lib/queries/resumes.ts
 *
 * 服务端直调 Prisma：简历列表（按 createdAt desc）。
 */

import "server-only";
import { prisma } from "@/lib/db";

export async function getResumes() {
  return prisma.resume.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export type ResumeRow = Awaited<ReturnType<typeof getResumes>>[number];
