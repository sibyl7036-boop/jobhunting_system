import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

/**
 * Tailwind Theme · Macaron Minimal
 * 设计原则：
 *  - 低饱和奶油色系（cream / peach / butter / sky / blush / sage）
 *  - 细描边 + 轻投影（没有重描边、没有浓阴影）
 *  - 大圆角 20-24px，pill 999px
 *  - 动效克制（0.2-0.5s，缓入缓出）
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
        // ── Page backgrounds ──
        "app-bg": "#FDF6EF",
        "surface-bg": "#FFFFFF",

        // ── Cream / Peach 奶油桃 ──
        cream: {
          50: "#FDF6EF",
          100: "#FBEBDE",
          200: "#F5D9C0",
          300: "#EABF9B",
          400: "#E0A678",
          500: "#D58B58",
        },

        // ── Blush / Rose 淡玫瑰 ──
        blush: {
          50: "#FDF2F2",
          100: "#FAE6EA",
          200: "#F3CED6",
          300: "#E9B1BF",
          400: "#DC8C9E",
          500: "#C86D85",
        },

        // ── Butter / Honey 奶油黄 ──
        butter: {
          50: "#FDFBEE",
          100: "#FBF4D4",
          200: "#F6E7A4",
          300: "#EDD26E",
          400: "#E0BB45",
        },

        // ── Sky / Mist 雾蓝 ──
        sky: {
          50: "#F3F7FA",
          100: "#E6EEF7",
          200: "#CFDFEC",
          300: "#B1C8DE",
          400: "#8FAECB",
        },

        // ── Sage / Matcha 抹茶绿 ──
        sage: {
          50: "#F3F7F1",
          100: "#E8EFE3",
          200: "#CFDCC7",
          300: "#B0C3A3",
          400: "#8FA783",
        },

        // ── Lilac 淡紫（低饱和版） ──
        lilac: {
          50: "#F7F4FB",
          100: "#EDE7F5",
          200: "#D9CEE8",
          300: "#BEAED3",
          400: "#9F8BBD",
        },

        // ── 兼容旧字段（保留但低饱和化） ──
        primary: "#E9B1BF",
        "primary-hover": "#DC8C9E",
        "primary-strong": "#C86D85",
        "primary-deep": "#B05871",

        "secondary-pink": "#FAE6EA",
        "secondary-yellow": "#FBF4D4",
        "secondary-lilac": "#EDE7F5",
        "secondary-peach": "#FBEBDE",
        "secondary-mint": "#E8EFE3",
        "secondary-sky": "#E6EEF7",
        "secondary-lavender": "#F7F4FB",

        // ── Text ──
        "text-primary": "#5B4A4A",
        "text-secondary": "#8A7972",
        "text-tertiary": "#B4A79E",
        "text-on-primary": "#FFFFFF",

        // ── Borders ──
        "border-light": "#F1E8E0",
        "border-strong": "#E8D7C8",

        // ── Status (muted 版) ──
        success: "#8FA783",
        warning: "#E0BB45",
        danger: "#DC8C9E",
        info: "#8FAECB",
        neutral: "#D9CEE8",
      },

      boxShadow: {
        soft: "0 1px 2px rgba(199,165,149,0.04), 0 8px 24px rgba(199,165,149,0.06)",
        hover:
          "0 2px 6px rgba(199,165,149,0.06), 0 14px 32px rgba(199,165,149,0.1)",
        pill: "0 1px 2px rgba(199,165,149,0.05), 0 2px 6px rgba(199,165,149,0.08)",
      },

      borderRadius: {
        "card-lg": "24px",
        "card-md": "20px",
        "card-sm": "16px",
        "btn-sm": "12px",
        "btn-lg": "16px",
        pill: "999px",
      },

      fontFamily: {
        sans: [
          "PingFang SC",
          "Microsoft YaHei",
          "Noto Sans SC",
          "system-ui",
          "-apple-system",
          "Helvetica Neue",
          "sans-serif",
        ],
      },

      fontSize: {
        "page-title": ["38px", { lineHeight: "1.2", fontWeight: "700", letterSpacing: "-0.01em" }],
        "section-title": ["20px", { lineHeight: "1.4", fontWeight: "600" }],
        "card-title": ["15px", { lineHeight: "1.5", fontWeight: "600" }],
        body: ["14px", { lineHeight: "1.6", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "1.5", fontWeight: "500" }],
      },

      backgroundImage: {
        "gradient-cream":
          "linear-gradient(110deg, #FAE6EA 0%, #FCEFE2 30%, #FDF6DB 60%, #E6EEF7 100%)",
        "gradient-peach":
          "linear-gradient(135deg, #FBEBDE 0%, #FBF4D4 100%)",
        "gradient-blush":
          "linear-gradient(135deg, #FAE6EA 0%, #FBEBDE 100%)",
        "gradient-sky":
          "linear-gradient(135deg, #E6EEF7 0%, #F3F7FA 100%)",
        "gradient-sage":
          "linear-gradient(135deg, #E8EFE3 0%, #F3F7F1 100%)",
      },

      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "soft-drift": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },

      animation: {
        "fade-in-up": "fade-in-up 0.55s cubic-bezier(0.22,0.61,0.36,1)",
        "fade-in": "fade-in 0.6s ease-out",
        "soft-drift": "soft-drift 4s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
