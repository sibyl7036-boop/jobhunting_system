"use client";

/**
 * app/error.tsx · 全局错误边界（Next.js 约定）
 *
 * 任何 Server Component / Client Component 抛出的未捕获异常都会走这里。
 * reset() 是 Next 注入的"重试当前路由"函数。
 */

import * as React from "react";
import { ErrorState } from "@/components/common/ErrorState";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[app/error] ", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <ErrorState
        title="页面加载失败"
        description="后台刚刚打了个盹，可以点「重试」再试一次。"
        onRetry={reset}
      />
    </div>
  );
}
