/**
 * lib/schemas/enums.ts
 *
 * PRD 规定的全部中文枚举（6.1~6.5）
 * 所有 API route / 前端 form 校验共用这组常量。
 */

import { z } from "zod";

// ── PRD 6.1 Resume ──
export const RESUME_TAGS = ["产品", "运营", "算法", "通用"] as const;
export const resumeTagSchema = z.enum(RESUME_TAGS);
export type ResumeTag = z.infer<typeof resumeTagSchema>;

// ── PRD 6.2 Application.currentStatus / Stage.type ──
// 注意：Application.currentStatus 多了一个特殊值 "未投递"（PRD 6.2），Stage.type 没有
export const STAGE_TYPES = [
  "已投递",
  "笔试",
  "测评",
  "一面",
  "二面",
  "三面",
  "HR面",
  "Offer",
  "挂了",
] as const;
export const stageTypeSchema = z.enum(STAGE_TYPES);
export type StageType = z.infer<typeof stageTypeSchema>;

export const APPLICATION_STATUSES = [...STAGE_TYPES, "未投递"] as const;
export const applicationStatusSchema = z.enum(APPLICATION_STATUSES);
export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;

// ── PRD 6.3 Stage.status ──
export const STAGE_STATUSES = [
  "待参加",
  "已完成",
  "已通过",
  "未通过",
] as const;
export const stageStatusSchema = z.enum(STAGE_STATUSES);
export type StageStatus = z.infer<typeof stageStatusSchema>;

// ── PRD 6.4 AIRun.taskType / status ──
export const AI_TASK_TYPES = [
  "parse_email",
  "parse_jd",
  "generate_questions",
  "review",
  "daily_intel",
  "tomorrow_tip", // Step 6.6 新增
] as const;
export const aiTaskTypeSchema = z.enum(AI_TASK_TYPES);
export type AITaskType = z.infer<typeof aiTaskTypeSchema>;

export const AI_RUN_STATUSES = ["success", "failed"] as const;
export const aiRunStatusSchema = z.enum(AI_RUN_STATUSES);
export type AIRunStatus = z.infer<typeof aiRunStatusSchema>;
