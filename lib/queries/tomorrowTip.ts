/**
 * lib/queries/tomorrowTip.ts · 明日 AI 提醒（按用户隔离）
 *
 * [2026-04-25 auth-v1] 按 (userId, date) 联合唯一
 */

import "server-only";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { callAI, AIError } from "@/lib/llmClient";
import { SYS_TOMORROW_TIP, userPromptTomorrowTip } from "@/lib/prompts";
import { startOfDayOffset, formatLocalDate } from "@/lib/dates";

const EMPTY_TIP = "明天暂无流程安排，可以安心休息一下。";

interface TomorrowTipResult {
  tipText: string;
  fromCache: boolean;
  eventCount: number;
  tomorrow: string;
}

export async function getTomorrowTip(
  userId: string,
  options?: { force?: boolean }
): Promise<TomorrowTipResult> {
  const force = options?.force ?? false;

  const start = startOfDayOffset(1);
  const end = startOfDayOffset(2);
  const tomorrow = formatLocalDate(start);

  const events = await prisma.stage.findMany({
    where: {
      time: { gte: start, lt: end },
      application: { userId },
    },
    orderBy: [{ time: "asc" }],
    include: {
      application: {
        select: { companyName: true, departmentName: true, roleName: true },
      },
    },
  });

  if (events.length === 0) {
    return {
      tipText: EMPTY_TIP,
      fromCache: false,
      eventCount: 0,
      tomorrow,
    };
  }

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

  if (!force) {
    const hit = await prisma.tomorrowTipCache.findUnique({
      where: { userId_date: { userId, date: tomorrow } },
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
      userId,
    });
    const tipText = text.trim() || EMPTY_TIP;

    await prisma.tomorrowTipCache.upsert({
      where: { userId_date: { userId, date: tomorrow } },
      create: { userId, date: tomorrow, tipText, eventsHash },
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

export async function clearTomorrowTipCache(userId: string): Promise<void> {
  const tomorrow = formatLocalDate(startOfDayOffset(1));
  await prisma.tomorrowTipCache
    .delete({ where: { userId_date: { userId, date: tomorrow } } })
    .catch(() => {
      /* 不存在就算了 */
    });
}
