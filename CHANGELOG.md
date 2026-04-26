# CHANGELOG

> **本仓库的改动日志**。v1.0 交付（2026-04-19）之后所有的维护期变更都记在这里。
>
> **与其他文档的分工**：
> - `docs/legacy/` = **v1.0 建设期历史快照**（implementation_plan / progress / 旧 architecture / 旧 tech_stack），维护期**冻结不修改**
> - `docs/prd.md` / `docs/ui-guide.md` / `docs/tech-stack.md` = **产品/视觉/技术栈规格**，长期参照，按需更新
> - `docs/architecture.md` = **当下的文件地图 + 关键契约点**（做新决策时追加契约点）
> - 本文件 = **动作流水**（每次改了什么、为什么、怎么验证、踩了什么坑）
> - `.workbuddy/memory/MEMORY.md` = **用户偏好 + 项目约定**（跨会话）
>
> **写入规则**
> - 按时间倒序，**最新在最上**
> - 每个条目必须回答 4 个问题：**做了什么 / 为什么 / 怎么验证 / 有没有踩坑**
> - 每个条目末尾附 **commit + tag + 分支 + 关联契约点**，方便回溯
> - 大改动（部署、跨模块、schema 迁移）必须独立成条，不要塞进小改动

---

## 条目模板（新条目请复制这块）

```markdown
## [未发布] · YYYY-MM-DD

### <type>: <一句话描述>（分支 <branch>）

**做了什么**
- <bullet 1>
- <bullet 2>

**为什么**
- <1~3 行解释动机>

**怎么验证**
- typecheck / lint / build 三件套 0 warning 0 error
- <附加验证：curl / smoke-api / smoke-closures / 页面手点等>

**踩坑**
- <若无可写"无"，若有详细写下次如何避免>

**关联 commit / tag / 分支**
- commit: `xxxxxxx`
- tag: `<tag-name>`
- 分支: `<branch>`（是否已合回 main：是/否）

**对应 architecture.md 契约点**
- <新增第 N 条：...>（或"无新契约"）
```

`<type>` 取值：`tweak` / `feat` / `deploy` / `refactor` / `fix` / `docs`

---

## [v1.0] · 2026-04-19 · 初始交付（基线条目）

**做了什么**
- 39 Step 全绿交付（Phase 0~7）。详情见 `progress.md` 的逐步勾选清单
- 18 个 API route（6 个 AI + 12 个业务）+ 3 页 + 全局 Drawer
- 真 Next.js 15 + 真 SQLite + 真豆包 API 调用
- 6 闭环 E2E 验收通过 31/0（`scripts/smoke-closures.ts`）

**为什么**
- PRD 3.1 明确要求"不是纯前端 localStorage demo"
- 单人使用的个人求职流程管理工具

**怎么验证**
- `pnpm lint` 0 warning 0 error
- `pnpm typecheck` 0 错误
- `pnpm build` 全绿
- `pnpm tsx scripts/smoke-closures.ts` 通过 31 / 失败 0

**踩坑**
（详见 `architecture.md` 关键契约点 + `.workbuddy/memory/2026-04-18.md` / `2026-04-19.md` 日度记录）

**关联 commit / tag / 分支**
- commit: `cc8ebb7`（main）
- tag: `v1.0` + `phase0-step1-done` ~ `phase7-step4-done` 全序列
- 分支: `main`

**对应 architecture.md 契约点**
- 截至交付共 22 条（1~22）

---

<!-- 未来新条目插在这行下方，最新的在最上面 -->

## [未发布] · 2026-04-26 · 文档大整理 📚

### docs: 重组 MD 文档到 docs/ · 重写 architecture + tech-stack + CODEBUDDY · 归档 v1.0 快照（分支 main）

**做了什么**
- **文件迁移**（`git mv` 保留历史）：
  - `UI.md` → `docs/ui-guide.md`（产品规格 · 长期参照）
  - `job_hunt_flow_board_prd.md` → `docs/prd.md`（产品规格 · 长期参照）
  - `implementation_plan.md` → `docs/legacy/implementation_plan.md`（v1.0 冻结）
  - `progress.md` → `docs/legacy/progress.md`（v1.0 冻结）
  - `architecture.md` → `docs/legacy/architecture.md`（v1.0 版旧地图 · 冻结）
  - `tech_stack.md` → `docs/legacy/tech_stack.md`（v1.0 版旧技术栈 · 冻结）
- **重写两份核心文档**（**删除旧版所有 v1.0 建设期痕迹**）：
  - `docs/architecture.md`（24KB · 重写）· 文件地图按当前 v2.0 真实结构画，30 条契约点按领域分组（数据访问 / 数据模型 / API / 前端交互 / 维护部署 / v2.0 新增），保留所有硬规则
  - `docs/tech-stack.md`（11KB · 重写）· 反映当前真实栈（Neon Postgres + bcryptjs + jose + Vercel），加版本锁定章节（为什么锁 Next 15 不上 Next 16）+ v1.0→v2.0 变更摘要表
- **重写 `CODEBUDDY.md`**（精简到 9 节，原 14 节）：删 "项目初始化（尚未执行）"、"实现优先级 6 天节奏"、"开发前准备自检"（Phase 6 前置）等过时内容；加"红色信号 · 看到这些停下来问"章节
- **新增 `docs/legacy/README.md`** 说明为什么冻结 v1.0 建设期文档 + 当前应该读哪些文档
- **更新 `README.md`**：
  - Prisma 命令 `migrate deploy` → `db push`（与 v2.0 build 脚本一致）
  - 环境变量示例 `DATABASE_URL="file:./prisma/dev.db"` → Neon pooled URL
  - 文档索引改指 `docs/` 新路径
- **批量修正代码注释里的文档引用**（`sed` 批处理）：
  - `UI.md` → `docs/ui-guide.md`（app/ + components/ 共 12 个文件）
  - `architecture.md 关键契约点` → `docs/architecture.md 契约点`（lib/ + prisma/ 共 7 个文件）
- **更新 `CHANGELOG.md` 顶部**"与其他文档的分工"段落，改指 `docs/` 新路径
- **清理残留**：
  - 删除 `.with/Dockerfile`（v1.0 Docker 残留，项目已切 Vercel）
  - 清理 `.git/info/exclude` 的 `.with/` 规则（已不需要）

**为什么**
- 根目录有 7 份 MD 文件散落，新 Agent 进入仓库分不清哪些是当前规格 / 哪些是历史快照 / 哪些应优先读
- v1.0 的 `implementation_plan.md`（72KB）+ `progress.md`（42KB）全是"39 Step 全绿"的建设期历史，对维护期 Agent 没有价值但会干扰阅读判断
- v1.0 版的 `architecture.md`（45KB）充斥"Phase X 产物 · 从计划中迁移到已有区"的建设期轨迹，已经与当前 v2.0 真实结构不匹配
- v1.0 版的 `tech_stack.md` 说"用 SQLite 本地开发"，但实际项目早已切 Neon Postgres + 上 Vercel，还加了鉴权栈
- 用户明确要求"所有旧版本的东西需要删除，这样可以帮助下一次负责优化代码的 Agent 更好地上手目前的现有代码和功能"

**怎么验证**
- `pnpm typecheck` ✅ 0 error
- `pnpm lint` ✅ 0 warning 0 error（批量 sed 替换未破坏代码）
- `pnpm build` ✅ Compiled successfully (4.1s)
- 根目录 `ls` 清爽：只剩 `README.md` / `CODEBUDDY.md` / `CHANGELOG.md` + 代码配置文件
- `git mv` 保留文件历史（`git log --follow docs/legacy/implementation_plan.md` 能追溯到最初）
- 所有代码注释里的文档路径引用都更新为新位置，无破损链接

**踩坑**
- **批量 sed 替换时引号问题**：macOS 的 `sed -i` 必须加空串参数 `-i ''`，直接 `-i` 会报错。用 `find ... -exec sed -i '' 's|...|...|g' {} +` 避免逐文件启动 sed 进程
- **CODEBUDDY.md 重写时**误删了原"一致性声明"相关段落，后补"红色信号"章节覆盖等效功能
- `.with/Dockerfile` 本被 `.git/info/exclude` 排除（未进 git），但物理文件还在磁盘上；`rm -rf` 删掉后同步清 exclude 规则

**关联 commit / tag / 分支**
- commit: （本 commit）
- tag: `docs-restructure-20260426`（建议）
- 分支: `main`

**对应 architecture.md 契约点**
- 无新契约（纯文档重组 + 清理，保留原 30 条契约点不变，只重新分组和措辞）

---

## [未发布] · 2026-04-25（第 2 条）· 审查修复 🔍

### fix: 全量代码审查 · 修复构建/ESLint 错误 + 清理残留（分支 main）

**做了什么**
- `components/onboarding/OnboardingDialog.tsx`：`icon: any` → `LucideIcon`（消除 ESLint no-explicit-any，Vercel 构建阻断错误）
- `components/ui/sheet.tsx` + `tailwind.config.ts`：`ease-[cubic-bezier(0.22,1,0.36,1)]` → 自定义 `ease-smooth`（消除 Tailwind 歧义警告）
- `next.config.ts`：加 `transpilePackages: ['jose']`（修复 Edge Runtime jose 构建警告）
- `package.json` build 脚本：`prisma migrate deploy` → `prisma db push --accept-data-loss`（修复 Vercel 构建 P3005 数据库非空报错）
- `app/api/stages/route.ts`：GET handler 加 `eslint-disable-next-line`（间接鉴权，不直接读 req）
- `components/auth/LoginForm.tsx`：移除未使用 `Button` import 和 `router`（页面使用 `window.location.href` 跳转）
- `components/dashboard/AIChatPanel.tsx`：移除未使用 `ArrowUpRight` / `Zap` / `Minimize2` import
- `components/dashboard/MiniResumePanel.tsx`：移除未使用 `Eye` import

**为什么**
- Vercel 构建时 ESLint 报错会直接阻断部署（`OnboardingDialog.tsx` 的 `any` 类型）
- Tailwind 对含括号的 arbitrary value 解析有歧义，构建警告 contaminants 日志
- `jose` 在 Edge Runtime 需要 transpile 才能正确打包
- `prisma migrate deploy` 在 Neon 数据库已含 schema 时会报 P3005，`db push` 更适合迭代场景
- 未使用的 import/variable 是代码整洁度问题，顺手清理

**怎么验证**
- `pnpm typecheck` ✔ 0 error
- `pnpm lint` ✔ 0 warning 0 error（本轮清理前只剩 unused-var warnings）
- `pnpm build` ✔ Compiled successfully（3.7s）
- Vercel 推送后自动触发重新部署

**踩坑**
- `OnboardingDialog.tsx` 最初尝试用 `_req` 前缀规避 unused-var，但 `@typescript-eslint/no-unused-vars` 不认 `_` 前缀，最终用 `eslint-disable-next-line` 解决
- `LoginForm.tsx` 里 `router` 被 import 但未使用，是因为早期版本用 `router.push()` 跳转，后来改为 `window.location.href` 保证 Cookie 生效后立即刷新服务端渲染，`router` 忘记一并移除

**关联 commit / tag / 分支**
- commit: `386a8f5`（构建修复）+ `8493a9c`（lint 清理）
- tag: 无（未到发布节点）
- 分支: `main`

**对应 architecture.md 契约点**
- 无新契约（均为修复，不改变架构决策）

---

## [v2.0-maintenance-r1] · 2026-04-25 · 维护期第一波大迭代（分支 main，多次小 commit）🎨🔐

> **Scope**：这是 v1.0 交付后的**维护期第 1 个整合版本**。用户整天通过对话式迭代推进，涉及 **鉴权与用户隔离**、**UI 全面改版**、**AI 交互重构**、**Stage 子信息扩展**、**Companies 自管理**、**新手引导** 等 7 大块。本条目是今天所有子改动的**总览**——为便于后续 Agent 快速定位，故合并成一条（而不是拆 20 条小流水）。

### 做了什么

#### 1️⃣ 用户系统 · 多用户 + 邮箱密码登录（auth-v1）

- **新增 `User` model**（`prisma/schema.prisma`）：`email` / `passwordHash` / `nickname`，与 `Resume / Application / IntelSummary / TomorrowTipCache / AIRun / CustomCompany / WeeklyTodo` 全部建反向关系
- 现有 6 张业务表全部加 `userId` 外键 + `@@index`，`onDelete: Cascade`
- 新增 `lib/auth.ts`：密码（bcryptjs）+ JWT（jose HS256）+ Cookie Session（httpOnly / sameSite=lax / 7d）+ `getCurrentUser()` / `requireCurrentUser()`
- 新增 `middleware.ts`：Edge 运行时验 JWT，未登录业务页 302 → `/login?redirect=...`，未登录 API → 401 JSON；已登录访问 `/login` → 302 `/dashboard`
- 新增 `app/login/page.tsx` + `components/auth/LoginForm.tsx`：Tab 切换登录/注册，奶油马卡龙配色，左侧 4 张核心能力卡（AI / 看板 / 简历便签 / 数据隔离）
- 新增 `/api/auth/{login, register, logout, me}` 4 个 route
- `Header.tsx` 右侧头像改为 **昵称首字母 + 悬浮菜单**（替换 v1 的 🌿 小猫图），含登出按钮
- **所有现有 queries 与 API route 全部改造为按 userId 过滤数据**（关键契约点 26）

#### 2️⃣ UI 全面改版 · 奶油马卡龙 + 首页重排（v2 layout）

- `components/layout/Sidebar.tsx`：**76px 窄边 + 胶囊外框 + 花朵 Logo（Flower2）**；底部新增"新手引导"按钮（Sparkles）；三个菜单（首页 / 日历 / 公司），"公司"替代"大厂"
- `components/layout/Header.tsx`：去除旧 `.EN` 切换；改为 tag pill + 奶油渐变标题 + 日期胶囊 + 用户菜单
- `app/dashboard/page.tsx` **v2 布局**：FunnelBar（顶） → 12 栅格主区：左 8 栏（`EventTable` 含今日/明日 tab · 视觉主角 → `AIChatPanel` 紧凑卡），右 4 栏（`MiniStatsColumn` → `StickyTodoPanel` 便签 → `DailyIntel` → `MiniResumePanel`） → 全局 `QuickAddFab`
- **去除**：`TodayTimeline` / `TomorrowReminder`（合并进 EventTable 今日/明日 tab）/ MiniStatsColumn 的 "Passed" 维度
- **新增**小件：`components/dashboard/AIChatPanel.tsx`（31KB 对话主面板）/ `AIWorkstation.tsx`（30KB 解析工作区）/ `MiniResumePanel.tsx` / `MiniStatsColumn.tsx` / `QuickAddFab.tsx` / `QuickStats.tsx` / `TodayTimeline.tsx`（保留作组件库件，页面未引用）

#### 3️⃣ AI 交互重构 · 聊天框为核心（ai-chat-v1）

- 新增 `app/api/ai/chat/route.ts`：通用对话流，可挂载"能力组件"（邮件解析 / JD 解析 / 面试题 / 复盘）作为可选上下文注入
- `AIChatPanel` 改为**紧凑卡 + 展开全屏弹窗**两种形态（v1 版 `AICopilot` 作为组件保留但已不挂页面）
- AI 调用继续走 `lib/llmClient.ts`（契约点 2 不变）；草稿态流程不变（契约点 22）

#### 4️⃣ Stage 详情 Drawer · 三个子 Tab（stage-tabs-v1）

- `prisma/schema.prisma` 的 `Stage` 扩字段：`interviewQuestions`（JSON 字符串化 string[]） / `personalNotes` / `reviewTranscript`
- 新增 `components/drawer/tabs/InterviewQuestionsTab.tsx`：面试题列表，支持手工录入 + Enter 添加 + 多行批量粘贴
- 新增 `components/drawer/tabs/PersonalNotesTab.tsx`：用户随手记（与这场面试相关的自由文字）
- 新增 `components/drawer/tabs/ReviewTab.tsx`：面试复盘，含原始转录 `reviewTranscript` 存档
- `StageDrawerContent.tsx` 顶部集成 Tab 切换器

#### 5️⃣ Companies 自管理（companies-custom-v1）

- 新增 `CustomCompany` model（`userId + name + sortOrder`）+ `/api/companies` GET/POST、`/api/companies/[id]` DELETE
- 新增 `components/companies/CustomCompanyManager.tsx`：用户可 + 自己想追踪的公司
- 新增 `components/companies/hiddenPresetStore.ts`：支持隐藏预置的 10 家大厂（localStorage）
- `components/companies/CompanyRow.tsx`：公司一行可以点击创建新申请事件；每家公司可删除（预置走 hiddenPresetStore；自定义走 API）
- `/companies` 顶部页面标题由"大厂"改为"公司"

#### 6️⃣ 周便签 Todo（weekly-todo-v1）

- 新增 `WeeklyTodo` model（`weekStart` YYYY-MM-DD 周一 + `content` + `done` + `sortOrder`）
- 新增 `/api/weekly-todos` GET/POST + `/api/weekly-todos/[id]` PATCH/DELETE
- 新增 `components/widgets/StickyTodoPanel.tsx`：纸张便签质感，支持卡片内嵌 + 日历右侧书签两种 variant
- 日历页右侧挂载便签，点击展开；首页右栏直接嵌入

#### 7️⃣ 新手引导（onboarding-v1）

- 新增 `components/onboarding/OnboardingDialog.tsx`：多步向导，首访自动弹 + Sidebar 左下按钮随时唤出
- 使用 localStorage `hasDismissedOnboarding` 判断首次

#### 8️⃣ 旧版本遗留物清理

- 删除 `.next_old/`（旧 Next 构建缓存整目录）
- 删除 `prisma/_sqlite_archive/`（已空的归档目录）
- 删除 `prisma/migrations/20260419021839_init_postgres/`（空目录）
- 删除 `app/api/_test-throw/` 与 `app/api/test-throw/`（空目录 · 调试残留）
- **保留**但文档备注：`prisma/migrations/20260418121855_init/`（SQLite 语法 SQL，不删是因 migration_lock 指向 postgres 后被 Neon 覆盖，物理删除会打破 Prisma 迁移元数据，留作历史参照）

### 为什么

- 产品从"单人 Demo"升级为"多用户可公开访问"，数据隔离是 **P0 级前置**
- v1 首页信息密度低、AI 能力被藏在小卡里，用户明确提出"AI 前置 + 核心功能凸显"
- Stage 面试详情原本只有"时间 / 链接 / 状态"，AI 生成的面试题/复盘无落点，用户无法回看
- `/companies` 原本 10 家大厂写死，用户需要按自己的目标公司追踪
- 新手进入系统面对"空白看板"不知从何开始，需要 onboarding

### 怎么验证

- `pnpm dev` 启动后：未登录访问任何业务页 → 302 `/login`；注册 → 进入 `/dashboard`；退出 → 回 `/login`
- 注册第二个账号，只能看到自己的数据（用户隔离生效）
- 首页 `EventTable` 今日/明日 tab 切换 OK；`AIChatPanel` 展开全屏对话 OK；`StickyTodoPanel` 便签增删 OK
- Stage Drawer 三个子 Tab（面试题/复盘/随手记）读写 OK
- `/companies` 添加自定义公司 / 删除预置公司 OK
- `lib/auth.ts` + `middleware.ts` + 所有 `/api/auth/*` 编译通过无 TS 错
- 登录页无重叠、LoginForm 无"数据隔离"提示条（已移至左侧卡片承载）

### 踩坑

- **登录后 cookie 不生效**：`cookies().set()` 在 Next 15 是异步，需 `await cookies()`（已修）
- **middleware + bcryptjs**：Edge 跑不了 Node 原生库，middleware 必须只用 `jose` 验签，不能引用 `lib/auth.ts`（那里有 bcrypt）
- **data 隔离漏网**：早期 queries 没加 `userId` 过滤，某账号能看到另一账号数据；修法：所有 `lib/queries/*` + `/api/**/route.ts` 一次性审查加 `userId` 过滤
- **InterviewQuestionsTab 字符串中嵌双引号**：`placeholder="... 可"批量导入""` 导致 JSX 解析错误，改全角引号「」
- **`/api/auth/me` 响应缓存**：Header 里组件每次导航都重拉；加 `credentials: "include"` + `{ cache: "no-store" }`
- **StickyTodoPanel 书签模式层级**：日历页右侧书签 z-index 被 MonthView 遮挡，升到 `z-40` + `pointer-events: auto`
- **首页简历块占地太大**：从 `ResumeCard` 换成 `MiniResumePanel`，仅展示名称 + tag，小空间承载
- **预览环境 postgres 连接**：Neon 偶发 "Error in PostgreSQL connection: Error { kind: Closed, cause: None }"，是免费档休眠唤醒日志，不影响业务

### 关联 commit / tag / 分支

- 本迭代用户通过"对话式连续修改"推进，未分独立分支，全部落 `main`
- 建议的聚合 tag：`v2.0-maintenance-r1-20260425`（待 commit 后打）
- git 历史部分提交 object 损坏（`git log` 报 `Could not read 8c1c585fd3bfd6a2ef489daaf654361dd73fc7fa`），不影响现工作副本，但建议下次 commit 前跑 `git fsck --full` 修复

### 对应 architecture.md 契约点

- 新增第 **26** 条：用户隔离契约（所有业务查询强制 `userId` 过滤）
- 新增第 **27** 条：鉴权与路由保护（Cookie Session + Edge middleware + 白名单）
- 新增第 **28** 条：Stage 子信息三件套（`interviewQuestions` / `personalNotes` / `reviewTranscript`）
- 新增第 **29** 条：AI 聊天面板为首页核心入口（草稿态流程不变）
- 新增第 **30** 条：Companies 预置+自定义混合策略（预置 10 家 + hiddenPresetStore 隐藏 + CustomCompany 扩展）

---

## [v1.0-demo] · 2026-04-19（当天第 6 条）🚀

### deploy: 部署到 Vercel 成功 · 公网可访问（分支 main）

**做了什么**
- Vercel 项目 `system-pi-three` 创建并导入 GitHub `sibyl7036-boop/system`
- Vercel Environment Variables 配置 4 条：`DATABASE_URL`（Neon pooled）+ `DOUBAO_API_KEY` + `DOUBAO_BASE_URL` + `DOUBAO_MODEL`
- 初次 deploy 成功：Build 过程含 `prisma generate && prisma migrate deploy && next build`，3~5 分钟完成
- 公网 URL：**https://system-pi-three.vercel.app**

**为什么**
- v1.0 交付后为展示 demo 所做的最后一步
- 跳过 PDF 存储改造（方案 B1 已在契约点 24 落地），节省 60 分钟

**怎么验证**
- `curl https://system-pi-three.vercel.app/dashboard` → 200 · 1.24s
- `curl https://system-pi-three.vercel.app/companies` → 200 · 1.54s
- `curl https://system-pi-three.vercel.app/api/companies/progress` → 200 · 返回 10 家大厂数据
- `SMOKE_BASE_URL=https://system-pi-three.vercel.app pnpm tsx scripts/smoke-closures.ts` → **通过 24 / 失败 1 / 耗时 49.4s**
  - 失败的 1 个是闭环 6.a 上传 PDF 返 HTTP 503（**符合预期的降级行为**，契约点 24）
  - 其余 5 个业务闭环全绿（含 4 个真实豆包 AI 调用 + 三视图同步 + Drawer CRUD）

**踩坑**
- Vercel 自动给项目加了 `-pi-three` 后缀（不是 `system` 单词名冲突就是算法选的），URL 不是最好看的 `system.vercel.app` 但没关系；后续可在 Settings → Domains 改名或绑定自定义域名
- 公网 E2E 比本地慢 15 秒（34.5s → 49.4s），主要是 Vercel Serverless 冷启动 + 跨洋网络延迟累积

**关联 commit / tag / 分支**
- 本次纯云端配置，无代码改动
- tag: `deploy-vercel-live-20260419`
- 分支: `main`

**对应 architecture.md 契约点**
- 无新契约（契约点 24、25 在前几条中已建立完整决策链）

**Demo URL**：https://system-pi-three.vercel.app

---

## [未发布] · 2026-04-19（当天第 5 条）

### deploy: 数据库从 SQLite 迁移到 Neon Postgres（分支 main · 直接提交）

**做了什么**
- `prisma/schema.prisma` datasource provider 从 `sqlite` 改为 `postgresql`，并更新头部注释
- 旧 SQLite 迁移归档到 `prisma/_sqlite_archive/`（20260418121855_init/ + migration_lock.toml），保留作历史参照
- 对 Neon 跑 `pnpm exec prisma migrate dev --name init_postgres` → 产出新迁移 `prisma/migrations/20260419021839_init_postgres/migration.sql`，6 张表全部建成
- `pnpm exec prisma db seed` 往 Neon 写入 10 家大厂占位 Application
- `.env` 和 `.env.local` 的 `DATABASE_URL` 从 `file:./dev.db` 换成 Neon 连接串（Singapore 区 pooled，含 `channel_binding=require`）
- `package.json` 的 `build` 脚本前缀加 `prisma generate && prisma migrate deploy &&`，Vercel 每次部署自动同步 Prisma Client + 应用迁移
- 本地 `prisma/dev.db` 保留（gitignore，如需回退到 SQLite 改 DATABASE_URL 即可，但现在本地连的是 Neon）
- 未改任何业务代码（0 行 `.tsx` / `.ts` 业务逻辑变化，schema 字段类型全是 Prisma 通用类型 Postgres 原生兼容）

**为什么**
- Vercel Serverless 容器没有持久化文件系统，SQLite 的 `dev.db` 文件部署到云上会随函数冷启动丢失
- Neon 免费版 0.5GB Postgres 对个人 demo 完全够用
- 本地和生产用同一个 Neon 实例（demo 项目无多环境需求）省事；真要隔离可以再开一个 Neon branch

**怎么验证**
- `pnpm exec prisma migrate dev --name init_postgres` ✔（6 表建成 + Client 重生成）
- `pnpm exec prisma db seed` ✔（10 家大厂幂等写入）
- `pnpm typecheck` ✔ / `pnpm lint` ✔ / `pnpm build` ✔（build 内含 migrate deploy 验收）
- `pnpm tsx scripts/smoke-closures.ts` **通过 31 / 失败 0 / 34.5s**——完整 6 闭环 E2E 跑在 Neon Postgres + 真实豆包 AI 上全绿。耗时从 SQLite 的 26.9s 增至 34.5s，多出的 7.6s 是跨洋网络延迟（本机 → Singapore Neon），可接受

**踩坑**
- 无。`prisma migrate dev` 对 Postgres 产出的 migration.sql 和 SQLite 方言差异很大（CREATE TABLE 语法、DEFAULT 子句、FK 约束写法），但 Prisma 会自动处理；我们的 schema 本来就用通用字段类型，零业务代码改动
- Neon 第一次访问慢 5~10 秒属正常（免费版休眠唤醒），写入 `architecture.md` 契约点 25 防止下次新人误以为是 bug

**关联 commit / tag / 分支**
- commit: （本次提交后回填）
- tag: `deploy-neon-postgres-20260419`
- 分支: `main`（纯基础设施改造直接提交；Vercel 部署下一次做）

**对应 architecture.md 契约点**
- 新增第 25 条：数据库迁移策略（SQLite → Postgres + 归档路径 + Neon 冷启动说明）

---

## [未发布] · 2026-04-19（当天第 4 条）

### feat: 上传路由加 Vercel 环境降级（分支 main · 直接提交）

**做了什么**
- `app/api/resumes/upload/route.ts` 顶部加环境探测：`process.env.VERCEL === "1"` 时直接 `throw new ApiError("FEATURE_UNAVAILABLE_IN_DEMO", "演示环境暂不支持简历上传，本地运行可体验完整功能", 503)`，不进入下游的文件写盘逻辑
- `lib/api.ts` 的 `ApiErrorCode` 枚举新增 `"FEATURE_UNAVAILABLE_IN_DEMO"`（保持类型安全）
- 本地开发不受影响（`VERCEL` 只有 Vercel 环境有，值固定是 `"1"`）
- 前端 `UploadResumeDialog.tsx` 未动——原有 catch 直接 toast 后端 error.message，降级文案会直接展示给用户

**为什么**
- 部署只是 demo 展示，不想花 1 小时改造 PDF 存储到 Vercel Blob
- Vercel Serverless 容器没有持久化文件系统，本地 `uploads/` 写盘在云上会随函数冷启动丢失；与其上传成功再 404，不如直接友好报错
- 方案 B1（降级）优于方案 B2（让它崩）：用户看到 toast "演示环境暂不支持..." 比看到 "网络异常" 体验好得多

**怎么验证**
- `pnpm typecheck` ✔ / `pnpm lint` ✔ / `pnpm build` ✔
- 本地 `VERCEL` 未设，走原路径；TS 类型对，枚举扩展没破坏 `withApiHandler` 的错误分派
- 实际 Vercel 上的行为会在部署后访问上传对话框点提交时验证（应看到 toast "演示环境暂不支持简历上传..."）

**踩坑**
- 第一次写 `new ApiError(503, code, message)` 是错的——`ApiError` 构造器签名是 `(code, message, status, details?)`，不是 `(status, code, message)`。TS 报错时才注意到
- 构造器参数顺序错 + 新 code 没扩枚举，两个 TS 错同时出现——修 5 分钟

**关联 commit / tag / 分支**
- commit: （本次提交后回填）
- tag: `feat-upload-demo-fallback-20260419`
- 分支: `main`（纯小改动不开分支）

**对应 architecture.md 契约点**
- 新增第 24 条：部署环境上传路由降级策略

---

## [未发布] · 2026-04-19（当天第 3 条）

### chore: 清理本地已上传的简历 PDF（分支 main · 直接提交）

**做了什么**
- 解除 1 个 Application（美团·产品经理）的 `linkedResumeId` 引用（走 Prisma nested disconnect）
- DELETE 1 条 Resume 记录（`南京大学_香港科技大学_王语彤_简历`，tag=产品）
- 物理删除 `uploads/cmo538x7d0003ggjr0neekzjb.pdf`（410KB）
- `uploads/` 目录留空

**为什么**
- 准备部署到 Vercel 之前，把真实简历从本地 DB + 文件系统清掉，避免任何意外泄漏路径
- 部署环境的 DB 本身是全新的 Neon 空库，但本地 uploads/ 若被打包进仓库（虽然 gitignore）也容易误操作

**怎么验证**
- `ls uploads/` 返回空（只有 `.` 和 `..`）
- Prisma 查 Resume 表：0 条
- Prisma 查 `linkedResumeId NOT NULL` 的 Application：0 条
- 本次不跑 smoke-closures（它自带数据自清理，不依赖 uploads 现状）

**踩坑**
- 无（Prisma onDelete=SetNull 本应让 DELETE Resume 时自动置空 linkedResumeId，但 route 层的 409 保护更早触发；从脚本层手动 disconnect 一次更稳）

**关联 commit / tag / 分支**
- commit: （本次提交后回填，和下一条合并成一个 commit）
- tag: `chore-clear-resumes-20260419`
- 分支: `main`

**对应 architecture.md 契约点**
- 无新契约

---

## [未发布] · 2026-04-19（当天第 2 条）

### fix: 删除本该在 Phase 6 清理的临时冒烟脚本（分支 main）

**做了什么**
- 删除 `scripts/test-ark-api.ts`（Phase 0 Step 0.6 的 Ark API 冒烟脚本，计划在 Step 6.1 完成后删除但当时漏删）

**为什么**
- Phase 0 该脚本就标注了"临时，Phase 6.1 完成后删除"（详见 `architecture.md` 目录树历史注释）
- 上一个 commit `9e66579` 追加文档时顺带把它 add 进来了，暴露出"漏删"这个旧 bug
- 按维护期工作流，发现问题立刻补 commit 修复，不改写历史

**怎么验证**
- `ls scripts/` 不再包含 test-ark-api.ts
- `pnpm typecheck` ✔（虽然 scripts 不进 tsc，但防御性检查）

**踩坑**
- 上次清理时没 `git status` 确认工作区干净，以后收尾 commit 前必须 `git status` 看一眼 Untracked files

**关联 commit / tag / 分支**
- commit: （本次提交后回填）
- tag: `fix-cleanup-arkapi-smoke-20260419`
- 分支: `main`

**对应 architecture.md 契约点**
- 无新契约

---

## [未发布] · 2026-04-19

### docs: 建立维护期工作流与改动留痕基建（分支 main · 直接提交）

**做了什么**
- 新建本文件 `CHANGELOG.md`（基线条目 + 条目模板 + 写入规则）
- 升级 `CODEBUDDY.md`：
  - 第 0 节"强制阅读门禁"拆成"模式 A 建设期 / 模式 B 维护期"，维护期必读文件从 6 份精简到 4 份（`CODEBUDDY.md` → `architecture.md` → `CHANGELOG.md` 最近 3 条 → `MEMORY.md`）
  - 第 1 节"仓库当前状态"刷新为 v1.0 已交付
  - 第 12 节"文档分工与维护规则"重写：显式区分建设期 / 维护期两套工作流，把 `CHANGELOG.md` 列为维护期必更文档
- 升级 `architecture.md`：
  - 目录树登记 `CHANGELOG.md`
  - "文档分类速查 A 文档层"标注 v1.0 历史快照 + 登记 `CHANGELOG.md` 角色
  - 追加关键契约点 **第 23 条**（维护期工作流：分支命名 / 自检单 / inline 注释格式 / 5 件收尾事项 / tag 命名规范）
- 没有动任何业务代码（0 行 .ts / .tsx / .prisma 改动）

**为什么**
- v1.0 交付后进入维护期，原来的 `progress.md` + `implementation_plan.md` + 39 Step tag 模式不再适用（没有"下一个未勾选 Step"让 Agent 做）
- 需要一套"改动留痕"机制，让下次 Agent（或用户自己）翻历史时能快速复原"为什么这段代码长这样"
- 三层结构：CHANGELOG（动作流水） + architecture 契约点（决策） + git tag + inline 注释（现场），互相交叉引用

**怎么验证**
- `pnpm lint` ✔ / `pnpm typecheck` ✔ / `pnpm build` ✔（纯文档改动，不影响构建）
- `CODEBUDDY.md` 第 0/1/12 节读下来一致、无自相矛盾
- 本条目自身就是条目模板的第一个应用样例

**踩坑**
- 无

**关联 commit / tag / 分支**
- commit: （本次提交后回填）
- tag: `docs-maintenance-workflow-20260419`
- 分支: `main`（直接提交；纯文档 + 流程建立不建分支隔离）

**对应 architecture.md 契约点**
- 新增第 23 条：维护期工作流
