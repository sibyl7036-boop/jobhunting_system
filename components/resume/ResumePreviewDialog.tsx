"use client";

/**
 * components/resume/ResumePreviewDialog.tsx
 *
 * 简历预览（Step 5.2）· 大 Dialog 内嵌 <iframe> 渲染 PDF
 *
 * PDF 预览不使用 react-pdf，按 UI.md 约定直接用浏览器原生 iframe。
 */

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, ExternalLink } from "lucide-react";

import {
  Dialog,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resume: { id: string; name: string } | null;
}

export function ResumePreviewDialog({ open, onOpenChange, resume }: Props) {
  const url = resume ? `/api/resumes/${resume.id}/file` : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 -translate-x-1/2 -translate-y-1/2",
            "flex h-[85vh] w-[70vw] max-w-4xl flex-col overflow-hidden",
            "rounded-card-lg bg-surface-bg shadow-hover",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
          )}
        >
          <header className="flex-shrink-0 flex items-center justify-between border-b border-border-light bg-surface-bg px-6 py-4">
            <div className="min-w-0 flex-1">
              <DialogPrimitive.Title className="truncate text-card-title text-text-primary">
                {resume?.name ?? "简历预览"}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-0.5 text-caption text-text-tertiary">
                PDF 预览（支持浏览器原生工具栏缩放 / 下载）
              </DialogPrimitive.Description>
            </div>
            <div className="flex items-center gap-2">
              {resume && (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center gap-1 rounded-btn-sm px-3 text-caption text-text-secondary hover:bg-soft-panel hover:text-text-primary transition-colors"
                  title="新标签页打开"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  新窗口打开
                </a>
              )}
              <DialogPrimitive.Close
                className="flex h-9 w-9 items-center justify-center rounded-full text-text-tertiary hover:bg-soft-panel hover:text-text-primary transition-colors"
                aria-label="关闭"
              >
                <X className="h-4 w-4" />
              </DialogPrimitive.Close>
            </div>
          </header>

          <div className="flex-1 bg-app-bg-secondary">
            {resume && (
              <iframe
                src={url}
                title={resume.name}
                className="h-full w-full"
                // 直接用浏览器内置 PDF viewer
              />
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
