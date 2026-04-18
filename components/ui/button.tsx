import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui · new-york style · Button
 *
 * Step 0.3 说明：
 * - 本组件是 shadcn CLI 在 new-york style 下的标准产出（Tailwind class 样式）。
 * - 颜色走 Tailwind 语义令牌：primary / primary-hover / primary-strong / text-on-primary 等，
 *   这些令牌在 tailwind.config.ts 里指向 UI.md 4.x 的真实色值。
 * - 需要改配色时改 tailwind.config.ts，不要在这里写死 hex。
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-btn-lg text-body font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-text-on-primary shadow-soft hover:bg-primary-hover active:bg-primary-strong",
        destructive:
          "bg-danger text-text-on-primary hover:bg-danger/90 active:bg-danger/80",
        outline:
          "border border-border-strong bg-surface-bg text-text-primary hover:bg-soft-panel",
        secondary:
          "bg-soft-panel text-text-primary hover:bg-secondary-pink",
        ghost: "text-text-primary hover:bg-soft-panel",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-btn-sm px-3 text-caption",
        lg: "h-12 rounded-btn-lg px-6",
        icon: "h-9 w-9 rounded-btn-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
