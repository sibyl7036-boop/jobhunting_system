"use client";

/**
 * 登录 / 注册 表单（马卡龙风适配）
 * - Tab 切换：登录 / 注册
 * - 注册多一个"昵称"字段
 * - 密码至少 8 位 + 字母 + 数字
 * - 登录/注册成功后：读取 URL 的 ?redirect= 决定去哪
 */

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User as UserIcon, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Mode = "login" | "register";

interface FormState {
  email: string;
  password: string;
  nickname: string;
}

export function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const redirect = sp.get("redirect") || "/dashboard";

  const [mode, setMode] = React.useState<Mode>("login");
  const [busy, setBusy] = React.useState(false);
  const [showPw, setShowPw] = React.useState(false);
  const [form, setForm] = React.useState<FormState>({
    email: "",
    password: "",
    nickname: "",
  });
  const [errors, setErrors] = React.useState<Partial<FormState>>({});

  const update = <K extends keyof FormState>(k: K, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  // 本地校验
  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "邮箱格式不正确";
    if (form.password.length < 8) e.password = "至少 8 位";
    else if (mode === "register") {
      if (!/[a-zA-Z]/.test(form.password) || !/\d/.test(form.password))
        e.password = "需包含字母和数字";
    }
    if (mode === "register") {
      const n = form.nickname.trim();
      if (!n) e.nickname = "请填写昵称";
      else if (n.length > 20) e.nickname = "不超过 20 字";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (busy) return;
    if (!validate()) return;
    setBusy(true);
    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email: form.email, password: form.password }
          : {
              email: form.email,
              password: form.password,
              nickname: form.nickname.trim(),
            };
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          (data?.error?.message as string) ||
          (mode === "login" ? "登录失败" : "注册失败");
        toast.error(msg);
        return;
      }
      toast.success(mode === "login" ? "欢迎回来 🌸" : "欢迎加入 🌸");
      // 硬跳转确保 Cookie 生效 & 服务端重新渲染
      window.location.href = redirect;
    } catch {
      toast.error("网络错误，请稍后再试");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] rounded-[24px] border border-[#f1e8e0] bg-white/85 backdrop-blur-xl p-6 shadow-[0_12px_36px_rgba(199,165,149,0.12)] md:p-8">
      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1 rounded-full bg-[#fdfbf8] p-1">
        {(["login", "register"] as Mode[]).map((m) => {
          const on = mode === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setErrors({});
              }}
              className={cn(
                "py-2 text-[13px] font-semibold transition-all rounded-full",
                "active:scale-[0.98]",
                on
                  ? "bg-white text-[#5b4a4a] shadow-[0_1px_2px_rgba(199,165,149,0.08),0_4px_10px_rgba(199,165,149,0.08)]"
                  : "text-[#b4a79e] hover:text-[#8a7972]"
              )}
            >
              {m === "login" ? "登录" : "注册"}
            </button>
          );
        })}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {/* 注册：昵称 */}
        {mode === "register" && (
          <Field
            label="昵称"
            required
            icon={<UserIcon size={14} />}
            error={errors.nickname}
            animateKey="nickname"
          >
            <input
              type="text"
              value={form.nickname}
              onChange={(e) => update("nickname", e.target.value)}
              maxLength={20}
              placeholder="首页将显示这个昵称"
              disabled={busy}
              className={inputCls(!!errors.nickname)}
            />
          </Field>
        )}

        {/* 邮箱 */}
        <Field label="邮箱" required icon={<Mail size={14} />} error={errors.email}>
          <input
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="name@example.com"
            disabled={busy}
            className={inputCls(!!errors.email)}
          />
        </Field>

        {/* 密码 */}
        <Field label="密码" required icon={<Lock size={14} />} error={errors.password}>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder={
                mode === "register" ? "至少 8 位，包含字母和数字" : "请输入密码"
              }
              disabled={busy}
              className={cn(inputCls(!!errors.password), "pr-10")}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b4a79e] hover:text-[#8a7972] transition-colors"
              aria-label={showPw ? "隐藏密码" : "显示密码"}
              tabIndex={-1}
            >
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </Field>

        {/* 提交 */}
        <button
          type="submit"
          disabled={busy}
          className={cn(
            "group relative mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl",
            "bg-gradient-to-br from-[#a8bf9e] via-[#9fb89a] to-[#7e9879]",
            "text-[14px] font-bold text-white tracking-wide",
            "shadow-[0_4px_14px_rgba(133,159,122,0.25)]",
            "transition-all duration-300",
            "hover:shadow-[0_6px_18px_rgba(133,159,122,0.35)] hover:brightness-[1.04]",
            "active:scale-[0.98]",
            "disabled:opacity-60 disabled:pointer-events-none"
          )}
        >
          {busy && <Loader2 size={14} className="animate-spin" />}
          {busy
            ? mode === "login"
              ? "登录中…"
              : "注册中…"
            : mode === "login"
              ? "登录看板"
              : "注册并登录"}
        </button>
      </form>

      {/* 协议 / 切换提示 */}
      <p className="mt-5 text-center text-[11px] text-[#b4a79e]">
        {mode === "login" ? (
          <>
            还没有账号？{" "}
            <button
              type="button"
              onClick={() => setMode("register")}
              className="font-semibold text-[#8a6d5f] hover:text-[#6b574f] transition-colors"
            >
              立即注册
            </button>
          </>
        ) : (
          <>
            已经注册过？{" "}
            <button
              type="button"
              onClick={() => setMode("login")}
              className="font-semibold text-[#8a6d5f] hover:text-[#6b574f] transition-colors"
            >
              去登录
            </button>
          </>
        )}
      </p>
    </div>
  );
}

function Field({
  label,
  required,
  icon,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
  animateKey?: string;
}) {
  return (
    <div className="animate-fade-in-up">
      <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8a7972]">
        <span className="text-[#b4a79e]">{icon}</span>
        {label}
        {required && <span className="text-[#c86d85]">*</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {error && (
        <p className="mt-1 text-[11px] text-[#c86d85] animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
}

function inputCls(hasError: boolean): string {
  return cn(
    "h-11 w-full rounded-xl border bg-white/90 px-3.5 text-[14px] text-[#3d3230] placeholder:text-[#c9bab1]",
    "border-[#f1e8e0] transition-all",
    "focus:bg-white focus:outline-none focus:ring-2",
    hasError
      ? "border-[#e9b1bf] focus:border-[#c86d85] focus:ring-[#fae6ea]"
      : "focus:border-[#e9b99a] focus:ring-[#fbebde]"
  );
}
