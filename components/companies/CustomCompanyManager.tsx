"use client";

/**
 * components/companies/CustomCompanyManager.tsx
 *
 * 公司清单管理器（v3）
 *
 * 功能：
 *  1. 添加 / 删除"自定义公司"（走 /api/companies）
 *  2. 展示已隐藏的预置公司 chip，支持一键恢复（localStorage）
 *  3. 监听 jhb:requestDeleteCustomCompany 事件（由 CompanyRow 里的删除按钮发出），
 *     执行真正的自定义公司 API 删除
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  X,
  Building2,
  Loader2,
  RotateCcw,
  EyeOff,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { fetchJson } from "@/lib/fetcher";
import {
  HIDDEN_PRESET_STORAGE_KEY,
  readHiddenPresetCompanies,
  writeHiddenPresetCompanies,
  restoreAllPresets,
} from "@/components/companies/hiddenPresetStore";

interface CustomCompany {
  id: string;
  name: string;
  createdAt: string;
}

interface Props {
  initialCustom: CustomCompany[];
}

export function CustomCompanyManager({ initialCustom }: Props) {
  const router = useRouter();
  const [list, setList] = React.useState<CustomCompany[]>(initialCustom);
  const [adding, setAdding] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [hiddenPresets, setHiddenPresets] = React.useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // 初次挂载：读 localStorage
  React.useEffect(() => {
    setHiddenPresets(readHiddenPresetCompanies());
  }, []);

  // 监听隐藏列表变化（来自 CompanyRow）
  React.useEffect(() => {
    const onChange = (ev: Event) => {
      const detail = (ev as CustomEvent<string[]>).detail;
      setHiddenPresets(Array.isArray(detail) ? detail : readHiddenPresetCompanies());
      // 刷页拿新 rows
      router.refresh();
    };
    window.addEventListener(HIDDEN_PRESET_STORAGE_KEY, onChange);
    return () => window.removeEventListener(HIDDEN_PRESET_STORAGE_KEY, onChange);
  }, [router]);

  // 监听 CompanyRow 发出的 "删除自定义公司" 请求
  React.useEffect(() => {
    const onReq = async (ev: Event) => {
      const name = (ev as CustomEvent<{ name: string }>).detail?.name;
      if (!name) return;
      const target = list.find((c) => c.name === name);
      if (!target) return;
      try {
        await fetchJson(`/api/companies/${target.id}`, { method: "DELETE" });
        setList((prev) => prev.filter((x) => x.id !== target.id));
        toast.success(`已移除「${name}」`);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "删除失败");
      }
    };
    window.addEventListener("jhb:requestDeleteCustomCompany", onReq as EventListener);
    return () =>
      window.removeEventListener("jhb:requestDeleteCustomCompany", onReq as EventListener);
  }, [list, router]);

  React.useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const addCompany = async () => {
    const name = draft.trim();
    if (!name || saving) return;
    setSaving(true);
    try {
      const created = await fetchJson<CustomCompany>("/api/companies", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setList((prev) => [...prev, created]);
      setDraft("");
      setAdding(false);
      toast.success(`已添加「${name}」`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "添加失败");
    } finally {
      setSaving(false);
    }
  };

  const restorePreset = (name: string) => {
    const next = hiddenPresets.filter((x) => x !== name);
    writeHiddenPresetCompanies(next);
    setHiddenPresets(next);
    window.dispatchEvent(
      new CustomEvent(HIDDEN_PRESET_STORAGE_KEY, { detail: next })
    );
    toast.success(`已恢复「${name}」`);
    router.refresh();
  };

  const restoreAll = () => {
    restoreAllPresets();
    setHiddenPresets([]);
    toast.success("已恢复所有预置公司");
    router.refresh();
  };

  return (
    <div className="mb-5 rounded-2xl border border-[#f1e8e0] bg-white/70 p-4 backdrop-blur">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 size={13} className="text-[#b4a79e]" />
          <span className="text-[12px] font-semibold text-[#8a7972]">
            我的公司清单
          </span>
          <span className="text-[11px] text-[#b4a79e]">
            · 显示中 {10 - hiddenPresets.length} 家预置 + {list.length} 家自定义
            {hiddenPresets.length > 0 && (
              <>
                {" "}· 已隐藏 {hiddenPresets.length} 家
              </>
            )}
          </span>
        </div>
        {hiddenPresets.length > 0 && (
          <button
            type="button"
            onClick={restoreAll}
            className="inline-flex items-center gap-1 rounded-full bg-[#fdfbf8] px-2.5 py-1 text-[11px] font-medium text-[#8a7972] transition-all hover:bg-[#fbebde] hover:text-[#b87a56]"
            title="一键恢复所有被隐藏的预置公司"
          >
            <RotateCcw size={10} strokeWidth={2.5} />
            恢复预置
          </button>
        )}
      </div>

      {/* 已隐藏预置公司（hover 可恢复） */}
      {hiddenPresets.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#b4a79e]">
            <EyeOff size={10} />
            已隐藏
          </span>
          {hiddenPresets.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => restorePreset(name)}
              className={cn(
                "group/chip inline-flex items-center gap-1 rounded-full border border-dashed border-[#ead8c8] bg-white/60 py-0.5 pl-2 pr-1 text-[11px] text-[#b4a79e] transition-all",
                "hover:border-[#e9b99a] hover:bg-[#fdf2ea] hover:text-[#b87a56]"
              )}
              title={`点击恢复「${name}」`}
            >
              <span className="font-medium">{name}</span>
              <span
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-full",
                  "text-[#c7b5a8] group-hover/chip:text-[#b87a56]"
                )}
              >
                <RotateCcw size={9} strokeWidth={2.5} />
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {/* 已自定义的公司 chip */}
        {list.map((c) => (
          <div
            key={c.id}
            className={cn(
              "group inline-flex items-center gap-1.5 rounded-full border border-[#e8d7c8] bg-gradient-to-br from-[#fbebde] to-[#fdf7f0] py-1 pl-3 pr-1 text-[12px] text-[#8a6d5f] transition-all",
              "hover:border-[#d9bfa9]"
            )}
          >
            <span className="font-medium">{c.name}</span>
          </div>
        ))}

        {/* 添加按钮 */}
        {adding ? (
          <div className="inline-flex items-center gap-1 rounded-full border border-[#e9b99a] bg-white px-3 py-1 shadow-sm">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addCompany();
                if (e.key === "Escape") {
                  setAdding(false);
                  setDraft("");
                }
              }}
              placeholder="公司名（≤20 字）"
              maxLength={20}
              className="w-[180px] bg-transparent text-[12px] text-[#5c463a] placeholder:text-[#c7b5a8] focus:outline-none"
            />
            <button
              type="button"
              onClick={addCompany}
              disabled={!draft.trim() || saving}
              className="flex h-6 items-center rounded-full bg-[#c86d85] px-2.5 text-[11px] font-medium text-white hover:bg-[#b85976] disabled:opacity-50"
            >
              {saving ? <Loader2 size={11} className="animate-spin" /> : "添加"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setDraft("");
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full text-[#b4a79e] hover:bg-black/5"
              aria-label="取消"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#e8d7c8] px-3 py-1 text-[12px] text-[#b4a79e] transition hover:border-[#e9b99a] hover:bg-[#fbebde] hover:text-[#8a6d5f]"
          >
            <Plus size={12} />
            添加公司
          </button>
        )}
      </div>

      {list.length === 0 && hiddenPresets.length === 0 && !adding && (
        <p className="mt-2 text-[11px] italic text-[#b4a79e]">
          鼠标悬浮任意公司可将其从清单中隐藏；也可点「添加公司」追踪其他公司（如外企 / 独角兽 / 国企等）
        </p>
      )}
    </div>
  );
}
