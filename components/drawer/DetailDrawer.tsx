"use client";

/**
 * components/drawer/DetailDrawer.tsx
 *
 * 全局右侧 Drawer 容器（UI.md 11）
 *
 * 状态管理：URL search params（architecture.md 关键契约点 16）
 *   - ?drawer=stage&id=xxx              → 查看 / 编辑已有 Stage
 *   - ?drawer=stage-new&applicationId=  → 新建 Stage（可选 &date=YYYY-MM-DD 预填）
 *   - ?drawer=application-new           → 新建 Application（+ 可选第一个 Stage）
 *
 * 好处：刷新恢复状态、可分享链接、三页共用一套逻辑。
 *
 * 本组件：
 *   - 监听 URL 参数 → 控 open 态
 *   - 根据 type 路由到 StageDrawerContent / NewStageDrawerContent / NewApplicationDrawerContent
 *   - 关闭时自动清 URL 参数（drawer / id / applicationId / date）
 */

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { StageDrawerContent } from "@/components/drawer/StageDrawerContent";
import { NewStageDrawerContent } from "@/components/drawer/NewStageDrawerContent";
import { NewApplicationDrawerContent } from "@/components/drawer/NewApplicationDrawerContent";

export function DetailDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const drawerType = searchParams.get("drawer");
  const stageId = searchParams.get("id");
  const applicationId = searchParams.get("applicationId");
  const prefillDate = searchParams.get("date");
  const prefillCompany = searchParams.get("companyName");

  const open = drawerType !== null;

  // 关闭 Drawer：把 drawer 相关的参数从 URL 里剥掉
  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) return; // 打开由 URL 驱动，这里只处理关闭
      const sp = new URLSearchParams(searchParams);
      sp.delete("drawer");
      sp.delete("id");
      sp.delete("applicationId");
      sp.delete("date");
      sp.delete("companyName");
      const query = sp.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        {/*
         * 无障碍兜底：Radix Dialog 要求 DialogContent 必须有 Title 子元素。
         * 子组件在 loading / 未匹配 type 时可能还没渲染 SheetTitle，
         * 这里始终放一份视觉隐藏的标题，子组件自己再渲染可见标题不影响。
         */}
        <SheetTitle className="sr-only">详情面板</SheetTitle>
        <SheetDescription className="sr-only">
          查看与编辑面试 / 流程 / 岗位详情
        </SheetDescription>

        {drawerType === "stage" && stageId && (
          <StageDrawerContent stageId={stageId} onClose={() => handleOpenChange(false)} />
        )}
        {drawerType === "stage-new" && (
          <NewStageDrawerContent
            initialApplicationId={applicationId ?? undefined}
            initialDate={prefillDate ?? undefined}
            onClose={() => handleOpenChange(false)}
          />
        )}
        {drawerType === "application-new" && (
          <NewApplicationDrawerContent
            initialCompany={prefillCompany ?? undefined}
            onClose={() => handleOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}