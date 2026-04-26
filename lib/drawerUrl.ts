"use client";

/**
 * lib/drawerUrl.ts · Drawer URL 参数工具
 *
 * Drawer 由 URL search params 驱动（docs/architecture.md 契约点 16）。
 * 本文件提供：
 *   - useOpenDrawer()：push / replace URL 加上 drawer 参数
 *   - useCloseDrawer()：清掉 drawer 参数
 *   - buildDrawerUrl()：给 <Link> 用的纯函数
 */

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

export type DrawerAction =
  | { type: "stage"; id: string }
  | { type: "stage-new"; applicationId?: string; date?: string }
  | { type: "application-new"; companyName?: string };

function applyAction(sp: URLSearchParams, action: DrawerAction): URLSearchParams {
  const next = new URLSearchParams(sp);
  // 先清掉老的参数
  next.delete("drawer");
  next.delete("id");
  next.delete("applicationId");
  next.delete("date");
  next.delete("companyName");

  next.set("drawer", action.type);
  if (action.type === "stage") {
    next.set("id", action.id);
  } else if (action.type === "stage-new") {
    if (action.applicationId) next.set("applicationId", action.applicationId);
    if (action.date) next.set("date", action.date);
  } else if (action.type === "application-new") {
    if (action.companyName) next.set("companyName", action.companyName);
  }
  return next;
}

export function useOpenDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback(
    (action: DrawerAction) => {
      const next = applyAction(searchParams, action);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );
}

export function useCloseDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback(() => {
    const sp = new URLSearchParams(searchParams);
    sp.delete("drawer");
    sp.delete("id");
    sp.delete("applicationId");
    sp.delete("date");
    sp.delete("companyName");
    const q = sp.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);
}