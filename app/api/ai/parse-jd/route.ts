/**
 * POST /api/ai/parse-jd
 *
 * 入参：{ jdText: string } 20~30000 字
 * 出参：{ draft: AIParseJdOutput, runId: string }
 *
 * [2026-04-25 auth-v1] 需要登录；AIRun.userId = 当前用户
 *
 * 不直接落库到 Application，保持"草稿态"（PRD Phase 6.3）。前端 AIWorkstation
 * 拿到 draft 后由用户确认再 PATCH /api/applications/:id。
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import {
  jsonOk,
  withApiHandler,
  parseJsonBody,
  validationError,
  ApiError,
} from "@/lib/api";
import { callAI, AIError } from "@/lib/llmClient";
import { SYS_PARSE_JD, userPromptParseJd } from "@/lib/prompts";
import {
  aiParseJdOutputSchema,
  type AIParseJdOutput,
} from "@/lib/schemas/ai-outputs";
import { requireCurrentUser } from "@/lib/auth";

const bodySchema = z.object({
  jdText: z
    .string()
    .trim()
    .min(20, "JD 文本至少 20 字")
    .max(30_000, "JD 过长（≤30000 字）"),
});

export const POST = withApiHandler(async (req) => {
  const user = await requireCurrentUser();
  const body = await parseJsonBody(req);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    throw validationError(parsed.error.issues[0]?.message ?? "参数非法");
  }

  try {
    const { json, runId } = await callAI<AIParseJdOutput>({
      taskType: "parse_jd",
      systemPrompt: SYS_PARSE_JD,
      userPrompt: userPromptParseJd(parsed.data.jdText),
      expectJson: true,
      logInputText: parsed.data.jdText,
      userId: user.id,
    });

    const check = aiParseJdOutputSchema.safeParse(json);
    if (!check.success) {
      return NextResponse.json(
        {
          error: {
            code: "AI_SCHEMA_MISMATCH",
            message: "AI 返回字段不符合约定结构",
            details: check.error.issues.slice(0, 3),
          },
        },
        { status: 502 }
      );
    }

    return jsonOk({ draft: check.data, runId });
  } catch (e) {
    if (e instanceof AIError) {
      throw new ApiError(
        "INTERNAL_ERROR",
        `AI 调用失败：${e.message}`,
        e.code === "AI_CALL_TIMEOUT" ? 504 : 502
      );
    }
    throw e;
  }
});
