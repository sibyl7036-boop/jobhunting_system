"use client";

/**
 * components/ui/sheet.tsx · shadcn/ui Sheet (new-york)
 *
 * 右侧滑出抽屉。Drawer 的外壳由本组件提供：
 *   - 遮罩（Overlay）
 *   - 动效（240ms ease-out，对齐 docs/ui-guide.md 11.3）
 *   - 左侧大圆角 + 宽 440px（docs/ui-guide.md 11.1）
 *   - 关闭按钮（圆形 icon button，docs/ui-guide.md 11.1）
 */

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-gradient-to-br from-[#5b4a4a]/25 via-[#3a2d2d]/30 to-[#2d2323]/35 backdrop-blur-[3px]",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
      className
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** 自定义宽度，默认 440px（docs/ui-guide.md 11.1） */
  widthClassName?: string;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ className, widthClassName = "w-[460px]", children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed right-0 top-0 z-50 h-full flex flex-col gap-0",
        // 背景：奶油渐变（顶部→底部轻浅），配合 header 融合
        "bg-gradient-to-b from-[#fffaf4] via-white to-[#fdfbf8]",
        // 更柔的阴影 + 左侧大弧形（32px）
        "shadow-[-24px_0_48px_-12px_rgba(91,74,74,0.18)]",
        "rounded-l-[32px]",
        // 左侧细微高光描边，让弧形更可读
        "before:absolute before:inset-y-0 before:-left-px before:w-px before:bg-gradient-to-b before:from-transparent before:via-[#f3e2d6] before:to-transparent before:pointer-events-none",
        // 外部装饰性"书签把手"：左侧中央向外凸出一个小圆角
        "after:absolute after:top-1/2 after:-translate-y-1/2 after:-left-2.5 after:w-2.5 after:h-16 after:rounded-l-full after:bg-gradient-to-b after:from-[#f3d9df] after:via-[#fbebde] after:to-[#ede7f5] after:shadow-[-6px_0_16px_-6px_rgba(200,109,133,0.25)] after:pointer-events-none",
        widthClassName,
        // 稍慢的滑入：280ms，更优雅
        "transition ease-smooth duration-300",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
        className
      )}
      {...props}
    >
      {children}
      {/* 关闭按钮：圆形 icon button */}
      <DialogPrimitive.Close
        className={cn(
          "absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full",
          "bg-white/80 backdrop-blur text-[#8a7972] border border-[#f1e8e0]",
          "transition-all hover:bg-[#fae6ea] hover:text-[#c86d85] hover:border-[#f3d9df] hover:rotate-90",
          "shadow-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e9b99a]",
          "disabled:pointer-events-none"
        )}
        aria-label="关闭"
      >
        <X className="h-4 w-4" />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "relative flex-shrink-0 px-6 pb-4 pt-6",
      // 顶部圆角与容器一致，内嵌式渐变底
      "rounded-tl-[32px] bg-gradient-to-br from-[#fff5ea] via-[#fffaf4] to-white",
      "border-b border-[#f3e2d6]/60",
      // 顶部细微高光条
      "after:absolute after:top-0 after:left-10 after:right-20 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#f3d9df] after:to-transparent after:pointer-events-none",
      className
    )}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

const SheetBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex-1 overflow-y-auto px-6 py-5",
      // 漂亮的滚动条
      "[&::-webkit-scrollbar]:w-1.5",
      "[&::-webkit-scrollbar-track]:bg-transparent",
      "[&::-webkit-scrollbar-thumb]:bg-[#f1e8e0] [&::-webkit-scrollbar-thumb]:rounded-full",
      "[&::-webkit-scrollbar-thumb:hover]:bg-[#e8d7c8]",
      className
    )}
    {...props}
  />
);
SheetBody.displayName = "SheetBody";

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex-shrink-0 border-t border-[#f3e2d6]/60 bg-gradient-to-t from-[#fdfbf8] to-white px-6 py-4",
      "flex items-center justify-end gap-2",
      className
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-section-title text-text-primary", className)}
    {...props}
  />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("mt-1 text-caption text-text-tertiary", className)}
    {...props}
  />
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};