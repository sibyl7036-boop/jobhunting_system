"use client";

/**
 * StageDrawerContent · Stage 详情 / 编辑（Step 4.2）
 *
 * 本文件里的所有业务交互（表单、保存、错误处理）在 Step 4.2 正式实现。
 * Step 4.1 先放骨架，保证容器能跑。
 */

import * as React from "react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ExternalLink, Loader2 } from "lucide-react";

import {
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { fetchJson } from "@/lib/fetcher";
import { useRouter } from "next/navigation";
import { ResumePreviewDialog } from "@/components/resume/ResumePreviewDialog";
import { InterviewQuestionsTab } from "@/components/drawer/tabs/InterviewQuestionsTab";
import { ReviewTab } from "@/components/drawer/tabs/ReviewTab";
import { PersonalNotesTab } from "@/components/drawer/tabs/PersonalNotesTab";
import {
  STAGE_TYPES,
  STAGE_STATUSES,
  APPLICATION_STATUSES,
} from "@/lib/schemas";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────────────────────────────
// 类型
// ──────────────────────────────────────────────────────────────────────

interface ApplicationWithStages {
  id: string;
  companyName: string;
  departmentName: string;
  roleName: string;
  jdText: string | null;
  jdSummary: string | null;
  jdKeywords: string[] | null;
  expectedSkills: string[] | null;
  interviewQuestions: string[] | null;
  linkedResumeId: string | null;
  currentStatus: string;
  linkedResume: { id: string; name: string; tag: string } | null;
  stages: Array<{
    id: string;
    type: string;
    status: string;
    time: string | null;
    meetingLink: string | null;
    reviewQuestionSummary: string | null;
    reviewAnswerSummary: string | null;
    reviewSuggestion: string | null;
    interviewQuestions: string[] | null;
    personalNotes: string | null;
    reviewTranscript: string | null;
  }>;
}

// ──────────────────────────────────────────────────────────────────────
// 表单 schema（Step 4.2）
// ──────────────────────────────────────────────────────────────────────

const formSchema = z.object({
  // Application 侧
  companyName: z.string().min(1, "公司名不能为空"),
  departmentName: z.string(),
  roleName: z.string().min(1, "岗位不能为空"),
  currentStatus: z.enum(APPLICATION_STATUSES as unknown as [string, ...string[]]),
  /** 关联简历 id，空串表示不关联（保存时转 null） */
  linkedResumeId: z.string(),
  // Stage 侧
  type: z.enum(STAGE_TYPES as unknown as [string, ...string[]]),
  status: z.enum(STAGE_STATUSES as unknown as [string, ...string[]]),
  /** datetime-local 值，如 "2026-04-19T10:00"，可为空 */
  time: z.string(),
  meetingLink: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

// ──────────────────────────────────────────────────────────────────────
// 工具
// ──────────────────────────────────────────────────────────────────────

/** ISO → datetime-local (本地时区 YYYY-MM-DDTHH:mm) */
function isoToLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** datetime-local → ISO (本地时区解释) */
function localInputToIso(input: string): string | null {
  if (!input) return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

/** SWR fetcher，复用 lib/fetcher */
const swrFetcher = <T,>(url: string) => fetchJson<T>(url);

// ──────────────────────────────────────────────────────────────────────
// 组件
// ──────────────────────────────────────────────────────────────────────

interface Props {
  stageId: string;
  onClose: () => void;
}

export function StageDrawerContent({ stageId, onClose }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [previewResume, setPreviewResume] = React.useState<
    { id: string; name: string } | null
  >(null);

  // ⚠️ Tab 切换状态必须和其他 hook 一样放在早 return 之前，
  //    否则会触发 "Rendered more hooks than during the previous render." 崩溃，
  //    直接表现为"侧边栏点开空白/崩溃"。
  const [activeTab, setActiveTab] = React.useState<
    "basic" | "questions" | "review" | "notes"
  >("basic");

  // 第一步：拿到 Stage 所属的 Application。由于我们的 URL 只带 stage id，
  // 而 API 是 /api/applications/:id 返回 stages[]，这里用"全局小查询"：先拉所有 dashboard+calendar 不行
  // 简单做法：再建一个最小的 fetch，按 stage id → application id
  // 但为了不让后端多一个端点，我们用最简单的约定：/api/stages/:id/detail
  // —— 这个端点 Phase 2 没做，为了 Phase 4 加一个最小 GET /api/stages/:id
  const { data, error, isLoading, mutate } = useSWR<{
    stage: {
      id: string;
      applicationId: string;
      type: string;
      status: string;
      time: string | null;
      meetingLink: string | null;
      reviewQuestionSummary: string | null;
      reviewAnswerSummary: string | null;
      reviewSuggestion: string | null;
      interviewQuestions: string[] | null;
      personalNotes: string | null;
      reviewTranscript: string | null;
    };
    application: ApplicationWithStages;
  }>(`/api/stages/${stageId}/detail`, swrFetcher);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      departmentName: "",
      roleName: "",
      currentStatus: "未投递",
      linkedResumeId: "",
      type: "一面",
      status: "待参加",
      time: "",
      meetingLink: "",
    },
  });

  // Step 5.3 · 简历列表（SWR）供"关联简历"下拉
  const { data: allResumes } = useSWR<
    Array<{ id: string; name: string; tag: string }>
  >("/api/resumes", swrFetcher);

  // 数据到了：重置表单
  React.useEffect(() => {
    if (!data) return;
    form.reset({
      companyName: data.application.companyName,
      departmentName: data.application.departmentName,
      roleName: data.application.roleName,
      currentStatus: data.application.currentStatus,
      linkedResumeId: data.application.linkedResumeId ?? "",
      type: data.stage.type,
      status: data.stage.status,
      time: isoToLocalInput(data.stage.time),
      meetingLink: data.stage.meetingLink ?? "",
    });
  }, [data, form]);

  const onSave = async (values: FormValues) => {
    if (!data) return;
    setSaving(true);
    try {
      // 并发 PATCH Application + Stage
      await Promise.all([
        fetchJson(`/api/applications/${data.application.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            companyName: values.companyName,
            departmentName: values.departmentName,
            roleName: values.roleName,
            currentStatus: values.currentStatus,
            // 空串 → null（后端用 nested connect/disconnect 处理）
            linkedResumeId: values.linkedResumeId || null,
          }),
        }),
        fetchJson(`/api/stages/${data.stage.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            type: values.type,
            status: values.status,
            time: localInputToIso(values.time),
            meetingLink: values.meetingLink || null,
          }),
        }),
      ]);
      toast.success("保存成功");
      setIsEditing(false);
      await mutate();
      router.refresh(); // 三页 Server Component 重新拉数据
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "保存失败，请稍后再试";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex flex-1 items-center justify-center">
        {error ? (
          <p className="text-body text-danger">
            {error instanceof Error ? error.message : "加载失败"}
          </p>
        ) : (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        )}
      </div>
    );
  }

  const stage = data.stage;
  const app = data.application;

  // Tab 列表（纯常量，不是 hook，放这里没问题）
  const TABS = [
    { key: "basic", label: "基础" },
    { key: "questions", label: "面试题" },
    { key: "review", label: "复盘" },
    { key: "notes", label: "随手记" },
  ] as const;

  return (
    <>
      {/* A. 顶部概览区（UI.md 11.2 A） */}
      <SheetHeader>
        <SheetTitle>{app.companyName}</SheetTitle>
        <SheetDescription>
          {app.departmentName ? `${app.departmentName} · ` : ""}
          {app.roleName}
        </SheetDescription>
        <div className="mt-3 flex items-center gap-2 pr-12">
          <span
            className={cn(
              "inline-flex items-center rounded-pill px-3 py-1 text-caption font-medium",
              statusChip(stage.status)
            )}
          >
            {stage.type} · {stage.status}
          </span>
          {stage.time && (
            <span className="text-caption text-text-tertiary">
              {new Date(stage.time).toLocaleString("zh-CN", {
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          {stage.meetingLink && (
            <a
              href={stage.meetingLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-caption text-primary-strong hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              会议链接
            </a>
          )}
        </div>

        {/* Tabs 切换 · v2 */}
        <div className="mt-4 flex items-center gap-1 rounded-full border border-[#f1e8e0] bg-[#fdfbf8] p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={cn(
                "flex-1 rounded-full px-3 py-1.5 text-[12px] transition-all",
                activeTab === t.key
                  ? "bg-white text-[#6b574f] shadow-[0_1px_2px_rgba(199,165,149,0.08)] font-semibold"
                  : "text-[#a69890] hover:text-[#8a6d5f]"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </SheetHeader>

      {/* B. 内容区 · 根据 Tab 切换 */}
      <SheetBody>
        {activeTab === "basic" && (
          <form
            id="stage-form"
            onSubmit={form.handleSubmit(onSave)}
            className="space-y-5"
          >
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-card-title text-text-primary">基础信息</h4>
              <Button
                type="button"
                variant={isEditing ? "secondary" : "outline"}
                size="sm"
                onClick={() => {
                  if (isEditing) {
                    form.reset();
                  }
                  setIsEditing((v) => !v);
                }}
              >
                {isEditing ? "取消" : "编辑"}
              </Button>
            </div>

            <Field label="公司" error={form.formState.errors.companyName?.message}>
              <Input
                disabled={!isEditing}
                {...form.register("companyName")}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="部门">
                <Input
                  disabled={!isEditing}
                  {...form.register("departmentName")}
                />
              </Field>
              <Field label="岗位" error={form.formState.errors.roleName?.message}>
                <Input
                  disabled={!isEditing}
                  {...form.register("roleName")}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="事件类型">
                <Select disabled={!isEditing} {...form.register("type")}>
                  {STAGE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="节点状态">
                <Select disabled={!isEditing} {...form.register("status")}>
                  {STAGE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label="整体流程状态">
              <Select
                disabled={!isEditing}
                {...form.register("currentStatus")}
              >
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="时间">
                <Input
                  type="datetime-local"
                  disabled={!isEditing}
                  {...form.register("time")}
                />
              </Field>
              <Field label="会议链接">
                <Input
                  placeholder="https://..."
                  disabled={!isEditing}
                  {...form.register("meetingLink")}
                />
              </Field>
            </div>
          </section>

          {/* D. 关联简历区（UI.md 11.2 D · Step 5.3 实装） */}
          <section className="space-y-3 border-t border-border-light pt-5">
            <h4 className="text-card-title text-text-primary">关联简历</h4>

            <Field label="选择简历">
              <Select
                disabled={!isEditing}
                {...form.register("linkedResumeId")}
              >
                <option value="">— 未关联 —</option>
                {(allResumes ?? []).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}（{r.tag}）
                  </option>
                ))}
              </Select>
            </Field>

            {/* 当前关联简历的预览入口（使用 form.watch 实时拿到最新 id） */}
            <CurrentResumePreview
              selectedId={form.watch("linkedResumeId")}
              allResumes={allResumes ?? []}
              onPreview={(r) => setPreviewResume(r)}
            />
          </section>

          {/* JD 信息区先空着（Phase 6 在 JD 解析里展开） */}
        </form>
        )}

        {activeTab === "questions" && (
          <InterviewQuestionsTab
            stageId={stage.id}
            applicationId={app.id}
            initialQuestions={stage.interviewQuestions}
            onSaved={async () => {
              await mutate();
              router.refresh();
            }}
          />
        )}

        {activeTab === "review" && (
          <ReviewTab
            stageId={stage.id}
            initial={{
              reviewTranscript: stage.reviewTranscript,
              reviewQuestionSummary: stage.reviewQuestionSummary,
              reviewAnswerSummary: stage.reviewAnswerSummary,
              reviewSuggestion: stage.reviewSuggestion,
            }}
            onSaved={async () => {
              await mutate();
              router.refresh();
            }}
          />
        )}

        {activeTab === "notes" && (
          <PersonalNotesTab
            stageId={stage.id}
            initial={stage.personalNotes}
            onSaved={async () => {
              await mutate();
              router.refresh();
            }}
          />
        )}
      </SheetBody>

      <SheetFooter>
        {isEditing && activeTab === "basic" && (
          <Button
            type="submit"
            form="stage-form"
            disabled={!form.formState.isDirty || saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                保存中…
              </>
            ) : (
              "保存"
            )}
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={onClose}>
          关闭
        </Button>
      </SheetFooter>

      {/* Step 5.3 · 简历预览 Dialog（嵌套在 Drawer 之上） */}
      <ResumePreviewDialog
        open={previewResume !== null}
        onOpenChange={(v) => !v && setPreviewResume(null)}
        resume={previewResume}
      />
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 子组件 / 工具
// ──────────────────────────────────────────────────────────────────────

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-caption text-danger">{error}</p>}
    </div>
  );
}

function statusChip(status: string): string {
  switch (status) {
    case "已通过":
      return "bg-secondary-mint text-[#4A9970]";
    case "未通过":
      return "bg-danger/25 text-primary-strong";
    case "待参加":
      return "bg-neutral/50 text-text-secondary";
    case "已完成":
      return "bg-[#EEEAF0] text-text-secondary";
    default:
      return "bg-neutral/40 text-text-secondary";
  }
}

/**
 * Step 5.3 · 关联简历区的"当前选中简历预览入口"
 *
 * selectedId 来自 form.watch("linkedResumeId")，实时反映用户在 select 里的选择。
 * 空串时显示"未关联"提示；有值时显示简历名 + 标签 + 预览按钮。
 */
function CurrentResumePreview({
  selectedId,
  allResumes,
  onPreview,
}: {
  selectedId: string;
  allResumes: Array<{ id: string; name: string; tag: string }>;
  onPreview: (resume: { id: string; name: string }) => void;
}) {
  if (!selectedId) {
    return (
      <p className="text-caption text-text-tertiary">
        还未关联简历，切换后请记得保存
      </p>
    );
  }
  const match = allResumes.find((r) => r.id === selectedId);
  if (!match) {
    return (
      <p className="text-caption text-danger">
        选中的简历已被删除，请重新选择
      </p>
    );
  }
  return (
    <div className="flex items-center justify-between rounded-card-md bg-app-bg-secondary p-3">
      <div>
        <p className="text-body font-medium text-text-primary">
          {match.name}
        </p>
        <p className="text-caption text-text-tertiary">标签：{match.tag}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onPreview({ id: match.id, name: match.name })}
      >
        预览
      </Button>
    </div>
  );
}