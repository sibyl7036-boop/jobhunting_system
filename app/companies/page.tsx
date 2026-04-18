/**
 * /companies 大厂流程页（UI.md 10）
 *
 * Server Component 直调 getCompaniesProgress()，序列化后传给 Client CompanyRow 渲染。
 * 10 家公司按 PRD 5.3.3 固定顺序；每家 0~N 个 Application，每个 Application 横向展示 9 个节点。
 */

import { getCompaniesProgress } from "@/lib/queries";
import {
  CompanyRow,
  type SerializedAppForRow,
} from "@/components/companies/CompanyRow";
import { NewApplicationButton } from "@/components/companies/NewApplicationButton";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const rows = await getCompaniesProgress();

  return (
    <div className="py-6">
      <section className="rounded-card-lg bg-surface-bg p-6 shadow-soft">
        {/* 卡片内 header：右上角"新增申请"按钮（Step 4.4 已接入 application-new Drawer） */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-section-title text-text-primary">流程概览</h2>
            <p className="mt-1 text-caption text-text-tertiary">
              共 {rows.length} 家公司 · 按投递活跃度排序
            </p>
          </div>
          <NewApplicationButton />
        </header>

        {/* 公司行列表 · 公司间距 20px（space-y-5） */}
        <div className="divide-y divide-border-light">
          {rows.map((row) => {
            const apps: SerializedAppForRow[] = row.applications.map((a) => ({
              id: a.id,
              companyName: a.companyName,
              departmentName: a.departmentName,
              roleName: a.roleName,
              currentStatus: a.currentStatus,
              isEmpty: a.isEmpty,
              stages: a.stages.map((s) => ({
                id: s.id,
                type: s.type,
                status: s.status,
              })),
            }));
            return (
              <CompanyRow
                key={row.companyName}
                companyName={row.companyName}
                applications={apps}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
