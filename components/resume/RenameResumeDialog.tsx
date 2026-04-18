"use client";

/**
 * components/resume/RenameResumeDialog.tsx
 *
 * 改名 + 改标签（Step 5.2）
 */

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { fetchJson } from "@/lib/fetcher";
import { RESUME_TAGS } from "@/lib/schemas";

const schema = z.object({
  name: z.string().min(1, "简历名必填"),
  tag: z.enum(RESUME_TAGS as unknown as [string, ...string[]]),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resume: { id: string; name: string; tag: string } | null;
}

export function RenameResumeDialog({ open, onOpenChange, resume }: Props) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", tag: "通用" },
  });

  React.useEffect(() => {
    if (open && resume) {
      form.reset({ name: resume.name, tag: resume.tag });
    }
  }, [open, resume, form]);

  const onSubmit = async (values: FormValues) => {
    if (!resume) return;
    setSaving(true);
    try {
      await fetchJson(`/api/resumes/${resume.id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      });
      toast.success("保存成功");
      router.refresh();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑简历信息</DialogTitle>
        </DialogHeader>

        <form
          id="rename-resume-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 pt-2"
        >
          <div className="space-y-1.5">
            <Label>简历名称</Label>
            <Input {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-caption text-danger">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>标签</Label>
            <Controller
              control={form.control}
              name="tag"
              render={({ field }) => (
                <Select value={field.value} onChange={field.onChange}>
                  {RESUME_TAGS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              )}
            />
          </div>
        </form>

        <DialogFooter>
          <Button
            type="submit"
            form="rename-resume-form"
            disabled={saving || !form.formState.isDirty}
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
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            取消
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
