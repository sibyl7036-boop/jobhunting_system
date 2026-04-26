/**
 * lib/dates.ts · 日期工具（本地时区，Asia/Shanghai 实际表现 ≈ 本机时区）
 *
 * 对齐 docs/docs/architecture.md 契约点时间语义（Step 2.3 决策）：
 *   - dashboard range 是半开区间 [今天 00:00, 今天 + N 天 00:00)
 *   - calendar 是闭区间 [start 00:00:00.000, end 23:59:59.999]
 *   - YYYY-MM-DD 一律按本地时区解释
 */

/** 本地时区"今天 00:00:00.000"的 Date */
export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** 本地时区 "今天 + N 天 00:00:00.000" 的 Date */
export function startOfDayOffset(days: number): Date {
  const d = startOfToday();
  d.setDate(d.getDate() + days);
  return d;
}

/** "YYYY-MM-DD" → 本地时区当天 00:00:00.000 */
export function parseDateStartLocal(s: string): Date {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) throw new Error(`非法日期：${s}，需要 YYYY-MM-DD`);
  const [, y, mo, d] = m;
  return new Date(Number(y), Number(mo) - 1, Number(d), 0, 0, 0, 0);
}

/** "YYYY-MM-DD" → 本地时区当天 23:59:59.999 */
export function parseDateEndLocal(s: string): Date {
  const d = parseDateStartLocal(s);
  d.setHours(23, 59, 59, 999);
  return d;
}

/** Date → "YYYY-MM-DD"（本地时区） */
export function formatLocalDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 解析 dashboard 的 range 参数（`Nd` 格式，N 为 1~365 整数） */
export function parseRangeDays(raw: string | null): number {
  if (!raw) return 7; // 默认
  const m = raw.match(/^(\d+)d$/);
  if (!m) throw new Error(`非法 range：${raw}，必须是 Nd 格式（例如 7d）`);
  const n = Number(m[1]);
  if (!Number.isInteger(n) || n < 1 || n > 365)
    throw new Error(`非法 range：${raw}，N 必须是 1~365`);
  return n;
}
