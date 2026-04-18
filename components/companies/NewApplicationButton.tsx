"use client";

/**
 * components/companies/NewApplicationButton.tsx
 *
 * /companies 页右上 "新增申请" 按钮（Step 4.4）
 *
 * 点击打开 ?drawer=application-new Drawer。
 * 独立 Client Component 的原因：companies/page.tsx 是 Server Component。
 */

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOpenDrawer } from "@/lib/drawerUrl";

export function NewApplicationButton() {
  const openDrawer = useOpenDrawer();
  return (
    <Button
      variant="default"
      onClick={() => openDrawer({ type: "application-new" })}
    >
      <Plus />
      新增申请
    </Button>
  );
}
