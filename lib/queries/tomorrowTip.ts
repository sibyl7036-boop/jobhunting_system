/**
 * lib/queries/tomorrowTip.ts · 明日 AI 提醒（Step 6.6）
 *
 * 缓存策略（架构契约点 · TomorrowTipCache + eventsHash 被动失效）：
 *   - 计算"明天"的本地时区 YYYY-MM-DD 字符串
 *   - 拉明天的 Stage 列表，按 id + time + type + status 排序 stringify + SHA-256 得 eventsHash
 *   - 查 TomorrowTipCache(date=明天)：若命中且 eventsHash 一致 → 直接返 tipText
 *   - 不命中 / hash 不一致 → 调 AI → upsert
 *   - 事件集合为空时：不调 AI，返回 UI.md 8.4 空态文案原文
 *
 * "事件变更自动失效" 无需额外清缓存代码——任何手动 / AI CRUD 改了明天的 Stage，
 * 下次访问时 eventsHash 自动不匹配，走重算路径。
 */

import "server-only";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { callAI, AIError } from "@/lib/llmClient";
import { SYS_TOMORROW_TIP, userPromptTomorrowTip } from "@/lib/prompts";
import { startOfDayOffset, formatLocalDate } from "@/lib/dates";

const EMPTY_TIP = "明天暂无流程安排，可以安心休息一下。"; // UI.md 8.4 空态原文

interface TomorrowTipResult {
  /** 卡片上直接展示的文本 */
  tipText: string;
  /** 是否命中缓存（调试用） */
  fromCache: boolean;
  /** 明天事件数（调试 / 前端刷新按钮用） */
  eventCount: number;
  /** 明天日期字符串 YYYY-MM-DD */
  tomorrow: string;
}

export async function getTomorrowTip(options?: {
  /** 强制重算（跳过缓存）；用于前端点 RefreshCw */
  force?: boolean;
}): Promise<TomorrowTipResult> {
  const force = options?.force ?? false;

  // 明天 [0:00, 24:00)
  const start = startOfDayOffset(1);
  const end = startOfDayOffset(2);
  const tomorrow = formatLocalDate(start);

  const events = await prisma.stage.findMany({
    where: { time: { gte: start, lt: end } },
    orderBy: [{ time: "asc" }],
    include: {
      application: {
        select: { companyName: true, departmentName: true, roleName: true },
      },
    },
  });

  // 空事件：直接返空态文案，不调 AI、不落缓存
  if (events.length === 0) {
    return {
      tipText: EMPTY_TIP,
      fromCache: false,
      eventCount: 0,
      tomorrow,
    };
  }

  // 计算 eventsHash
  const fingerprint = events
    .map((e) => ({
      id: e.id,
      time: e.time?.toISOString() ?? null,
      type: e.type,
      status: e.status,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
  const eventsHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(fingerprint))
    .digest("hex");

  // 查缓存
  if (!force) {
    const hit = await prisma.tomorrowTipCache.findUnique({
      where: { date: tomorrow },
    });
    if (hit && hit.eventsHash === eventsHash) {
      return {
        tipText: hit.tipText,
        fromCache: true,
        eventCount: events.length,
        tomorrow,
      };
    }
  }

  // 调 AI
  const eventLines = events
    .map((e, i) => {
      const time = e.time
        ? new Date(e.time).toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "时间未定";
      const app = e.application;
      return `${i + 1}. ${time} · ${app.companyName}${app.departmentName ? ` · ${app.departmentName}` : ""}${app.roleName ? ` · ${app.roleName}` : ""} · ${e.type}（${e.status}）`;
    })
    .join("\n");

  try {
    const { text } = await callAI({
      taskType: "tomorrow_tip",
      systemPrompt: SYS_TOMORROW_TIP,
      userPrompt: userPromptTomorrowTip(eventLines),
      expectJson: false,
      logInputText: eventLines,
    });
    const tipText = text.trim() || EMPTY_TIP;

    await prisma.tomorrowTipCache.upsert({
      where: { date: tomorrow },
      create: { date: tomorrow, tipText, eventsHash },
      update: { tipText, eventsHash },
    });

    return {
      tipText,
      fromCache: false,
      eventCount: events.length,
      tomorrow,
    };
  } catch (e) {
    if (e instanceof AIError) {
      console.warn("[tomorrow-tip] AI failed:", e.code, e.message);
    } else {
      console.warn("[tomorrow-tip] unexpected:", e);
    }
    // 失败时优雅降级：返回简单的兜底文本，不缓存
    const firstEvent = events[0];
    const company = firstEvent.application.companyName;
    return {
      tipText: `明天共 ${events.length} 个流程事件（${company}等），请提前确认会议链接和状态。`,
      fromCache: false,
      eventCount: events.length,
      tomorrow,
    };
  }
}

/** 清掉当日缓存（供 Refresh 按钮用） */
export async function clearTomorrowTipCache(): Promise<void> {
  const tomorrow = formatLocalDate(startOfDayOffset(1));
  await prisma.tomorrowTipCache
    .delete({ where: { date: tomorrow } })
    .catch(() => {
      /* 不存在就算了 */
    });
}
