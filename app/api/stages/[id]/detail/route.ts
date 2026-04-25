/**
 * /api/stages/[id]/detail
 *
 * GET · Drawer 详情一次性拉取
 *
 * [2026-04-25 auth-v1] 通过 Stage.application.userId 校验归属
 */

import { prisma } from "@/lib/db";
import { jsonOk, withApiHandler, notFound } from "@/lib/api";
import { serializeApplication } from "@/lib/serialize";
import { requireCurrentUser } from "@/lib/auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function toStageDto(stage: {
  id: string;
  applicationId: string;
  type: string;
  status: string;
  time: Date | null;
  meetingLink: string | null;
  reviewQuestionSummary: string | null;
  reviewAnswerSummary: string | null;
  reviewSuggestion: string | null;
  interviewQuestions: string | null;
  personalNotes: string | null;
  reviewTranscript: string | null;
}) {
  let parsedQuestions: string[] | null = null;
  if (stage.interviewQuestions) {
    try {
      const arr = JSON.parse(stage.interviewQuestions);
      if (Array.isArray(arr)) parsedQuestions = arr.filter((x) => typeof x === "string");
    } catch {
      parsedQuestions = null;
    }
  }
  return {
    id: stage.id,
    applicationId: stage.applicationId,
    type: stage.type,
    status: stage.status,
    time: stage.time ? stage.time.toISOString() : null,
    meetingLink: stage.meetingLink,
    reviewQuestionSummary: stage.reviewQuestionSummary,
    reviewAnswerSummary: stage.reviewAnswerSummary,
    reviewSuggestion: stage.reviewSuggestion,
    interviewQuestions: parsedQuestions,
    personalNotes: stage.personalNotes,
    reviewTranscript: stage.reviewTranscript,
  };
}

export const GET = withApiHandler<RouteContext>(async (_req, ctx) => {
  const user = await requireCurrentUser();
  const { id } = await ctx.params;

  const stage = await prisma.stage.findUnique({
    where: { id },
    include: { application: { select: { userId: true } } },
  });
  if (!stage || stage.application.userId !== user.id)
    throw notFound(`Stage id=${id} 不存在`);

  const app = await prisma.application.findUnique({
    where: { id: stage.applicationId },
    include: {
      stages: { orderBy: { time: "asc" } },
      linkedResume: true,
    },
  });
  if (!app) throw notFound(`Stage ${id} 对应的 Application 不存在`);

  const serializedApp = serializeApplication(app);

  return jsonOk({
    stage: toStageDto(stage),
    application: {
      id: serializedApp.id,
      companyName: serializedApp.companyName,
      departmentName: serializedApp.departmentName,
      roleName: serializedApp.roleName,
      jdText: serializedApp.jdText,
      jdSummary: serializedApp.jdSummary,
      jdKeywords: serializedApp.jdKeywords,
      expectedSkills: serializedApp.expectedSkills,
      interviewQuestions: serializedApp.interviewQuestions,
      linkedResumeId: serializedApp.linkedResumeId,
      currentStatus: serializedApp.currentStatus,
      linkedResume: app.linkedResume
        ? {
            id: app.linkedResume.id,
            name: app.linkedResume.name,
            tag: app.linkedResume.tag,
          }
        : null,
      stages: app.stages.map(toStageDto),
    },
  });
});
