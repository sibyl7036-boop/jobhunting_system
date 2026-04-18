"use client";

/**
 * NewApplicationDrawerContent · 新建 Application + 可选第一个 Stage（Step 4.4）
 *
 * 从 /companies 右上 "新增申请" 进入。
 * 表单：
 *   - 公司（必填）
 *   - 部门（可空）
 *   - 岗位（必填）
 *   - 可选：第一个 Stage（类型 + 时间 + 会议链接）
 * 原子化：先 POST /api/applications，成功后再 POST /api/stages；
 *   Stage 失败时 Application 保留、表单不清、提示用户。
 */

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
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

const COMPANY_SUGGEST = [
  "阿里",
  "腾讯",
  "字节",
  "美团",
  "百度",
  "京东",
  "拼多多",
  "小红书",
  "快手",
  "滴滴",
] as const;

const formSchema = z.object({
  companyName: z.string().min(1, "公司必填"),
  departmentName: z.string(),
  roleName: z.string().min(1, "岗位必填"),
  addFirstStage: z.boolean(),
  stageType: z.enum(STAGE_TYPES as unknown as [string, ...string[]]),
  stageStatus: z.enum(STAGE_STATUSES as unknown as [string, ...string[]]),
  stageTime: z.string(),
  stageMeetingLink: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

function localInputToIso(input: string): string | null {
  if (!input) return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

interface Props {
  onClose: () => void;
}

export function NewApplicationDrawerContent({ onClose }: Props) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      departmentName: "",
      roleName: "",
      addFirstStage: false,
      stageType: "一面",
      stageStatus: "待参加",
      stageTime: "",
      stageMeetingLink: "",
    },
  });

  const addFirstStage = form.watch("addFirstStage");

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      // Step 1：建 Application
      const app = await fetchJson<{
        id: string;
        companyName: string;
        roleName: string;
      }>(`/api/applications`, {
        method: "POST",
        body: JSON.stringify({
          companyName: values.companyName,
          departmentName: values.departmentName,
          roleName: values.roleName,
          currentStatus: values.addFirstStage ? values.stageType : "已投递",
        }),
      });

      // Step 2：可选建第一个 Stage
      if (values.addFirstStage) {
        try {
          await fetchJson(`/api/stages`, {
            method: "POST",
            body: JSON.stringify({
              applicationId: app.id,
              type: values.stageType,
              status: values.stageStatus,
              time: localInputToIso(values.stageTime),
              meetingLink: values.stageMeetingLink || null,
            }),
          });
        } catch (err) {
          // Application 已建成功，Stage 失败：提示并保留 Drawer
          const msg = err instanceof Error ? err.message : "流程节点创建失败";
          toast.error(
            `岗位「${app.companyName}·${app.roleName}」已创建，但第一个流程节点失败：${msg}`
          );
          router.refresh();
          return;
        }
      }

      toast.success("新增申请成功");
      router.refresh();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "创建失败";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle>新增申请</SheetTitle>
        <SheetDescription>
          先填公司 / 部门 / 岗位，可顺手加上第一个流程节点
        </SheetDescription>
      </SheetHeader>

      <SheetBody>
        <form
          id="new-app-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label>公司</Label>
            <Controller
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <>
                  <Input
                    list="company-suggest"
                    placeholder="例如：腾讯"
                    {...field}
                  />
                  <datalist id="company-suggest">
                    {COMPANY_SUGGEST.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </>
              )}
            />
            {form.formState.errors.companyName && (
              <p className="text-caption text-danger">
                {form.formState.errors.companyName.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>部门</Label>
              <Input
                placeholder="例如：IEG"
                {...form.register("departmentName")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>岗位</Label>
              <Input
                placeholder="例如：游戏产品"
                {...form.register("roleName")}
              />
              {form.formState.errors.roleName && (
                <p className="text-caption text-danger">
                  {form.formState.errors.roleName.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-card-md bg-app-bg-secondary p-3">
            <input
              id="add-stage"
              type="checkbox"
              className="h-4 w-4 accent-primary"
              {...form.register("addFirstStage")}
            />
            <label htmlFor="add-stage" className="text-body text-text-primary">
              同时添加第一个流程节点
            </label>
          </div>

          {addFirstStage && (
            <div className="space-y-3 rounded-card-md bg-app-bg-secondary p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>类型</Label>
                  <Select {...form.register("stageType")}>
                    {STAGE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>状态</Label>
                  <Select {...form.register("stageStatus")}>
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
                <Input type="datetime-local" {...form.register("stageTime")} />
              </div>
              <div className="space-y-1.5">
                <Label>会议链接</Label>
                <Input
                  placeholder="https://..."
                  {...form.register("stageMeetingLink")}
                />
              </div>
            </div>
          )}
        </form>
      </SheetBody>

      <SheetFooter>
        <Button type="submit" form="new-app-form" disabled={saving}>
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
