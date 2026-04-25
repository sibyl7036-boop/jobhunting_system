/**
 * lib/queries/resumes.ts · 按用户隔离
 */

import "server-only";
import { prisma } from "@/lib/db";

export async function getResumes(userId: string) {
  return prisma.resume.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export type ResumeRow = Awaited<ReturnType<typeof getResumes>>[number];
