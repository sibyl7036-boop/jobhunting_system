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

> 当前仓库处于"**Phase 1 完成**"——6 个数据 model + 10 家大厂种子 + zod schema 全套就绪。Phase 2 REST API 待开始。

```
/Users/sibyl/Desktop/system/
├── job_hunt_flow_board_prd.md       ← 已有 · 产品真相（PRD）
├── UI.md                            ← 已有 · 视觉真相（界面规范）
├── tech_stack.md                    ← 已有 · 落地真相（技术栈 + 目录 + 启动命令）
├── implementation_plan.md           ← 已有 · 步骤真相（7 Phase / 39 Step 指令手册）
├── progress.md                      ← 已有 · 进度真相（逐步勾选清单）
├── architecture.md                  ← 已有 · 文件地图（本文件）
├── CODEBUDDY.md                     ← 已有 · AI Agent 入口（首读）
├── .env                             ← 已有 · Prisma CLI 专用（只有 DATABASE_URL="file:./dev.db"）；不进 git
├── .env.local                       ← 已有 · Next.js runtime 环境变量（DATABASE_URL / DOUBAO_*）；不进 git
├── .gitignore                       ← 已有 · 保护 node_modules / .next / .env* / dev.db / uploads / .workbuddy 等
├── .workbuddy/                      ← 已有 · 工作记忆（不进 git）
│
│ ── Phase 0 产物 ──
├── package.json                     ← 已有 · Next 15.5 + React 18.3 + Tailwind 3.4 + TS 5.9 + Prisma 5.22 + shadcn 依赖 + zod 4.3
├── pnpm-lock.yaml                   ← 已有 · 依赖锁定
├── pnpm-workspace.yaml              ← 已有 · onlyBuiltDependencies 白名单（@prisma/engines / prisma / tailwindcss-oxide）
├── tsconfig.json                    ← 已有 · TypeScript 配置，含 `@/*` path alias
├── next.config.ts                   ← 已有 · Next.js 配置（当前为空 defaults）
├── next-env.d.ts                    ← 已有 · Next.js 自动生成（gitignore 忽略；仓库初始 commit 保留了一份）
├── .eslintrc.json                   ← 已有 · ESLint 8 配置，extends next/core-web-vitals + next/typescript
├── tailwind.config.ts               ← 已有 · UI.md 4.1~4.6 全部色值 + 阴影 + 字体 + 字号 + 圆角 + tailwindcss-animate plugin
├── postcss.config.mjs               ← 已有 · PostCSS 走 tailwindcss + autoprefixer
├── components.json                  ← 已有 · shadcn/ui 配置（new-york / neutral / cssVars / @/* alias）
│
├── app/
│   ├── layout.tsx                   ← 已有 · 三区布局（Sidebar + Header + main），zh-CN + UI.md 语义令牌
│   ├── page.tsx                     ← 已有 · 重定向到 /dashboard
│   ├── globals.css                  ← 已有 · Tailwind 3 三件套 + body 基线（app-bg + text-primary + PingFang + 行高 1.5）
│   ├── favicon.ico                  ← 已有 · 默认图标
│   ├── dashboard/page.tsx           ← 已有 · 占位页（Phase 3.2+3.3 实现真实模块）
│   ├── calendar/page.tsx            ← 已有 · 占位页（Phase 3.4 实现月视图）
│   └── companies/page.tsx           ← 已有 · 占位页（Phase 3.5 实现）
├── public/                          ← 已有 · 静态资源（next.svg 等；Phase 7.2 清理）
│
├── components/
│   ├── ui/
│   │   └── button.tsx               ← 已有 · shadcn Button，variant 映射 UI.md 4.2 粉色阶梯 + 4.6 状态色
│   ├── layout/
│   │   ├── Sidebar.tsx              ← 已有 · 左侧固定导航栏（UI.md 6.2）
│   │   └── Header.tsx               ← 已有 · 顶部 Header（UI.md 6.3，按路由切 UI.md 8.2/9/10 标题）
│   └── CatIcon.tsx                  ← 已有 · 小猫占位（lucide Cat；Phase 7.2 换 UI.md 12.3 自定义 SVG）
│
├── lib/
│   ├── utils.ts                     ← 已有 · shadcn 约定的 cn() 辅助（clsx + tailwind-merge）
│   └── db.ts                        ← 已有 · Prisma Client 单例（dev 模式挂 globalThis 防 HMR 泄漏）
│
├── scripts/
│   └── test-ark-api.ts              ← 已有 · 【临时，Phase 6.1 完成后删除】Ark API 冒烟脚本（已决策走 /chat/completions + response_format）
│
│ ── Phase 1 产物 ──
├── prisma/
│   ├── schema.prisma                ← 已有 · 6 个 model（Resume / Application（含 interviewQuestions）/ Stage / AIRun / IntelSummary / TomorrowTipCache）+ 中文枚举字符串 + Cascade/SetNull 关系
│   ├── seed.ts                      ← 已有 · 幂等种子脚本，预置 10 家大厂占位 Application（阿里/腾讯/字节/美团/百度/京东/拼多多/小红书/快手/滴滴）
│   ├── migrations/
│   │   └── 20260418121855_init/     ← 已有 · 首次迁移（建 6 张表 + 索引）
│   └── dev.db                       ← 已有 · SQLite 数据库（运行时产物，gitignore）
├── lib/schemas/
│   ├── enums.ts                     ← 已有 · PRD 所有中文枚举（RESUME_TAGS/STAGE_TYPES/APPLICATION_STATUSES/STAGE_STATUSES/AI_TASK_TYPES/AI_RUN_STATUSES）+ zod enum schema
│   ├── entities.ts                  ← 已有 · 6 实体 zod schema（Xxx / XxxCreateInput / XxxUpdateInput 三套）+ `z.infer` 类型导出
│   ├── ai-outputs.ts                ← 已有 · PRD 9.1~9.4 四个 AI JSON 输出 zod schema
│   └── index.ts                     ← 已有 · barrel 导出

（以下 Phase 2+ 陆续产生）
├── README.md                        ← 计划中 · 仓库门面，写"三条命令跑起来"（Phase 7.4 产生）
│
├── app/api/                         ← 计划中 · Phase 2 起 REST API Route Handlers
│   ├── resumes/
│   │   ├── route.ts                 ← GET 列表
│   │   ├── upload/route.ts          ← POST 上传（multipart PDF）
│   │   └── [id]/
│   │       ├── route.ts             ← PATCH 改名 / DELETE
│   │       └── file/route.ts        ← GET 流式返回 PDF 文件
│   ├── applications/
│   │   ├── route.ts                 ← POST 创建
│   │   └── [id]/route.ts            ← GET（含 stages）/ PATCH / DELETE
│   ├── stages/
│   │   ├── route.ts                 ← POST 创建
│   │   └── [id]/route.ts            ← PATCH / DELETE
│   ├── dashboard/
│   │   └── events/route.ts          ← GET ?range=Nd 的流程事件
│   ├── calendar/
│   │   └── events/route.ts          ← GET ?start=&end= 的流程事件
│   ├── companies/
│   │   └── progress/route.ts        ← GET 10 家公司 × Application × Stage 全量
│   └── ai/
│       ├── parse-email/route.ts     ← POST 解析面试邮件（走 /chat/completions · 输出 JSON · 草稿态）
│       ├── parse-jd/route.ts        ← POST 解析 JD
│       ├── generate-questions/route.ts ← POST 生成面试题
│       ├── review/route.ts          ← POST 面试复盘
│       └── daily-intel/route.ts     ← GET 今日大厂动向摘要（按生成日本地时区缓存）
│
├── components/                      ← 计划中 · Phase 3+ 产生业务组件
│   ├── ui/                          ← shadcn/ui 后续按需添加（card / dialog / sheet / table / badge 等）
│   ├── dashboard/                   ← 首页 5 模块
│   ├── calendar/                    ← 日历组件
│   ├── companies/                   ← 公司流程行
│   └── drawer/                      ← 全局右侧 Drawer 容器及内容组件
│
├── lib/                             ← 计划中 · Phase 2+ 起产生
│   ├── fetcher.ts                   ← 最小化 fetch 封装（自动抛错）
│   ├── api.ts                       ← API route 通用：jsonOk / jsonError / withApiHandler
│   ├── llmClient.ts                 ← Ark API 唯一出口 callAI（/chat/completions + response_format）
│   ├── prompts.ts                   ← PRD 9.1~9.5 的 5 个 system prompt 原文常量
│   ├── fakeIntelSource.ts           ← 本地硬编码的大厂资讯样例（供 daily-intel 使用）
│   └── queries/                     ← 各 API 对应的前端 query 函数
│
├── uploads/                         ← 计划中 · PDF 简历本地存储目录（不进 git，运行时自动创建）
│
└── scripts/
    └── smoke-api.ts                 ← 计划中 · Phase 2.6 非 AI REST API 烟测脚本

└── node_modules/                    ← 已有 · pnpm 安装产物（不进 git）
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
3. **Ark API 调用路径决策** → ✅ **已锁定（2026-04-18 Step 0.6 冒烟测试）：走 `/chat/completions` + `response_format: { type: "json_object" }`**
   - 实测结果：Case A（chat/completions + response_format）和 Case C（responses + text.format）都能稳定返回合法 JSON；Case B、D（纯 prompt）返回会被 markdown ` ```json ... ``` ` 围栏包裹，无法直接 JSON.parse
   - 选 A 不选 C 的理由：OpenAI 兼容格式、请求体更扁平（messages vs input 嵌套 input_text）、响应解析更直接（choices[0].message.content vs 遍历 output[].content[].text）、工具链更丰富
   - 纯文本场景（PRD 9.5 今日大厂动向 / Step 6.6 明日提醒）：走同一路径 `/chat/completions`，不传 `response_format`，Case E 实测 200 + 拿到纯文本 "今日晴暖，微风拂面，适宜出行。"
   - Endpoint 响应的实际模型 id：`deepseek-v3-2-2512`（与用户告知的 DeepSeek 3.2 一致）
   - `lib/llmClient.ts`（Step 6.1）按此决策实现，不再保留运行时切换能力（候选已收敛）
4. **Prompt 原文** → `lib/prompts.ts` 的 5 个常量必须和 PRD 9.1~9.5 **逐字一致**
5. **中文枚举** → `stageType` / `currentStatus` / `stage.status` / `resume.tag` 等字段永远存中文原值（`HR面`、`待参加`、`产品` 等）
6. **API Key 边界** → `process.env.DOUBAO_*` 只允许在 `app/api/**/route.ts` 和 `lib/llmClient.ts` 里被读取，绝不下发到客户端
7. **AI 草稿态** → 任何 AI 路由**不写业务表**（只写 `AIRun` 日志），返回结果由前端收下→人工确认→再调 PATCH 入库
8. **底座模型** → Endpoint `ep-20260418165808-rvgk2` 后端绑 **DeepSeek 3.2**；切模型由用户在火山方舟控制台操作，项目代码不动
9. **前端技术栈版本锁定（2026-04-18 Step 0.1 决策）** → `create-next-app@latest` 默认拉 Next 16 + Tailwind 4 + React 19，与 `tech_stack.md` 规格不符、且会让后续 Tailwind 配置指令失效。本项目**强制降版到 Next 15 + Tailwind 3 + React 18 + ESLint 8**（通过手写 `package.json` 锁定，具体版本：next ^15.1 / tailwindcss ^3.4 / react ^18.3 / eslint ^8.57 / eslint-config-next ^15.1）。未来升级需同步重写 `tailwind.config.ts` 和 implementation_plan 相关步骤。
10. **zod schema 统一落 `lib/schemas/`（2026-04-18 Step 1.4 决策）** → 不单独建 `types/`，zod schema 一份文件同时承担"运行时校验"和"`z.infer` 出 TS 类型源"两个角色。`lib/schemas/enums.ts`（6 组中文枚举）+ `lib/schemas/entities.ts`（6 实体 + Create/Update 派生）+ `lib/schemas/ai-outputs.ts`（PRD 9.1~9.4 的 AI JSON 输出）+ `lib/schemas/index.ts`（barrel）。新增依赖：zod 4.3.6。
11. **JSON 字符串数组约定** → SQLite 不支持数组，`Application.jdKeywords` / `Application.expectedSkills` / `Application.interviewQuestions` / `AIRun.outputJson` 在 DB 里统一用 `String?` 存 JSON 字符串；应用层（API route）读写时 `JSON.parse` / `JSON.stringify` 转换；zod schema 在应用层用原生 `z.array(z.string())` / `z.record()` 类型。

---

## 🔄 维护规则（给 Agent）

1. **文件动了就更新本文件**。新增/删除/重命名/移动，任何一种都算。
2. **不要把进度写进来**。状态（做没做）在 `progress.md`，这里只管"是什么"。
3. **计划中的条目**：当实际创建出来后，把行从"（以下 Phase X 起陆续产生）"区域挪到已有的 app/ 或 lib/ 等子树下（保留 Phase 注释）；若最终没做，就删掉那一行。
4. **若实际产物与本文件偏差**（例如 Agent 做了 `lib/foo.ts` 却没登记）：以**实际代码为准**，立刻补登记，并在对应的 git commit message 里说明。
