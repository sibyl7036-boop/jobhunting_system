# 求职流程管理看板 · Job Hunt Flow Board

一个面向求职季大学生的 **求职流程管理看板** 系统。浅色马卡龙粉风格，单人本地使用，用 **Vibe Coding** 方式一人闭环交付。

**技术栈**：Next.js 15 (App Router) · TypeScript · SQLite + Prisma · shadcn/ui + Tailwind · 火山方舟豆包 API（实际底座 DeepSeek 3.2）

---

## 30 秒了解

- 3 个页面：
  - `/dashboard` — 时间维度流程表、明日 AI 提醒、今日大厂动向、我的简历、AI Copilot
  - `/calendar` — 月视图日历
  - `/companies` — 大厂流程页（阿里 / 腾讯 / 字节 / 美团 / 百度 / 京东 / 拼多多 / 小红书 / 快手 / 滴滴）
- 1 个全局右侧 Drawer —— 详情查看 + 编辑 + AI 辅助 + 保存，三页面共用
- 5 个 AI 能力：解析面试邮件 / 解析 JD / 生成面试题 / 面试复盘 / 今日大厂动向
- 所有 AI 结果先进入"**草稿态**"，允许用户编辑确认后再落库

---

## 三步跑起来

```bash
# 1. 装依赖（需要 Node ≥ 20 + pnpm）
pnpm install

# 2. 初始化数据库（SQLite，本地文件）
#    - 建表
pnpm exec prisma migrate deploy
#    - 预置 10 家大厂占位
pnpm exec prisma db seed

# 3. 启动开发服务器
pnpm dev
# 打开 http://localhost:3000 → 自动重定向到 /dashboard
```

---

## 环境变量

复制一份 `.env.example`（如无则手建 `.env.local`），填入：

```env
# Prisma 本地 SQLite
DATABASE_URL="file:./dev.db"

# 火山方舟（豆包）API，登录控制台获取
DOUBAO_API_KEY=ark-xxxx
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
DOUBAO_MODEL=ep-xxxxxxxxxxxxxxx
```

`.env.local` 已在 `.gitignore` 里，**API Key 不会进 git**。

另需一份 Prisma CLI 专用的 `.env`（只放 `DATABASE_URL` 一项）——因为 Prisma CLI 不读 `.env.local`。

---

## 常用命令

```bash
pnpm dev                        # 启动 Next.js dev server（默认 3000）
pnpm build && pnpm start        # 生产构建 + 启动
pnpm lint                       # ESLint
pnpm typecheck                  # TypeScript 类型检查

pnpm exec prisma studio         # 可视化查看 / 编辑数据
pnpm exec prisma migrate dev    # 改完 schema.prisma 后执行迁移

# 端到端烟测（需先启动 dev server）
pnpm tsx scripts/smoke-api.ts       # REST API 层 14 断言
pnpm tsx scripts/smoke-closures.ts  # PRD 6 闭环 E2E（含真实 AI 调用）
```

---

## 目录速查

```
app/                      # Next.js App Router（页面 + API route）
  dashboard/  calendar/  companies/
  api/
    resumes/  applications/  stages/
    dashboard/events/  calendar/events/  companies/progress/
    ai/
      parse-email/  parse-jd/  generate-questions/  review/
      daily-intel/  tomorrow-tip/refresh/
components/
  ui/                     # shadcn/ui 生成（Button / Sheet / Dialog / Skeleton 等）
  layout/                 # Sidebar / Header
  dashboard/              # 首页 5 个主模块
  calendar/  companies/   # 各自页面组件
  drawer/                 # 全局 Drawer 容器 + 三种内容（stage / stage-new / application-new）
  resume/                 # 简历上传 / 改名 / 预览 Dialog
  common/                 # EmptyState / ErrorState / ConfirmDeleteDialog
  CatIcon.tsx             # 小猫 SVG（呼吸 / 晃动 / hover 动效）
lib/
  db.ts                   # Prisma 单例
  llmClient.ts            # 豆包 API 唯一出口（/chat/completions + response_format）
  prompts.ts              # PRD 9.1~9.5 原文 system prompts
  queries/                # Server Component 直调 Prisma 的 SSR 读方法
  schemas/                # zod 校验 + z.infer 类型
  fetcher.ts              # 客户端 fetchJson 封装
  drawerUrl.ts            # URL 参数驱动的 Drawer 开关工具
  serialize.ts  dates.ts  fakeIntelSource.ts  api.ts  utils.ts
prisma/
  schema.prisma           # 6 个 model（Resume / Application / Stage / AIRun / IntelSummary / TomorrowTipCache）
  seed.ts                 # 10 家大厂占位（幂等）
  migrations/
  dev.db                  # SQLite（gitignore）
scripts/
  smoke-api.ts            # REST API 烟测
  smoke-closures.ts       # PRD 6 闭环 E2E
  fixtures/closure-tiny.pdf
uploads/                  # 用户上传的 PDF（gitignore）
```

---

## 文档

| 文件 | 作用 |
|---|---|
| [`job_hunt_flow_board_prd.md`](./job_hunt_flow_board_prd.md) | 产品真相（数据模型、API 契约、AI 提示词原文、6 个验收闭环） |
| [`UI.md`](./UI.md) | 视觉真相（浅色马卡龙粉色系、布局、动效） |
| [`tech_stack.md`](./tech_stack.md) | 技术栈 + 目录 + 禁用方案清单 |
| [`architecture.md`](./architecture.md) | 文件地图 + 关键契约点（22 条） |
| [`implementation_plan.md`](./implementation_plan.md) | 7 Phase / 39 Step 指令手册 |
| [`progress.md`](./progress.md) | 逐步勾选清单 |
| [`CODEBUDDY.md`](./CODEBUDDY.md) | AI Agent 入口（含强制阅读门禁） |

---

## 许可与声明

- 本仓库为个人求职流程管理工具，仅本地使用
- 所有豆包 API Key 仅存在于 `.env.local`，永远不进 git
- AI 输出均需用户确认后才会落库，符合 PRD 3.2 的草稿态硬性规则
