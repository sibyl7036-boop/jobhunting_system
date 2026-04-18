/**
 * lib/schemas/ai-outputs.ts
 *
 * Phase 6 AI 调用返回的 5 种 JSON 输出结构 zod schema
 * 严格对齐 PRD 9.1~9.5 的 "输出 JSON 结构" 字段清单。
 * 9.5 今日大厂动向是纯文本（无 JSON），不在此文件。
 */

import { z } from "zod";
import { stageTypeSchema } from "./enums";

// ── PRD 9.1 解析面试邮件 ──
export const aiParseEmailOutputSchema = z.object({
  companyName: z.string().nullable(),
  departmentName: z.string().nullable(),
  roleName: z.string().nullable(),
  stageType: stageTypeSchema.nullable(),
  time: z.string().nullable(),
  meetingLink: z.string().nullable(),
  jdText: z.string().nullable(),
});
export type AIParseEmailOutput = z.infer<typeof aiParseEmailOutputSchema>;

// ── PRD 9.2 解析 JD ──
export const aiParseJdOutputSchema = z.object({
  jdSummary: z.string().min(1),
  jdKeywords: z.array(z.string()).min(1),
  expectedSkills: z.array(z.string()).min(1),
});
export type AIParseJdOutput = z.infer<typeof aiParseJdOutputSchema>;

// ── PRD 9.3 生成面试题 ──
export const aiQuestionsOutputSchema = z.object({
  questions: z.array(z.string()).min(1),
});
export type AIQuestionsOutput = z.infer<typeof aiQuestionsOutputSchema>;

// ── PRD 9.4 面试复盘 ──
export const aiReviewOutputSchema = z.object({
  questionSummary: z.string().min(1),
  answerSummary: z.string().min(1),
  suggestion: z.string().min(1),
});
export type AIReviewOutput = z.infer<typeof aiReviewOutputSchema>;
