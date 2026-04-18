/**
 * POST /api/ai/parse-jd
 *
 * 输入岗位 JD 文本，输出 `{ jdSummary, jdKeywords, expectedSkills }`（PRD 9.2）
 * 不落库，返回草稿；由前端 → Drawer → 用户编辑 → PATCH /api/applications/:id 写入
 */

import { z } from "zod";
import {
  jsonOk,
  withApiHandler,
  parseJsonBody,
  validationError,
  jsonError,
} from "@/lib/api";
import { callAI, AIError } from "@/lib/llmClient";
import { SYS_PARSE_JD, userPromptParseJd } from "@/lib/prompts";
import { aiParseJdOutputSchema } from "@/lib/schemas";

export const runtime = "nodejs";

const inputSchema = z.object({
  jdText: z
    .string()
    .min(20, "JD 文本太短（至少 20 字），建议粘贴完整 JD 内容")
    .max(30000, "JD 文本过长（超过 30000 字），请精简"),
});

export const POST = withApiHandler(async (req) => {
  const body = await parseJsonBody(req);
  const { jdText } = inputSchema.parse(body);

  try {
    const { json, text, runId } = await callAI({
      taskType: "parse_jd",
      systemPrompt: SYS_PARSE_JD,
      userPrompt: userPromptParseJd(jdText),
      expectJson: true,
      logInputText: jdText,
    });
    const parsed = aiParseJdOutputSchema.safeParse(json);
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
