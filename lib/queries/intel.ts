/**
 * lib/queries/intel.ts · 今日大厂动向（Server Component 首屏直用）
 *
 * 和 /api/ai/daily-intel 逻辑等价：命中本地缓存则直接返，否则调 AI 后 upsert。
 * Server Component 首屏 await 本函数 + 把结果传给 DailyIntel 卡片。
 */

import "server-only";
import { prisma } from "@/lib/db";
import { callAI, AIError } from "@/lib/llmClient";
import { SYS_DAILY_INTEL, userPromptDailyIntel } from "@/lib/prompts";
import { formatLocalDate } from "@/lib/dates";
import { FAKE_INTEL, formatIntelItemsForPrompt } from "@/lib/fakeIntelSource";

/**
 * 返回今日摘要字符串；AI/配置失败时返 null（前端显示"暂无动向"兜底）
 */
export async function getDailyIntelSummary(): Promise<{
  summary: string | null;
  fromCache: boolean;
}> {
  const today = formatLocalDate();

  const hit = await prisma.intelSummary.findUnique({ where: { date: today } });
  if (hit) return { summary: hit.summaryText, fromCache: true };

  try {
    const { text } = await callAI({
      taskType: "daily_intel",
      systemPrompt: SYS_DAILY_INTEL,
      userPrompt: userPromptDailyIntel(formatIntelItemsForPrompt(FAKE_INTEL)),
      expectJson: false,
    });
    const summary = text.trim();
    await prisma.intelSummary.upsert({
      where: { date: today },
      create: { date: today, summaryText: summary },
      update: { summaryText: summary },
    });
    return { summary, fromCache: false };
  } catch (e) {
    // Server Component 首屏不应因 AI 错误而整页崩；只打 server log + 返 null
    if (e instanceof AIError) {
      console.warn("[daily-intel] AI failed:", e.code, e.message);
    } else {
      console.warn("[daily-intel] unexpected:", e);
    }
    return { summary: null, fromCache: false };
  }
}
