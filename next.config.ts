import type { NextConfig } from "next";

/**
 * Next.js 配置
 *
 * serverExternalPackages（Next 15）：
 *   Phase 5.1 加入 `pdf-parse` + `pdfjs-dist` —— pdf-parse v2 的底层 pdfjs-dist 在 Next 的
 *   server bundler 下会报 "Object.defineProperty called on non-object"，因为 bundler 处理
 *   worker 入口时破坏了其内部 prototype 初始化顺序。把它们标记为"外部包"后，Node 直接
 *   require()，问题消失。
 */
const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
