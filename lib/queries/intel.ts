/**
 * lib/queries/intel.ts · 今日大厂动向（按用户隔离）
 *
 * [2026-04-25 auth-v1] IntelSummary 按 (userId, date) 联合唯一
 * 动向信息本身是 global 的，但每个用户有独立缓存 key，便于未来做个性化
 */

import "server-only";
import { prisma } from "@/lib/db";
import { callAI, AIError } from "@/lib/llmClient";
import { SYS_DAILY_INTEL, userPromptDailyIntel } from "@/lib/prompts";
import { formatLocalDate } from "@/lib/dates";
import { FAKE_INTEL, formatIntelItemsForPrompt } from "@/lib/fakeIntelSource";

export async function getDailyIntelSummary(userId: string): Promise<{
  summary: string | null;
  fromCache: boolean;
}> {
  const today = formatLocalDate();

  const hit = await prisma.intelSummary.findUnique({
    where: { userId_date: { userId, date: today } },
  });
  if (hit) return { summary: hit.summaryText, fromCache: true };

  try {
    const { text } = await callAI({
      taskType: "daily_intel",
      systemPrompt: SYS_DAILY_INTEL,
      userPrompt: userPromptDailyIntel(formatIntelItemsForPrompt(FAKE_INTEL)),
      expectJson: false,
      userId,
    });
    const summary = text.trim();
    await prisma.intelSummary.upsert({
      where: { userId_date: { userId, date: today } },
      create: { userId, date: today, summaryText: summary },
      update: { summaryText: summary },
    });
    return { summary, fromCache: false };
  } catch (e) {
    if (e instanceof AIError) {
      console.warn("[daily-intel] AI failed:", e.code, e.message);
    } else {
      console.warn("[daily-intel] unexpected:", e);
    }
    return { summary: null, fromCache: false };
  }
}
