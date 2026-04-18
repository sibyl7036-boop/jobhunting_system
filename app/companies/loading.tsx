/**
 * app/companies/loading.tsx · 大厂页骨架屏（Step 7.1）
 */

import { Skeleton } from "@/components/ui/skeleton";

export default function CompaniesLoading() {
  return (
    <div className="pb-12 pt-6">
      <div className="rounded-card-lg bg-surface-bg p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="divide-y divide-border-light">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 py-4">
              <Skeleton className="h-8 w-[160px]" />
              <div className="flex flex-1 items-center gap-2">
                {Array.from({ length: 9 }).map((_, j) => (
                  <Skeleton key={j} className="h-9 w-16 rounded-pill" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
