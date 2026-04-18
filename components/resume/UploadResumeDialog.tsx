"use client";

/**
 * components/resume/UploadResumeDialog.tsx
 *
 * 上传新简历（Step 5.2）
 *
 * 表单：文件选择 + 简历名（默认用文件名去 .pdf 后缀）+ 标签
 * 提交：FormData POST /api/resumes/upload
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RESUME_TAGS } from "@/lib/schemas";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadResumeDialog({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [file, setFile] = React.useState<File | null>(null);
  const [name, setName] = React.useState("");
  const [tag, setTag] = React.useState<string>("通用");
  const [saving, setSaving] = React.useState(false);

  // 重置
  React.useEffect(() => {
    if (!open) {
      setFile(null);
      setName("");
      setTag("通用");
    }
  }, [open]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f && !name) {
      // 默认 name = 文件名去 .pdf
      setName(f.name.replace(/\.pdf$/i, ""));
    }
  };

  const onSubmit = async () => {
    if (!file) {
      toast.error("请先选择 PDF 文件");
      return;
    }
    if (!name.trim()) {
      toast.error("请填写简历名");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", name.trim());
      fd.append("tag", tag);

      const res = await fetch("/api/resumes/upload", {
        method: "POST",
        body: fd,
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          body?.error?.message ?? `上传失败（HTTP ${res.status}）`;
        throw new Error(msg);
      }

      if (body?.warning) {
        toast.success(
          `上传成功，但${body.warning}。不影响预览与关联。`,
          { duration: 5000 }
        );
      } else {
        toast.success("上传成功");
      }
      router.refresh();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "上传失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>上传简历</DialogTitle>
          <DialogDescription>
            PDF 格式，单个文件不超过 10MB；上传后会自动尝试提取文本（失败不影响预览）。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>选择 PDF</Label>
            <label
              className={cn(
                "flex min-h-[112px] cursor-pointer flex-col items-center justify-center gap-2 rounded-card-md border border-dashed border-border-strong bg-app-bg-secondary px-4 py-6 text-center",
                "hover:border-primary hover:bg-soft-panel transition-colors"
              )}
            >
              <Upload className="h-5 w-5 text-text-tertiary" />
              {file ? (
                <>
                  <p className="text-body font-medium text-text-primary">
                    {file.name}
                  </p>
                  <p className="text-caption text-text-tertiary">
                    {(file.size / 1024).toFixed(1)} KB · 点此更换文件
                  </p>
                </>
              ) : (
                <>
                  <p className="text-body text-text-primary">点击选择 PDF</p>
                  <p className="text-caption text-text-tertiary">
                    或把文件拖到此处
                  </p>
                </>
              )}
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={onFileChange}
                disabled={saving}
              />
            </label>
          </div>

          <div className="space-y-1.5">
            <Label>简历名</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：阿里-产品-v3"
              disabled={saving}
            />
          </div>

          <div className="space-y-1.5">
            <Label>标签</Label>
            <Select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              disabled={saving}
            >
              {RESUME_TAGS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onSubmit} disabled={saving || !file}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                上传中…
              </>
            ) : (
              <>
                <Upload />
                上传
              </>
            )}
          </Button>
          <Button
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
