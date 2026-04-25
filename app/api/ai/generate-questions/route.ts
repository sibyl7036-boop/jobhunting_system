/**
 * POST /api/ai/generate-questions
 *
 * 入参：{ applicationId: string }（可选 customStyle: string）
 * 出参：{ draft: { questions: string[] }, runId: string }
 *
 * [2026-04-25 auth-v1]
 *   - 必须登录
 *   - applicationId 必须属于当前用户（否则 404）
 *   - 后端自己从 Application 取 jdText + linkedResume.extractedText 拼 prompt
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
import {
  SYS_GENERATE_QUESTIONS,
  userPromptGenerateQuestions,
} from "@/lib/prompts";
import {
  aiQuestionsOutputSchema,
  type AIQuestionsOutput,
} from "@/lib/schemas/ai-outputs";
import { requireCurrentUser } from "@/lib/auth";

const bodySchema = z.object({
  applicationId: z.string().min(1, "applicationId 必填"),
  customStyle: z.string().max(500).optional(),
});

export const POST = withApiHandler(async (req) => {
  const user = await requireCurrentUser();
  const body = await parseJsonBody(req);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    throw validationError(parsed.error.issues[0]?.message ?? "参数非法");
  }

  const app = await prisma.application.findUnique({
    where: { id: parsed.data.applicationId },
    include: { linkedResume: { select: { extractedText: true, name: true } } },
  });
  if (!app || app.userId !== user.id) {
    throw notFound(`Application id=${parsed.data.applicationId} 不存在`);
  }

  // 组合 jdText：优先 jdText / 次之 jdSummary + expectedSkills
  let jdPart = app.jdText ?? "";
  if (!jdPart.trim()) {
    const summary = app.jdSummary ?? "";
    const skills = app.expectedSkills
      ? (() => {
          try {
            const arr = JSON.parse(app.expectedSkills);
            return Array.isArray(arr) ? `\n期望能力：${arr.join("、")}` : "";
          } catch {
            return "";
          }
        })()
      : "";
    jdPart = `${summary}${skills}`.trim();
  }
  if (parsed.data.customStyle) {
    jdPart = `${jdPart}\n\n（补充风格）：${parsed.data.customStyle}`;
  }

  // 简历文本限长（避免超 context）
  const rawResumeText = app.linkedResume?.extractedText ?? "";
  const resumeText = rawResumeText.slice(0, 6_000);

  try {
    const { json, runId } = await callAI<AIQuestionsOutput>({
      taskType: "generate_questions",
      systemPrompt: SYS_GENERATE_QUESTIONS,
      userPrompt: userPromptGenerateQuestions(jdPart, resumeText),
      expectJson: true,
      logInputText: `appId=${app.id} ${app.companyName}/${app.roleName}`,
      userId: user.id,
    });

    const check = aiQuestionsOutputSchema.safeParse(json);
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
