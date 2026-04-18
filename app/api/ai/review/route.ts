/**
 * POST /api/ai/review
 *
 * 面试复盘：根据录音转文字内容输出 `{ questionSummary, answerSummary, suggestion }`（PRD 9.4）
 *
 * 入参：{ stageId: string, transcriptText: string }
 * 出参：{ runId, draft: {...} }
 *
 * 不落库，前端收下 → 编辑 → 保存走 PATCH /api/stages/:id 写 review 三字段
 */

import { z } from "zod";
import {
  jsonOk,
  withApiHandler,
  parseJsonBody,
  validationError,
  jsonError,
  notFound,
} from "@/lib/api";
import { callAI, AIError } from "@/lib/llmClient";
import { SYS_REVIEW, userPromptReview } from "@/lib/prompts";
import { aiReviewOutputSchema } from "@/lib/schemas";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const inputSchema = z.object({
  stageId: z.string().min(1, "stageId 必填"),
  transcriptText: z
    .string()
    .min(30, "转录文本太短（至少 30 字）")
    .max(40000, "转录文本过长（超过 40000 字），请精简"),
});

export const POST = withApiHandler(async (req) => {
  const body = await parseJsonBody(req);
  const { stageId, transcriptText } = inputSchema.parse(body);

  const stage = await prisma.stage.findUnique({ where: { id: stageId } });
  if (!stage) throw notFound(`Stage ${stageId} 不存在`);

  try {
    const { json, text, runId } = await callAI({
      taskType: "review",
      systemPrompt: SYS_REVIEW,
      userPrompt: userPromptReview(transcriptText),
      expectJson: true,
      logInputText: `[stage=${stageId}] transcript.len=${transcriptText.length}`,
    });

    const parsed = aiReviewOutputSchema.safeParse(json);
    if (!parsed.success) {
      return jsonError(
        "INTERNAL_ERROR",
        "AI 返回结构不符合预期，请稍后重试",
        502,
        {
          code: "AI_SCHEMA_MISMATCH",
          raw: text,
          issues: parsed.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        }
      );
    }
    return jsonOk({ runId, draft: parsed.data });
  } catch (e) {
    if (e instanceof AIError) {
      return jsonError("INTERNAL_ERROR", `${e.code}: ${e.message}`, 502, {
        code: e.code,
      });
    }
    if (e instanceof z.ZodError) {
      throw validationError(
        "入参校验失败",
        e.issues.map((i) => ({ path: i.path.join("."), message: i.message }))
      );
    }
    throw e;
  }
});
