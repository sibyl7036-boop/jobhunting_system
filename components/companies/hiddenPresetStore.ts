"use client";

/**
 * components/companies/hiddenPresetStore.ts
 *
 * 预置公司（COMPANY_ORDER 里那 10 家）不能从数据库层删除 —— 它们只是
 * 前端的一个 UI 常量（种子脚本只造一个空的占位 Application）。
 *
 * 为了支持"用户隐藏预置公司"且不做 DB migration，我们把"隐藏名单"
 * 放在浏览器 localStorage（每个用户会话只看到自己的）。
 *
 * 存储结构：
 *   localStorage["jhb:hiddenPresetCompanies"] = JSON.stringify(string[])
 *
 * 组件之间通过自定义事件 "jhb:hiddenPresetCompanies" 广播同步。
 */

export const HIDDEN_PRESET_STORAGE_KEY = "jhb:hiddenPresetCompanies";

export function readHiddenPresetCompanies(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HIDDEN_PRESET_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function writeHiddenPresetCompanies(list: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const deduped = Array.from(new Set(list));
    window.localStorage.setItem(
      HIDDEN_PRESET_STORAGE_KEY,
      JSON.stringify(deduped)
    );
  } catch {
    /* ignore */
  }
}

export function restoreAllPresets(): void {
  writeHiddenPresetCompanies([]);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(HIDDEN_PRESET_STORAGE_KEY, { detail: [] })
    );
  }
}
