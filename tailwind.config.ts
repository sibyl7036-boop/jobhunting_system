import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

/**
 * Tailwind 3 主题配置（严格按 UI.md 第 4 ~ 5 章原值）
 *
 * 色值 / 字号 / 间距 / 圆角 / 行高的真相源：/Users/sibyl/Desktop/system/UI.md
 * 本文件不做任何美学发挥，只负责把 UI.md 的原值翻译成 Tailwind 可识别的 token。
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── UI.md 4.1 页面背景色组 ──
        "app-bg": "#FFF7FB",
        "app-bg-secondary": "#FFFDF7",
        "surface-bg": "#FFFFFF",
        "soft-panel": "#FFF1F7",
        "warm-panel": "#FFF8E8",
        "cool-panel": "#F8F5FF",

        // ── UI.md 4.2 主色组 ──
        primary: "#F3AFCB",
        "primary-hover": "#EA9CBE",
        "primary-strong": "#DD85AE",

        // ── UI.md 4.3 辅助色组 ──
        "secondary-pink": "#FFD8E8",
        "secondary-yellow": "#FFF0B8",
        "secondary-lilac": "#E9D8FF",
        "secondary-peach": "#FFE2D6",
        "secondary-mint": "#DDF5E8",

        // ── UI.md 4.4 文本色组 ──
        "text-primary": "#47384A",
        "text-secondary": "#6F6172",
        "text-tertiary": "#9B8F9D",
        "text-on-primary": "#FFFFFF",

        // ── UI.md 4.5 边框色 ──
        "border-light": "#F3E4EC",
        "border-strong": "#E8D4DE",

        // ── UI.md 4.6 状态色 ──
        success: "#8ECFAF",
        warning: "#F3C96B",
        danger: "#E58CA4",
        info: "#A8BDF3",
        neutral: "#DDD6E3",
      },
      boxShadow: {
        // ── UI.md 4.5 阴影 ──
        soft: "0 8px 24px rgba(214, 164, 187, 0.10)",
        hover: "0 12px 30px rgba(214, 164, 187, 0.16)",
      },
      borderRadius: {
        // ── UI.md 5.4 圆角规范 ──
        "card-lg": "24px", // 大卡片
        "card-md": "20px", // 中小卡片
        "btn-sm": "14px", // 按钮偏小
        "btn-lg": "18px", // 按钮偏大
        pill: "999px", // 胶囊
      },
      fontFamily: {
        // ── UI.md 5.1 字体 ──
        sans: [
          "PingFang SC",
          "Microsoft YaHei",
          "Noto Sans SC",
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        // ── UI.md 5.2 字号层级 ──
        "page-title": ["28px", { lineHeight: "1.4", fontWeight: "700" }],
        "section-title": ["18px", { lineHeight: "1.5", fontWeight: "700" }],
        "card-title": ["16px", { lineHeight: "1.5", fontWeight: "600" }],
        body: ["14px", { lineHeight: "1.5", fontWeight: "500" }],
        caption: ["12px", { lineHeight: "1.5", fontWeight: "500" }],
      },
      keyframes: {
        // ── UI.md 8.4 小猫呼吸 ──
        "cat-breathe": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.03)" },
        },
        // ── UI.md 13.4 AI 处理中轻微左右晃动 ──
        "cat-wobble": {
          "0%, 100%": { transform: "translateX(0) rotate(0deg)" },
          "25%": { transform: "translateX(-1.5px) rotate(-2deg)" },
          "75%": { transform: "translateX(1.5px) rotate(2deg)" },
        },
      },
      animation: {
        "cat-breathe": "cat-breathe 2.4s ease-in-out infinite",
        "cat-wobble": "cat-wobble 0.6s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
