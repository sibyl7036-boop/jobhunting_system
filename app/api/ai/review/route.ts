/**
 * POST /api/ai/review
 *
 * 入参：{ stageId: string, transcriptText: string } 30~30000 字
 * 出参：{ draft: AIReviewOutput, runId: string }
 *
 * [2026-04-25 auth-v1]
 *   - 必须登录
 *   - stageId 必须属于当前用户（Stage.application.userId 校验）
 *   - 结果不直接落库（草稿态），由前端确认后 PATCH /api/stages/:id 保存
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import {
  jsonOk,
  withApiHandler,
  parseJsonBody,
  validationError,
  notFound,
  ApiError,
} from "@/lib/api";
import { prisma } from "@/lib/db";
import { callAI, AIError } from "@/lib/llmClient";
import { SYS_REVIEW, userPromptReview } from "@/lib/prompts";
import {
  aiReviewOutputSchema,
  type AIReviewOutput,
} from "@/lib/schemas/ai-outputs";
import { requireCurrentUser } from "@/lib/auth";

const bodySchema = z.object({
  stageId: z.string().min(1, "stageId 必填"),
  transcriptText: z
    .string()
    .trim()
    .min(30, "转录文本至少 30 字")
    .max(30_000, "转录文本过长（≤30000 字）"),
});

export const POST = withApiHandler(async (req) => {
  const user = await requireCurrentUser();
  const body = await parseJsonBody(req);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    throw validationError(parsed.error.issues[0]?.message ?? "参数非法");
  }

  const stage = await prisma.stage.findUnique({
    where: { id: parsed.data.stageId },
    include: { application: { select: { userId: true } } },
  });
  if (!stage || stage.application.userId !== user.id) {
    throw notFound(`Stage id=${parsed.data.stageId} 不存在`);
  }

  try {
    const { json, runId } = await callAI<AIReviewOutput>({
      taskType: "review",
      systemPrompt: SYS_REVIEW,
      userPrompt: userPromptReview(parsed.data.transcriptText),
      expectJson: true,
      logInputText: `stageId=${stage.id} ${parsed.data.transcriptText.slice(0, 500)}`,
      userId: user.id,
    });

    const check = aiReviewOutputSchema.safeParse(json);
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
