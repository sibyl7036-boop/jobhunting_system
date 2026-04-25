/**
 * POST /api/ai/parse-email
 *
 * 入参：{ inputText: string } 8~20000 字
 * 出参：{ draft: AIParseEmailOutput, runId: string }
 *
 * [2026-04-25 auth-v1] 需要登录；AIRun.userId = 当前用户
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
import { SYS_PARSE_EMAIL, userPromptParseEmail } from "@/lib/prompts";
import {
  aiParseEmailOutputSchema,
  type AIParseEmailOutput,
} from "@/lib/schemas/ai-outputs";
import { requireCurrentUser } from "@/lib/auth";

const bodySchema = z.object({
  inputText: z
    .string()
    .trim()
    .min(8, "面试邮件/通知文本至少 8 字")
    .max(20_000, "文本过长（≤20000 字）"),
});

export const POST = withApiHandler(async (req) => {
  const user = await requireCurrentUser();
  const body = await parseJsonBody(req);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    throw validationError(parsed.error.issues[0]?.message ?? "参数非法");
  }

  try {
    const { json, runId } = await callAI<AIParseEmailOutput>({
      taskType: "parse_email",
      systemPrompt: SYS_PARSE_EMAIL,
      userPrompt: userPromptParseEmail(parsed.data.inputText),
      expectJson: true,
      logInputText: parsed.data.inputText,
      userId: user.id,
    });

    const check = aiParseEmailOutputSchema.safeParse(json);
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
