/**
 * lib/schemas/entities.ts
 *
 * 6 个核心实体的 zod schema（字段与 Prisma model 对齐）
 * 派生两套：
 *   - Xxx：全字段 schema（包含 id / createdAt / updatedAt），用于 GET 响应 / DB → 前端
 *   - XxxCreateInput：POST 请求体 schema（不含 id / createdAt / updatedAt / 自动维护字段）
 *   - XxxUpdateInput：PATCH 请求体 schema（全字段可选）
 *
 * jdKeywords / expectedSkills / interviewQuestions / outputJson 在 DB 里是 JSON 字符串，
 * 但在应用层 schema 里用原生数组 / 对象类型，JSON.parse/stringify 由 route 层负责。
 */

import { z } from "zod";
import {
  resumeTagSchema,
  stageTypeSchema,
  applicationStatusSchema,
  stageStatusSchema,
  aiTaskTypeSchema,
  aiRunStatusSchema,
} from "./enums";

// ── 共用片段 ──
const idField = z.string().min(1);
const tsField = z.union([z.date(), z.string()]); // Prisma 返 Date，JSON 序列化后变字符串

// ── 6.1 Resume ──
export const resumeSchema = z.object({
  id: idField,
  name: z.string().min(1).max(100),
  tag: resumeTagSchema,
  fileName: z.string().min(1),
  fileUrl: z.string().min(1),
  extractedText: z.string().nullable().optional(),
  createdAt: tsField,
  updatedAt: tsField,
});
export type Resume = z.infer<typeof resumeSchema>;

export const resumeCreateInputSchema = resumeSchema
  .pick({
    name: true,
    tag: true,
    fileName: true,
    fileUrl: true,
    extractedText: true,
  })
  .partial({ extractedText: true });
export type ResumeCreateInput = z.infer<typeof resumeCreateInputSchema>;

export const resumeUpdateInputSchema = resumeCreateInputSchema.partial();
export type ResumeUpdateInput = z.infer<typeof resumeUpdateInputSchema>;

// ── 6.2 Application ──
export const applicationSchema = z.object({
  id: idField,
  companyName: z.string().min(1).max(100),
  departmentName: z.string().max(100),
  roleName: z.string().min(1).max(100),
  jdText: z.string().nullable().optional(),
  jdSummary: z.string().nullable().optional(),
  // DB 存 JSON string，应用层用数组；JSON.parse/stringify 由 route 层处理
  jdKeywords: z.array(z.string()).nullable().optional(),
  expectedSkills: z.array(z.string()).nullable().optional(),
  interviewQuestions: z.array(z.string()).nullable().optional(),
  linkedResumeId: z.string().nullable().optional(),
  currentStatus: applicationStatusSchema,
  createdAt: tsField,
  updatedAt: tsField,
});
export type Application = z.infer<typeof applicationSchema>;

export const applicationCreateInputSchema = applicationSchema
  .pick({
    companyName: true,
    departmentName: true,
    roleName: true,
    jdText: true,
    jdSummary: true,
    jdKeywords: true,
    expectedSkills: true,
    interviewQuestions: true,
    linkedResumeId: true,
    currentStatus: true,
  })
  .partial({
    departmentName: true,
    jdText: true,
    jdSummary: true,
    jdKeywords: true,
    expectedSkills: true,
    interviewQuestions: true,
    linkedResumeId: true,
    currentStatus: true,
  });
export type ApplicationCreateInput = z.infer<
  typeof applicationCreateInputSchema
>;

export const applicationUpdateInputSchema = applicationCreateInputSchema.partial();
export type ApplicationUpdateInput = z.infer<
  typeof applicationUpdateInputSchema
>;

// ── 6.3 Stage ──
export const stageSchema = z.object({
  id: idField,
  applicationId: idField,
  type: stageTypeSchema,
  time: tsField.nullable().optional(),
  meetingLink: z.string().nullable().optional(),
  status: stageStatusSchema,
  reviewQuestionSummary: z.string().nullable().optional(),
  reviewAnswerSummary: z.string().nullable().optional(),
  reviewSuggestion: z.string().nullable().optional(),
  createdAt: tsField,
  updatedAt: tsField,
});
export type Stage = z.infer<typeof stageSchema>;

export const stageCreateInputSchema = stageSchema
  .pick({
    applicationId: true,
    type: true,
    time: true,
    meetingLink: true,
    status: true,
    reviewQuestionSummary: true,
    reviewAnswerSummary: true,
    reviewSuggestion: true,
  })
  .partial({
    time: true,
    meetingLink: true,
    status: true,
    reviewQuestionSummary: true,
    reviewAnswerSummary: true,
    reviewSuggestion: true,
  });
export type StageCreateInput = z.infer<typeof stageCreateInputSchema>;

export const stageUpdateInputSchema = stageCreateInputSchema.partial();
export type StageUpdateInput = z.infer<typeof stageUpdateInputSchema>;

// ── 6.4 AIRun ──
export const aiRunSchema = z.object({
  id: idField,
  taskType: aiTaskTypeSchema,
  inputText: z.string(),
  outputText: z.string(),
  outputJson: z.record(z.string(), z.unknown()).nullable().optional(),
  status: aiRunStatusSchema,
  errorMessage: z.string().nullable().optional(),
  createdAt: tsField,
});
export type AIRun = z.infer<typeof aiRunSchema>;

// ── 6.5 IntelSummary ──
export const intelSummarySchema = z.object({
  id: idField,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date 必须是 YYYY-MM-DD"),
  summaryText: z.string(),
  createdAt: tsField,
  updatedAt: tsField,
});
export type IntelSummary = z.infer<typeof intelSummarySchema>;

// ── 扩展 · TomorrowTipCache ──
export const tomorrowTipCacheSchema = z.object({
  id: idField,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date 必须是 YYYY-MM-DD"),
  tipText: z.string(),
  eventsHash: z.string(),
  createdAt: tsField,
  updatedAt: tsField,
});
export type TomorrowTipCache = z.infer<typeof tomorrowTipCacheSchema>;
