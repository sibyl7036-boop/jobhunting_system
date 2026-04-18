/**
 * lib/serialize.ts
 *
 * JSON 字符串数组字段在 DB ↔ 应用层 之间的转换（见 architecture.md 关键契约点 11）
 *
 * - Application.jdKeywords / expectedSkills / interviewQuestions 在 DB 是 String?
 * - AIRun.outputJson 在 DB 是 String?
 * - 应用层想要原生数组 / 对象，用本文件工具
 */

/** DB String → string[] | null */
export function parseStringArray(raw: string | null | undefined): string[] | null {
  if (raw == null) return null;
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : null;
  } catch {
    return null;
  }
}

/** string[] | null | undefined → DB String | null */
export function stringifyStringArray(
  arr: string[] | null | undefined
): string | null {
  if (arr == null) return null;
  if (!Array.isArray(arr)) return null;
  return JSON.stringify(arr);
}

/** DB String → record 对象 */
export function parseJsonRecord(
  raw: string | null | undefined
): Record<string, unknown> | null {
  if (raw == null) return null;
  try {
    const v = JSON.parse(raw);
    return v && typeof v === "object" && !Array.isArray(v)
      ? (v as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/** record → DB String */
export function stringifyJsonRecord(
  obj: Record<string, unknown> | null | undefined
): string | null {
  if (obj == null) return null;
  return JSON.stringify(obj);
}

/**
 * Application 实体 DB → 应用层（把三个 JSON 字符串字段解析成数组）
 */
export interface ApplicationDbRow {
  id: string;
  companyName: string;
  departmentName: string;
  roleName: string;
  jdText: string | null;
  jdSummary: string | null;
  jdKeywords: string | null;
  expectedSkills: string | null;
  interviewQuestions: string | null;
  linkedResumeId: string | null;
  currentStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export function serializeApplication<T extends ApplicationDbRow>(row: T) {
  return {
    ...row,
    jdKeywords: parseStringArray(row.jdKeywords),
    expectedSkills: parseStringArray(row.expectedSkills),
    interviewQuestions: parseStringArray(row.interviewQuestions),
  };
}
