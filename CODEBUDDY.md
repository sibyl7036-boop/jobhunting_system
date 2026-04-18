# CODEBUDDY.md

本仓库是"**求职流程管理看板**（Job Hunt Flow Board）"的工作区，面向一名大学生求职季用户，单人使用，走 Vibe Coding 路线完成。本文件是任何 AI Agent 进入本仓库时的**第一读物**。

---

## 🚨 0. 写代码前的强制阅读门禁（硬性前置条件）

> **以下 4 份文件必须完整阅读完毕，才允许写/改任何代码。不是浏览、不是扫一眼，是完整读完。**

| # | 文件 | 为什么必须读 |
|---|---|---|
| 1 | [`job_hunt_flow_board_prd.md`](./job_hunt_flow_board_prd.md) | **产品真相**：数据模型、API 契约、页面规格、AI 提示词原文、验收标准。字段名/枚举值/URL 以 PRD 为准。 |
| 2 | [`UI.md`](./UI.md) | **视觉真相**：浅色马卡龙色系、布局、组件、交互动效。偏离 UI.md 的配色/结构视为缺陷。 |
| 3 | [`tech_stack.md`](./tech_stack.md) | **落地真相**：技术栈选型、目录结构、依赖清单、启动命令、6 天实现顺序、禁用方案清单。 |
| 4 | [`architecture.md`](./architecture.md) | **文件地图**：仓库里每个文件/文件夹是干什么的。进来 30 秒定位代码。 |
| 5 | [`implementation_plan.md`](./implementation_plan.md) | **步骤真相**：分 7 个 Phase / 38 步的执行手册。按顺序照做、每步都有验证清单、完成后必须更新 progress.md。 |
| 6 | [`progress.md`](./progress.md) | **进度真相**：逐步勾选清单。进来就能看到当前做到哪、下一步做什么。 |

**冲突时的权威优先级：PRD > UI.md > tech_stack.md。** `architecture.md` 记录"**是什么**"、`progress.md` 记录"**做到哪**"、`implementation_plan.md` 记录"**怎么做**"，三者互不越位。

**验证清单（动手前自检）**：
- [ ] 我已完整读完 `job_hunt_flow_board_prd.md`（1050+ 行）
- [ ] 我已完整读完 `UI.md`
- [ ] 我已完整读完 `tech_stack.md`
- [ ] 我已读完 `architecture.md`，了解每个文件/文件夹的作用
- [ ] 我已读完 `progress.md`，知道当前应从哪个 Step 开始
- [ ] 我已读完 `implementation_plan.md` 中我要执行的 Phase/Step 的完整指令
- [ ] 我要做的改动不会与 PRD 冲突、不会破坏已有功能

**任何一条没打勾，就不要开始写代码。**

---

## 1. 仓库当前状态

**截至 2026-04-18：** 仓库只有 4 份 Markdown 文档（3 份规格 + 本文件），还没有任何代码、`package.json`、`.git`、`node_modules`。项目处于"**文档已就绪、待初始化**"阶段。

真实的"已建成什么"以 [`architecture.md`](./architecture.md) 为准，每次进入仓库**先读它**，判断当前到哪一步。

---

## 2. 项目核心一览

- **前后端一体** Web 系统（PRD 3.1 明确禁止做成纯前端 localStorage demo）
- 3 个页面 + 1 个全局右侧 Drawer：
  - `/dashboard` 首页（流程表格、明日 AI 提醒、今日大厂动向、简历、AI Copilot）
  - `/calendar` 日历页
  - `/companies` 大厂流程页（阿里/腾讯/字节/美团/百度/京东/拼多多/小红书/快手/滴滴）
- 5 个真实**豆包 API** 调用：解析面试邮件 / 解析 JD / 生成面试题 / 面试复盘 / 今日大厂动向
- PDF 简历上传、预览（原生 iframe）、文本提取、与岗位关联
- **所有 AI 结果必须先进入"草稿态"，允许用户编辑后再落库**（PRD 3.2，硬性规则）

---

## 3. 技术栈（权威来源：`tech_stack.md`）

| 层级 | 选型 |
|---|---|
| 全栈框架 | **Next.js（App Router）14.x / 15.x** |
| 语言 | TypeScript 5.x |
| 数据库 | **SQLite**（本地 `prisma/dev.db`） |
| ORM | **Prisma 5.x** |
| UI 库 | **shadcn/ui**（代码复制进项目）+ Tailwind CSS 3.x |
| 图标 | lucide-react |
| 动效 | Framer Motion（仅用于 Drawer / 小猫轻动效） |
| 表单 | react-hook-form + zod |
| 日期 | date-fns |
| PDF 文本 | `pdf-parse`（Node 端） |
| PDF 预览 | 浏览器原生 `<iframe>`（不用 react-pdf） |
| AI 调用 | **原生 fetch 直连豆包 API**（OpenAI 兼容格式），**不引入 LangChain** |
| 包管理 | pnpm（推荐）或 npm |
| Node | ≥ 20 |

**核心原则：能用一个技术解决的绝不用两个；能用官方默认方案的绝不引入三方库。** `tech_stack.md` 第 1 节列出了"为什么不用某些方案"（Next.js 替换、Postgres、MongoDB、LangChain、Redux、Ant Design、Docker、tRPC 等都在禁用清单），引入新依赖前必读。

---

## 4. 项目初始化（尚未执行）

当要把项目从"文档"推进到"代码"时，按 `tech_stack.md` 第 7 节：

```bash
# 1. 初始化 Next.js（App Router + TS + Tailwind）
pnpm create next-app@latest . --typescript --tailwind --app --eslint

# 2. 接入 shadcn/ui
pnpm dlx shadcn@latest init

# 3. 安装核心依赖
pnpm add @prisma/client framer-motion lucide-react date-fns \
  react-hook-form zod @hookform/resolvers pdf-parse react-day-picker \
  clsx tailwind-merge
pnpm add -D prisma @types/pdf-parse tsx

# 4. 初始化 Prisma + SQLite（schema 按 PRD 第 6 章写）
pnpm dlx prisma init --datasource-provider sqlite
pnpm dlx prisma migrate dev --name init
pnpm dlx prisma db seed   # 预置 10 家大厂

# 5. 启动
pnpm dev
```

完成初始化后：删除本节，并在 `architecture.md` 里追加一条"里程碑 0：项目骨架搭建完成"的记录。

---

## 5. 常用命令（项目初始化后才生效）

```bash
pnpm dev                         # Next.js 本地开发（默认 3000）
pnpm build && pnpm start         # 生产构建 + 启动
pnpm lint                        # ESLint
pnpm dlx prisma studio           # 可视化查看 / 改数据库
pnpm dlx prisma migrate dev      # 改完 schema 后执行迁移
```

**项目未初始化前，这些命令都无法执行，不要假装跑过。**

---

## 6. 目录结构（权威：`tech_stack.md` 第 4 节）

```
app/                # 路由 + API Route Handlers
  dashboard/  calendar/  companies/
  api/
    resumes/  applications/  stages/
    dashboard/events/  calendar/events/  companies/progress/
    ai/
      parse-email/  parse-jd/  generate-questions/  review/  daily-intel/
components/
  ui/               # shadcn 复制进来的组件（可自由改）
  layout/  dashboard/  calendar/  companies/  drawer/
  CatIcon.tsx       # UI.md 指定的小猫元素
lib/
  db.ts             # Prisma client 单例
  llmClient.ts      # 豆包 API 封装（唯一出口）
  prompts.ts        # 5 个 system prompt 常量（按 PRD 第 9 章原文）
  utils.ts
prisma/
  schema.prisma  seed.ts  dev.db (gitignore)
uploads/            # PDF 简历本地存储（gitignore）
.env.local          # DOUBAO_API_KEY 等，禁入 git
```

---

## 7. 数据模型速查（权威：PRD 第 6 章）

5 个核心实体：**Resume / Application / Stage / AIRun / IntelSummary**。

- **Application（岗位申请）** 是主干：`companyName + departmentName + roleName + jdText / jdSummary / jdKeywords / expectedSkills + linkedResumeId + currentStatus`
- **Stage（流程节点）** 属于某个 Application：`type ∈ {已投递/笔试/测评/一面/二面/三面/HR面/Offer/挂了}` + `status ∈ {待参加/已完成/已通过/未通过}` + 时间 / 会议链接 / 复盘三件套（questionSummary / answerSummary / suggestion）
- **Resume** 独立存储：`fileUrl + extractedText + tag ∈ {产品/运营/算法/通用}`
- **AIRun** 是调用日志（**所有 AI 调用都必须写**）
- **IntelSummary** 是每日大厂动向摘要

写 `schema.prisma` 时字段类型、可空性、枚举值严格对齐 PRD 第 6.1~6.5，不要自由发挥。

---

## 8. API 设计速查（权威：PRD 第 7 章）

REST 风格，按实体分组：
- `/api/resumes`（含 `/upload`）
- `/api/applications/:id`
- `/api/stages/:id` + `/api/dashboard/events?range=7d` + `/api/calendar/events?start&end`
- `/api/companies/progress`
- `/api/ai/{parse-email,parse-jd,generate-questions,review,daily-intel}`

**关键约束**：
- 前端永远不直连豆包，所有 AI 调用走 `lib/llmClient.ts`
- `DOUBAO_API_KEY` 只能出现在 `.env.local` 和服务端代码里
- 每次 AI 调用都写一条 `AIRun` 日志

---

## 9. AI 提示词（权威：PRD 第 9 章）

5 个 prompt 在 PRD 里有**完整原文**，落地时要**原样抄到 `lib/prompts.ts`**，不要改写。共同要求：
- 模型尽量输出 JSON（`response_format: { type: 'json_object' }`）
- 后端 `JSON.parse` 套 try-catch，失败时返回可读错误
- AI 结果先回给前端做"草稿态"，用户确认后再调 PATCH 入库

---

## 10. UI 约定（权威：`UI.md`）

- 色系：**浅色 + 马卡龙粉**（**不是深色**）
- 组件来源：**shadcn/ui**，颜色全部走 Tailwind 变量，修改 `tailwind.config.ts` 的 `primary` 即可全局换色
- Drawer 从右侧滑入，统一承载"查看 + 编辑 + AI 辅助 + 保存"
- 必须有的状态：loading / 空态 / 保存成功 / 保存失败 / AI 调用失败 / 上传失败
- 小猫 SVG 作为装饰性元素，Framer Motion 做轻动效即可

---

## 11. 实现优先级（权威：PRD 第 14 章 + tech_stack 第 8 节）

**P0（必做闭环）**：数据模型 → 三页 → Drawer → 简历上传关联 → 4 个 AI 能力（解析邮件 / JD / 出题 / 复盘）→ 手动 CRUD

**P1（锦上添花）**：今日动向摘要、AI 调用日志查看页、更精致的 loading / 空态、流程节点视觉

**建议 6 天节奏**：Day1 地基 → Day2 API → Day3 三页面 → Day4 Drawer → Day5 AI 接入 → Day6 打磨。**不要一次性贪多**。

---

## 12. 文档分工与维护规则（重要）

本仓库有 3 份"活文档"各司其职，**不许混用**：

| 文件 | 记录什么 | 什么时候必须更新 |
|---|---|---|
| `architecture.md` | **是什么**：每个文件/文件夹的作用（文件地图） | 每当**新增 / 删除 / 重命名 / 移动**任何文件或目录时 |
| `progress.md` | **做到哪**：逐步勾选清单（38 个 Step 的完成状态） | 每完成 `implementation_plan.md` 的一个 Step 的**全部验证清单** |
| `implementation_plan.md` | **怎么做**：7 Phase / 38 Step 的指令手册 | 计划本身调整时（正常情况不动） |

### 行为准则
- **开始工作前**：读 `progress.md` 看下一个该做的 Step → 翻 `implementation_plan.md` 读该 Step 完整指令 → 读 `architecture.md` 确认相关文件的定位
- **工作中**：新建任何文件/目录前，看 `architecture.md` 里是否已经规划了位置；如没有，先在 `architecture.md` 登记再动手
- **工作后**：
  1. 走完当前 Step 的**全部验证清单**
  2. 在 `progress.md` 把该 Step 从 `[ ]` 改成 `[x]` 并填完成日期
  3. 若本次新增了文件/目录，把它补登到 `architecture.md` 对应位置
  4. 若完成的是一个完整 Phase（全 Step 都打勾），在 `progress.md` 的 Phase 出口勾 "已追加 architecture.md 里程碑"，并在 `architecture.md` 顶部加一条简短的 Phase 完成记录（一两句话）
- **若发现文档与实际代码不一致**：以**代码为准**，立刻校正文档

### 不写就算没做完
Step 做完了但 `progress.md` 没勾、新建了文件但 `architecture.md` 没登记 —— 都算**未完成**。下一次 Agent 进来会重新做，浪费你时间。

---

## 13. 豆包 / 火山方舟 API 调用契约

### 模型与环境变量（`.env.local`，已全部就绪）
| 变量 | 值 | 状态 |
|---|---|---|
| `DOUBAO_API_KEY` | `ark-...`（用户 2026-04-18 提供；等价于官方 `ARK_API_KEY`） | ✅ 已写入 `.env.local` |
| `DOUBAO_BASE_URL` | `https://ark.cn-beijing.volces.com/api/v3` | ✅ 北京区公网 |
| `DOUBAO_MODEL` | `ep-20260418165808-rvgk2`（Endpoint ID） | ✅ 后端绑定 **DeepSeek 3.2** |

三项全部就绪。命名虽叫 `DOUBAO_*`，实际走的是火山方舟（Ark）平台 + DeepSeek 3.2 模型，只是沿用历史命名。

### 调用路径（由 Step 0.6 决策为准）
火山方舟同时提供两套 API：
- `/chat/completions`（OpenAI 兼容，请求体 `messages: [...]`）
- `/responses`（新版，请求体 `input: [{content:[{type:'input_text'}]}]`）

**两者同一 Endpoint 都能调通**，但 JSON 强约束的支持度可能不同。因此：
- **Phase 0 Step 0.6** 会跑一次冒烟测试，实测两条路径 + 两种 JSON 约束方式（共 4 个用例）
- 最终选用哪条路径由测试结果决定，写入 `architecture.md` 「关键契约点 · Ark API 调用路径决策」
- `lib/llmClient.ts` 的 `callAI` 按该决策实现，**不要硬编码接口路径**

### 通用约束
- 不传 `stream`（不要流式响应）
- 不传 `tools`（不需要联网搜索；daily-intel 用本地资讯）
- 调用超时 30 秒

### API Key 安全红线（硬性）
- 只允许存在于 `.env.local`（该文件已在 `.gitignore`）
- **严禁**把真实 Key 写入任何会被提交的文件（`README.md` / `implementation_plan.md` / 测试代码 / 错误日志 / commit message 等）
- **严禁**在客户端 bundle（`"use client"` 组件、`components/**`、`app/**/page.tsx` 等）读取 `process.env.DOUBAO_*`；只允许在 Route Handler（`app/api/**/route.ts`）与 `lib/llmClient.ts` 里读
- `lib/llmClient.ts` 在 catch 错误时要显式把 `Authorization` 头和完整 Key 从日志里剥掉
- 若发现 Key 出现在不该出现的地方：删除 → `git log -S"<key 前缀>"` 检查是否已提交 → 若已提交必须 rotate Key 并通知用户

---

## 14. 给 Agent 的工作守则

1. **写代码前必须走完第 0 节的门禁**。6 份必读文件全读完才能动手。
2. **不要把系统降级成纯前端 localStorage 页面**（PRD 3.1 禁止）。必须真 Next.js + 真 SQLite + 真豆包调用。
3. **AI 结果的"草稿态 → 用户确认 → 落库"流程是硬性规则**（PRD 3.2），不能省略。
4. **豆包 API Key 绝不出现在前端文件里**（见第 13 节红线）。
5. **新增依赖前先问**：能不能用已有技术解决？参见 `tech_stack.md` 第 1 节禁用清单。
6. **不要编造本仓库不存在的命令或文件**。项目未初始化时 `pnpm dev` 跑不起来，不要假装跑过。
7. **字段名、枚举值、URL 路径严格对齐 PRD**，不要按英文习惯擅自翻译（例如 `HR面` 不要写成 `hr_interview`，枚举值以中文字符串为准）。
8. **完成任一 Step 后，必须同步更新 `progress.md` 和（如涉及文件变更）`architecture.md`**（见第 12 节）。
9. 用户是产品经理背景 + Vibe Coding，偏好"能一眼看懂动线 + 关键处有中文注释"的代码，不需要过度抽象。

---

## 15. 工作记忆

本机启用了跨会话工作记忆，位置：`/Users/sibyl/Desktop/system/.workbuddy/memory/`。若任务可能依赖历史上下文，先读 `MEMORY.md` 与最近的日期文件。

> **注意**：工作记忆只是**辅助上下文**，不是规格。规格以 PRD / UI.md / tech_stack.md 为准；文件定位以 architecture.md 为准；进度以 progress.md 为准。
