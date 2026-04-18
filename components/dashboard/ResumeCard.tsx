"use client";

/**
 * components/dashboard/ResumeCard.tsx
 *
 * 我的简历卡片（UI.md 8.6）
 *
 * Step 3.3 占位：
 *   - 有数据：渲染列表行（左 FileText + 中 名称/标签/时间 + 右 Eye/Trash2 按钮）
 *   - 无数据：空态（小文件夹图标 + "先放一份简历进来吧"）
 *   - 本步所有按钮 disabled + tooltip "即将开放"，Phase 5.2 接真实上传/预览/删除逻辑
 */

import { FileText, Eye, Trash2, Upload, FolderClosed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Server → Client 边界上的简历类型（Date 已序列化） */
export interface SerializedResume {
  id: string;
  name: string;
  tag: string;
  createdAtIso: string;
}

interface ResumeCardProps {
  resumes: SerializedResume[];
}

/** 标签色映射：4 种 tag → UI.md 辅助色 */
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

export function ResumeCard({ resumes }: ResumeCardProps) {
  const isEmpty = resumes.length === 0;

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
          disabled
          title="即将开放（Phase 5 启用）"
        >
          <Upload />
          上传
        </Button>
      </header>

      {isEmpty ? (
        <EmptyResumes />
      ) : (
        <ul className="space-y-2">
          {resumes.map((r) => (
            <ResumeRow key={r.id} resume={r} />
          ))}
        </ul>
      )}
    </section>
  );
}

function ResumeRow({ resume }: { resume: SerializedResume }) {
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-card-md bg-app-bg-secondary px-3 py-2.5",
        "transition-colors hover:bg-soft-panel"
      )}
    >
      {/* 左：文件图标 */}
      <span className="flex h-9 w-9 items-center justify-center rounded-btn-sm bg-secondary-pink/60 text-primary-strong">
        <FileText size={18} strokeWidth={1.8} />
      </span>

      {/* 中：名称 / 标签 / 时间 */}
      <div className="min-w-0 flex-1">
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
      </div>

      {/* 右：预览 / 删除（disabled） */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          disabled
          title="即将开放（Phase 5 启用）"
          aria-label="预览"
        >
          <Eye />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled
          title="即将开放（Phase 5 启用）"
          aria-label="删除"
        >
          <Trash2 />
        </Button>
      </div>
    </li>
  );
}

function EmptyResumes() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-card-md bg-app-bg-secondary py-8 text-center">
      <FolderClosed
        size={32}
        strokeWidth={1.4}
        className="text-text-tertiary"
      />
      <p className="text-body text-text-secondary">先放一份简历进来吧</p>
    </div>
  );
}
