/**
 * POST /api/ai/parse-email
 *
 * 从面试邮件 / 通知 / 聊天记录文本中抽取流程字段（PRD 9.1）。
 *
 * 入参：{ inputText: string }
 * 出参：AI 解析的草稿 JSON（不落业务表，由前端收下 → 用户编辑 → 再走 PATCH/POST 入库）
 *
 * 所有调用都会在 AIRun 表写一条日志（由 callAI 负责）。
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
import { SYS_PARSE_EMAIL, userPromptParseEmail } from "@/lib/prompts";
import { aiParseEmailOutputSchema } from "@/lib/schemas";

export const runtime = "nodejs";

const inputSchema = z.object({
  inputText: z
    .string()
    .min(5, "文本太短，至少 5 个字")
    .max(20000, "文本过长（超过 20000 字），请精简后重试"),
});

export const POST = withApiHandler(async (req) => {
  const body = await parseJsonBody(req);
  const { inputText } = inputSchema.parse(body);

  try {
    const { json, text, runId } = await callAI({
      taskType: "parse_email",
      systemPrompt: SYS_PARSE_EMAIL,
      userPrompt: userPromptParseEmail(inputText),
      expectJson: true,
      logInputText: inputText, // 只记原始文本，不含 prompt 模板
    });

    // zod 校验 AI 输出结构（stageType 必须落在 9 个中文枚举内）
    const parsed = aiParseEmailOutputSchema.safeParse(json);
    if (!parsed.success) {
      return jsonError(
        "INTERNAL_ERROR",
        "AI 返回结构不符合预期，请稍后重试或换一段更清晰的文本",
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

    return jsonOk({
      runId,
      draft: parsed.data,
    });
  } catch (e) {
    if (e instanceof AIError) {
      return jsonError("INTERNAL_ERROR", `${e.code}: ${e.message}`, 502, {
        code: e.code,
      });
    }
    if (e instanceof z.ZodError) {
      throw validationError(
        "入参校验失败",
        e.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        }))
      );
    }
    throw e;
  }
});
