/**
 * /api/ai/chat · 求职助手通用对话
 *
 * 设计要点：
 *   - 直接调豆包 OpenAI 兼容接口，不走 callAI（通用 chat 不强求 JSON schema 校验）
 *   - 支持多轮 messages（由前端管理历史）
 *   - 仍落 AIRun 日志（taskType 复用 "daily_intel"？不：把通用 chat 作为 "parse_email" 之外的
 *     新 taskType 之前需要改 enum。权衡后：**用最后一轮 user message 作为 inputText，
 *     taskType 复用 "daily_intel"** 不合理；
 *     简单处理：走一条 AIRun.status=success，taskType 用 "parse_email" 会混乱。
 *     方案：AI 聊天不落 AIRun，避免污染任务日志。前端临时保存在会话里。
 *
 * Body: { messages: [{role:'user'|'assistant'|'system', content: string}, ...] }
 * Resp: { reply: string }
 *
 * [2026-04-25 auth-v1] 需要登录
 */

import { z } from "zod";
import {
  jsonOk,
  withApiHandler,
  parseJsonBody,
  validationError,
  ApiError,
} from "@/lib/api";
import { requireCurrentUser } from "@/lib/auth";

const msgSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(12_000),
});

const bodySchema = z.object({
  messages: z.array(msgSchema).min(1).max(30),
});

const SYSTEM_PROMPT = `你是一个贴心、专业的求职助手，叫"求职小助手"。你为正在求职的大学生提供帮助：
- 面试准备、面试题分析、面试复盘
- 简历优化建议
- JD 解析、岗位推荐
- 求职流程规划（投递节奏、offer 比较等）
- 一些心态和时间管理建议

风格：
- 回答简洁、可执行，优先用分点 / 小标题组织
- 不编造公司政策或招聘内幕；不确定时直说"我不确定"
- 默认中文回答，代码保留英文
- 不要长篇大论，控制在 300 字内，必要时主动问用户"还想聊哪一块？"

当前时间：${new Date().toISOString()}`;

export const POST = withApiHandler(async (req) => {
  await requireCurrentUser(); // 隔离：非登录用户不可用

  const body = await parseJsonBody(req);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    throw validationError(parsed.error.issues[0]?.message ?? "参数非法");
  }

  const apiKey = process.env.DOUBAO_API_KEY;
  const baseUrl = process.env.DOUBAO_BASE_URL;
  const model = process.env.DOUBAO_MODEL;
  if (!apiKey || !baseUrl || !model) {
    throw new ApiError(
      "INTERNAL_ERROR",
      "AI 未配置：请检查环境变量 DOUBAO_*",
      500
    );
  }

  // 组合 system + 用户历史（如前端没传 system 就注入）
  const hasSystem = parsed.data.messages.some((m) => m.role === "system");
  const messages = hasSystem
    ? parsed.data.messages
    : [{ role: "system" as const, content: SYSTEM_PROMPT }, ...parsed.data.messages];

  let resp: Response;
  try {
    resp = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.6,
        max_tokens: 800,
      }),
      signal: AbortSignal.timeout(40_000),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new ApiError(
      "INTERNAL_ERROR",
      msg.includes("abort") ? `AI 超时：${msg}` : `AI 网络错误：${msg}`,
      msg.includes("abort") ? 504 : 502
    );
  }

  if (!resp.ok) {
    const t = await resp.text().catch(() => "");
    throw new ApiError(
      "INTERNAL_ERROR",
      `AI HTTP ${resp.status}: ${t.slice(0, 300)}`,
      502
    );
  }

  const raw = (await resp.json().catch(() => null)) as
    | { choices?: Array<{ message?: { content?: string } }> }
    | null;

  const reply = raw?.choices?.[0]?.message?.content ?? "";
  if (!reply) {
    throw new ApiError("INTERNAL_ERROR", "AI 返回为空", 502);
  }

  return jsonOk({ reply });
});
