import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * shadcn/ui 约定的类名合并工具（new-york style 依赖它）。
 * - clsx：合法化条件类名（支持对象 / 数组 / falsy）
 * - tailwind-merge：解决 "px-2 px-4" 冲突时取后者
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
