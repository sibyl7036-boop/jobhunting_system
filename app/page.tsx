import { redirect } from "next/navigation";

/**
 * 根路由 → 重定向到 /dashboard（按 PRD 2.1）
 */
export default function Home() {
  redirect("/dashboard");
}
