/**
 * GET /api/ai/daily-intel
 *
 * 今日大厂动向摘要（PRD 5.1.3 + 9.5）
 *
 * 缓存策略（Step 6.5 决策）：
 *   - IntelSummary.date 存"生成日（本地时区 YYYY-MM-DD 字符串）"
 *   - 命中 date=今天 → 直接返 summaryText（不调 AI）
 *   - 未命中 → 调 AI → upsert 入库
 *   - 跨 0 点自动失效（新 date 查不到，自动重算）
 */

import { prisma } from "@/lib/db";
import { jsonOk, withApiHandler, jsonError } from "@/lib/api";
import { callAI, AIError } from "@/lib/llmClient";
import { SYS_DAILY_INTEL, userPromptDailyIntel } from "@/lib/prompts";
import { formatLocalDate } from "@/lib/dates";
import { FAKE_INTEL, formatIntelItemsForPrompt } from "@/lib/fakeIntelSource";

export const runtime = "nodejs";

export const GET = withApiHandler(async () => {
  const today = formatLocalDate(); // YYYY-MM-DD 本地时区

  // 1. 查缓存
  const hit = await prisma.intelSummary.findUnique({ where: { date: today } });
  if (hit) {
    return jsonOk({
      date: today,
      summary: hit.summaryText,
      fromCache: true,
    });
  }

  // 2. 未命中：调 AI
  const itemsText = formatIntelItemsForPrompt(FAKE_INTEL);
  try {
    const { text, runId } = await callAI({
      taskType: "daily_intel",
      systemPrompt: SYS_DAILY_INTEL,
      userPrompt: userPromptDailyIntel(itemsText),
      expectJson: false, // 纯文本
      logInputText: itemsText,
    });

    // 3. 写库
    const summary = text.trim();
    await prisma.intelSummary.upsert({
      where: { date: today },
      create: { date: today, summaryText: summary },
      update: { summaryText: summary },
    });

    return jsonOk({ date: today, summary, fromCache: false, runId });
  } catch (e) {
    if (e instanceof AIError) {
      return jsonError("INTERNAL_ERROR", `${e.code}: ${e.message}`, 502, {
        code: e.code,
      });
    }
    throw e;
  }
});
