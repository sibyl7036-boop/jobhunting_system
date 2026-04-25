"use client";

/**
 * NewStageDrawerContent · 新建 Stage（Step 4.4）
 *
 * 支持两种入口：
 *   1. 已指定 applicationId（公司页 "新增流程节点" 或选了已有岗位）
 *   2. 仅有日期预填（日历页点空白日期）：用户从下拉选已有 Application
 *
 * 简化：本 Drawer 不支持"现场新建 Application"，若用户要建新岗位，引导他走
 *       /companies 页右上"新增申请"（application-new Drawer）。
 */

import * as React from "react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

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
import { STAGE_TYPES, STAGE_STATUSES } from "@/lib/schemas";

// ──────────────────────────────────────────────────────────────────────
// 表单
// ──────────────────────────────────────────────────────────────────────

const formSchema = z.object({
  applicationId: z.string().min(1, "请选择岗位"),
  type: z.enum(STAGE_TYPES as unknown as [string, ...string[]]),
  status: z.enum(STAGE_STATUSES as unknown as [string, ...string[]]),
  time: z.string(),
  meetingLink: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

/** 日期 YYYY-MM-DD → datetime-local 默认 09:00 */
function dateToLocalInput(date?: string): string {
  if (!date) return "";
  return `${date}T09:00`;
}

/** datetime-local → ISO */
function localInputToIso(input: string): string | null {
  if (!input) return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

// ──────────────────────────────────────────────────────────────────────
// 组件
// ──────────────────────────────────────────────────────────────────────

interface Props {
  initialApplicationId?: string;
  initialDate?: string; // YYYY-MM-DD
  onClose: () => void;
}

interface AppRow {
  id: string;
  companyName: string;
  departmentName: string;
  roleName: string;
}

export function NewStageDrawerContent({
  initialApplicationId,
  initialDate,
  onClose,
}: Props) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);

  // 取全部 Application 供下拉选择
  const { data: apps, isLoading: appsLoading } = useSWR<AppRow[]>(
    "/api/applications",
    (url: string) => fetchJson<AppRow[]>(url)
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      applicationId: initialApplicationId ?? "",
      type: "一面",
      status: "待参加",
      time: dateToLocalInput(initialDate),
      meetingLink: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      await fetchJson(`/api/stages`, {
        method: "POST",
        body: JSON.stringify({
          applicationId: values.applicationId,
          type: values.type,
          status: values.status,
          time: localInputToIso(values.time),
          meetingLink: values.meetingLink || null,
        }),
      });
      toast.success("新增事件成功");
      router.refresh();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "新增失败";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle>新增事件</SheetTitle>
        <SheetDescription>
          选择岗位后填入时间、类型与状态
        </SheetDescription>
      </SheetHeader>

      <SheetBody>
        <form
          id="new-stage-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label>关联岗位</Label>
            {appsLoading ? (
              <div className="flex items-center gap-2 text-caption text-text-tertiary">
                <Loader2 className="h-4 w-4 animate-spin" />
                加载岗位列表…
              </div>
            ) : (
              <Select {...form.register("applicationId")}>
                <option value="">— 请选择 —</option>
                {(apps ?? []).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.companyName}
                    {a.departmentName ? ` · ${a.departmentName}` : ""}
                    {a.roleName ? ` · ${a.roleName}` : ""}
                  </option>
                ))}
              </Select>
            )}
            {form.formState.errors.applicationId && (
              <p className="text-caption text-danger">
                {form.formState.errors.applicationId.message}
              </p>
            )}
            <p className="text-caption text-text-tertiary">
              没有合适的岗位？去「公司进度」页面右上角「新增申请」先建一个。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>事件类型</Label>
              <Select {...form.register("type")}>
                {STAGE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>节点状态</Label>
              <Select {...form.register("status")}>
                {STAGE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>时间</Label>
            <Input type="datetime-local" {...form.register("time")} />
          </div>

          <div className="space-y-1.5">
            <Label>会议链接</Label>
            <Input placeholder="https://..." {...form.register("meetingLink")} />
          </div>
        </form>
      </SheetBody>

      <SheetFooter>
        <Button
          type="submit"
          form="new-stage-form"
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              创建中…
            </>
          ) : (
            "创建"
          )}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          取消
        </Button>
      </SheetFooter>
    </>
  );
}
