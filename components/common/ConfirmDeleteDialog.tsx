"use client";

/**
 * components/common/ConfirmDeleteDialog.tsx
 *
 * 二次确认删除（docs/ui-guide.md 风格：圆角大卡 + 浅色马卡龙）
 *
 * 使用：
 *   const [open, setOpen] = useState(false);
 *   <ConfirmDeleteDialog
 *     open={open}
 *     onOpenChange={setOpen}
 *     title="确认删除该流程节点？"
 *     description="此操作不可撤销。"
 *     onConfirm={async () => { ...; }}
 *   />
 */

import * as React from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void> | void;
  /** 确认成功后提示文案；传 false 则不提示 */
  successMessage?: string | false;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description = "此操作不可撤销。",
  confirmLabel = "确认删除",
  cancelLabel = "取消",
  onConfirm,
  successMessage = "删除成功",
}: Props) {
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      if (successMessage) toast.success(successMessage);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "操作失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                处理中…
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
