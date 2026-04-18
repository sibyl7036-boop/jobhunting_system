"use client";

/**
 * components/dashboard/ResumeCard.tsx
 *
 * 我的简历卡片（UI.md 8.6 + PRD 5.1.4）
 *
 * Step 3.3 占位 → Step 5.2 实装：
 *   - 上传 Dialog（文件选择 + name + tag）
 *   - 每行 预览 / 改名改tag / 删除（删除走 ConfirmDeleteDialog，引用校验由后端 409 拦）
 *   - 空态：引导上传
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Eye,
  Trash2,
  Upload,
  Pencil,
  FolderClosed,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchJson } from "@/lib/fetcher";
import { UploadResumeDialog } from "@/components/resume/UploadResumeDialog";
import { RenameResumeDialog } from "@/components/resume/RenameResumeDialog";
import { ResumePreviewDialog } from "@/components/resume/ResumePreviewDialog";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";

// ──────────────────────────────────────────────────────────────────────
// 类型
// ──────────────────────────────────────────────────────────────────────

export interface SerializedResume {
  id: string;
  name: string;
  tag: string;
  createdAtIso: string;
}

interface ResumeCardProps {
  resumes: SerializedResume[];
}

// ──────────────────────────────────────────────────────────────────────
// 工具
// ──────────────────────────────────────────────────────────────────────

function tagChipClass(tag: string): string {
  switch (tag) {
    case "产品":
      return "bg-secondary-lilac text-text-primary";
    case "运营":
      return "bg-secondary-peach text-text-primary";
    case "算法":
      return "bg-secondary-mint text-[#4A9970]";
    case "通用":
    default:
      return "bg-neutral/50 text-text-secondary";
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

// ──────────────────────────────────────────────────────────────────────
// 主组件
// ──────────────────────────────────────────────────────────────────────

export function ResumeCard({ resumes }: ResumeCardProps) {
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [previewResume, setPreviewResume] =
    React.useState<SerializedResume | null>(null);
  const [renameResume, setRenameResume] =
    React.useState<SerializedResume | null>(null);
  const [deleteResume, setDeleteResume] =
    React.useState<SerializedResume | null>(null);
  const router = useRouter();
  const isEmpty = resumes.length === 0;

  const handleDelete = async () => {
    if (!deleteResume) return;
    await fetchJson(`/api/resumes/${deleteResume.id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <section
      className={cn(
        "rounded-card-md bg-surface-bg p-5 shadow-soft",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-hover"
      )}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-card-title text-text-primary">我的简历</h3>
          <p className="mt-1 text-caption text-text-tertiary">
            放 2~3 份常用版本就够了
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setUploadOpen(true)}
        >
          <Upload />
          上传
        </Button>
      </header>

      {isEmpty ? (
        <EmptyResumes onUpload={() => setUploadOpen(true)} />
      ) : (
        <ul className="space-y-2">
          {resumes.map((r) => (
            <ResumeRow
              key={r.id}
              resume={r}
              onPreview={() => setPreviewResume(r)}
              onRename={() => setRenameResume(r)}
              onDelete={() => setDeleteResume(r)}
            />
          ))}
        </ul>
      )}

      {/* 上传 / 改名 / 预览 / 删除 四个 Dialog */}
      <UploadResumeDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <RenameResumeDialog
        open={renameResume !== null}
        onOpenChange={(v) => !v && setRenameResume(null)}
        resume={renameResume}
      />
      <ResumePreviewDialog
        open={previewResume !== null}
        onOpenChange={(v) => !v && setPreviewResume(null)}
        resume={previewResume}
      />
      <ConfirmDeleteDialog
        open={deleteResume !== null}
        onOpenChange={(v) => !v && setDeleteResume(null)}
        title="确认删除该简历？"
        description={
          deleteResume
            ? `将删除「${deleteResume.name}」（${deleteResume.tag}），若已被岗位关联会提示无法删除。`
            : "此操作不可撤销。"
        }
        onConfirm={handleDelete}
        successMessage="简历已删除"
      />
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 子组件
// ──────────────────────────────────────────────────────────────────────

function ResumeRow({
  resume,
  onPreview,
  onRename,
  onDelete,
}: {
  resume: SerializedResume;
  onPreview: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-card-md bg-app-bg-secondary px-3 py-2.5",
        "transition-colors hover:bg-soft-panel"
      )}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-btn-sm bg-secondary-pink/60 text-primary-strong">
        <FileText size={18} strokeWidth={1.8} />
      </span>

      <button
        type="button"
        onClick={onPreview}
        className="min-w-0 flex-1 cursor-pointer text-left"
      >
        <div className="flex items-center gap-2">
          <p className="truncate text-body font-medium text-text-primary">
            {resume.name}
          </p>
          <span
            className={cn(
              "inline-flex flex-shrink-0 items-center rounded-pill px-2 py-0.5 text-caption",
              tagChipClass(resume.tag)
            )}
          >
            {resume.tag}
          </span>
        </div>
        <p className="mt-0.5 text-caption text-text-tertiary">
          {formatDate(resume.createdAtIso)} 上传
        </p>
      </button>

      <div className="flex items-center gap-1">
        <IconBtn label="预览" onClick={onPreview}>
          <Eye size={16} />
        </IconBtn>
        <IconBtn label="改名 / 改标签" onClick={onRename}>
          <Pencil size={16} />
        </IconBtn>
        <IconBtn label="删除" variant="danger" onClick={onDelete}>
          <Trash2 size={16} />
        </IconBtn>
      </div>
    </li>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  variant,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-btn-sm transition-colors",
        variant === "danger"
          ? "text-text-tertiary hover:bg-danger/15 hover:text-danger"
          : "text-text-tertiary hover:bg-soft-panel hover:text-primary-strong"
      )}
    >
      {children}
    </button>
  );
}

function EmptyResumes({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card-md bg-app-bg-secondary py-8 text-center">
      <FolderClosed size={32} strokeWidth={1.4} className="text-text-tertiary" />
      <p className="text-body text-text-secondary">先放一份简历进来吧</p>
      <Button variant="outline" size="sm" onClick={onUpload}>
        <Upload />
        上传第一份简历
      </Button>
    </div>
  );
}
