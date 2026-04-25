/**
 * /companies 大厂流程页 · 极简奶油马卡龙风
 */

import { redirect } from "next/navigation";
import { getCompaniesProgress } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  CompanyRow,
  type SerializedAppForRow,
} from "@/components/companies/CompanyRow";
import { NewApplicationButton } from "@/components/companies/NewApplicationButton";
import { CustomCompanyManager } from "@/components/companies/CustomCompanyManager";
import { Building2, Briefcase, CheckCircle2, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/companies");

  const customRecords = await prisma.customCompany.findMany({
    where: { userId: user.id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, createdAt: true },
  });
  const customNames = customRecords.map((c) => c.name);

  const rows = await getCompaniesProgress(user.id, customNames);

  const totalCompanies = rows.length;
  const investedCompanies = rows.filter((r) =>
    r.applications.some((a) => !a.isEmpty)
  ).length;
  const totalApps = rows.reduce(
    (sum, r) => sum + r.applications.filter((a) => !a.isEmpty).length,
    0
  );
  const passedApps = rows.reduce(
    (sum, r) =>
      sum +
      r.applications.filter(
        (a) =>
          !a.isEmpty &&
          a.stages.some((s) => s.type === "Offer" && s.status === "已通过")
      ).length,
    0
  );

  return (
    <div className="pb-8">
      {/* 顶部统计 */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatPill
          icon={<Building2 size={16} />}
          label="Companies"
          hint="已收录"
          value={totalCompanies}
          suffix="家"
          iconBg="bg-[#FAE6EA]"
          iconColor="text-[#c86d85]"
          dot="bg-[#E9B1BF]"
          delay={0}
        />
        <StatPill
          icon={<Briefcase size={16} />}
          label="Invested"
          hint="已投递"
          value={investedCompanies}
          suffix="家"
          iconBg="bg-[#EDE7F5]"
          iconColor="text-[#8a6fa5]"
          dot="bg-[#BEAED3]"
          delay={0.06}
        />
        <StatPill
          icon={<Sparkles size={16} />}
          label="Roles"
          hint="岗位总数"
          value={totalApps}
          suffix="个"
          iconBg="bg-[#FBF4D4]"
          iconColor="text-[#a08a3a]"
          dot="bg-[#EDD26E]"
          delay={0.12}
        />
        <StatPill
          icon={<CheckCircle2 size={16} />}
          label="Offers"
          hint="已拿 Offer"
          value={passedApps}
          suffix="个"
          iconBg="bg-[#E8EFE3]"
          iconColor="text-[#70876a]"
          dot="bg-[#B0C3A3]"
          delay={0.18}
        />
      </div>

      <section className="surface p-6">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FBEBDE]">
              <Building2
                size={16}
                className="text-[#b87a56]"
                strokeWidth={2}
              />
            </div>
            <div>
              <h2 className="text-section-title text-[#5b4a4a]">
                Flow Overview
              </h2>
              <p className="text-[11px] text-[#b4a79e]">
                共 {rows.length} 家公司 · 按投递活跃度排序
              </p>
            </div>
          </div>
            <NewApplicationButton />
          </header>

          <CustomCompanyManager initialCustom={customRecords.map((c) => ({
            id: c.id,
            name: c.name,
            createdAt: c.createdAt.toISOString(),
          }))} />

          <div className="divide-y divide-[#f4ece4]">
          {rows.map((row, idx) => {
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
                index={idx}
                isCustom={row.isCustom}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatPill({
  icon,
  label,
  hint,
  value,
  suffix,
  iconBg,
  iconColor,
  dot,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  value: number;
  suffix: string;
  iconBg: string;
  iconColor: string;
  dot: string;
  delay: number;
}) {
  return (
    <div
      className="group relative rounded-2xl border border-[#f1e8e0] bg-white/90 backdrop-blur p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#e8d7c8] hover:shadow-soft animate-fade-in-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#b4a79e]">
              {label}
            </p>
          </div>
          <p className="mt-2 flex items-baseline gap-1">
            <span className="text-[28px] font-bold leading-none text-[#5b4a4a] tabular-nums">
              {value}
            </span>
            <span className="text-[11px] text-[#b4a79e]">{suffix}</span>
          </p>
          <p className="mt-1 text-[11px] text-[#b4a79e]">{hint}</p>
        </div>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
