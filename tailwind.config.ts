import type { Config } from "tailwindcss";

/**
 * Tailwind 3 配置（Step 0.1 最小版）
 * Step 0.2 将在此处扩展 UI.md 第 4 章的全部马卡龙粉色值令牌。
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
