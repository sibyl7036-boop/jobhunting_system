# architecture.md

> **本文件是项目文件地图（File Map）。**
>
> **作用**：让任何 AI Agent 进入仓库后，**30 秒内就知道每个文件/文件夹是干什么的**，不用去翻文档推理。
>
> **不做什么**：
> - 不记录进度（那是 `progress.md` 的事）
> - 不记录产品规格（那是 `job_hunt_flow_board_prd.md` / `UI.md` / `tech_stack.md` 的事）
> - 不记录实施指令（那是 `implementation_plan.md` 的事）
>
> **更新规则**：每当**新增、删除、或本质性重构**任何文件/文件夹时，必须同步更新本文件对应行。命名改动、目录迁移都要体现在这里。

---

## 🗺️ 目录树（当前真实状态）

> 当前仓库处于"**文档阶段**"，只有 Markdown 规格文档。Next.js 项目尚未初始化。
> 下方"计划中"的文件/目录在 `implementation_plan.md` 执行到相应 Phase 时才会出现，届时需把对应行从"计划中"移入"已有"。

```
/Users/sibyl/Desktop/system/
├── job_hunt_flow_board_prd.md       ← 已有 · 产品真相（PRD）
├── UI.md                            ← 已有 · 视觉真相（界面规范）
├── tech_stack.md                    ← 已有 · 落地真相（技术栈 + 目录 + 启动命令）
├── implementation_plan.md           ← 已有 · 步骤真相（7 Phase / 39 Step 指令手册）
├── progress.md                      ← 已有 · 进度真相（逐步勾选清单）
├── architecture.md                  ← 已有 · 文件地图（本文件）
├── CODEBUDDY.md                     ← 已有 · AI Agent 入口（首读）
└── .workbuddy/                      ← 已有 · 工作记忆（不进 git，见下方说明）

（以下 Phase 0 起陆续产生）
├── package.json                     ← 计划中 · pnpm 包清单与脚本（Phase 0.1 产生）
├── tsconfig.json                    ← 计划中 · TS 配置（Phase 0.1 产生）
├── next.config.*                    ← 计划中 · Next.js 配置（Phase 0.1 产生）
├── tailwind.config.*                ← 计划中 · Tailwind 主题（马卡龙粉色令牌）（Phase 0.2 产生）
├── postcss.config.*                 ← 计划中 · PostCSS 配置（Phase 0.1 产生）
├── components.json                  ← 计划中 · shadcn/ui 配置（Phase 0.3 产生）
├── .env / .env.local                ← 计划中 · 环境变量（不进 git）
├── .gitignore                       ← 计划中 · 忽略 node_modules / dev.db / uploads / .env.local 等
├── README.md                        ← 计划中 · 仓库门面，写"三条命令跑起来"（Phase 7.4 产生）
│
├── app/                             ← 计划中 · Next.js App Router 根目录
│   ├── layout.tsx                   ← 全局布局（左导航 + 顶 Header + 内容区 + Drawer 容器）
│   ├── page.tsx                     ← 根路由 → 重定向到 /dashboard
│   ├── globals.css                  ← Tailwind 指令 + CSS 变量基线
│   ├── dashboard/page.tsx           ← 首页（流程表格 + 明日提醒 + 大厂动向 + 简历 + AI Copilot）
│   ├── calendar/page.tsx            ← 日历页（月视图）
│   ├── companies/page.tsx           ← 大厂流程页（10 家公司纵向 + 流程节点横向）
│   └── api/
│       ├── resumes/
│       │   ├── route.ts             ← GET 列表
│       │   ├── upload/route.ts      ← POST 上传（multipart PDF）
│       │   └── [id]/
│       │       ├── route.ts         ← PATCH 改名 / DELETE
│       │       └── file/route.ts    ← GET 流式返回 PDF 文件
│       ├── applications/
│       │   ├── route.ts             ← POST 创建
│       │   └── [id]/route.ts        ← GET（含 stages）/ PATCH / DELETE
│       ├── stages/
│       │   ├── route.ts             ← POST 创建
│       │   └── [id]/route.ts        ← PATCH / DELETE
│       ├── dashboard/
│       │   └── events/route.ts      ← GET ?range=Nd 的流程事件
│       ├── calendar/
│       │   └── events/route.ts      ← GET ?start=&end= 的流程事件
│       ├── companies/
│       │   └── progress/route.ts    ← GET 10 家公司 × Application × Stage 全量
│       └── ai/
│           ├── parse-email/route.ts ← POST 解析面试邮件（走豆包 · 输出 JSON · 草稿态）
│           ├── parse-jd/route.ts    ← POST 解析 JD
│           ├── generate-questions/route.ts ← POST 生成面试题
│           ├── review/route.ts      ← POST 面试复盘
│           └── daily-intel/route.ts ← GET 今日大厂动向摘要（带日缓存）
│
├── components/
│   ├── ui/                          ← shadcn/ui 生成物（button / card / dialog / sheet / table / badge 等）
│   ├── layout/
│   │   ├── Sidebar.tsx              ← 左侧导航
│   │   └── Header.tsx               ← 顶部 Header（含小猫 SVG）
│   ├── dashboard/
│   │   ├── EventTable.tsx           ← 首页时间维度流程表格
│   │   ├── TomorrowReminder.tsx     ← 明日 AI 提醒卡片
│   │   ├── DailyIntel.tsx           ← 今日大厂动向卡片
│   │   ├── ResumeCard.tsx           ← 我的简历卡片（列表 + 上传）
│   │   └── AICopilot.tsx            ← AI Copilot 卡片（输入 + 4 快捷按钮）
│   ├── calendar/
│   │   └── MonthView.tsx            ← 日历月视图
│   ├── companies/
│   │   └── CompanyRow.tsx           ← 单家大厂的流程行
│   ├── drawer/
│   │   ├── DetailDrawer.tsx         ← 全局右侧 Drawer 容器（URL 参数驱动）
│   │   ├── StageDrawerContent.tsx   ← Stage 详情内容
│   │   └── NewStageDrawer.tsx       ← 新建事件内容
│   └── CatIcon.tsx                  ← UI.md 指定的小猫 SVG
│
├── lib/
│   ├── db.ts                        ← Prisma Client 单例（dev 模式挂 globalThis 防 HMR 泄漏）
│   ├── utils.ts                     ← shadcn 生成的 cn() 辅助等
│   ├── fetcher.ts                   ← 最小化 fetch 封装（自动抛错）
│   ├── api.ts                       ← API route 通用：jsonOk / jsonError / withApiHandler
│   ├── llmClient.ts                 ← 豆包 API 唯一出口（原生 fetch + 写 AIRun 日志）
│   ├── prompts.ts                   ← PRD 9.1~9.5 的 5 个 system prompt 原文常量
│   ├── fakeIntelSource.ts           ← 本地硬编码的大厂资讯样例（供 daily-intel 使用）
│   ├── queries/                     ← 各 API 对应的前端 query 函数
│   └── schemas/                     ← 5 实体 + 5 AI 输出的 zod schema
│
├── prisma/
│   ├── schema.prisma                ← 数据模型（Resume / Application / Stage / AIRun / IntelSummary / TomorrowTipCache）
│   ├── seed.ts                      ← 种子脚本（预置 10 家大厂占位 Application）
│   ├── migrations/                  ← 迁移历史（进 git）
│   └── dev.db                       ← SQLite 数据库文件（不进 git）
│
├── uploads/                         ← PDF 简历本地存储目录（不进 git，运行时自动创建）
│
├── scripts/
│   ├── test-ark-api.ts              ← 【临时 · Phase 0.6 产生 → Phase 6.1 完成后删除】Ark API 连通性冒烟脚本（测试 /chat/completions vs /responses）
│   └── smoke-api.ts                 ← 非 AI REST API 烟测脚本（一条命令跑通 CRUD）
│
└── node_modules/                    ← pnpm 安装产物（不进 git）
```

---

## 📂 文件分类速查

### A. 文档层（纯 Markdown，不是代码）

| 文件 | 作用 | 谁读 |
|---|---|---|
| `job_hunt_flow_board_prd.md` | **产品真相**。数据模型、API 契约、页面规格、AI 提示词原文、6 个验收闭环。 | 所有人 |
| `UI.md` | **视觉真相**。浅色马卡龙色系、布局、组件、交互动效。 | 所有人 |
| `tech_stack.md` | **落地真相**。Next.js + SQLite + Prisma + shadcn/ui + 豆包。含禁用方案清单。 | AI Agent |
| `implementation_plan.md` | **步骤真相**。7 Phase / 39 Step 指令手册，每步含验证清单，严禁代码。 | AI Agent |
| `progress.md` | **进度真相**。逐步勾选清单，配合 implementation_plan 使用。 | AI Agent |
| `architecture.md` | **文件地图**（本文件）。每个文件/文件夹的作用。 | AI Agent |
| `CODEBUDDY.md` | **入口**。AI Agent 进入仓库第一读物，含强制阅读门禁。 | AI Agent |
| `README.md` | 仓库门面，人类读者看（Phase 7.4 才产出）。 | 人类 |

### B. 配置层

| 文件 | 作用 |
|---|---|
| `package.json` | pnpm 依赖 + 脚本（`dev` / `build` / `lint` / `prisma.seed`） |
| `tsconfig.json` | TypeScript 配置，含 `@/*` path alias |
| `next.config.*` | Next.js 配置（默认即可） |
| `tailwind.config.*` | Tailwind 主题：扩展马卡龙粉语义色令牌 |
| `postcss.config.*` | PostCSS（Tailwind 依赖） |
| `components.json` | shadcn/ui 生成器配置 |
| `.env` / `.env.local` | 环境变量；**不进 git**；Phase 6 需要豆包三件套 |
| `.gitignore` | 忽略 `node_modules/` / `prisma/dev.db` / `uploads/` / `.env*` 等 |

### C. 代码层

| 目录 | 作用 | 写入规则 |
|---|---|---|
| `app/` | Next.js App Router。页面在各子目录的 `page.tsx`，API 在 `app/api/**/route.ts` | 页面是 Server Component，API 用 route.ts |
| `components/` | React 组件。`ui/` 是 shadcn 生成物，其他按业务域分 | 业务组件不放 `ui/` 子目录 |
| `lib/` | 无副作用的工具与数据访问。`db.ts` 是 Prisma 单例，`llmClient.ts` 是豆包唯一出口 | 任何 AI 调用必须走 `llmClient.ts`；API Key 不得离开 lib/ 与 route 文件 |
| `prisma/` | 数据模型与迁移 | `schema.prisma` 改动必须配 migration |
| `uploads/` | 用户上传的 PDF 文件 | 运行时目录；`.gitignore` 忽略 |
| `scripts/` | 一次性脚本（烟测、数据修复等） | 不在生产运行路径上 |

### D. 运行时产物（都不进 git）

| 路径 | 作用 |
|---|---|
| `node_modules/` | pnpm 安装产物 |
| `.next/` | Next.js 构建缓存 |
| `prisma/dev.db` / `prisma/dev.db-journal` | SQLite 数据库文件与 WAL |
| `uploads/*` | 运行时上传的 PDF |
| `.env.local` | 本地密钥 |

### E. 工作记忆

| 路径 | 作用 |
|---|---|
| `.workbuddy/memory/YYYY-MM-DD.md` | 每日工作记忆（AI Agent 跨会话上下文） |
| `.workbuddy/memory/MEMORY.md` | 长期事实（用户偏好、项目约定） |

工作记忆是辅助上下文，**不是规格**。规格以 PRD / UI / tech_stack 为准。

---

## 🔑 关键契约点（零散但必须对齐）

1. **Prisma 单例** → 所有 DB 访问只走 `lib/db.ts` 导出的实例，不要 `new PrismaClient()`
2. **Ark（豆包 / DeepSeek 3.2）唯一出口** → 所有 AI 调用只走 `lib/llmClient.ts` 的 `callAI`（兼容别名 `callDoubao`），它负责 fetch + 日志 + 错误分类
3. **Ark API 调用路径决策** → 🔄 **待 Step 0.6 冒烟测试完成后锁定**
   - 候选：`/chat/completions`（OpenAI 兼容）或 `/responses`（火山方舟新 API）
   - 决策规则：谁能稳定输出合法 JSON 选谁；都行时选 `/chat/completions`
   - 决策落地：Step 0.6 完成后，在此节追加一段"**已决策：走 XXX 路径，理由 YYY**"
4. **Prompt 原文** → `lib/prompts.ts` 的 5 个常量必须和 PRD 9.1~9.5 **逐字一致**
5. **中文枚举** → `stageType` / `currentStatus` / `stage.status` / `resume.tag` 等字段永远存中文原值（`HR面`、`待参加`、`产品` 等）
6. **API Key 边界** → `process.env.DOUBAO_*` 只允许在 `app/api/**/route.ts` 和 `lib/llmClient.ts` 里被读取，绝不下发到客户端
7. **AI 草稿态** → 任何 AI 路由**不写业务表**（只写 `AIRun` 日志），返回结果由前端收下→人工确认→再调 PATCH 入库
8. **底座模型** → Endpoint `ep-20260418165808-rvgk2` 后端绑 **DeepSeek 3.2**；切模型由用户在火山方舟控制台操作，项目代码不动

---

## 🔄 维护规则（给 Agent）

1. **文件动了就更新本文件**。新增/删除/重命名/移动，任何一种都算。
2. **不要把进度写进来**。状态（做没做）在 `progress.md`，这里只管"是什么"。
3. **计划中的条目**：当实际创建出来后，把行从"（以下 Phase X 起陆续产生）"区域挪到已有的 app/ 或 lib/ 等子树下（保留 Phase 注释）；若最终没做，就删掉那一行。
4. **若实际产物与本文件偏差**（例如 Agent 做了 `lib/foo.ts` 却没登记）：以**实际代码为准**，立刻补登记，并在对应的 git commit message 里说明。
