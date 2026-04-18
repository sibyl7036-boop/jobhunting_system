/**
 * POST /api/ai/generate-questions
 *
 * 基于 Application 的 jdText + linkedResume.extractedText 生成 3~5 个面试题（PRD 9.3）。
 *
 * 入参：{ applicationId: string }
 * 出参：{ runId, draft: { questions: string[] } }
 *
 * 不落库，返回草稿；前端展示可编辑，确认后 PATCH /api/applications/:id 写入
 * `interviewQuestions` 字段（Application 共享题库，同一 Application 的所有 Stage 共用）
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
import {
  SYS_GENERATE_QUESTIONS,
  userPromptGenerateQuestions,
} from "@/lib/prompts";
import { aiQuestionsOutputSchema } from "@/lib/schemas";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const inputSchema = z.object({
  applicationId: z.string().min(1, "applicationId 必填"),
});

export const POST = withApiHandler(async (req) => {
  const body = await parseJsonBody(req);
  const { applicationId } = inputSchema.parse(body);

  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { linkedResume: { select: { extractedText: true } } },
  });
  if (!app) throw notFound(`Application ${applicationId} 不存在`);

  const jdText = app.jdText ?? "";
  const resumeText = app.linkedResume?.extractedText ?? "";

  if (!jdText && !resumeText) {
    throw validationError(
      "该岗位的 JD 与关联简历都为空，无法生成面试题。请先补充 JD 或关联一份简历。"
    );
  }

  try {
    const { json, text, runId } = await callAI({
      taskType: "generate_questions",
      systemPrompt: SYS_GENERATE_QUESTIONS,
      userPrompt: userPromptGenerateQuestions(jdText, resumeText),
      expectJson: true,
      logInputText: `[app=${applicationId}] jd.len=${jdText.length} resume.len=${resumeText.length}`,
    });

    const parsed = aiQuestionsOutputSchema.safeParse(json);
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
