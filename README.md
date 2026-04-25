# 求职流程管理看板 · Job Hunt Flow Board

面向求职季学生的全流程求职管理系统，支持**多用户注册登录、数据隔离**，集成 AI 辅助（面试邮件解析 / JD 解析 / 面试题生成 / 面试复盘 / 今日大厂动向）。

> 🌐 **在线演示**：https://system-pi-three.vercel.app
> 演示环境为免费 Vercel + Neon Postgres，首次访问冷启动约 10~15 秒。

---

## ✨ v2.0 功能亮点

| 模块 | 说明 |
|---|---|
| 🔐 多用户系统 | 邮箱注册/登录，Cookie Session 鉴权，数据按用户严格隔离 |
| 📊 首页 v2 布局 | AI 聊天前置、流程表格（今日/明日 Tab）、周便签 Todo、迷你简历 |
| 🗂️ Stage 子 Tab | 每个面试节点支持面试题 / 复盘记录 / 随手记三个子页签 |
| 🏢 Companies 自管理 | 预置 10 家大厂 + 自定义添加 + 隐藏不需要的预置项 |
| 🤖 AI 聊天面板 | 通用对话流，可挂载能力组件（邮件解析 / JD 解析 / 出题 / 复盘） |
| 👋 新手引导 | 首访自动弹出分步向导，Sidebar 随时可重新唤起 |
| 📄 简历管理 | 上传 PDF、文本提取、与岗位关联、在线预览 |
| 📅 日历视图 | 月视图展示所有面试/测评节点 |

所有 AI 生成结果均先进入**草稿态**，用户编辑确认后再落库。

---

## 🚀 快速启动

```bash
# 1. 安装依赖（需要 Node ≥ 20 + pnpm）
pnpm install

# 2. 配置环境变量（复制 .env.example 或新建 .env.local）
#    详见下方「环境变量」章节

# 3. 初始化数据库
pnpm exec prisma migrate deploy   # 执行迁移
pnpm exec prisma db seed         # 预置 10 家大厂

# 4. 启动开发服务器
pnpm dev
# 打开 http://localhost:3000 → 自动跳转 /login 注册登录
```

生产构建：

```bash
pnpm build && pnpm start
```

---

## 🔑 环境变量

新建 `.env.local`（Next.js runtime，不进 git）和 `.env`（Prisma CLI 专用）：

```env
# .env.local
DATABASE_URL="file:./prisma/dev.db"      # 本地 SQLite；生产环境填 Neon Postgres pooled URL
AUTH_SECRET="your-random-secret"          # Cookie Session 签名密钥（生产环境必须设置）

# 火山方舟（豆包）API
DOUBAO_API_KEY=ark-xxxx
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
DOUBAO_MODEL=ep-xxxxxxxxxxxxxxx
```

> **注意**：`AUTH_SECRET` 在生产部署（Vercel）中必须通过环境变量注入，否则 JWT 可被伪造。

---

## 🛠️ 技术栈

| 层级 | 选型 |
|---|---|
| 框架 | Next.js **15.5** (App Router) + React **18.3** + TypeScript **5.9** |
| 样式 | Tailwind CSS **3.4** + shadcn/ui (new-york style) |
| 数据库 | SQLite (本地开发) / **Neon Postgres** (生产) + Prisma **5.22** |
| 鉴权 | bcryptjs + jose (JWT HS256) + Cookie Session |
| AI | 火山方舟豆包 API（底座 DeepSeek 3.2）|
| 部署 | **Vercel** (Hobby) + Neon Postgres (Singapore) |
| 其他 | date-fns · react-hook-form + zod · framer-motion · lucide-react |

---

## 📁 项目结构

```
app/
  login/page.tsx            # 登录/注册页
  dashboard/page.tsx        # 首页 v2（AI 聊天 + 流程表 + 便签 + 迷你简历）
  calendar/page.tsx         # 日历月视图
  companies/page.tsx        # 公司流程页（预置 + 自定义）
  api/
    auth/{login,register,logout,me}  # 鉴权 API
    ai/{chat,parse-email,parse-jd,generate-questions,review,daily-intel}
    resumes/  applications/  stages/   # 业务 CRUD
    weekly-todos/                      # 周便签 Todo
    companies/                         # 自定义公司管理
components/
  auth/LoginForm.tsx        # 登录/注册表单
  layout/Sidebar.tsx       # 侧边栏（窄边 + 花朵 Logo）
  layout/Header.tsx         # 顶部栏（用户菜单）
  dashboard/                # 首页组件（AIChatPanel / EventTable / StickyTodo 等）
  drawer/                   # 全局右侧 Drawer（Stage 详情 + 新建）
  drawer/tabs/              # Stage 子 Tab（面试题 / 复盘 / 随手记）
  companies/                # 公司页组件（含 CustomCompanyManager）
  onboarding/               # 新手引导 Dialog
  widgets/StickyTodoPanel.tsx  # 周便签（便签/书签双形态）
lib/
  auth.ts                   # 鉴权工具（bcrypt + jose + Cookie Session）
  db.ts                     # Prisma 单例
  llmClient.ts              # 豆包 API 唯一出口
  prompts.ts                # AI system prompts（PRD 原文）
  queries/                  # 服务端数据查询
middleware.ts               # Edge 运行时鉴权中间件
prisma/
  schema.prisma             # User / Resume / Application / Stage / CustomCompany / WeeklyTodo / AIRun / IntelSummary / TomorrowTipCache
  seed.ts                   # 10 家大厂预置种子
uploads/                    # PDF 上传目录（gitignore）
```

---

## 🧪 常用命令

```bash
pnpm dev                  # 启动开发服务器（localhost:3000）
pnpm build                # 生产构建
pnpm lint                 # ESLint 检查
pnpm typecheck            # TypeScript 类型检查

pnpm exec prisma studio   # 可视化数据库管理
pnpm exec prisma migrate dev   # 开发时创建新迁移

# E2E 烟测（需先启动 dev server）
pnpm tsx scripts/smoke-api.ts
```

---

## 📚 文档索引

| 文件 | 作用 |
|---|---|
| [`CHANGELOG.md`](./CHANGELOG.md) | 维护期改动日志（做了什么 / 为什么 / 怎么验证） |
| [`architecture.md`](./architecture.md) | 文件地图 + 关键架构契约点 |
| [`CODEBUDDY.md`](./CODEBUDDY.md) | AI Agent 入口（含强制阅读门禁） |
| [`job_hunt_flow_board_prd.md`](./job_hunt_flow_board_prd.md) | 产品需求文档（PRD） |
| [`UI.md`](./UI.md) | 视觉规范（马卡龙粉配色） |
| [`tech_stack.md`](./tech_stack.md) | 技术栈详解 + 禁用方案清单 |
| [`implementation_plan.md`](./implementation_plan.md) | v1.0 实施步骤（7 Phase / 39 Step） |

---

## 📝 版本记录

| 版本 | 日期 | 说明 |
|---|---|---|
| v2.0-maintenance-r1 | 2026-04-25 | 多用户鉴权 + 首页 v2 + Stage 子 Tab + Companies 自管理 + 新手引导 |
| v1.0 | 2026-04-19 | 初始交付（39 Step 全绿，公网 demo 上线） |

---

## ⚠️ 声明

- 本仓库为个人求职管理工具，**AI 输出均需用户确认后才会落库**
- `DOUBAO_API_KEY` / `AUTH_SECRET` 仅存在于 `.env.local`，**永远不进 git**
- 在线演示为免费托管，性能有限，仅供功能预览
