/**
 * lib/llmClient.ts · 火山方舟（Ark）/ DeepSeek 3.2 唯一出口
 *
 * 架构契约点 2 + 3：
 *   - 所有 AI 调用只能经过本文件 `callAI`（兼容别名 `callDoubao`）
 *   - 路径已锁定 `/chat/completions` + `response_format: { type: "json_object" }`（Step 0.6 冒烟测试决策）
 *   - 纯文本任务（daily-intel / tomorrow-tip）不传 response_format
 *
 * 每次调用都写一条 AIRun 记录（成功 / 失败都写）。
 * 错误分类：
 *   - AI_CALL_TIMEOUT  — 30s 超时
 *   - AI_CALL_FAILED   — 网络错误 / 4xx / 5xx
 *   - AI_PARSE_FAILED  — expectJson=true 但返回不是合法 JSON
 *
 * API Key 安全：
 *   - 只在服务端读取 process.env.DOUBAO_API_KEY
 *   - catch 时 console.error 禁止把 Authorization / Key 打出来（本文件里的日志已脱敏）
 */

import "server-only";
import { prisma } from "@/lib/db";

// ──────────────────────────────────────────────────────────────────────
// 类型
// ──────────────────────────────────────────────────────────────────────

/** AIRun.taskType 使用的枚举 */
export type AITaskType =
  | "parse_email"
  | "parse_jd"
  | "generate_questions"
  | "review"
  | "daily_intel"
  | "tomorrow_tip"
  | "ping"; // 仅用于 Step 6.1 的 _ping 冒烟

export type AIErrorCode =
  | "AI_CALL_FAILED"
  | "AI_CALL_TIMEOUT"
  | "AI_PARSE_FAILED"
  | "AI_CONFIG_MISSING";

export class AIError extends Error {
  constructor(
    public readonly code: AIErrorCode,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "AIError";
  }
}

interface CallAIParams {
  taskType: AITaskType;
  systemPrompt: string;
  userPrompt: string;
  /** 期望模型输出合法 JSON；true 时传 response_format 并做 JSON.parse */
  expectJson?: boolean;
  /** 写入 AIRun.inputText 的字符串（默认 userPrompt）；用于把 systemPrompt 剥离时瘦身 */
  logInputText?: string;
  /**
   * [2026-04-25 auth-v1] 归属用户，写入 AIRun.userId。
   * 不传则视为系统调用（AIRun.userId=null）。
   */
  userId?: string | null;
}

interface CallAIResult<T = unknown> {
  /** 原始文本（choices[0].message.content） */
  text: string;
  /** expectJson=true 时解析的 JSON 对象；否则 null */
  json: T | null;
  /** AIRun 记录 id，便于前端回传或审计 */
  runId: string;
}

// ──────────────────────────────────────────────────────────────────────
// 核心 callAI
// ──────────────────────────────────────────────────────────────────────

const TIMEOUT_MS = 30_000;

export async function callAI<T = unknown>(
  params: CallAIParams
): Promise<CallAIResult<T>> {
  const apiKey = process.env.DOUBAO_API_KEY;
  const baseUrl = process.env.DOUBAO_BASE_URL;
  const model = process.env.DOUBAO_MODEL;

  if (!apiKey || !baseUrl || !model) {
    throw new AIError(
      "AI_CONFIG_MISSING",
      "AI 调用配置缺失，请检查 .env.local 里的 DOUBAO_API_KEY / DOUBAO_BASE_URL / DOUBAO_MODEL"
    );
  }

  const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: params.systemPrompt },
      { role: "user", content: params.userPrompt },
    ],
  };
  if (params.expectJson) {
    body.response_format = { type: "json_object" };
  }

  const logInput = params.logInputText ?? params.userPrompt;
  const ownerUserId = params.userId ?? null;

  let resp: Response;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (e) {
    const isAbort =
      (e as Error)?.name === "TimeoutError" ||
      (e as Error)?.name === "AbortError";
    const code: AIErrorCode = isAbort ? "AI_CALL_TIMEOUT" : "AI_CALL_FAILED";
    const msg = isAbort
      ? `AI 调用超时（${TIMEOUT_MS / 1000}s）`
      : `AI 网络错误：${(e as Error)?.message ?? "unknown"}`;
    // 脱敏日志：打出 task 和 code，不打 Authorization / url query
    console.error("[llmClient] fetch failed", { taskType: params.taskType, code });
    await writeAIRun({
      userId: ownerUserId,
      taskType: params.taskType,
      inputText: logInput,
      outputText: "",
      outputJson: null,
      status: "failed",
      errorMessage: `${code}: ${msg}`,
    });
    throw new AIError(code, msg, e);
  }

  // HTTP 非 2xx → 失败
  if (!resp.ok) {
    const errBody = await resp.text().catch(() => "");
    const msg = `AI HTTP ${resp.status}: ${errBody.slice(0, 300)}`;
    console.error("[llmClient] HTTP error", {
      taskType: params.taskType,
      status: resp.status,
    });
    await writeAIRun({
      userId: ownerUserId,
      taskType: params.taskType,
      inputText: logInput,
      outputText: "",
      outputJson: null,
      status: "failed",
      errorMessage: `AI_CALL_FAILED: ${msg}`,
    });
    throw new AIError("AI_CALL_FAILED", msg);
  }

  // 解析响应
  let raw: unknown;
  try {
    raw = await resp.json();
  } catch (e) {
    await writeAIRun({
      userId: ownerUserId,
      taskType: params.taskType,
      inputText: logInput,
      outputText: "",
      outputJson: null,
      status: "failed",
      errorMessage: `AI_CALL_FAILED: 响应不是合法 JSON（${(e as Error).message}）`,
    });
    throw new AIError("AI_CALL_FAILED", "AI 响应体不是合法 JSON", e);
  }

  // choices[0].message.content
  const content =
    (raw as {
      choices?: Array<{ message?: { content?: string } }>;
    })?.choices?.[0]?.message?.content ?? "";

  if (!content) {
    await writeAIRun({
      userId: ownerUserId,
      taskType: params.taskType,
      inputText: logInput,
      outputText: JSON.stringify(raw).slice(0, 500),
      outputJson: null,
      status: "failed",
      errorMessage: "AI_CALL_FAILED: 响应里没有 choices[0].message.content",
    });
    throw new AIError("AI_CALL_FAILED", "AI 响应缺少 content 字段");
  }

  // 期望 JSON 时尝试解析
  let parsed: T | null = null;
  if (params.expectJson) {
    try {
      parsed = JSON.parse(content) as T;
    } catch (e) {
      await writeAIRun({
        userId: ownerUserId,
        taskType: params.taskType,
        inputText: logInput,
        outputText: content,
        outputJson: null,
        status: "failed",
        errorMessage: `AI_PARSE_FAILED: ${(e as Error).message}`,
      });
      throw new AIError(
        "AI_PARSE_FAILED",
        `AI 返回的不是合法 JSON：${(e as Error).message}`,
        e
      );
    }
  }

  // 成功 → 写 AIRun
  const run = await writeAIRun({
    userId: ownerUserId,
    taskType: params.taskType,
    inputText: logInput,
    outputText: content,
    outputJson: parsed,
    status: "success",
    errorMessage: null,
  });

  return { text: content, json: parsed, runId: run.id };
}

// 兼容别名（早期文档里偶尔用 callDoubao）
export const callDoubao = callAI;

// ──────────────────────────────────────────────────────────────────────
// 内部：写 AIRun 日志（[2026-04-25 auth-v1] 支持 userId 归属）
// ──────────────────────────────────────────────────────────────────────

async function writeAIRun(params: {
  userId?: string | null;
  taskType: AITaskType;
  inputText: string;
  outputText: string;
  outputJson: unknown;
  status: "success" | "failed";
  errorMessage: string | null;
}) {
  try {
    return await prisma.aIRun.create({
      data: {
        userId: params.userId ?? null,
        taskType: params.taskType,
        inputText: params.inputText.slice(0, 20_000), // 安全截断
        outputText: params.outputText.slice(0, 20_000),
        outputJson:
          params.outputJson !== null ? JSON.stringify(params.outputJson) : null,
        status: params.status,
        errorMessage: params.errorMessage,
      },
    });
  } catch (e) {
    // DB 写失败不阻断主流程（只 log），避免调用链异常吞没原始 AI 错误
    console.error("[llmClient] AIRun write failed", e);
    return { id: "db-write-failed" };
  }
}