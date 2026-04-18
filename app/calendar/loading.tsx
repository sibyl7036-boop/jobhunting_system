/**
 * app/calendar/loading.tsx · 日历页骨架屏（Step 7.1）
 */

import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarLoading() {
  return (
    <div className="pb-12 pt-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 左 8 栏：月视图 */}
        <div className="lg:col-span-8">
          <section className="rounded-card-lg bg-surface-bg p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-9 w-40" />
            </div>
            <div className="mb-2 grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="h-[108px] w-full" />
              ))}
            </div>
          </section>
        </div>

        {/* 右 4 栏：当日事件列表 */}
        <aside className="lg:col-span-4">
          <section className="rounded-card-lg bg-surface-bg p-5 shadow-soft">
            <Skeleton className="mb-4 h-6 w-24" />
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
