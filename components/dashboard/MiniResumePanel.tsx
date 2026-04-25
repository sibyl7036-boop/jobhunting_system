"use client";

/**
 * components/dashboard/MiniResumePanel.tsx
 *
 * 侧边栏精简简历面板：
 *   - 仅占一个 section 的高度
 *   - 每份简历：左侧彩色小图标 + 名称 + 标签
 *   - 操作：Hover 时出现预览 / 改名 / 删除
 *   - 底部：紧凑上传按钮
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Upload,
  Pencil,
  Trash2,
  ChevronRight,
  Plus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { fetchJson } from "@/lib/fetcher";
import { UploadResumeDialog } from "@/components/resume/UploadResumeDialog";
import { RenameResumeDialog } from "@/components/resume/RenameResumeDialog";
import { ResumePreviewDialog } from "@/components/resume/ResumePreviewDialog";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";

export interface MiniResume {
  id: string;
  name: string;
  tag: string;
  createdAtIso: string;
}

function tagTint(tag: string): { bg: string; fg: string } {
  switch (tag) {
    case "产品":
      return { bg: "#EDE7F5", fg: "#8a6fa5" };
    case "运营":
      return { bg: "#FBEBDE", fg: "#b87a56" };
    case "算法":
      return { bg: "#E8EFE3", fg: "#70876a" };
    case "通用":
    default:
      return { bg: "#FAE6EA", fg: "#c86d85" };
  }
}

interface MiniResumePanelProps {
  resumes: MiniResume[];
}

export function MiniResumePanel({ resumes }: MiniResumePanelProps) {
  const router = useRouter();
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [previewResume, setPreviewResume] = React.useState<MiniResume | null>(null);
  const [renameResume, setRenameResume] = React.useState<MiniResume | null>(null);
  const [deleteResume, setDeleteResume] = React.useState<MiniResume | null>(null);

  const isEmpty = resumes.length === 0;

  const handleDelete = async () => {
    if (!deleteResume) return;
    await fetchJson(`/api/resumes/${deleteResume.id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <section
      className="surface animate-fade-in-up"
      style={{ animationDelay: "0.15s" }}
    >
      <header className="flex items-center justify-between border-b border-[#f1e8e0] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#FAE6EA]">
            <FileText size={12} className="text-[#c86d85]" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-[#5b4a4a] leading-tight">
              My Resumes
            </h3>
            <p className="text-[10px] text-[#b4a79e] leading-tight">
              {isEmpty ? "还没上传" : `${resumes.length} 份`}
            </p>
          </div>
        </div>
        {!isEmpty && (
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-[#b4a79e] hover:bg-[#fdfbf8] hover:text-[#8a6d5f] transition"
            aria-label="上传"
            title="上传新简历"
          >
            <Plus size={13} />
          </button>
        )}
      </header>

      <div className="p-3">
        {isEmpty ? (
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-[#ead8c8] bg-[#fdf9f3]/60 py-6 text-center transition hover:border-[#e8d7c8] hover:bg-[#fdf9f3]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fbebde]">
              <Upload size={14} className="text-[#b87a56]" />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-[#6b574f]">
                上传 PDF 简历
              </p>
              <p className="mt-0.5 text-[10px] text-[#b4a79e]">
                支持多份上传
              </p>
            </div>
          </button>
        ) : (
          <ul className="space-y-1.5">
            {resumes.map((r, idx) => {
              const tint = tagTint(r.tag);
              return (
                <li
                  key={r.id}
                  className="group relative flex items-center gap-2 rounded-xl border border-transparent p-1.5 transition-all hover:border-[#f1e8e0] hover:bg-[#fdfbf8] animate-fade-in-up"
                  style={{ animationDelay: `${0.2 + idx * 0.04}s` }}
                >
                  <button
                    type="button"
                    onClick={() => setPreviewResume(r)}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                    style={{ background: tint.bg }}
                    aria-label="预览"
                  >
                    <FileText
                      size={13}
                      strokeWidth={2}
                      style={{ color: tint.fg }}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewResume(r)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="truncate text-[12px] font-semibold text-[#5b4a4a] leading-tight">
                      {r.name}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1">
                      <span
                        className="inline-flex items-center rounded-full px-1.5 py-px text-[9px] font-semibold"
                        style={{ background: tint.bg, color: tint.fg }}
                      >
                        {r.tag}
                      </span>
                    </div>
                  </button>
                  <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
                    <MiniBtn
                      onClick={() => setRenameResume(r)}
                      label="改名"
                    >
                      <Pencil size={10} />
                    </MiniBtn>
                    <MiniBtn
                      onClick={() => setDeleteResume(r)}
                      label="删除"
                      variant="danger"
                    >
                      <Trash2 size={10} />
                    </MiniBtn>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

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
            ? `将删除「${deleteResume.name}」（${deleteResume.tag}）。若已被岗位关联会提示无法删除。`
            : "此操作不可撤销。"
        }
        onConfirm={handleDelete}
        successMessage="简历已删除"
      />
    </section>
  );
}

function MiniBtn({
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
      title={label}
      aria-label={label}
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded-lg transition",
        variant === "danger"
          ? "text-[#b4a79e] hover:bg-[#fae6ea] hover:text-[#c86d85]"
          : "text-[#b4a79e] hover:bg-[#fbf4ee] hover:text-[#8a6d5f]"
      )}
    >
      {children}
    </button>
  );
}

// ChevronRight 只是引入避免未使用报错
void ChevronRight;