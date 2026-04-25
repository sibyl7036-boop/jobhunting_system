"use client";

/**
 * components/dashboard/ResumeCard.tsx · 极简奶油风
 * 白底细边卡 + 低饱和彩色小徽标 + 静 hover
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileText, Eye, Trash2, Upload, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchJson } from "@/lib/fetcher";
import { UploadResumeDialog } from "@/components/resume/UploadResumeDialog";
import { RenameResumeDialog } from "@/components/resume/RenameResumeDialog";
import { ResumePreviewDialog } from "@/components/resume/ResumePreviewDialog";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";

export interface SerializedResume {
  id: string;
  name: string;
  tag: string;
  createdAtIso: string;
}

interface ResumeCardProps {
  resumes: SerializedResume[];
}

function tagClass(tag: string): string {
  switch (tag) {
    case "产品":
      return "bg-[#F7F4FB] text-[#8a6fa5] border-[#ede7f5]";
    case "运营":
      return "bg-[#FBEBDE] text-[#b87a56] border-[#f3e2d6]";
    case "算法":
      return "bg-[#E8EFE3] text-[#70876a] border-[#dde7d6]";
    case "通用":
    default:
      return "bg-[#FAE6EA] text-[#c86d85] border-[#f3d9df]";
  }
}

function tagIconBg(tag: string): string {
  switch (tag) {
    case "产品":
      return "bg-[#EDE7F5]";
    case "运营":
      return "bg-[#FBEBDE]";
    case "算法":
      return "bg-[#E8EFE3]";
    case "通用":
    default:
      return "bg-[#FAE6EA]";
  }
}

function tagIconColor(tag: string): string {
  switch (tag) {
    case "产品":
      return "text-[#8a6fa5]";
    case "运营":
      return "text-[#b87a56]";
    case "算法":
      return "text-[#70876a]";
    case "通用":
    default:
      return "text-[#c86d85]";
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}.${m}.${day}`;
}

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
    <section className="surface p-6">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAE6EA]">
            <FileText size={16} strokeWidth={2} className="text-[#c86d85]" />
          </div>
          <div>
            <h3 className="text-card-title text-[#5b4a4a]">My Resumes</h3>
            <p className="text-[11px] text-[#b4a79e]">
              {isEmpty
                ? "先上传第一份吧"
                : `共 ${resumes.length} 份`}
            </p>
          </div>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={() => setUploadOpen(true)}
        >
          <Upload />
          上传简历
        </Button>
      </header>

      {isEmpty ? (
        <EmptyResumes onUpload={() => setUploadOpen(true)} />
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {resumes.map((r, idx) => (
            <ResumeRow
              key={r.id}
              resume={r}
              delay={idx * 0.04}
              onPreview={() => setPreviewResume(r)}
              onRename={() => setRenameResume(r)}
              onDelete={() => setDeleteResume(r)}
            />
          ))}
        </ul>
      )}

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

function ResumeRow({
  resume,
  delay,
  onPreview,
  onRename,
  onDelete,
}: {
  resume: SerializedResume;
  delay: number;
  onPreview: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <li
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl p-3",
        "border border-[#f1e8e0] bg-white/60",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-[#e8d7c8] hover:bg-white",
        "animate-fade-in-up"
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      <div
        className={cn(
          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl",
          tagIconBg(resume.tag)
        )}
      >
        <FileText
          size={16}
          strokeWidth={1.8}
          className={tagIconColor(resume.tag)}
        />
      </div>

      <button
        type="button"
        onClick={onPreview}
        className="min-w-0 flex-1 cursor-pointer text-left"
      >
        <div className="flex items-center gap-2">
          <p className="truncate text-body font-semibold text-[#5b4a4a]">
            {resume.name}
          </p>
          <span
            className={cn(
              "inline-flex flex-shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
              tagClass(resume.tag)
            )}
          >
            {resume.tag}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] text-[#b4a79e]">
          {formatDate(resume.createdAtIso)}
        </p>
      </button>

      <div className="flex items-center gap-1 opacity-50 transition-opacity group-hover:opacity-100">
        <IconBtn label="预览" onClick={onPreview}>
          <Eye size={13} />
        </IconBtn>
        <IconBtn label="改名 / 改标签" onClick={onRename}>
          <Pencil size={13} />
        </IconBtn>
        <IconBtn label="删除" variant="danger" onClick={onDelete}>
          <Trash2 size={13} />
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
        "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
        variant === "danger"
          ? "text-[#b4a79e] hover:bg-[#fae6ea] hover:text-[#c86d85]"
          : "text-[#b4a79e] hover:bg-[#fbf4ee] hover:text-[#8a6d5f]"
      )}
    >
      {children}
    </button>
  );
}

function EmptyResumes({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#ead8c8] bg-[#fdf9f3]/60 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fbebde]">
        <FileText size={20} className="text-[#b87a56]" />
      </div>
      <p className="text-body font-medium text-[#6b574f]">
        先放一份简历进来吧
      </p>
      <p className="text-[11px] text-[#b4a79e]">PDF 格式 · 支持多份上传</p>
      <Button
        variant="default"
        size="sm"
        className="mt-1"
        onClick={onUpload}
      >
        <Upload />
        上传第一份简历
      </Button>
    </div>
  );
}
