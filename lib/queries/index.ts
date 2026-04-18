/**
 * lib/queries · 服务端数据访问 barrel
 *
 * 约定（architecture.md 关键契约点 14）：
 *   - Server Component 首屏数据：import from "@/lib/queries"，直调 Prisma
 *   - Client Component 交互：import { fetchJson } from "@/lib/fetcher"，走 /api/*
 */

export { getDashboardEvents, type DashboardEvent } from "./dashboard";
export { getCalendarEvents, type CalendarEvent } from "./calendar";
export {
  getCompaniesProgress,
  COMPANY_ORDER,
  type CompanyName,
  type CompanyProgressRow,
  type CompanyApplication,
  type CompanyStage,
} from "./companies";
export { getResumes, type ResumeRow } from "./resumes";
