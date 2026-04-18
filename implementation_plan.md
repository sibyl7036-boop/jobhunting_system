# implementation_plan.md

> **本文件是给 AI Coding Agent 的分步实施指令手册。**
>
> **与其他文档的分工**（互不越位）：
> - **规格真相**：`job_hunt_flow_board_prd.md`（产品）/ `UI.md`（视觉）/ `tech_stack.md`（技术栈）
> - **步骤真相**（"怎么做"）：本文件
> - **进度真相**（"做到哪"）：`progress.md`——Agent 每完成一个 Step 的全部验证清单后，必须勾选对应行
> - **文件地图**（"是什么"）：`architecture.md`——Agent 新增/重命名/删除任何文件或目录时必须同步更新；作出技术选型决策（哪个库、哪种方案）时写入"关键契约点"
>
> **使用规则**
> - 严格按阶段顺序执行，**不要跳步**、不要合并、不要预先实现后面阶段的功能
> - 每一步都必须跑通"验证清单"里的**全部**条目才能进入下一步
> - **每完成一个 Step** → 在 `progress.md` 把该 Step 从 `[ ]` 改成 `[x]` 并填完成日期；若本次动了文件结构，同步更新 `architecture.md` 的目录树
> - **每完成一个 Phase**（该 Phase 的全部 Step 已勾完）→ 在 `progress.md` 勾 Phase 出口项；如本 Phase 产生了新的技术选型决策（例如 URL 参数 vs Context、数据访问走 Server Component vs React Query），写入 `architecture.md` 的"关键契约点"
> - 任何步骤的指令与 PRD 冲突时，以 PRD 为准；本文件有笔误以 PRD 为准
> - **本文件不包含任何代码**。所有代码由 Agent 根据指令与 PRD / UI.md / tech_stack.md 自行实现

---

## 🚦 开工前强制检查

在执行 **Phase 0 Step 1** 之前，先完成以下检查：

- [ ] 已完整读完 `job_hunt_flow_board_prd.md`
- [ ] 已完整读完 `UI.md`
- [ ] 已完整读完 `tech_stack.md`
- [ ] 已读完 `architecture.md`，了解每个文件/文件夹的作用与关键契约点
- [ ] 已读完 `progress.md`，确认当前应从哪个 Step 开始（从最靠前的未勾选项开始）
- [ ] 已读完 `CODEBUDDY.md`，理解所有红线（禁纯前端 / AI 草稿态 / API Key 禁前端 / 枚举中文原值）
- [ ] 本机有 Node ≥ 20 与 pnpm，能执行命令

任何一条没打勾，停下来解决，再开始。

---

## 🗺️ 总览

| Phase | 目标 | 预计步数 | 可交付成果 |
|---|---|---|---|
| 0 | 项目骨架 | 5 | Next.js + Tailwind + shadcn/ui 空白页跑通，Prisma 连上 SQLite |
| 1 | 数据层 | 4 | Prisma schema 完整、首次 migrate 通过、种子数据写入 |
| 2 | REST API（非 AI） | 6 | Resume / Application / Stage / Dashboard events / Calendar events / Companies progress 全部可用 |
| 3 | 三个主页面骨架 | 5 | /dashboard、/calendar、/companies 能展示后端真实数据 |
| 4 | 全局 Drawer + 手动 CRUD | 4 | Drawer 打开、编辑、保存、三页同步刷新 |
| 5 | Resume 上传预览与关联 | 3 | PDF 上传、iframe 预览、文本提取、关联岗位 |
| 6 | 豆包 AI 接入 | 6 | 5 个 AI 能力全部可用，草稿态交互到位 |
| 7 | 打磨与验收 | 4 | 所有 loading / 空态 / 错误提示、UI 精修、PRD 第 13 章 6 个闭环跑通 |

总计 39 步（Phase 0 含 5 步骨架 + Step 0.1.5 git 基线 + Step 0.6 Ark API 连通性测试，共 7 步）。每步粒度控制在"AI 一次可独立完成 + 可验证"，没有一步超过半天工作量。

---

## Phase 0 · 项目骨架（Day 1 上午）

> **阶段目标**：从空文件夹到"浏览器打开 `http://localhost:3000` 能看到 Next.js 欢迎页 + Tailwind 颜色生效 + shadcn Button 组件能渲染"。

---

### Step 0.1 — 用 Next.js 脚手架初始化项目

**做什么**
- 在仓库根目录执行 Next.js 官方脚手架，要求 App Router + TypeScript + Tailwind + ESLint + `src/` 目录关闭（保持 `app/` 在根层）。
- 脚手架询问"import alias"时保留默认 `@/*`。
- 生成完成后，把脚手架产出的样板路由页面先保留（别删，Phase 0 Step 5 再替换）。

**验证清单**
- [ ] 根目录出现 `package.json`、`tsconfig.json`、`next.config.*`、`tailwind.config.*`、`postcss.config.*`、`app/`
- [ ] `pnpm install` 无报错
- [ ] `pnpm dev` 启动 3000 端口，浏览器能打开官方欢迎页
- [ ] `pnpm build` 通过
- [ ] `pnpm lint` 通过

---

### Step 0.1.5 — 验证 git 仓库状态并建立提交基线

**背景**：仓库已在用户本地完成 `git init`（2026-04-18 确认），本步目的是**验证 git 能正常工作**并把"文档 + 脚手架"作为首次基线提交，保证 Step 0.2 起每个 Step 都能 commit 且能按步回退。

**做什么**
- 检查 `.git/` 目录存在：`ls -la .git` 确认
- 检查 `.gitignore` 已存在（本仓库已在 2026-04-18 预置）且包含 `.env*` / `node_modules/` / `.next/` / `prisma/dev.db` / `uploads/` / `.workbuddy/`
- `git status` 确认 `.env.local` 未被追踪（防止明文 API Key 进 git）
- `git add .` + `git commit -m "chore: baseline · PRD/UI/tech_stack/plan 文档 + Next.js 脚手架"`
- 查看 commit：`git log --oneline`，确认有且只有 1 个基线 commit（或之前还有"initial commit"也可以）
- 建立 tag：`git tag phase0-step1-done`（后续每个 Step 完成后都 tag 一次，格式 `phaseX-stepY-done`，方便精确回退）

**验证清单**
- [ ] `git status` 显示 working tree clean
- [ ] `git log --oneline` 至少有本次基线 commit
- [ ] `.env.local` 不在追踪列表（`git ls-files | grep env.local` 为空）
- [ ] `git tag -l` 显示 `phase0-step1-done`
- [ ] 从此开始，每完成一个 Step 的验证清单后，都要 `git commit` + `git tag phaseX-stepY-done`

---

### Step 0.2 — 配置 Tailwind 主题：浅色马卡龙粉基调

**做什么**
- **严格按 UI.md 第 4 章**把全部色值写进 `tailwind.config.*` 的 `theme.extend.colors`，色值**原样抄录**不要自由发挥：
  - 页面背景组（UI.md 4.1）：`app-bg #FFF7FB` / `app-bg-secondary #FFFDF7` / `surface-bg #FFFFFF` / `soft-panel #FFF1F7` / `warm-panel #FFF8E8` / `cool-panel #F8F5FF`
  - 主色组（UI.md 4.2）：`primary #F3AFCB` / `primary-hover #EA9CBE` / `primary-strong #DD85AE`
  - 辅助色组（UI.md 4.3）：`secondary-pink #FFD8E8` / `secondary-yellow #FFF0B8` / `secondary-lilac #E9D8FF` / `secondary-peach #FFE2D6` / `secondary-mint #DDF5E8`
  - 文本色组（UI.md 4.4）：`text-primary #47384A` / `text-secondary #6F6172` / `text-tertiary #9B8F9D` / `text-on-primary #FFFFFF`
  - 边框与阴影（UI.md 4.5）：`border-light #F3E4EC` / `border-strong #E8D4DE` / `shadow-soft 0 8px 24px rgba(214,164,187,0.10)` / `shadow-hover 0 12px 30px rgba(214,164,187,0.16)`
  - 状态色（UI.md 4.6）：`success #8ECFAF` / `warning #F3C96B` / `danger #E58CA4` / `info #A8BDF3` / `neutral #DDD6E3`
- 圆角扩展 theme.extend.borderRadius（UI.md 5.4）：大卡片 `24px`、中小卡片 `20px`、按钮 `14px ~ 18px`、小标签 `999px` 胶囊
- 字体（UI.md 5.1）：`PingFang SC, Microsoft YaHei, Noto Sans SC, system-ui`
- 配置 `darkMode: 'class'`，但默认不启用深色（PRD + UI.md 都是浅色基调）
- 全局样式文件（`app/globals.css`）设 body 背景为 `app-bg`、文字色为 `text-primary`，行高 1.5

**验证清单**
- [ ] `tailwind.config.*` 中能看到 UI.md 第 4 章**全部**色值（逐一核对）
- [ ] 在欢迎页临时放一个使用 `bg-primary text-on-primary` 的元素，浏览器里看到的是 `#F3AFCB` 粉色配 `#FFFFFF` 白字
- [ ] 字体 DevTools 里确认已应用 `PingFang SC` 链
- [ ] 临时元素验证完**删掉**，不要残留
- [ ] `pnpm build` 仍通过

---

### Step 0.3 — 接入 shadcn/ui

**做什么**
- 执行 `shadcn init`：Style 选 **new-york**（与 UI.md 的"精致轻盈"气质更匹配）、Base color 选 **neutral**、CSS 变量开启、`@/*` 路径 alias。
- 生成的 CSS 变量（`--primary`、`--background` 等）必须覆盖成 Step 0.2 的 UI.md 真实色值：`--primary: #F3AFCB`、`--primary-foreground: #FFFFFF`、`--background: #FFF7FB`、`--foreground: #47384A`、`--border: #F3E4EC`、`--card: #FFFFFF` 等，**以 Step 0.2 的 Tailwind 令牌为唯一真相**。
- 按 shadcn 推荐方式建立 `components/ui/` 目录（shadcn 生成物会放这里）、`lib/utils.ts`（生成的 `cn` 辅助）。
- 先只添加一个组件 `button` 做连通性验证（后续组件用到时再按需添加）。

**验证清单**
- [ ] `components/ui/button.tsx` 已存在
- [ ] `lib/utils.ts` 已存在且导出 `cn`
- [ ] CSS 变量已覆盖（`getComputedStyle(root).getPropertyValue('--primary')` 返回 `#F3AFCB` 或其 HSL 等价值）
- [ ] 在欢迎页临时放一个 `<Button>测试</Button>`，浏览器能看到 `#F3AFCB` 粉色按钮，hover 变为 `#EA9CBE`
- [ ] 临时按钮**删掉**，不残留
- [ ] `pnpm build` 通过

---

### Step 0.4 — 接入 Prisma + SQLite（仅连通，不建模）

**做什么**
- 按 `tech_stack.md` 第 7 节执行 `prisma init --datasource-provider sqlite`，生成 `prisma/schema.prisma` 与 `.env`。
- **`.env.local` 已由用户预置完毕**（仓库根目录已存在，含 `DATABASE_URL` + 豆包三件套），Agent 只需校验其存在且不要覆盖，严禁把任何值同步到会进 git 的文件里。
- 若发现 `.env.local` 缺某个变量，参考 `tech_stack.md` 第 6 节补全：
  - `DATABASE_URL="file:./prisma/dev.db"`
  - `DOUBAO_API_KEY=ark-...`（用户已在 2026-04-18 提供）
  - `DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3`
  - `DOUBAO_MODEL=ep-20260418165808-rvgk2`（用户的 Endpoint ID）
- 建立 `lib/db.ts`，**按 Next.js 开发模式最佳实践**封装 Prisma Client 单例（避免 HMR 热更新时连接泄漏），具体实现由 Agent 按 Prisma 官方文档写。
- 检查 `.gitignore`（已存在），确认 `prisma/dev.db`、`prisma/dev.db-journal`、`.env`、`.env.local`、`uploads/` 都在其中；若缺漏补齐。
- 本步**不写任何 model**，`schema.prisma` 保留 Prisma 生成的默认 generator + datasource 即可。

**验证清单**
- [ ] `pnpm dlx prisma generate` 成功（即使没有 model 也能生成）
- [ ] `lib/db.ts` 导出 prisma 实例，且在 dev 模式下会把实例挂 `globalThis`
- [ ] `.env` / `.env.local` 不在 git 追踪中（执行 `git status` 确认）
- [ ] `prisma/dev.db` 在 `.gitignore` 中
- [ ] `.env.local` 里 4 个变量（DATABASE_URL / DOUBAO_API_KEY / DOUBAO_BASE_URL / DOUBAO_MODEL）**全部非空**

---

### Step 0.5 — 全局布局骨架：左侧导航 + 顶部 Header + 内容区

**做什么**（严格按 UI.md 第 6 章）
- 把脚手架自带的 `app/page.tsx` 改成重定向到 `/dashboard`（按 PRD 2.1）。
- 建立 `app/layout.tsx`：**三区布局**，具体规格如下（UI.md 6.1~6.3）：
  - **左侧导航栏**（UI.md 6.2）：宽度 `88px`、背景半透明白 + 轻微模糊（backdrop-blur）、圆角 `28px`、竖向胶囊感、半悬浮。3 项图标 + 文字：
    - Dashboard（lucide `LayoutDashboard`）→ `/dashboard`
    - Calendar（lucide `CalendarDays`）→ `/calendar`
    - Companies（lucide `Building2`）→ `/companies`
    - 底部放 AI Copilot 小猫入口（Phase 7.2 精修前先用一个简单占位 emoji 或 `Sparkles` 图标）
    - 选中态：淡粉底色（`soft-panel`）+ icon/文字略深 + 整个按钮 scale `1.04`
    - hover 态：背景稍亮 + 阴影轻微增强
  - **顶部 Header**（UI.md 6.3）：**薄、轻、通透**、不要重边框；左侧放页面标题 + 一句小副标题；右侧放日期 pill + 小头像占位；背景不要像传统后台顶部栏
  - **主内容区**：最大宽度 `1440px ~ 1600px`（UI.md 15.1）、左右 padding `32px`（UI.md 5.3）、顶部 padding `28px`
- 建立三个占位页（`app/dashboard/page.tsx`、`app/calendar/page.tsx`、`app/companies/page.tsx`），内容仅一个居中的"X 页占位（等待 Phase 3 实现）"
- 颜色**只使用 Step 0.2 的 UI.md 语义令牌**（`bg-app-bg`、`text-text-primary`、`border-border-light` 等），不要写死 hex

**验证清单**
- [ ] 访问 `/` 自动跳 `/dashboard`，看到"首页占位"
- [ ] 点左侧导航能正确切换到 `/calendar`、`/companies`，**当前 active 项有 scale(1.04) 且淡粉底**
- [ ] 左导航宽度量取确为 `88px`，圆角 `28px`
- [ ] 顶部 Header 量取无明显下边框、背景通透
- [ ] 页面背景色为 `#FFF7FB`（DevTools 取色确认）
- [ ] 窗口缩放到 1280 / 1440 / 1920 宽度，布局不溢出不错位
- [ ] `pnpm build` + `pnpm lint` 均通过

---

### Step 0.6 — 🧪 豆包 / 火山方舟 API 连通性冒烟测试（强制，不跳过）

> **背景**：模型是 **DeepSeek 3.2**，通过火山方舟（Ark）平台的 Endpoint `ep-20260418165808-rvgk2` 访问。
> 火山方舟官方示例都使用 `/responses`（Responses API），但本项目 Phase 6 的 JSON 强约束需求可能更适合 `/chat/completions`（OpenAI 兼容）。两者谁能稳定输出 JSON 还需实测验证。
>
> **本步的唯一目的**：在正式写 AI route 之前，用最小成本测出"哪种接口能调通 + 哪种能稳定 JSON 输出"，避免 Phase 6 才发现问题。

**做什么**

1. 建立一次性脚本 `scripts/test-ark-api.ts`（Phase 0 末尾的临时脚本，Step 6.1 开始前删除）。
2. 脚本读取 `.env.local` 的 `DOUBAO_API_KEY` / `DOUBAO_BASE_URL` / `DOUBAO_MODEL`。
3. 依次执行 5 个测试用例，每个用例打印：请求路径 / HTTP 状态 / 响应 body（截取前 500 字符）/ 是否成功 / JSON.parse 是否成功（用例 E 只看是否拿到非空字符串）：

| # | 接口 | 请求体结构 | JSON 约束方式 | 期望 |
|---|---|---|---|---|
| A | `/chat/completions` | `messages: [...]` | `response_format: { type: 'json_object' }` | 200 + 可解析 JSON |
| B | `/chat/completions` | `messages: [...]` | 只靠 prompt 要求"必须返回 JSON" | 200 + 可解析 JSON（对照组） |
| C | `/responses` | `input: [{content:[{type:'input_text'}]}]` | `text: { format: { type: 'json_object' } }`（如不支持则不带） | 200 + 可解析 JSON |
| D | `/responses` | 同上 | 只靠 prompt 要求 | 200 + 可解析 JSON（对照组） |
| E | A/B/C/D 中最终选定路径 | 同该路径 | 不加任何 JSON 约束 | 200 + 非空文本字符串（验证"今日大厂动向"纯文本场景） |

用例 A~D 的 prompt 统一用：`请返回一个 JSON 对象，包含两个字段：ok（布尔值）、message（字符串"hello from ark"）。不要输出任何其他内容。`
用例 E 的 prompt 用：`用一句话（30字以内）介绍今天的天气。`

4. **不用** `stream`，**不用** `tools`（我们场景不需要）。
5. 把 5 个用例的结果汇总成一张表打印到控制台。
6. 如果用例 A~D **全部失败**或**全部拿不到合法 JSON**：停下来，把脚本完整输出提供给用户，不要继续下一步。
7. 如果至少一个 JSON 用例成功且用例 E 能拿到非空文本：根据结果在 `architecture.md` 的"关键契约点"追加一条"**Ark API 调用路径决策**"，说明最终选 A/B/C/D 中的哪种、用例 E 确认纯文本输出可用，并更新 `implementation_plan.md` Phase 6 开头的"调用契约"（如需要）。

**验证清单**
- [ ] 脚本可以用 `pnpm tsx scripts/test-ark-api.ts` 一条命令跑完
- [ ] 脚本输出的结果表**完整可读**（不会因其中一个用例崩溃而中断后续用例）
- [ ] Authorization 头和 API KEY 值**不**被 `console.log` 出来
- [ ] 用例 A~D 至少一个拿到 200 + 合法 JSON；否则**停止推进**，把输出丢给用户
- [ ] 用例 E 拿到 200 + 非空字符串响应
- [ ] 根据结果更新 `architecture.md`（决策记录）与 `implementation_plan.md` Phase 6 "调用契约"（如需调整）
- [ ] 脚本**保留**在仓库里，Phase 6 Step 6.1 实现完 `lib/llmClient.ts` 后再删（留作回归对照）

---

### ✅ Phase 0 出口检查

- 所有 Step 0.1 ~ 0.6 已在 `progress.md` 勾选完成
- 在 `progress.md` 的 "Phase 0 出口" 勾选已完成
- 在 `architecture.md` 把本 Phase 实际产生的文件从"计划中"区移入已有区（如 `app/layout.tsx`、`lib/db.ts`、`scripts/test-ark-api.ts` 等），并在"关键契约点"追加两项决策：
  - **Ark API 调用路径决策**：根据 Step 0.6 结果写明"已决策走 `/chat/completions`（或 `/responses`），理由 XXX"
  - **shadcn 基础配置**：选用的 style（default / new-york）、baseColor
- 当前状态摘要（一两句话）：骨架跑通、Ark API 已验证可调、进入 Phase 1

---

## Phase 1 · 数据层（Day 1 下午）

> **阶段目标**：把 PRD 第 6 章的 5 个实体 + Phase 6 需要的 2 处扩展（Application.interviewQuestions 字段 + TomorrowTipCache 表）一次性建模，数据库能跑起来，10 家大厂种子数据到位。

---

### Step 1.1 — 在 Prisma schema 中建 6 个 model

**做什么**
- 严格按 **PRD 第 6.1 ~ 6.5** 的 TypeScript 类型，把 `Resume` / `Application` / `Stage` / `AIRun` / `IntelSummary` 翻译成 Prisma model。
- 额外**在 Phase 1 就一起建**以下 PRD 之外的扩展（这些字段/表在 Phase 6 才会真正用，但现在一起建可以省掉 2 次 migration，更干净）：
  - 在 `Application` model 里加 `interviewQuestions String?`（JSON 化的 `string[]`；Step 6.3 的 AI 面试题共享题库用）
  - 新建 `TomorrowTipCache` model：`id(cuid)` + `date(String, @unique)` + `tipText(String)` + `eventsHash(String)` + `createdAt` + `updatedAt`（Step 6.6 的明日提醒缓存用）
- 枚举值（StageType、StageStatus、ResumeTag、AIRun.taskType、AIRun.status、Application.currentStatus）**必须原样保留中文字符串**。SQLite 不支持原生枚举，用 `String` 字段 + zod 校验，不要擅自改成英文代号。
- 关系：`Stage.applicationId` → `Application.id`（多对一，cascade delete）；`Application.linkedResumeId` → `Resume.id`（可选，单向）。
- 时间字段统一用 `DateTime`，可空字段严格按 PRD 的 `| null` 标注对齐。
- `jdKeywords` / `expectedSkills` / `interviewQuestions` 是字符串数组，SQLite 不支持数组，统一存成 JSON 字符串字段，读写时由应用层 `JSON.parse / JSON.stringify`。**在 schema 注释里写明这一点**。
- `AIRun.outputJson` 也用 JSON 字符串字段。

**验证清单**
- [ ] `pnpm dlx prisma format` 通过
- [ ] `pnpm dlx prisma validate` 通过
- [ ] 6 个 model 都有 `id`（cuid 或 uuid）、`createdAt`、`updatedAt`（TomorrowTipCache 也要有）
- [ ] 枚举字段仍是中文字符串（grep 确认 `HR面`、`挂了`、`待参加` 等中文字面量存在）
- [ ] `Stage` 的 `applicationId` 有 `onDelete: Cascade`
- [ ] `Application` 有 `interviewQuestions String?` 字段；`TomorrowTipCache` 表已建且 `date` 字段是唯一索引

---

### Step 1.2 — 执行首次迁移

**做什么**
- 执行 `prisma migrate dev --name init`，生成初始迁移文件。
- 迁移文件路径 `prisma/migrations/...` 要**加入 git**（不要忽略）。
- 生成的 `node_modules/.prisma/client` 类型能被 `lib/db.ts` 正确导入。

**验证清单**
- [ ] `prisma/dev.db` 文件生成成功
- [ ] `prisma/migrations/` 下出现第一个带时间戳的迁移目录
- [ ] 执行 `pnpm dlx prisma studio`，能在浏览器看到 5 张空表
- [ ] 5 张表的列名、类型与 PRD 第 6 章一致

---

### Step 1.3 — 写种子脚本并预置 10 家大厂

**做什么**
- 建立 `prisma/seed.ts`。
- 按 PRD 5.3.3 预置 10 家大厂：阿里、腾讯、字节、美团、百度、京东、拼多多、小红书、快手、滴滴。
- 种子策略：每家大厂创建一个**占位 Application**，字段 `companyName=公司名`、`departmentName=""`、`roleName="待填"`、`currentStatus="未投递"`，**不创建 Stage**。这样 `/companies` 页的"未投递公司"逻辑有数据承载。
- 种子脚本幂等：重复跑不会产生重复数据（用 `upsert` + 自然键 `companyName + roleName + departmentName`）。
- 在 `package.json` 里按 Prisma 官方文档接法配好 `"prisma": { "seed": "..." }` 字段，用 `tsx` 运行。

**验证清单**
- [ ] `pnpm dlx prisma db seed` 执行成功
- [ ] 连续跑两次种子，Application 表记录数不变（幂等性）
- [ ] Prisma Studio 里看到 10 条 Application，公司名与 PRD 列表完全一致

---

### Step 1.4 — 建立全局 zod schema 与类型同步

**做什么**
- 建立 `lib/schemas/` 目录（或 `types/` 目录，二选一，Agent 自行决定并**在 `architecture.md` 的目录树和关键契约点都同步记录**）。
- 为 6 个实体各写一份 zod schema（5 个 PRD 实体 + `TomorrowTipCache`），字段与 Prisma model 对齐；导出 `z.infer` 得到的 TS 类型作为应用层使用的主类型。
- 为 5 个 AI 输出结构（PRD 9.1 ~ 9.5）也写 zod schema，用于 Phase 6 解析 AI JSON。
- 命名约定：`resumeSchema`、`applicationSchema`（含 `interviewQuestions` 可空数组校验）、`stageSchema`、`aiRunSchema`、`intelSummarySchema`、`tomorrowTipCacheSchema`、`aiParseEmailOutputSchema`、`aiParseJdOutputSchema`、`aiQuestionsOutputSchema`、`aiReviewOutputSchema`。

**验证清单**
- [ ] `pnpm build` 通过（schema 无类型错误）
- [ ] 随手在 `lib/db.ts` 的模块作用域写一个 `resumeSchema.parse({...})` 的**临时**语句，用合法/非法对象各测一次，行为符合预期
- [ ] 临时测试代码**删掉**，不残留

---

### ✅ Phase 1 出口检查

- 所有 Step 1.1 ~ 1.4 已在 `progress.md` 勾选
- 在 `progress.md` 的 "Phase 1 出口" 勾选已完成
- 在 `architecture.md` 把 `prisma/schema.prisma`、`prisma/seed.ts`、`prisma/migrations/**`、`lib/schemas/**` 等新产生的文件从"计划中"移入已有区；在"关键契约点"补一项"**zod schema 目录位置**"（最终选的是 `lib/schemas/` 还是 `types/`）
- 当前状态摘要：6 个 model 可用（含 interviewQuestions + TomorrowTipCache）、10 家大厂已入库、zod schema 到位

---

## Phase 2 · REST API（非 AI）（Day 2）

> **阶段目标**：把 PRD 第 7 章除 AI 之外的所有 API 实现完。前端这一步不动。
>
> **通用约定**（每个步骤都适用）：
> - 统一错误结构：成功返回数据对象，失败返回 `{ error: { code, message } }` + HTTP 4xx/5xx
> - 所有输入参数用 zod 校验，失败返 400
> - 写操作一律用 Prisma 事务，关联校验（如 `applicationId` 是否存在）放事务内
> - 每个 route 文件里**放一个 block 注释**说明对应的 PRD 章节

---

### Step 2.1 — Resume API（不含上传）

**做什么**
- 实现 `GET /api/resumes`、`PATCH /api/resumes/:id`、`DELETE /api/resumes/:id`。
- `POST /api/resumes/upload` 留到 Phase 5（涉及文件），本步跳过。
- `GET` 返回列表按 `createdAt desc`。
- `DELETE` 时如果该 Resume 被某个 Application 的 `linkedResumeId` 引用，**拒绝删除**并返 409，错误消息提示引用方的岗位名。

**验证前准备**
- 因为本阶段还没有上传 API，Resume 表是空的。先通过 `pnpm dlx prisma studio` 在浏览器 GUI 里**手动插入 1 条 Resume**（name="测试-产品简历"、tag="产品"、fileName="test.pdf"、fileUrl="/tmp/placeholder"、extractedText="测试文本"）供后续 GET / PATCH / DELETE 和"引用校验"测试用。

**验证清单**
- [ ] 用 curl / Thunder Client / Postman 测三类请求，正常返回
- [ ] GET 返回包含上面手动插入的那条
- [ ] 空列表场景（先 DELETE 掉再 GET）返回 `[]` 不是 `null`
- [ ] PATCH 一个不存在的 id 返 404
- [ ] 构造一条被 Application 引用的 Resume（Prisma Studio 里手动把某 Application 的 linkedResumeId 指向该 Resume），DELETE 返 409
- [ ] 非法请求体（tag 传非枚举值）返 400，错误消息指向字段

---

### Step 2.2 — Application API

**做什么**
- 实现 `GET /api/applications/:id`、`POST /api/applications`、`PATCH /api/applications/:id`、`DELETE /api/applications/:id`。
- `GET` 要 include 该 Application 下所有 `Stage`（按 `time asc`），以及 `linkedResume`（如有）。
- `DELETE` 时 Stage 跟随级联删除（由 Phase 1.1 的 cascade 保证）。
- 创建时 `currentStatus` 默认 `"未投递"`。

**验证清单**
- [ ] POST 一条 Application 成功，返回含 id
- [ ] GET 该 id 返回包含空的 `stages: []`
- [ ] PATCH 改 companyName、currentStatus，读回确认生效
- [ ] 非法 currentStatus 返 400
- [ ] DELETE 后 GET 返 404

---

### Step 2.3 — Stage API + Dashboard/Calendar 事件查询

**做什么**
- 实现 `POST /api/stages`、`PATCH /api/stages/:id`、`DELETE /api/stages/:id`。
- `POST` 必须带 `applicationId`，不存在则 404。
- 实现 `GET /api/dashboard/events?range=7d`：返回今天起 `range` 天内（默认 7）所有 Stage，join 出公司 / 部门 / 岗位 / 关联简历名，按 time asc。
  - **range 参数解析严格**：只接受 `Nd` 格式（例如 `7d`、`14d`），非法返 400
  - 时间窗口：**按本地时区（Asia/Shanghai）**把"今天 00:00:00.000"作为起始、"今天 + N 天 - 1 毫秒"作为结束（即 `今天 00:00:00 <= time < 今天+N 天 00:00:00`）
- 实现 `GET /api/calendar/events?start=YYYY-MM-DD&end=YYYY-MM-DD`：闭区间，返回该区间内所有 Stage（同样 join）。
  - 参数格式严格 `YYYY-MM-DD`，非法返 400
  - **时间解释（按本地时区）**：`start` 当作"start 当天 00:00:00.000"、`end` 当作"end 当天 23:59:59.999"，即 `start 00:00:00 <= time <= end 23:59:59.999`
  - 跨月边界例子：Stage.time = `2026-04-30 23:30:00`，查询 `start=2026-04-01&end=2026-04-30` 能命中；查询 `start=2026-05-01&end=2026-05-31` 不能命中
  - `start > end` 返 400

**验证清单**
- [ ] 创建一条 Application + 3 条不同日期的 Stage（今天、明天、8 天后，时间分别是 10:00 / 14:30 / 23:30）
- [ ] `GET /api/dashboard/events?range=7d` 只返回前两条（今天和明天）
- [ ] `GET /api/calendar/events?start=...&end=...` 覆盖 8 天后（含当天）时能取到第 3 条
- [ ] 跨月边界测试：插入 `time=2026-04-30 23:30:00` 的 Stage，查询 `start=2026-04-01&end=2026-04-30` 命中；查询 `start=2026-05-01&end=...` 不命中
- [ ] 非法 range 值（如 `abc`、`7`）返 400
- [ ] 非法日期（`start > end`、格式错误）返 400
- [ ] Stage 的 applicationId 不存在时 POST 返 404

---

### Step 2.4 — Companies Progress API

**做什么**
- 实现 `GET /api/companies/progress`：返回 10 家大厂完整列表，每家包含其下所有 Application，每个 Application 包含其所有 Stage。
- 对"未投递"的公司（占位 Application，`currentStatus === "未投递"`），在返回结构里加一个显式的 `isEmpty: true` 标记，便于前端展示"未投递"空态。
- 排序：公司按 PRD 列出的顺序（阿里、腾讯、字节…），岗位按 `createdAt asc`，Stage 按 `time asc`（null 排最后）。

**验证清单**
- [ ] 只跑种子、不加任何 Application 的情况下，返回 10 家公司，全部 `isEmpty: true`
- [ ] 给"腾讯"新增一个 Application + 2 个 Stage 后，返回里腾讯 `isEmpty: false`，岗位 + Stage 结构正确
- [ ] 响应时间在 100ms 内（数据量小，应该瞬时）

---

### Step 2.5 — 统一错误处理 + 日志

**做什么**
- 建立 `lib/api.ts`（或 `lib/apiHelpers.ts`），导出：
  - `jsonOk(data, init?)` / `jsonError(code, message, status)` 两个响应工具
  - 一个 `withApiHandler` 高阶包装，自动 catch 未捕获异常 → 500 + 打 `console.error`
- 把 Step 2.1 ~ 2.4 的所有 route 重构到用这两套工具。
- 错误 code 约定：`VALIDATION_ERROR`、`NOT_FOUND`、`CONFLICT`、`INTERNAL_ERROR`。

**验证清单**
- [ ] 故意在某 route 抛异常，响应 500 + body 是 `{ error: { code: 'INTERNAL_ERROR', ... }}`，server 日志里有 stack
- [ ] 故意传非法 JSON body，响应 400 + code `VALIDATION_ERROR`
- [ ] 所有之前写好的 API 重新跑一遍 Step 2.1 ~ 2.4 的验证清单，全部仍通过（回归）

---

### Step 2.6 — 最小集成测试脚本（可选但强烈推荐）

**做什么**
- 在 `scripts/smoke-api.ts` 建一个烟测脚本：依次调用本地 dev server 的所有 non-AI API，create → read → update → delete 走一遍，打印每步 HTTP 状态。
- 允许使用 `node --experimental-fetch` 或 `tsx scripts/smoke-api.ts` 执行。
- 这不是正式测试框架，只是"一条命令证明 API 还活着"的兜底。

**验证清单**
- [ ] `pnpm tsx scripts/smoke-api.ts`（或等价命令）在 dev server 启动后一次性跑完，全部打印 2xx
- [ ] 脚本结束后，Prisma Studio 里看到的数据与脚本期望一致（或脚本做了清理）

---

### ✅ Phase 2 出口检查

- 所有 Step 2.1 ~ 2.6 已在 `progress.md` 勾选
- 在 `progress.md` 的 "Phase 2 出口" 勾选已完成
- 在 `architecture.md` 把 `app/api/**`、`lib/api.ts`、`scripts/smoke-api.ts` 移入已有区，并确认目录树与实际一致
- 当前状态摘要：8 个非 AI endpoint 全部可用、烟测脚本可一条命令跑完 CRUD

---

## Phase 3 · 三个主页面骨架（Day 3）

> **阶段目标**：三个页面都能展示后端真实数据，但**不做**新增/编辑（那放 Phase 4）。点击行/节点先只打开"空 Drawer"占位。

---

### Step 3.1 — 数据请求层封装

**做什么**
- 建立 `lib/fetcher.ts`：一个最小化的 `fetch` 封装，读 JSON、自动抛错。
- 建立 `lib/queries/` 目录，每个 API 对应一个 query 函数（例如 `getDashboardEvents(range)`）。**本阶段暂不引入 React Query**，先用 Next.js 的 Server Component + async fetch 直接拉数据（PRD / tech_stack 都没强制 React Query）。
- 在页面里用 `fetch(absoluteUrl, { cache: 'no-store' })` 或直接调 Prisma（Server Component 内），Agent 二选一并**在 `architecture.md` 的"关键契约点"新增一条"数据请求方式"**说明选择理由。

**验证清单**
- [ ] `pnpm typecheck`（或 `pnpm build`）通过
- [ ] 在 `/dashboard` 临时打印 `getDashboardEvents('7d')` 的返回，浏览器 Network 或 Server Log 能看到数据流

---

### Step 3.2 — `/dashboard` 首页：时间维度流程表格

**做什么**（严格按 UI.md 8.3）
- 在 `/dashboard` 页面上实现 PRD 5.1.1 的表格：日期 / 时间 / 事件类型 / 公司 / 部门 / 岗位 / 当前状态 / 关联简历 / 操作。
- 数据来源：`GET /api/dashboard/events?range=7d`。
- **外观要求**（UI.md 8.3）：
  - 整个表格放在一张大白卡片中，卡片圆角 `24px`（大卡片规格）
  - 卡片标题：`未来 7 天流程安排`，标题右侧放 tabs：`今日 / 明日 / 本周`（**tabs 仅渲染 UI，点击切换留到 Phase 7**）
  - 卡片顶部一条极淡的粉到黄渐变线作为装饰
  - 表格**浅分隔，不要传统重线框**
  - 行高 `60~68px`；hover 背景 `soft-panel`；hover 时 `translateY(-1px)`；选中时边框更明显、shadow 略增强
- **单元格视觉规则**（UI.md 8.3，严格遵守）：
  - **事件类型**（胶囊标签，`rounded-full`）：
    - 一面 / 二面 / 三面 / HR面 → **浅粉紫**（`secondary-lilac #E9D8FF` 底 + `text-primary` 字）
    - 笔试 / 测评 → **浅黄**（`secondary-yellow #FFF0B8` 底 + `text-primary` 字）
    - Offer 沟通 → **浅绿**（`secondary-mint #DDF5E8` 底 + `success` 字）
    - 其他 → `neutral` 底 + `text-secondary` 字
  - **当前状态**（柔和小标签，按 UI.md 4.7 状态使用规则）：
    - 待参加 → 浅灰紫底（`neutral #DDD6E3` 浅化）+ `text-secondary` 字
    - 已完成 → 浅灰底 + `text-secondary` 字
    - 已通过 → 浅绿底（`secondary-mint`）+ 深绿字（`success` 加深或直接用 `#4A9970` 系）
    - 未通过 → 浅红粉底（`danger` 浅化）+ 深粉字（`primary-strong`）
  - **关联简历**：显示简历名称小标签，未关联则浅灰字 `未关联`
- **操作列**：Phase 3 **暂不渲染**，Phase 4.4 正式接入"编辑 / 标记完成 / 删除"图标按钮并绑行为
- **行点击**：先只打印 `console.log('row click', rowId)`（Phase 4.3 会改成打开 Drawer）
- **空态**（UI.md 13.5）：使用克制温柔文案，例如"未来 7 天暂无流程安排，可以先把简历准备好 🌸"

**验证清单**
- [ ] 清空 Stage 表，首页显示空态文案
- [ ] 用 Prisma Studio 手动插入今天的 1 条 Stage（type="一面"，status="待参加"）+ 明天的 1 条 Stage（type="笔试"，status="已通过"），表格正常显示 2 行
- [ ] 事件类型胶囊颜色正确：一面=浅粉紫、笔试=浅黄（DevTools 取色确认 `#E9D8FF` / `#FFF0B8`）
- [ ] 状态小标签颜色正确：待参加=浅灰紫、已通过=浅绿
- [ ] hover 行时背景变为 `soft-panel #FFF1F7`、且行轻微上浮 1px
- [ ] 窗口缩放到 1280 宽度时表格不溢出横向滚动条；1440 / 1920 也正常
- [ ] 操作列**未渲染任何图标按钮**（防止和 Phase 4.4 重复）

---

### Step 3.3 — `/dashboard` 首页：其余 4 个模块占位

**做什么**（严格按 UI.md 第 8 章）
- **页面整体布局**（UI.md 8.1）：使用 **12 栏栅格**：
  - 左侧 **8 栏**：Step 3.2 的时间维度流程表格
  - 右侧 **4 栏**：从上到下依次是 `明日 AI 提醒` → `今日大厂动向` → `AI Copilot`
  - 底部或左下：`我的简历` 小卡片（UI.md 8.1：底部或左下）
- **顶部欢迎区**（UI.md 8.2）：
  - 标题：`今天也离理想 offer 更近一点`
  - 副标题：`把面试、流程和投递节奏整理得更轻松一点`
  - 右上角放一个日期 pill
  - 旁边放一个很小的星星或花朵 icon（lucide `Sparkles` 或 `Flower2`）
- **明日 AI 提醒卡片**（UI.md 8.4，占位实现）：
  - 背景：`linear-gradient(135deg, #FFF7D8, #FFF3FA)`
  - 左上角：小猫头像 icon（Phase 7.2 精修前先用 emoji 🐱 放浅粉圆形背景；UI.md 推荐 8.4 简单 SVG，Phase 7.2 替换）
  - 右上角：`Bell` 铃铛 icon
  - 标题：`明日提醒`
  - 内容：先写死 `明天暂无流程安排，可以安心休息一下。`（UI.md 空态文案原文）
  - Phase 6.6 接真实逻辑
- **今日大厂动向卡片**（UI.md 8.5，占位）：
  - 背景：浅粉紫到浅黄的非常淡渐变
  - 标题：`今日动向`，右上角 `Sparkles` 或 `Megaphone`
  - 内容占位：`暂无动向`
  - 底部小标签：`AI 摘要`
  - Phase 6.5 接真实逻辑
- **我的简历卡片**（UI.md 8.6，占位）：
  - 标题 `我的简历` + 副标题 `放 2~3 份常用版本就够了`
  - 列表项设计按 UI.md 8.6（左文件图标 + 中间名称/标签/时间 + 右预览/删除）
  - 有 Resume 数据（Step 2.1 验证前准备手动插的那条）时渲染列表行；无数据显示空态 `先放一份简历进来吧`
  - **上传、预览、删除按钮本阶段全部 `disabled`**（shadcn Button 的 disabled 属性），鼠标悬停显示 tooltip `即将开放`；Phase 5.2 再启用
  - Phase 5.2 接
- **AI Copilot 卡片**（UI.md 8.7，占位）：
  - 大卡片，背景非常淡的粉紫渐变
  - 左上标题 `AI Copilot` + 小猫 icon（同上，Phase 7.2 换）
  - 多行输入框，placeholder：`粘贴面试邮件、JD 或面试转录，我来帮你整理 ✨`（UI.md 原文）
  - 输入框圆角 `18px`，背景偏白
  - 下方 4 个胶囊快捷按钮：`解析面试邮件` / `解析 JD` / `生成面试题` / `生成复盘`
  - 按钮点击暂不响应；Phase 6.3 接
- 所有卡片圆角 `20px`（中小卡片）或 `24px`（大卡片，UI.md 5.4）、shadow 用 `shadow-soft`、hover 时换 `shadow-hover` 并上浮 2px（UI.md 13.1）

**验证清单**
- [ ] 首页用 **12 栏网格**：左 8 右 4；左上为表格，右侧从上到下依次为 明日提醒 / 大厂动向 / Copilot；我的简历在左下或底部
- [ ] 顶部欢迎区文字、日期 pill、装饰 icon 全部到位
- [ ] 明日提醒卡背景确为粉黄渐变（DevTools 确认 linear-gradient 参数）
- [ ] 今日动向卡、Copilot 卡、简历卡按 UI.md 位置和背景渲染
- [ ] Copilot 的 placeholder 文案与 UI.md 原文 100% 一致
- [ ] 所有按钮可点击但无副作用（console 无报错）
- [ ] 视觉检查：5 个模块的卡片圆角、阴影、间距一致，符合 UI.md 5.3 / 5.4 / 13.1

---

### Step 3.4 — `/calendar` 月视图

**做什么**（严格按 UI.md 第 9 章）
- **页面布局**（UI.md 9.2）：上方标题 `日历` + 月份切换；左侧或上方月视图；下方或右侧放"选中日期事件列表"
- **日历外观**（UI.md 9.3）：干净的月视图；每格足够留白；有事件时用**小胶囊标签或 1~2 条小色条**表示（**不是小圆点**）
- **颜色规则**（UI.md 9.4，严格）：
  - 面试类事件（一面/二面/三面/HR面）→ `secondary-lilac` 浅粉紫小标签
  - 笔试 / 测评 → `secondary-yellow` 浅黄小标签
  - Offer 沟通 → `secondary-mint` 浅绿小标签
- 一格事件最多 3 条，超出用"+N"省略
- 通过 `GET /api/calendar/events?start=该月第一天&end=该月最后一天` 拉数据
- **交互**（UI.md 9.5）：
  - 点击日期格：右侧展示当日事件列表（本步只做"展示"，不做"新增"）；Phase 4.4 再接新增入口
  - 点击事件：先只 `console.log(eventId)`（Phase 4.3 改成打开 Drawer）
  - 日期格 hover：背景轻微变亮（用 `soft-panel` 或 `app-bg-secondary`）
  - 月份切换（上/下月）要正确重新拉数据
- 使用 `react-day-picker`（shadcn `calendar` 组件封装）

**验证清单**
- [ ] 默认打开当月，能看到 Step 3.2 插入的数据（今天、明天两条）以小胶囊显示在对应格
- [ ] 切到上月/下月，日历网格正确刷新
- [ ] 事件胶囊颜色正确：一面=浅粉紫、笔试=浅黄
- [ ] 某天事件超过 3 条时显示 "+N" 省略标记
- [ ] 点日期格，右侧/下方的事件列表正确刷新为当日事件
- [ ] 月份切换后 500ms 内能看到新数据

---

### Step 3.5 — `/companies` 大厂流程页

**做什么**（严格按 UI.md 第 10 章）
- **页面结构**（UI.md 10.2）：顶部大标题 `大厂进度` + 副标题 `从公司维度查看你的所有流程推进情况`；主体一张大白卡片，内部是流程图区域
- **核心布局**（UI.md 10.3）：纵轴 10 家公司名（按 PRD 顺序：阿里/腾讯/字节/美团/百度/京东/拼多多/小红书/快手/滴滴），横轴流程节点
- **单行公司样式**（UI.md 10.4）：
  - 未投递公司：公司名右侧显示很淡的标签 `未投递`，再一行浅灰文字 `还没有在这家公司开始流程`
  - 已投递公司：展示岗位流程条，左侧"部门名 + 岗位名"，右侧横向流程节点
- **流程节点样式**（UI.md 10.5）：**圆角胶囊矩形，不是小圆点**；高度 `34~38px`、宽度自适应、节点间用细线连接
  - 节点顺序（PRD 5.3.5）：已投递 → 笔试 → 测评 → 一面 → 二面 → 三面 → HR面 → Offer → 挂了
  - 节点颜色按 UI.md 10.5（PRD 5.3.6 对齐）：
    - 已通过 → 浅绿（`secondary-mint #DDF5E8`）
    - 当前进行中 → 主粉色（`primary #F3AFCB`）+ 白字 + 轻微 glow（`box-shadow: 0 0 12px rgba(243,175,203,0.4)`）
    - 未开始 → 浅灰紫（`neutral #DDD6E3`）
    - 未通过 → 浅红粉（`danger #E58CA4` 浅化底）
- **页面可读性**（UI.md 10.6）：公司行间距 `20px`、同公司不同岗位间距 `10px`、左侧公司列固定宽 `140~180px`、右侧流程区允许横向滚动
- **交互**（UI.md 10.5 / 10.7）：
  - 节点 hover：上浮 2px + 阴影略增强
  - 节点 click：`scale(1.02)` + 先 `console.log(stageId)`（Phase 4.3 改成打开 Drawer）
  - 岗位流程条右侧放 `MoreHorizontal` 更多菜单（UI.md 10.7），**本步只渲染图标，不绑菜单逻辑**（Phase 4.4 再接编辑/删除）
  - 页面右上角 "新增申请" 按钮（UI.md 10.7），**本步只渲染按钮，不绑逻辑**（Phase 4.4 再接）
- 数据来源：`GET /api/companies/progress`

**验证清单**
- [ ] 清空 Stage 后，10 家公司全部显示"未投递"标签 + 浅灰提示文字
- [ ] 给"腾讯"的种子 Application 加 `一面(已通过)` + `二面(当前进行中)` 两条 Stage，腾讯行渲染流程条，已通过=浅绿、进行中=主粉色+白字
- [ ] 流程节点确为**圆角胶囊矩形**（量取高度 34~38px、`border-radius ≥ 17px`）
- [ ] 节点之间有细线连接（不是纯空白）
- [ ] 左侧公司列宽度 `140~180px`，公司行间距 20px
- [ ] 横向溢出时流程区滚动，但左侧公司列不动（不破布局）
- [ ] hover 节点有上浮 + 阴影增强

---

### ✅ Phase 3 出口检查

- 所有 Step 3.1 ~ 3.5 已在 `progress.md` 勾选
- 在 `progress.md` 的 "Phase 3 出口" 勾选已完成
- 在 `architecture.md` 把三页 page.tsx、`components/dashboard/**`、`components/calendar/**`、`components/companies/**`、`lib/fetcher.ts`、`lib/queries/**` 移入已有区
- 在 `architecture.md` 关键契约点补一项 "**数据请求方式**"（Step 3.1 决策：Server Component 直调 Prisma 还是走 fetch API route）
- 当前状态摘要：三页只读展示跑通、点击行/事件/节点有 console.log 占位

---

## Phase 4 · 全局 Drawer + 手动 CRUD（Day 4）

> **阶段目标**：Drawer 能在三个页面任一处被打开、展示详情、编辑、保存，保存后三页数据同步刷新。手动新增/删除事件全部跑通。

---

### Step 4.1 — 建立全局 Drawer 容器

**做什么**（严格按 UI.md 第 11 章）
- 用 shadcn `sheet` 组件（right 侧滑出）建立一个全局 Drawer 容器
- **外观**（UI.md 11.1）：从右侧滑出、宽度 **440px**、背景近纯白（`surface-bg #FFFFFF`）、**左侧大圆角**（`rounded-l-3xl` 即 24px+）、顶部固定、内容区可滚动、关闭按钮为圆形 icon button
- **动效**（UI.md 11.3）：Drawer 打开 `240ms ease-out`；内部模块轻微 stagger 淡入（Framer Motion 可选）
- 用 **URL search param** 管理"当前打开什么 Drawer + 传入什么 id"（`?drawer=stage&id=xxx` 或 `?drawer=application&id=xxx`）。好处是刷新页面能恢复状态、能复制链接
- Drawer 根据 `type` 路由到不同的内容组件：`StageDrawerContent`（流程节点详情）/ `ApplicationDrawerContent`（岗位详情）。本阶段先做 StageDrawerContent
- 在 `app/layout.tsx` 挂一次即可，三个页面都能触发
- 决策需同步：**在 `architecture.md` 的"关键契约点"新增一条"Drawer 状态管理方式：URL search param（`?drawer=...&id=...`）"**

**验证清单**
- [ ] 在 `/dashboard`、`/calendar`、`/companies` 任一页面把 `?drawer=stage&id=xxx` 拼到 URL，Drawer 自动打开
- [ ] 点 Drawer 遮罩 / ESC 关闭，URL 的 drawer / id 参数自动清掉
- [ ] Drawer 宽度量取确为 440px，左侧圆角明显
- [ ] 打开动效时长约 240ms（DevTools Performance 可看）
- [ ] Drawer 内部内容可滚动，底部按钮吸底不被遮挡

---

### Step 4.2 — StageDrawerContent：展示 + 编辑基础信息

**做什么**
- 根据 `id` 拉取 `GET /api/applications/:id`（join 了 stages 与 resume）+ 找到对应 stage。
- 展示 PRD 5.4.2 A（基础信息）与 C（关联简历，只展示名称+标签+预览入口，不做切换——切换放 Phase 5）。
- 用 `react-hook-form` + zod 管理表单状态，dirty 态右上角显示 UI.md 约定的"未保存"小徽章。
- 保存按钮调 `PATCH /api/applications/:id`（改公司/部门/岗位）+ `PATCH /api/stages/:id`（改时间/会议链接/状态）。
- 保存成功后：关闭 Drawer + toast "保存成功" + 触发三页面重新拉数据（**关键**：用 `router.refresh()` 或 React Query 的 invalidate）。
- 保存失败：toast 错误消息，表单保持 dirty。

**验证清单**
- [ ] 打开某 Stage 的 Drawer，能看到正确字段
- [ ] 改公司名 + 改时间 + 改状态，点保存后，首页表格 / 日历 / 公司页三处都能看到更新
- [ ] 不做任何修改直接点保存，按钮应**禁用**（非 dirty 状态）
- [ ] 故意让后端返错（把 status 传非法枚举），前端有可读 toast 且表单不 reset

---

### Step 4.3 — 接入三页面的行/节点点击 → 打开 Drawer

**做什么**
- 把 Phase 3 里三个页面中 `console.log` 的行点击 / 日历事件点击 / 公司页节点点击，全部改成"设置 URL 的 `drawer` 和 `id` 参数"。
- 日历单元格点击（空白处）改成打开"新增事件 Drawer"（下一步 4.4）。

**验证清单**
- [ ] 首页点表格行 → Drawer 打开、字段正确
- [ ] 日历点事件 → Drawer 打开、字段正确
- [ ] 公司页点节点 → Drawer 打开、字段正确
- [ ] 同一个 Stage 从三个入口打开，内容一致

---

### Step 4.4 — 手动新增 / 删除事件 + 表格操作列接入

**做什么**
- **首页表格操作列**（承接 Step 3.2 推迟的部分）：在表格"操作"列渲染 3 个 lucide-react 小型圆角 icon 按钮：
  - `Eye` 查看详情（点击效果等同 Phase 4.3 的行点击——打开 Stage Drawer）
  - `Check` 标记完成（点击调 `PATCH /api/stages/:id` 把 status 置 `已完成`，成功后刷新）
  - `Pencil` 编辑（点击打开 Stage Drawer 且直接进入编辑态）
  - `Trash2` 删除（点击弹二次确认 Dialog，确认后调 `DELETE /api/stages/:id`）
- **新增事件**：
  - 首页表格顶部工具条放一个"新增事件"按钮（`Plus` 图标 + 文字），点击打开**新建模式的 Drawer**（空表单）
  - 日历页点击空白日期也打开新建 Drawer，**预填好日期**
  - 公司页岗位条右侧 `MoreHorizontal` 菜单里放"新增流程节点"项，打开新建 Drawer 并预填 `applicationId`
  - 公司页右上"新增申请"按钮：打开新建 Drawer，要求先填公司/部门/岗位（创建新 Application），再可选地加第一个 Stage
- **新建 Drawer 保存逻辑**：若 `applicationId` 未指定，前端先用 `combobox` 让用户选已有 Application 或新建一个（查询条件：同 company+department+role 已存在则复用，否则创建新 Application）；再创建 Stage。操作原子化（一次 POST /api/applications 后再 POST /api/stages，失败时前端保留表单不丢）
- **删除入口**：
  - 首页表格操作列（上文已说）
  - 公司页节点 hover 显示小 `Trash2` 按钮；或在 `MoreHorizontal` 菜单里放"删除节点" / "删除岗位"
  - 日历事件胶囊 hover 或点击后在 Drawer 内点"删除"
  - 所有删除都**二次确认 Dialog**（文案："确认删除该 XXX？此操作不可撤销。"）

**验证清单**
- [ ] 首页表格操作列 3 个 icon 按钮渲染到位，图标正确（Eye/Check/Pencil/Trash2）
- [ ] 点 `Check` 标记完成：Stage status 从"待参加"变"已完成"，三页刷新
- [ ] 从首页"新增事件"按钮新增一条事件（含公司/部门/岗位/时间/类型），保存后三页都能看到
- [ ] 从日历页点 7 天后的空白日期，新建 Drawer 的日期字段已预填
- [ ] 从公司页右上"新增申请"按钮：创建一条"阿里-产品-产品经理" Application，可选加一个"一面"Stage，保存后公司页"阿里"行刷新
- [ ] 从公司页"阿里"的 `MoreHorizontal` 菜单"新增流程节点"，正常添加
- [ ] 删除一条 Stage（从表格 Trash2 或 Drawer 内删除）后，三页立即消失
- [ ] 删除一条 Application（公司页 `MoreHorizontal` → 删除岗位）后，连带 Stage 一并消失（级联生效）
- [ ] 误点删除 Dialog 的"取消"，数据不变
- [ ] 操作列的 Trash2 点击要弹二次确认 Dialog，不能直接删

---

### ✅ Phase 4 出口检查

- 所有 Step 4.1 ~ 4.4 已在 `progress.md` 勾选
- 在 `progress.md` 的 "Phase 4 出口" 勾选已完成
- 在 `architecture.md` 把 `components/drawer/**` 移入已有区
- 在 `architecture.md` 关键契约点补一项 "**Drawer 状态管理方式**"（Step 4.1 决策：URL search param 还是 Context）
- 当前状态摘要：Drawer 可从三页任一入口打开、基础信息编辑保存闭环通、手动新增/删除事件可用

---

## Phase 5 · Resume 上传预览与关联（Day 4 晚 / Day 5 上午）

> **阶段目标**：PDF 上传、iframe 预览、文本提取、在 Drawer 中切换关联简历，全部跑通。

---

### Step 5.1 — 实现 `POST /api/resumes/upload`

**做什么**
- 接收 `multipart/form-data`，字段 `file`（PDF）+ `name`（字符串）+ `tag`（枚举）。
- 存文件到仓库根目录的 `uploads/`（PRD 允许）；文件名用 `cuid + 原扩展名` 防冲突。
- 用 `pdf-parse` 提取文本，失败不阻断，把 `extractedText` 留 null 并返回一个 `warning` 字段。
- 返回 Resume 记录（含 `fileUrl = /api/resumes/:id/file`）。
- 额外实现 `GET /api/resumes/:id/file`：读取本地文件流式返回，`Content-Type: application/pdf`。
- 文件大小上限 10MB，超出返 413。

**验证清单**
- [ ] 用 curl 上传一个本地 PDF，响应含 id + extractedText（取前 200 字 console.log 验证）
- [ ] 上传非 PDF（png）返 400
- [ ] 上传 >10MB 文件返 413
- [ ] 上传一个加密/损坏 PDF，返 200 但 `extractedText === null` + warning
- [ ] 浏览器访问 `/api/resumes/:id/file` 直接加载 PDF

---

### Step 5.2 — 首页"我的简历"卡片接入

**做什么**
- 卡片内列出所有 Resume（名称 + 标签 + 上传时间 + 缩略预览入口）。
- 上传按钮打开 shadcn `dialog`，含文件选择 + 名称输入 + 标签 select。
- 每条简历有"预览"（打开新弹框内嵌 iframe）、"改名/改标签"（inline 或弹框）、"删除"（带引用校验的二次确认）。

**验证清单**
- [ ] 上传 2 份 PDF，卡片列表显示 2 条
- [ ] 点预览，弹框内 iframe 能看到 PDF 内容
- [ ] 改名后列表立即刷新
- [ ] 删除一份未被引用的简历成功；删除被 Application 引用的简历显示"该简历被 X 使用，无法删除"

---

### Step 5.3 — Drawer 中切换关联简历

**做什么**
- 在 `StageDrawerContent` 的"关联简历"区域加一个 select，列出所有 Resume。
- 切换后，`PATCH /api/applications/:id` 更新 `linkedResumeId`。
- 下方显示该简历的"预览"按钮，点击复用 Step 5.2 的 iframe 弹框。

**验证清单**
- [ ] 打开 Drawer，select 显示所有 Resume，初始值是当前 linkedResumeId
- [ ] 切换后保存，首页表格"关联简历"列同步刷新
- [ ] 切换成"无"（null），表格列显示空白或"未关联"

---

### ✅ Phase 5 出口检查

- 所有 Step 5.1 ~ 5.3 已在 `progress.md` 勾选
- 在 `progress.md` 的 "Phase 5 出口" 勾选已完成
- 在 `architecture.md` 把 `app/api/resumes/upload/**`、`app/api/resumes/[id]/file/**`、`uploads/` 目录移入已有区
- 当前状态摘要：PDF 上传 + 原生 iframe 预览 + 文本提取 + 岗位关联闭环通

---

## Phase 6 · 豆包 / 火山方舟 AI 接入（Day 5）

> **阶段目标**：5 个 AI 能力全部可用；所有 AI 结果都走"草稿态 → 用户编辑 → 保存"三段式。
>
> **模型信息**：底层模型是 **DeepSeek 3.2**，通过火山方舟（Ark）的 Endpoint 统一接入。因此代码中的"豆包 / Doubao"只是历史命名，实际走的是 Ark 平台 + DeepSeek 模型。环境变量名保留 `DOUBAO_*` 以保持向后兼容，但语义等价于火山方舟官方示例里的 `ARK_*`。
>
> **开工前硬性条件**：`.env.local` 必须包含以下三项，且 Step 0.6 连通性测试已通过。
>
> | 变量 | 值 / 来源 | 状态 |
> |---|---|---|
> | `DOUBAO_API_KEY` | 用户于 2026-04-18 提供，已写入 `.env.local`（等价于官方 `ARK_API_KEY`） | ✅ 已配置 |
> | `DOUBAO_BASE_URL` | `https://ark.cn-beijing.volces.com/api/v3`（火山方舟北京区公网） | ✅ 已配置 |
> | `DOUBAO_MODEL` | `ep-20260418165808-rvgk2`（用户的 Endpoint ID，后端绑定 DeepSeek 3.2） | ✅ 已配置 |
>
> ### 🔧 调用契约（所有 AI route 必须遵守）
>
> **接口路径**：由 **Step 0.6 冒烟测试的结果**决定，以 `architecture.md` 「关键契约点 · Ark API 调用路径决策」为准。
> - 若 Step 0.6 测出 `/chat/completions` + `response_format: json_object` 能稳定返回合法 JSON → 全项目统一走 `/chat/completions`（推荐）
> - 若 Step 0.6 测出 `/chat/completions` 不支持或 JSON 约束失效，而 `/responses` 可用 → 全项目统一走 `/responses`
> - 若两者都能用 → 默认选 `/chat/completions`（更简单、更贴近 OpenAI 生态、更多工具链支持）
>
> **通用约束**（不论选哪条路径）：
> - 请求方法：POST
> - 请求头：`Authorization: Bearer ${DOUBAO_API_KEY}` + `Content-Type: application/json`
> - `model`：`${DOUBAO_MODEL}`（Endpoint ID）
> - **不**传 `stream`（本项目不需要流式）
> - **不**传 `tools`（本项目不需要联网搜索；daily-intel 用 `lib/fakeIntelSource.ts` 本地资讯）
> - 期望 JSON 输出时：按 Step 0.6 测出的可行方式约束（`response_format` / `text.format` / 或仅靠 prompt，择一）
> - 超时：30 秒，触发 `AI_CALL_TIMEOUT`
>
> ### 🔒 API Key 安全红线
> - 只能写入 `.env.local`（该文件已在 `.gitignore`）
> - 严禁出现在任何 `app/**/page.tsx`、`components/**`、`README.md`、`implementation_plan.md`、提交信息等会被提交的文件里
> - 严禁 `console.log(process.env.DOUBAO_API_KEY)`，也不能把它泄露进 `AIRun.errorMessage` 或任何日志
> - `lib/llmClient.ts` 的 `callAI` 在 catch 时要显式把 `Authorization` 头从日志里剥掉
>
> ### 💰 Token 成本预算意识（重要）
> - DeepSeek 3.2 虽便宜，但 Step 0.6 冒烟测试 + Phase 6 联调 + Phase 7 6 个闭环验收期间，累计调用可能到几百上千次
> - **调试期间每个 AI 请求成功/失败后，都要把 AIRun 记录通过 Prisma Studio 查一眼**，避免盲测烧 token
> - 同一份 prompt 调通一次后，**不要反复触发验证**；验证清单里每条只要求"跑一次成功"即可
> - 遇到 5xx/网络错误不要无脑重试，先看 AIRun 表的 errorMessage 定位问题
> - 建议：Phase 6 开发时在一个单独浏览器标签常驻 `pnpm dlx prisma studio` 的 AIRun 页面，实时观察调用情况

---

### Step 6.1 — 建立 `lib/llmClient.ts` + 日志

**做什么**
- `lib/llmClient.ts` 导出函数 `callAI({ taskType, systemPrompt, userPrompt, expectJson })`（保留兼容别名 `callDoubao`），严格遵守 Phase 6 开头的"调用契约"：
  - **接口路径**：**读取 `architecture.md` 关键契约点 · Ark API 调用路径决策**（该决策由 Step 0.6 产出），按其选定的路径拼 URL，**不要硬编码**
  - **请求头**：`Authorization: Bearer ${process.env.DOUBAO_API_KEY}` + `Content-Type: application/json`
  - **请求体**（按路径选择对应结构）：
    - 如走 `/chat/completions`：`{ model, messages: [{role:'system',content:systemPrompt}, {role:'user',content:userPrompt}], (response_format: {type:'json_object'} if expectJson) }`
    - 如走 `/responses`：`{ model, input: [{role:'system',content:[{type:'input_text',text:systemPrompt}]}, {role:'user',content:[{type:'input_text',text:userPrompt}]}], (text:{format:{type:'json_object'}} if expectJson 且 Step 0.6 已验证可用) }`
    - `model` 统一取 `process.env.DOUBAO_MODEL`（Endpoint ID，形如 `ep-20260418165808-rvgk2`）
    - **不传** `stream` / `tools` 字段
  - **响应解析**（按路径选择）：
    - `/chat/completions` → `response.choices[0].message.content`
    - `/responses` → 按 Step 0.6 实测出的 output 结构提取文本（通常是遍历 `response.output[*]` 找 `type === 'message'` 的项、读 `content[*].text`）
  - **超时**：`AbortSignal.timeout(30000)`（30 秒），超时抛 `AI_CALL_TIMEOUT`
  - **日志**：无论成功失败，都在 `AIRun` 表写一条（`taskType` / `inputText=userPrompt` / `outputText=解析后的字符串` / `outputJson=JSON.parse 结果或 null` / `status` / `errorMessage`）
  - **错误分类**：`AI_CALL_FAILED`（网络/4xx/5xx）、`AI_CALL_TIMEOUT`、`AI_PARSE_FAILED`（expectJson 但 JSON.parse 失败）
  - **日志脱敏**：catch 中 `console.error` 时禁止把 `Authorization` 头和 Key 值打进去
- 建立 `lib/prompts.ts`，把 PRD 9.1 ~ 9.5 的 **system prompt 原文原样**放进去作为常量导出；**不要改动一个字**。

**验证清单**
- [ ] 在临时 route `/api/ai/_ping` 调 `callAI`（expectJson=true，userPrompt="回复一个包含 ok:true 的 JSON 对象"），能收到真实返回
- [ ] `AIRun` 表多一条 status=success 的记录，outputText 非空、outputJson 被正确解析
- [ ] 把 env 里的 key 改错一位，调用失败 + AIRun 表多一条 status=failed + errorMessage 非空且**不包含完整 Key**
- [ ] 把 `DOUBAO_BASE_URL` 改成不可达地址，30 秒内抛 `AI_CALL_TIMEOUT` 或立即抛 `AI_CALL_FAILED`，不阻塞
- [ ] 行为与 Step 0.6 的冒烟测试一致（同路径 + 同请求结构）
- [ ] 测完把 `/api/ai/_ping` 与 `scripts/test-ark-api.ts` 都删掉

---

### Step 6.2 — `POST /api/ai/parse-email`

**做什么**
- 接收 `{ inputText: string }`。
- 用 PRD 9.1 的 system prompt + user prompt 模板调用 `callDoubao`（expectJson=true）。
- 用 zod schema（Phase 1.4 已建）解析输出；解析失败返 `AI_PARSE_FAILED` 给前端。
- 成功时**不落库**，直接把解析结果返给前端作为"草稿"。
- 字段 `stageType` 必须是 PRD 规定的 9 个中文枚举之一，否则视为解析失败。

**验证清单**
- [ ] curl 传一段典型面试邮件文本（手工构造），返回 JSON 含公司/部门/岗位/stageType/time
- [ ] 传一段完全无关文本（比如"我今天吃了饭"），所有字段 null 或返回合理
- [ ] AIRun 表都有对应日志

---

### Step 6.3 — AI Copilot 前端接入（解析邮件 + 解析 JD + 生成面试题 + 生成复盘）

**做什么**
- 首页 AI Copilot 卡片的 4 个快捷按钮接线：
  - **解析面试邮件**：点击 → 调 6.2 → 返回的草稿打开一个专用的"新建 Stage Drawer"并预填字段（companyName / departmentName / roleName / stageType / time / meetingLink / jdText）→ 用户可编辑 → 保存时走 Phase 4.4 的"新建"路径，同时创建 Application（如果不存在同 company+department+role）+ Stage。
  - **解析 JD**：要求用户选择一个已有的 Application（shadcn `combobox`），粘贴 JD 文本 → 调 `POST /api/ai/parse-jd`（Step 6.4 要实现）→ 返回 `jdSummary / jdKeywords / expectedSkills` → 进入 Drawer 的 JD 区 → 用户编辑 → 保存走 `PATCH /api/applications/:id`。
  - **生成面试题**：要求用户选一个 Application（**不是 Stage**，因为面试题属于"岗位题库"，一个 Application 共享一套题库；不同 Stage 的面试共用）→ 调 `POST /api/ai/generate-questions`（入参 `applicationId`，后端从中取出 `jdText` + `linkedResume.extractedText`）→ 返回题目列表 → 展示为可编辑的 shadcn `textarea` 列表（每题一行，UI.md 11.2 E：带小编号圆点或数字标签的简洁卡片）→ 保存到 **Application.`interviewQuestions`**（Phase 1.1 已预建；`String?` 字段存 JSON 字符串化的 `string[]`）
    - Drawer 展示位置：在 `StageDrawerContent` 的 "E. AI 面试辅助区"（UI.md 11.2 E）展示——**所有属于同一 Application 的 Stage 都能看到这份共享题库**
    - 不需要新建 migration（Phase 1.1 已建好）
  - **生成复盘**：要求用户选一个 Stage（复盘是某一场面试专有）并粘贴转录文本 → 调 `POST /api/ai/review` → 返回 `questionSummary / answerSummary / suggestion` → 进入 Drawer 的 "F. AI 面试复盘区"（UI.md 11.2 F：3 个小卡片）→ 编辑保存到 Stage 的三个复盘字段。

**验证清单**
- [ ] 4 个按钮点击都有 loading 态，不会重复提交
- [ ] AI 失败时有清晰 toast，不破坏用户已有编辑
- [ ] 解析邮件 → 编辑 → 保存后，三页面出现新事件
- [ ] 解析 JD 保存后，Drawer 重新打开看到 jdSummary 已落库
- [ ] 生成面试题保存后，Drawer 再次打开能回显
- [ ] 生成复盘保存后，对应 Stage 的三字段写入

---

### Step 6.4 — 补齐 `parse-jd` / `generate-questions` / `review` 三个 AI API

**做什么**
- 各自实现一个 route，流程与 6.2 完全一致：调 `callDoubao` + zod 解析 + 返回草稿 + 写 AIRun。
- `generate-questions` 的 userPrompt 要拼接 `jdText` + 关联简历的 `extractedText`（允许为空）。
- `review` 的入参 `{ transcriptText, stageId }`。

**验证清单**
- [ ] 每个 endpoint 用 curl 构造典型输入，能收到结构正确的 JSON
- [ ] 输入为空或过短时，返回 4xx 而非 500
- [ ] AIRun 表记录齐全

---

### Step 6.5 — `GET /api/ai/daily-intel` + 首页"今日大厂动向"

**做什么**
- Route 内部按以下缓存策略：
  - `IntelSummary.date` 字段存 "**生成日（本地时区 YYYY-MM-DD 字符串）**"——跨 0 点自动失效
  - 查询流程：用 `format(new Date(), 'yyyy-MM-dd')`（本地时区）计算今天的 date 字符串 → 查 `IntelSummary.date = 今天` 的记录 → 命中则直接返回 `summaryText`（不调 AI）；未命中则调 AI 后 upsert
  - 跨 0 点后再访问：新 date 查不到 → 自动重新调 AI 生成
- 若命中缓存但用户希望强制重算：**不在本阶段提供**（PRD 没要求；要避免过度设计）
- 若未命中，读取一个"原始资讯列表"——本项目没有真实爬虫，**在 `lib/fakeIntelSource.ts` 里放一个硬编码的示例资讯数组**（Agent 自行写 5~8 条，看起来像"今日腾讯开放产品方向暑期实习"这类）；后续如需接真源可替换。调 `callAI`（PRD 9.5 的 prompt，**注意这个不是 JSON 输出，是纯文本 50~90 字摘要**），把结果写入 `IntelSummary` 并返回。
- 前端首页"今日大厂动向"卡片从该 API 取数据展示。

**验证清单**
- [ ] 第一次加载首页：调一次豆包、IntelSummary 表多一条、卡片显示摘要
- [ ] 刷新首页：不再调豆包（AIRun 表没新增）、卡片内容不变
- [ ] 把今天的 IntelSummary 删掉再刷新，重新调用豆包、表里重新有记录

---

### Step 6.6 — "明日 AI 提醒"模块

**做什么**
- 首页"明日 AI 提醒"卡片：Server Component 内查询明天的 Stage 列表：
  - 如果为空 → 显示"明天暂无流程安排，可以安心休息一下。"（UI.md 8.4 空态文案原文）（不调 AI）
  - 如果非空 → 把事件列表拼成一段 userPrompt，走 `callAI`（**用一个新 prompt**，Agent 参考 PRD 5.1.2 的示例自行写系统提示词，产出 50~80 字自然语言提醒）→ 卡片展示
- **缓存策略（按用户反馈：事件一变自动失效重算）**：
  - 使用 Phase 1.1 已建的 `TomorrowTipCache` 表（`date String @unique` + `tipText` + `eventsHash` + `createdAt` + `updatedAt`）
  - `eventsHash` 是"明天的 Stage 列表（按 id + time + type + status 排序后 stringify 再 SHA-256）"的哈希，用来判断事件集合是否变化
  - 查询流程：**按本地时区**计算"明天的日期字符串"（`YYYY-MM-DD`）→ 计算当前明天的 `eventsHash` → 查表 `date=明天字符串` 的记录 → 若存在且 `eventsHash` 匹配则直接返回 `tipText`（不调 AI）；否则调 AI 并 upsert 更新 tipText + eventsHash
  - **事件变更触发失效（被动失效）**：不需要额外代码——只要明天的 Stage 有任何 CRUD（Phase 4.4 的手动接口 + Phase 6.3 的 AI 解析入库），下次访问首页时 `eventsHash` 自动不匹配、自动重算。**无需主动清缓存**
  - 用户在卡片右上角点一个 `RefreshCw` 图标可强制重算（删除当日缓存后重拉）
  - 不需要新建 migration（Phase 1.1 已建好）；需要建的是 `lib/queries/getTomorrowTip.ts` 或 `app/api/ai/tomorrow-tip/route.ts`（Agent 自选）
  - 在 `architecture.md` 关键契约点新增一条 "**明日提醒缓存方案：TomorrowTipCache + eventsHash 被动失效**"

**验证清单**
- [ ] 明天无事件时显示 `明天暂无流程安排，可以安心休息一下。`，AIRun 表无新增
- [ ] 明天有 2 条事件时，首次访问调用 AI、卡片显示拼接句、TomorrowTipCache 新增一条记录
- [ ] 不动数据再刷新，AIRun 表无新增、卡片内容不变
- [ ] 在 Prisma Studio 里改明天某 Stage 的 time（或新增一条明天的 Stage），再刷新首页：eventsHash 变化 → 自动重新调 AI → tipText 更新
- [ ] 点卡片右上 `RefreshCw` 按钮强制重算：AIRun 表新增、tipText 更新
- [ ] 本步在 `architecture.md` 关键契约点新增 "**明日提醒缓存方案：TomorrowTipCache + eventsHash 被动失效**"

---

### ✅ Phase 6 出口检查

- 所有 Step 6.1 ~ 6.6 已在 `progress.md` 勾选
- 在 `progress.md` 的 "Phase 6 出口" 勾选已完成
- 在 `architecture.md` 把 `lib/llmClient.ts`、`lib/prompts.ts`、`lib/fakeIntelSource.ts`、`app/api/ai/**` 移入已有区
- 在 `architecture.md` 关键契约点更新 "**明日提醒缓存方案**"（Step 6.6 决策：复用 IntelSummary 表还是新增 AiTipCache 表）
- 若 Step 6.3 给 Stage / Application 新增了字段（例如 `interviewQuestions`），在 `architecture.md` 的目录树与关键契约点都要反映，并附相应 Prisma migration 已提交
- 当前状态摘要：5 个 AI 能力全部接入、草稿态交互到位、AIRun 日志完整

---

## Phase 7 · 打磨与验收（Day 6）

> **阶段目标**：所有 loading / 空态 / 错误提示到位；UI 精修到 UI.md 水准；PRD 第 13 章的 6 个闭环全部走通。

---

### Step 7.1 — 全局状态规范化

**做什么**
- 列一张清单，遍历每个页面/卡片/Drawer 的：
  - loading：骨架屏或 spinner（shadcn `skeleton`）
  - 空态：插画/文案/CTA
  - 错误态：可重试
  - 保存成功 / 失败：统一走 shadcn `toast`（`sonner`）
- 网络失败时全局 toast "网络异常，请稍后重试"，不让页面白屏。

**验证清单**
- [ ] 把 dev server 短暂 kill 掉，前端尝试发请求时出现错误 toast 且不崩
- [ ] 首次进首页用慢网（Chrome DevTools Network 调 Slow 3G）能看到骨架屏
- [ ] 清空所有数据后，三个页面都显示各自的空态插画

---

### Step 7.2 — UI 精修（对照 UI.md 地毯式走查）

**做什么**
- 建立一张"UI.md 逐节核对表"，逐节核对：
  - **第 4 章配色**：所有色值与 UI.md 4.1~4.6 原值一致（DevTools 抽样 10 处），状态颜色规则（4.7）在表格/日历/公司页都生效
  - **第 5 章字体排版**：字体链、字号层级、间距、行高、圆角
  - **第 6 章全局布局**：左导航 88px / 圆角 28px / 选中态 scale 1.04、Header 薄轻通透
  - **第 8 章 Dashboard**：12 栏布局、欢迎区文案、5 个卡片逐项
  - **第 9 章 Calendar**：月视图留白、事件胶囊颜色、交互
  - **第 10 章 Companies**：胶囊节点（不是圆点）、连接细线、公司列宽 140~180px
  - **第 11 章 Drawer**：440px / 左大圆角 / 顶部固定 / 内容结构 A~F 齐全
  - **第 12 章图标**：lucide-react 图标映射逐一核对（12.2）
  - **第 13 章微交互**：hover/active/selected 的 scale 值、loading 的 3 个浅粉小圆点
- 正式小猫 SVG（UI.md 8.4 / 12.3）：24×24 或 32×32 内联 SVG，圆脸 + 双耳 + 双眼 + 简单嘴巴，主色 `primary`，浅粉圆底；替换 Phase 3.3 的 emoji 占位
- 小猫动效（UI.md 8.4）：默认 scale 1→1.03→1 呼吸动画、hover 上浮 -2px、AI 处理中轻微左右晃动
- Drawer 打开 240ms ease-out（UI.md 11.3），用 Framer Motion 或 CSS transition 均可

**验证清单**
- [ ] "UI.md 逐节核对表" 每一条勾完
- [ ] DevTools 取色 10 处，色值与 UI.md 4.1~4.6 完全一致
- [ ] 小猫 SVG 渲染正确，呼吸动画约 2s 周期
- [ ] 键盘 Tab 能依次聚焦到所有交互元素，focus ring 明显（使用 `primary` 色）
- [ ] 在 Chrome / Safari 各跑一次，无视觉塌陷
- [ ] 慢网（Slow 3G）下 Drawer 打开动画仍流畅（不卡顿）

---

### Step 7.3 — PRD 第 13 章 6 个闭环验收

**做什么**
逐一走通（每个闭环都是一次真实操作，不是点点看看）：

1. **AI 解析写入**：粘贴一段面试邮件 → AI 解析 → 编辑确认 → 保存 → 首页/日历/公司页三视图都能看到
2. **手动录入**：首页新增事件 → 填完保存 → 三视图可见
3. **详情编辑**：点某行开 Drawer → 改公司/JD/简历 → 保存成功
4. **AI 面试题**：打开某 Application Drawer → 解析 JD → 生成面试题 → 编辑保存
5. **AI 复盘**：某 Stage Drawer → 粘贴转录 → AI 复盘 → 编辑保存
6. **简历上传关联**：上传 PDF → 预览 → 自动提取文本 → 在某 Stage Drawer 关联

**验证清单**
- [ ] 6 个闭环全部一次跑通，不需要中途重启或手动改数据库
- [ ] 每个闭环的最终状态在 Prisma Studio 里可核对
- [ ] 整个过程 AIRun 表里有合理的调用记录

---

### Step 7.4 — 最终清理

**做什么**
- 删掉所有临时 `console.log`、TODO 注释、废弃文件
- 确保 `.env.local` / `uploads/` / `prisma/dev.db` 都在 gitignore
- 更新仓库根的 `README.md`（若无则新建），写清"怎么从零跑起来"（三条命令：install → migrate + seed → dev）
- 最后一次跑 `pnpm build` + `pnpm lint`

**验证清单**
- [ ] grep 仓库内已无 `console.log`、无 `TODO:`、无 `FIXME:`
- [ ] `git status` 干净或仅含 `.env.local` / `uploads/*` / `dev.db`（且这些都在 gitignore）
- [ ] README 的三条命令让一个新人从 clone 到看到首页真的能跑通
- [ ] `pnpm build` 无 warning
- [ ] `pnpm lint` 无 error

---

### ✅ Phase 7 出口检查

- 所有 Step 7.1 ~ 7.4 已在 `progress.md` 勾选（含 PRD 第 13 章 6 个闭环逐一打勾）
- 在 `progress.md` 的 "Phase 7 出口" 勾选已完成
- 在 `architecture.md` 补齐 `README.md` 等 Phase 7 产物；确认整个文件地图和仓库实际状态 1:1 一致
- 当前状态摘要：v1.0 可演示、6 个端到端闭环全通、README 能让新人 clone 即跑

---

## 📌 附录 · 通用注意事项（所有步骤都要遵守）

1. **每一步完成后，先走验证清单、再做 git commit**。commit message 写清楚"Phase X.Y: 做了什么"。**同一个 commit 里必须同步勾选 `progress.md` 的对应 Step；若动了文件结构，同步更新 `architecture.md`**。
2. **不要跳步**。例如 Phase 4 还没做完就开始写 Phase 6 的 AI 是严重错误。
3. **修改 Prisma schema 必须伴随 migration**。不要只改 schema.prisma 不跑 migrate。
4. **发现 PRD / UI.md / tech_stack.md 有模糊或矛盾处**：停下来，**在 `architecture.md` 的"关键契约点"追加一条"开放问题"**（若没有就新建"开放问题"小节），然后按保守解释继续；不要自己擅作决定还不留痕。
5. **所有枚举值只能用 PRD 定义的中文字符串**（`HR面`、`挂了`、`待参加` 等）。
6. **AI Key 与任何机密不得进入任何前端 bundle**。Server Component / Route Handler 内才允许读 `process.env.DOUBAO_*`。
7. **AI 结果必须草稿态**。前端不允许在调完 AI 后直接 PATCH 入库，必须让用户先看见、能编辑、点保存才落库。
8. **文档三件套各司其职，互不越位**：
   - `progress.md` 记"做到哪"（勾 Step + 填完成日期）
   - `architecture.md` 记"是什么"（文件地图 + 关键契约点 + 开放问题）
   - 本文件（`implementation_plan.md`）记"怎么做"（指令手册本身，除非计划需要调整，否则不动）
   - **每完成一个 Step，progress.md 必须更新**；**文件结构有变或做出技术决策，architecture.md 必须更新**；二者任一没更新，视为该 Step 未完成
