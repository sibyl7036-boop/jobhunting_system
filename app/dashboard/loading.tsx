/**
 * app/dashboard/loading.tsx · 首页骨架屏（Step 7.1）
 *
 * 与 app/dashboard/page.tsx 的 12 栏布局结构保持一致：
 *   左 8 栏：时间维度流程表格 + 我的简历
 *   右 4 栏：明日提醒 + 今日动向 + AI Copilot
 */

import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="pb-12 pt-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 左 8 栏 */}
        <div className="space-y-6 lg:col-span-8">
          {/* 时间维度流程表格 */}
          <section className="rounded-card-lg bg-surface-bg p-6 shadow-soft">
            <Skeleton className="mb-4 h-6 w-48" />
            <Skeleton className="mb-5 h-4 w-64" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </section>

          {/* 我的简历 */}
          <section className="rounded-card-lg bg-surface-bg p-6 shadow-soft">
            <Skeleton className="mb-4 h-6 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </section>
        </div>

        {/* 右 4 栏 */}
        <div className="space-y-6 lg:col-span-4">
          <Skeleton className="h-40 w-full rounded-card-lg" />
          <Skeleton className="h-32 w-full rounded-card-lg" />
          <Skeleton className="h-72 w-full rounded-card-lg" />
        </div>
      </div>
    </div>
  );
}
