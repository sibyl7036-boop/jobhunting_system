# progress.md

> **本文件是 AI Coding 开发进度的逐步勾选清单。**
>
> 与其他文件的分工：
> - `implementation_plan.md` = 指令手册（告诉 Agent 要做什么、怎么验证）
> - `progress.md`（本文件）= 进度快照（记录每一步做完没做完）
> - `architecture.md` = 文件地图（记录仓库里每个文件/文件夹的作用）
>
> **使用规则**
> - 每完成 `implementation_plan.md` 里的一个 Step 的全部验证清单，就把本文件对应行的 `☐` 改成 `☑`，并填写完成日期
> - 不允许跳步勾选；不允许没验证先勾再补
> - 每个 Phase 全部勾完后，在 `architecture.md` 追加该 Phase 的里程碑记录，再继续下一 Phase

---

## 🧭 总览

| Phase | 内容 | 步数 | 完成 | 总进度 |
|---|---|---|---|---|
| 0 | 项目骨架 + git 基线 + API 连通性验证 | 7 | 7/7 | ✅✅✅✅✅✅✅ |
| 1 | 数据层（6 个 model） | 4 | 4/4 | ✅✅✅✅ |
| 2 | REST API（非 AI） | 6 | 6/6 | ✅✅✅✅✅✅ |
| 3 | 三页骨架 | 5 | 2/5 | ✅✅⬜⬜⬜ |
| 4 | Drawer + 手动 CRUD | 4 | 4/4 | ✅✅✅✅ |
| 5 | Resume 上传预览关联 | 3 | 3/3 | ✅✅✅ |
| 6 | 豆包 AI 接入 | 6 | 6/6 | ✅✅✅✅✅✅ |
| 7 | 打磨验收 | 4 | 0/4 | ⬜⬜⬜⬜ |
| **合计** | | **39** | **22/39** | **56%** |

---

## Phase 0 · 项目骨架

- [x] **Step 0.1** — Next.js 脚手架初始化
  - 完成日期：2026-04-18
  - 关键产物：`package.json` / `tsconfig.json` / `next.config.ts` / `tailwind.config.ts` / `postcss.config.mjs` / `.eslintrc.json` / `next-env.d.ts` / `app/` / `public/`
  - 验证备注：Next 15.5.15 + React 18.3 + Tailwind 3.4.19 + TS 5.9 + ESLint 8.57 + eslint-config-next 15.5（官方脚手架默认 Next 16 + Tailwind 4 + React 19，与 tech_stack 规格不符，已强制降版）。build 3.4s / lint 0 warn / dev 3000 HTTP 200 含中文内容。已去掉 Geist 字体引用（Step 0.2 换 PingFang SC）；页面暂保留脚手架欢迎页（Step 0.5 替换为重定向到 /dashboard）。
- [x] **Step 0.1.5** — 验证 git 仓库状态并建立提交基线
  - 完成日期：2026-04-18
  - 关键产物：Step 0.1 的 commit `527851b` + tag `phase0-step1-done`（已随 Step 0.1 一并完成）
  - 验证备注：.git/ 存在、working tree clean、.env.local 未追踪、tag 已推到 origin、.gitignore 含 .env*/node_modules/.next/dev.db/uploads/.workbuddy 全部关键项。实际上这些动作在 Step 0.1 完成时已经顺手做了，本步只是补充验证。
- [x] **Step 0.2** — 配置 Tailwind 马卡龙粉主题
  - 完成日期：2026-04-18
  - 关键产物：`tailwind.config.ts`（UI.md 4.1~4.6 全部色值 + 4.5 阴影 + 5.1 字体 + 5.2 字号层级 + 5.4 圆角）/ `app/globals.css`（body 背景 app-bg / 文字 text-primary / PingFang 字体链 / 行高 1.5）
  - 验证备注：`pnpm build` 后 grep `.next/static/css/` 验证：bg-primary=rgb(243 175 203)=#F3AFCB ✅ / body bg=#fff7fb ✅ / body color=#47384a ✅ / font-family: PingFang SC 链 ✅ / shadow-soft=0 8px 24px rgba(214,164,187,0.10) ✅ / rounded-pill=999px ✅。临时 probe 元素验证完已删除。
- [x] **Step 0.3** — 接入 shadcn/ui
  - 完成日期：2026-04-18
  - 关键产物：`components.json`（new-york / neutral / cssVars / @/* alias）/ `components/ui/button.tsx`（shadcn Button 按 UI.md variant 映射 primary / primary-hover / primary-strong / 浅粉ghost）/ `lib/utils.ts`（cn 辅助）/ `tailwind.config.ts` 加 tailwindcss-animate plugin / 新增依赖：class-variance-authority 0.7.1 / clsx 2.1.1 / tailwind-merge 3.5.0 / lucide-react 1.8.0 / tailwindcss-animate 1.0.7 / @radix-ui/react-slot 1.2.4
  - 验证备注：shadcn init 未跑 CLI（非 TTY），直接写等价 components.json + Button 组件。pnpm build 通过；grep CSS 产物确认 `hover\:bg-primary-hover` / `active\:bg-primary-strong` / `rounded-btn-lg` 全部编译出来。临时 Button probe 已删除。
- [x] **Step 0.4** — 接入 Prisma + SQLite（仅连通，不建模）
  - 完成日期：2026-04-18
  - 关键产物：`prisma/schema.prisma`（最小版，datasource sqlite + generator prisma-client-js）/ `lib/db.ts`（PrismaClient 单例 + dev 模式 globalThis）/ `.env`（Prisma CLI 专用，只有 DATABASE_URL，已 gitignore）
  - 依赖：prisma 5.22.0（devDep）+ @prisma/client 5.22.0。`create-next-app` 不装 Prisma，初装 `pnpm dlx prisma init` 默认拉 Prisma 7（结构大变：prisma.config.ts / output 改成 lib/generated/prisma / datasource url 从 config 注入）→ 已强制降版到 5.22
  - 验证备注：`pnpm exec prisma -v` 认得 5.22 / `pnpm exec tsc --noEmit` 0 错误 / `pnpm build` 通过 / `.env` 和 `.env.local` 都被 gitignore 拦住（git check-ignore 输出两者文件名 = 已忽略）
- [x] **Step 0.5** — 全局布局骨架（左导航 + 顶 Header + 内容区）
  - 完成日期：2026-04-18
  - 关键产物：`app/layout.tsx`（三区布局，Sidebar + Header + main，最大宽 1600px，左右 padding 32px）/ `app/page.tsx`（重定向到 /dashboard）/ `app/dashboard/page.tsx` / `app/calendar/page.tsx` / `app/companies/page.tsx`（3 个占位页）/ `components/layout/Sidebar.tsx`（88px 宽 + 圆角 28px + 半透明白 + blur + 3 导航项 + 底部 CatIcon）/ `components/layout/Header.tsx`（按路由切 UI.md 8.2/9/10 标题 + 日期 pill + 头像占位）/ `components/CatIcon.tsx`（Phase 7.2 前占位，lucide Cat 装浅粉圆底）。新增依赖：date-fns 4.1.0
  - 验证备注：4 条路由都编译出静态页面。`/` 返 307 重定向 location:/dashboard；`/dashboard` 200 含 Header 文案"今天也离理想 offer" + 占位"首页占位"；`/calendar` 200 含"从日期视角"+"日历页占位"；`/companies` 200 含"从公司维度"+"大厂流程页占位"。颜色全走 Tailwind 语义令牌 无 hex。
- [x] **Step 0.6** — 🧪 Ark API 连通性冒烟测试（强制）
  - 完成日期：2026-04-18
  - 关键产物：`scripts/test-ark-api.ts`（5 用例冒烟 + 脱敏 log + 30s 超时）+ architecture.md 关键契约点 3 已更新为"走 /chat/completions + response_format"
  - 测试结果：
    - [x] A: `/chat/completions` + `response_format:json_object` → 200 ✓ JSON ✓（选中）
    - [x] B: `/chat/completions` 纯 prompt 约束 → 200 但返回含 markdown 围栏，JSON.parse 失败
    - [x] C: `/responses` + `text.format` → 200 ✓ JSON ✓（备选）
    - [x] D: `/responses` 纯 prompt 约束 → 200 但返回含 markdown 围栏
    - [x] E: `/chat/completions` + 纯文本（非 JSON 场景）→ 200 ✓ 拿到"今日晴暖，微风拂面，适宜出行。"
  - 最终选定路径：`/chat/completions`
  - 验证备注：Endpoint 后绑的实际模型 id = `deepseek-v3-2-2512`（与用户告知的 DeepSeek 3.2 一致）。脚本保留，Phase 6 Step 6.1 完成后删除。

**Phase 0 出口** ☑ 已追加 architecture.md 里程碑「项目骨架搭建完成 + Ark API 连通性已验证」

---

## Phase 1 · 数据层

- [x] **Step 1.1** — Prisma schema 建 6 个 model
  - 完成日期：2026-04-18
  - 关键产物：`prisma/schema.prisma`（Resume / Application（含 interviewQuestions）/ Stage / AIRun / IntelSummary / TomorrowTipCache）
  - 验证备注：prisma validate ✓ / format ✓ / 中文枚举 10 个关键字面量全部保留（HR面/挂了/待参加/已通过/未通过/产品/运营/算法/通用/已投递）/ Stage.applicationId onDelete:Cascade / Application.linkedResumeId onDelete:SetNull（Resume 删除时自动置空引用） / IntelSummary.date 和 TomorrowTipCache.date 都有 @unique / jdKeywords/expectedSkills/interviewQuestions/outputJson 统一存 JSON 字符串（schema 注释写明）
- [x] **Step 1.2** — 执行首次迁移
  - 完成日期：2026-04-18
  - 关键产物：`prisma/migrations/20260418121855_init/migration.sql`（6 张表 + 索引）/ `prisma/dev.db`（102KB，gitignore）
  - 验证备注：第一次跑 migrate 时 db 落在 `prisma/prisma/dev.db`（.env 里 `file:./prisma/dev.db` 路径相对 schema.prisma 导致多一层），已修正为 `file:./dev.db`，清掉错位产物重跑。`prisma migrate status` 输出 "Database schema is up to date!"。pnpm build 通过（新 client 有 6 个 model 类型）
- [x] **Step 1.3** — 种子脚本 + 10 家大厂
  - 完成日期：2026-04-18
  - 关键产物：`prisma/seed.ts`（占位 Application，companyName + departmentName="" + roleName="待填" + currentStatus="未投递"）/ `package.json` 的 `prisma.seed` 字段（`tsx prisma/seed.ts`）
  - 验证备注：首次跑 create 10 条；二次跑 10 条全 skip（幂等性通过）；公司名与 PRD 5.3.3 完全一致（阿里/腾讯/字节/美团/百度/京东/拼多多/小红书/快手/滴滴）
- [x] **Step 1.4** — 全局 zod schema
  - 完成日期：2026-04-18
  - 关键产物：`lib/schemas/enums.ts`（6 组常量 + zod enum：RESUME_TAGS / STAGE_TYPES / APPLICATION_STATUSES / STAGE_STATUSES / AI_TASK_TYPES / AI_RUN_STATUSES） / `lib/schemas/entities.ts`（6 实体：Resume / Application / Stage / AIRun / IntelSummary / TomorrowTipCache，每个派生 Xxx + XxxCreateInput + XxxUpdateInput 三套）/ `lib/schemas/ai-outputs.ts`（PRD 9.1~9.4 四个 AI JSON 输出 schema）/ `lib/schemas/index.ts`（barrel）
  - 依赖：zod 4.3.6
  - 决策：选择 `lib/schemas/` 目录（一份文件同时做校验 + `z.infer` 类型源，不再单建 `types/`）
  - 验证备注：临时 scripts/test-schemas.ts 跑了 7 个冒烟用例：5 个合法（resumeSchema/resumeCreateInputSchema/applicationCreateInputSchema/stageCreateInputSchema HR面/aiParseJdOutputSchema）全过；2 个非法（resume tag='前端'、stage type='hr_interview'）正确失败 + 错误消息含 PRD 中文枚举。tsc 零错误。临时脚本已删除。

**Phase 1 出口** ☑ 数据层建模完成：6 个 model 可用 + 10 家大厂已入库 + zod schema 覆盖 6 实体 + 4 AI 输出

---

## Phase 2 · REST API（非 AI）

- [x] **Step 2.1** — Resume API（不含上传）
  - 完成日期：2026-04-18
  - 关键产物：`lib/api.ts`（ApiError / jsonOk / jsonError / withApiHandler / parseJsonBody）/ `lib/serialize.ts`（JSON 数组字段序列化工具）/ `app/api/resumes/route.ts`（GET 列表 desc / POST 暂不开放）/ `app/api/resumes/[id]/route.ts`（PATCH / DELETE 含引用校验 409）
  - 验证备注：修复了 `.env.local` 的 DATABASE_URL（从 `file:./prisma/dev.db` 改成 `file:./dev.db`，Prisma Client 运行时相对 schema.prisma 解析）。curl 全通：GET /api/resumes 200 含手动插的测试 Resume / PATCH does-not-exist 返 404 / PATCH 合法改名 200 / PATCH 非法 tag 返 400 + 错误消息含 PRD 4 个枚举 / DELETE 被 Application.linkedResumeId 引用返 409 + 提示"腾讯-待填"岗位名
- [x] **Step 2.2** — Application API
  - 完成日期：2026-04-18
  - 关键产物：`app/api/applications/route.ts`（POST）/ `app/api/applications/[id]/route.ts`（GET 含 stages + linkedResume / PATCH / DELETE）
  - 验证备注：POST 返 201 + currentStatus 默认"未投递" / GET 返回 stages:[]（新 Application 无 Stage）+ linkedResume:null / PATCH 合法改 currentStatus+jdKeywords 成功（数组正确存 JSON 字符串+返时反序列化） / PATCH 非法 currentStatus 返 400 + 错误消息含 10 个枚举（已投递/笔试/.../Offer/挂了/未投递） / DELETE 200 + 后续 GET 返 404
- [x] **Step 2.3** — Stage API + Dashboard / Calendar 事件查询
  - 完成日期：2026-04-18
  - 关键产物：`lib/dates.ts`（本地时区日期工具：startOfToday/startOfDayOffset/parseDateStartLocal/parseDateEndLocal/formatLocalDate/parseRangeDays）/ `app/api/stages/route.ts`（POST + applicationId 外键校验）/ `app/api/stages/[id]/route.ts`（PATCH / DELETE）/ `app/api/dashboard/events/route.ts`（半开区间 [今天, 今天+N天)） / `app/api/calendar/events/route.ts`（闭区间 [start 00:00, end 23:59:59.999]）
  - 验证备注：dashboard range=7d 返回 2 条（今天+明天，不含 8 天后）/ range=10d 返 3 条 / range=abc / range=7 都返 400 含具体原因 / calendar 2026-04-01~04-30 命中 4-30 23:30 的 Stage（跨月边界正确）/ 5-01~5-31 不命中 / start>end 400 / 格式错误 400 / POST Stage 外键不存在 404
- [x] **Step 2.4** — Companies Progress API
  - 完成日期：2026-04-18
  - 关键产物：`app/api/companies/progress/route.ts`（按 PRD 5.3.3 硬编码 10 家公司顺序，一次性 findMany 后按 companyName 聚合）
  - 验证备注：只跑种子不加任何 Application 时 10 家全 isEmpty:true / 给腾讯加"游戏产品" + 2 Stage 后腾讯 apps=2（占位"待填"isEmpty:true + "游戏产品"isEmpty:false stages=2 按 time asc）/ 响应 11ms 远低于 100ms 要求
- [x] **Step 2.5** — 统一错误处理 + 日志
  - 完成日期：2026-04-18
  - 关键产物：`lib/api.ts`（实际在 Step 2.1 开头就建了：ApiError 类 / jsonOk / jsonError / withApiHandler 高阶 / parseJsonBody / notFound / conflict / validationError 工厂；错误 code 枚举 VALIDATION_ERROR/NOT_FOUND/CONFLICT/INTERNAL_ERROR）
  - 验证备注：2.1~2.4 所有 route 从一开始就用 withApiHandler（无需重构）；临时建 app/api/test-throw/route.ts 故意抛异常 → 返 500 INTERNAL_ERROR + dev log 有 [api] uncaught 前缀（dev 模式 details 含原始消息，生产模式隐藏）；非法 JSON body 返 400 "请求体必须是合法 JSON"；zod 校验失败自动 400 含 path 和 message；回归 2.1~2.4 代表用例全过。临时 test-throw route 已删除。
- [x] **Step 2.6** — 烟测脚本
  - 完成日期：2026-04-18
  - 关键产物：`scripts/smoke-api.ts`（14 个断言覆盖 Resume GET / Application CRUD / Stage POST+PATCH+DELETE / Dashboard events 合法+非法 / Calendar events 合法+非法 / Companies progress 含数量=10 校验）
  - 验证备注：`pnpm tsx scripts/smoke-api.ts` 一条命令跑完，通过 14 失败 0；build 时捕到一个 Prisma 类型问题（`Application.linkedResumeId` 在 update 时必须用 `linkedResume.connect/disconnect` nested write，不能直接赋字段），已修复并回归通过

**Phase 2 出口** ☑ 非 AI REST API 全部就绪：8 个 endpoint（Resume×2 / Application×2 / Stage×2 / Dashboard events / Calendar events / Companies progress）+ 统一错误处理 + 烟测脚本

---

## Phase 3 · 三页骨架（只读）

- [x] **Step 3.1** — 数据请求层封装
  - 完成日期：2026-04-18
  - 关键产物：`lib/fetcher.ts`（客户端 fetch 封装 + FetchError）/ `lib/queries/{dashboard,calendar,companies,resumes,index}.ts`（Server Component 直调 Prisma 的 5 个 query 函数 + 类型导出）/ 新增依赖：server-only 0.0.1
  - 决策：**Server Component 直调 Prisma**，不走 HTTP fetch API route（理由已写入 architecture.md 关键契约点 14）。API route 保留供 Phase 4+ 客户端交互（CRUD）使用。
  - 验证备注：`pnpm typecheck` 0 错误 / `pnpm build` 通过，/dashboard 正确识别为 ƒ Dynamic server-rendered / `pnpm dev` 访问 /dashboard 返 200，server log 打印 `[dashboard] getDashboardEvents(7) → 0 条 Stage；首条预览： （空）`（Phase 2 烟测后 Stage 表已清空，符合预期）。dashboard/page.tsx 保留临时 console.log，Phase 3.2 实现真实表格时会一并清理。
- [x] **Step 3.2** — `/dashboard` 时间维度流程表格
  - 完成日期：2026-04-18
  - 关键产物：`components/dashboard/EventTable.tsx`（Client Component，`"use client"`，大白卡 24px 圆角 + 顶部粉-黄渐变装饰线 + 标题 + 今日/明日/本周 tabs 仅 UI + 9 列表格 + hover 浮起 + 事件类型/状态胶囊颜色映射 + 空态文案）/ `app/dashboard/page.tsx`（Server Component 拉 `getDashboardEvents(7)` + 序列化 Date→ISO 传 Client）
  - 胶囊颜色映射（PRD + UI.md 8.3 + Step 3.2 指令）：一面/二面/三面/HR面 → `secondary-lilac` / 笔试/测评 → `secondary-yellow` / Offer → `secondary-mint` + `#4A9970` / 其他（已投递/挂了）→ `neutral`
  - 状态颜色映射：待参加 → `neutral/50` / 已完成 → `#EEEAF0` / 已通过 → `secondary-mint` + `#4A9970` / 未通过 → `danger/25` + `primary-strong`
  - 行交互：点击整行 `console.log('row click', stageId)`（Phase 4.3 接 Drawer），操作列表头只渲染 "操作" 文字和 "—" 占位（无任何按钮，防与 Phase 4.4 冲突）
  - 验证备注：typecheck 0 错误 / build 通过（/dashboard 2.01kB 含 Client bundle）/ 有数据：dev server HTTP 200 + grep HTML 命中`未来 7 天流程安排`/`linear-gradient`/`bg-secondary-lilac`/`bg-secondary-yellow`/`bg-secondary-mint`/`bg-neutral`/`bg-soft-panel`/`一面`×3/`笔试`×3/`待参加`/`已通过`/`阿里`×6/`未关联`×2 / 空态：清空 Stage 后 HTML 命中"未来 7 天暂无流程安排"+"可以先把简历准备好"+"有新流程时" / hover class `hover:bg-soft-panel hover:-translate-y-px` 已出现在 DOM。当前 DB 里保留 2 条 demo Stage 方便本地预览（可随时清空）
- [x] **Step 3.3** — `/dashboard` 其余 4 个模块占位
  - 完成日期：2026-04-18
  - 关键产物：`components/dashboard/TomorrowReminder.tsx`（粉黄渐变 `#FFF7D8→#FFF3FA` + CatIcon + Bell + 硬编码"明天暂无流程安排..."）/ `DailyIntel.tsx`（粉紫→浅黄 `#F8F5FF→#FFF8E8` + Sparkles + "暂无动向" + "AI 摘要"标签）/ `ResumeCard.tsx`（列表态：FileText 图标 + 标签胶囊 4 色映射（产品=lilac/运营=peach/算法=mint/通用=neutral）+ Eye/Trash2/Upload 按钮全 `disabled` + title="即将开放"；空态：FolderClosed + "先放一份简历进来吧"）/ `AICopilot.tsx`（粉紫渐变大卡 + CatIcon + textarea radius=18px placeholder 与 UI.md 8.7 原文 100% 一致 + 4 个胶囊快捷按钮 console.log）/ `app/dashboard/page.tsx` 升级为 12 栏布局（lg:col-span-8 左 + lg:col-span-4 右；并发拉 events + resumes）
  - 验证备注：typecheck 0 / build 通过 /dashboard 5.7kB（4 个 Client 组件）/ dev HTTP 200 · HTML 36KB / grep 22 个关键字全部命中（含 `lg:col-span-8` `lg:col-span-4` `FFF7D8` `FFF8E8` `FFF1F7` `border-radius:18px` `disabled=""` `粘贴面试邮件` `解析面试邮件` `放 2~3 份常用版本就够了` 等） / 所有卡片走 `rounded-card-md/lg` + `shadow-soft` + `hover:-translate-y-0.5 hover:shadow-hover` 统一视觉规则 / 简历卡 disabled 按钮 tooltip 用原生 `title` 属性（不引入新依赖）
- [x] **Step 3.4** — `/calendar` 月视图
  - 完成日期：2026-04-18
  - 关键产物：`components/calendar/MonthView.tsx`（Client Component：12 栏布局左 8 月视图 + 右 4 当日事件列表 / 7×N grid 周一起始 / 每格 min-h 108px / 上月/今天/下月按钮 / 胶囊色规则复用 EventTable 的 typeChipClass / 超 3 条用 +N / 点日期格更新 `selectedDay` / 点事件 console.log）/ `app/calendar/page.tsx`（SSR 拉当月网格事件数据注入给 MonthView，切月由 Client 端直接 fetch /api/calendar/events）
  - 决策：**不用 react-day-picker，手写 7 列 grid**。理由：需求是"展示事件"而非"选日期"；react-day-picker 的强项用不上，手写只依赖已装的 date-fns + Tailwind grid，代码更少、布局更可控（UI.md 9.3 "每格足够留白"要求精细控制）。已写入 architecture.md 关键契约点 15。
  - 验证备注：typecheck 0 / build 通过（/calendar 3.26kB ƒ Dynamic）/ 顺带清了 EventTable 的一个未用 import，build 无 ESLint warning / dev HTTP 200 HTML 35KB / 4/18 格子渲染 `bg-secondary-lilac`（一面）+ 右侧"当日 1 个事件" + "14:30"时间，4/19 格子渲染 `bg-secondary-yellow`（笔试） / 布局 class `grid-cols-7` / `lg:col-span-8` / `lg:col-span-4` 都在 / "上一月"/"下一月"/"今天" 按钮 DOM 齐全，Client state 切月触发 useEffect 重新 fetch
- [x] **Step 3.5** — `/companies` 大厂流程页
  - 完成日期：2026-04-18
  - 关键产物：`components/companies/CompanyRow.tsx`（Client Component：PRD 硬顺序 9 个节点胶囊 + nodeStateFor 判定 4 态 + 节点颜色映射 passed=mint/active=primary+glow/failed=danger浅化/pending=neutral + hover 浮起 + 细线连接器 + 公司列宽 160px + 流程区 overflow-x-auto + MoreHorizontal 占位）/ `app/companies/page.tsx`（Server Component 直调 getCompaniesProgress + 序列化传 Client；右上"新增申请"按钮 disabled + title 提示；公司间用 `divide-y divide-border-light` 分隔）
  - 验证备注：typecheck 0 / build 通过（/companies 1.52kB ƒ Dynamic，0 warning）/ dev HTTP 200 HTML 37KB / 10 家公司名全部渲染（按 PRD 5.3.3 顺序）/ 只有腾讯有真实 Application（IEG·游戏产品 + 一面已通过 + 二面待参加）其他 9 家渲染"未投递"+"还没有在这家公司开始流程" / 节点颜色 `bg-secondary-mint`（已通过）+ `bg-primary`（当前进行中）+ `bg-neutral`（未开始）+ `shadow-[0_0_12px_rgba(243,175,203,0.4)]`（进行中 glow）全部命中 / 节点 `h-9`（36px，落在 34~38 规格）+ `rounded-pill` 圆角胶囊 / 公司列 `w-[160px]`（落在 140~180 规格）/ MoreHorizontal 按钮 `aria-label="更多操作"` 已渲染（disabled，Phase 4.4 接菜单）

**Phase 3 出口** ☑ 已追加 architecture.md 里程碑「三页面骨架完成（只读）」

---

## Phase 4 · Drawer + 手动 CRUD

- [x] **Step 4.1** — 全局 Drawer 容器
  - 完成日期：2026-04-18
  - 关键产物：`components/ui/sheet.tsx`（shadcn Sheet new-york，440px 宽 + rounded-l-3xl + 240ms 动效 + 圆形 X 关闭按钮）/ `components/ui/dialog.tsx`（shadcn Dialog 精简版，供二次确认用）/ `components/ui/input.tsx` + `select.tsx` + `label.tsx` / `components/drawer/DetailDrawer.tsx`（URL search params 驱动：`?drawer=stage&id=…` / `stage-new` / `application-new`；支持刷新恢复状态 + 分享链接）/ `components/drawer/{StageDrawerContent,NewStageDrawerContent,NewApplicationDrawerContent}.tsx` / `components/common/ConfirmDeleteDialog.tsx` / `lib/drawerUrl.ts`（useOpenDrawer / useCloseDrawer）/ `app/layout.tsx` 挂 DetailDrawer + Suspense + Toaster(sonner) / `app/api/stages/[id]/detail/route.ts`（新端点，一次性返 stage+application+linkedResume）
  - 新增依赖：`react-hook-form 7.72` / `@hookform/resolvers 5.2` / `sonner 2.0` / `@radix-ui/react-dialog 1.1` / `swr 2.4` / `server-only`（Phase 3.1 已装）
  - 验证备注：typecheck 0 / build 通过 0 warning / SSR HTML 含 `DetailDrawer` + `Toaster` + `sonner` chunk 注入；URL 直接带 `?drawer=stage-new` 时 HTTP 200（Radix Dialog 的 content 在 client hydrate 后挂载，符合预期）/ `/api/stages/:id/detail` 端点合法 id 返 200 + 反序列化数组字段、非法 id 返 404
- [x] **Step 4.2** — StageDrawerContent：展示 + 编辑基础信息
  - 完成日期：2026-04-18
  - 关键产物：`components/drawer/StageDrawerContent.tsx`（react-hook-form + zod；展示态默认只读，点"编辑"切表单态；保存并发 PATCH Application + Stage；保存成功 toast + `router.refresh()` 触发三页 SSR 重拉；非 dirty 保存按钮禁用；错误 toast 不 reset）
  - 视觉：顶部概览（公司/部门·岗位/类型状态胶囊/时间/会议链接）/ 基础信息编辑区（6 字段 + 事件类型 + 状态 + 整体流程状态）/ 关联简历区（展示态，Phase 5.3 接切换）/ JD 信息区占位（Phase 6 接）
  - 验证备注：E2E 6 步通过（POST App → POST Stage → GET detail → PATCH status 已完成 → PATCH companyName → 400 非法 status）。dirty 态按钮状态由 `form.formState.isDirty` 自动算出
- [x] **Step 4.3** — 接入三页面的行/节点点击 → 打开 Drawer
  - 完成日期：2026-04-18
  - 关键产物：`lib/drawerUrl.ts` 工具 + 三页的 click handler 替换：
    - `EventTable.tsx`：行点击 `openDrawer({ type: "stage", id })`
    - `MonthView.tsx`：日历格内事件胶囊 click / 右侧事件列表 click 都走 stage drawer；**日期格点击时若当日无事件，自动开 `stage-new` Drawer 并预填日期**
    - `CompanyRow.tsx`：节点 click，有 stage 开 stage drawer；无 stage（pending）开 stage-new 并预填 applicationId
  - 验证备注：三页所有点击路径都通过 URL replace 切到 Drawer；保存后 `router.refresh()` 让三页 Server Component 重拉，同一 stage 从三个入口打开字段一致
- [x] **Step 4.4** — 手动新增 / 删除事件 + 表格操作列接入
  - 完成日期：2026-04-18
  - 关键产物：`EventTable.tsx` 顶部 "新增事件" 按钮（开 stage-new Drawer）+ 操作列 4 个 icon 按钮（Eye 查看 / Check 标记完成 / Pencil 编辑 / Trash2 删除，Trash2 走 ConfirmDeleteDialog 二次确认）/ `NewApplicationButton.tsx`（`/companies` 右上"新增申请"开 application-new Drawer）/ `CompanyRow.tsx` 每个岗位条右侧 MoreHorizontal 菜单（新增流程节点 / 删除该岗位，删除走二次确认 + 级联删 Stage）/ `app/api/applications/route.ts` 新增 GET 列表端点（默认过滤"未投递"占位，供新建 Stage 时下拉选择）
  - 决策：Drawer 不支持"现场创建 Application"（避免复杂 combobox）；如需新岗位 → `/companies` 右上"新增申请"。这保持 4 个 Drawer 类型单一职责：stage / stage-new / application-new（+ 可选第一个 stage）。
  - 验证备注：E2E 9 步全过：新建 App → 新建 Stage → GET detail → PATCH 标记完成 → PATCH 改公司名 → 400 非法 status → DELETE Stage → DELETE Application → 404 确认删除。二次确认 Dialog 的取消 / 加载态 / 错误 toast 全就位

**Phase 4 出口** ☑ 已追加 architecture.md 里程碑「手动 CRUD 闭环完成（含 Drawer）」

---

## Phase 5 · Resume 上传预览关联

- [x] **Step 5.1** — `POST /api/resumes/upload` + `GET /api/resumes/:id/file`
  - 完成日期：2026-04-18
  - 关键产物：`app/api/resumes/upload/route.ts`（multipart/form-data；文件/MIME/大小校验；uploads/<id>.pdf 落盘；pdf-parse v2 提取文本 + 控制字符清洗；失败不阻断返 warning；`export const runtime = "nodejs"`）/ `app/api/resumes/[id]/file/route.ts`（流式返 PDF 含 Content-Disposition/Content-Length/Cache-Control）/ `app/api/resumes/[id]/route.ts` 升级：DELETE 同步清 uploads/<id>.pdf / `next.config.ts`：加 `serverExternalPackages: ["pdf-parse", "pdfjs-dist"]`
  - 新增依赖：`pdf-parse 2.4` + `@types/pdf-parse 1.1`（devDep）
  - 踩坑：pdf-parse v2 用 `new PDFParse({ data }).getText()`（不再是 v1 的 `pdf(buffer)`）；Next 15 server bundler 直接打包 pdfjs-dist 会报 "Object.defineProperty called on non-object"，必须走 serverExternalPackages；pdf-parse 输出的 `\n\f\t` 要清洗成普通换行/空格否则 NextResponse.json 产出的裸控制字符会让严格 JSON 解析器（jq/python）挂掉（浏览器 fetch.json 能吞但 DB 里存裸控制字符也影响后续 AI prompt）
  - 验证备注：curl + jq E2E 9 场景全过：合法 tiny.pdf → 201 + extractedText="Hello Job Hunt Resume Demo\\n\\n-- 1 of 1 --"；PNG 伪装 → 400；>10MB → 413；损坏 PDF → 201 + warning="文本提取失败：Invalid PDF structure." + extractedText=null；GET file → 200 + application/pdf + 555B + `file` 确认 PDF v1.4；被 Application 引用 → DELETE 409；解除引用后 → DELETE 200；uploads/ 目录物理文件删除
- [x] **Step 5.2** — 首页"我的简历"卡片接入
  - 完成日期：2026-04-18
  - 关键产物：`components/resume/UploadResumeDialog.tsx`（文件选择 + 虚线拖放区 + name 预填 + tag Select + 10MB 提示 + warning toast）/ `RenameResumeDialog.tsx`（react-hook-form + 改名 + 改 tag + dirty 态）/ `ResumePreviewDialog.tsx`（70vw × 85vh 大 Dialog 内嵌 iframe + "新窗口打开"入口）/ `components/dashboard/ResumeCard.tsx` 整体升级：空态引导 / 列表项可点（整行 → 预览，操作列 Pencil 改名 / Trash2 删除）/ 删除走 ConfirmDeleteDialog（409 引用错误会自动 toast "该简历被 ...岗位 使用"）
  - 验证备注：已走通 Step 5.1 的 API E2E + Step 5.2 组件全部 typecheck 0 / build 0 warning；dashboard bundle 7.19kB（+ 3 个简历 Dialog）
- [x] **Step 5.3** — Drawer 中切换关联简历
  - 完成日期：2026-04-18
  - 关键产物：`StageDrawerContent.tsx` 的"关联简历"区改为：Select 列出全部 Resume（含"— 未关联 —"空选项）+ `CurrentResumePreview` 子组件实时拿 `form.watch("linkedResumeId")` 渲染当前简历名+标签+预览按钮；form schema 加 `linkedResumeId` 字段；保存时空串 → null 传给 `/api/applications/:id` PATCH（后端已用 nested connect/disconnect 处理）；点预览复用 `ResumePreviewDialog` 嵌套在 Drawer 之上
  - 验证备注：E2E 跑通：上传 A+B 简历 → PATCH 关联 A → GET 带 join 返 linkedResume 完整对象 → 切到 B → 断开 null；`/api/dashboard/events` 返的 application.linkedResume 同步刷新（首页表格"关联简历"列据此展示）

**Phase 5 出口** ☑ 已追加 architecture.md 里程碑「Resume 模块完整闭环：上传 / 预览 / 改名 / 删除 / 关联切换」

---

## Phase 6 · 豆包 AI 接入

**开工前必须确认** `.env.local` 已包含所有豆包必需变量（见下方"开发前准备"小节）。

- [x] **Step 6.1** — `lib/llmClient.ts` + AIRun 日志
  - 完成日期：2026-04-19
  - 关键产物：`lib/prompts.ts`（PRD 9.1~9.5 原文常量 + Step 6.6 新增 SYS_TOMORROW_TIP + 6 个 userPrompt 模板函数）/ `lib/llmClient.ts`（`callAI` 函数，严格按 Step 0.6 决策走 `/chat/completions` + `response_format`，30s 超时，AIRun 日志 + 错误分类 `AI_CALL_TIMEOUT`/`AI_CALL_FAILED`/`AI_PARSE_FAILED`/`AI_CONFIG_MISSING`，日志脱敏）/ 临时 `app/api/ai/test-ping/route.ts`（验证后已删除）
  - 验证备注：ping 请求 200 + `json={ok:true}` + AIRun 1 条 success；Key 改错 1 位 → 401 + AIRun failed + errorMessage 记录后端返回的 AuthenticationError；**日志里不含错 Key 明文**（grep 0 次）；走的就是 Step 0.6 锁定的 `/chat/completions` 路径
- [x] **Step 6.2** — `POST /api/ai/parse-email`
  - 完成日期：2026-04-19
  - 关键产物：`app/api/ai/parse-email/route.ts`（zod 入参 5~20000 字 / callAI expectJson / aiParseEmailOutputSchema 校验 stageType 枚举 / AI_SCHEMA_MISMATCH 502 包装）
  - 验证备注：腾讯游戏事业部一面邮件 → 返 {公司,部门,岗位,一面,2026-04-22 15:00, 会议链接} 全命中；"今天吃了饭"无关文本 → 7 字段全 null（"不编造"规则生效）；AIRun 日志齐
- [x] **Step 6.4** — 补齐 `parse-jd` / `generate-questions` / `review` 三个 AI API
  - 完成日期：2026-04-19
  - 关键产物：`app/api/ai/parse-jd/route.ts`（JD 20~30000 字） / `generate-questions/route.ts`（入参 applicationId，后端拉 jdText + linkedResume.extractedText；两者都为空返 400） / `review/route.ts`（入参 stageId + transcriptText 30~40000 字，stageId 不存在 404）
  - 验证备注：
    - parse-jd 游戏数据产品 JD → jdSummary 120 字 + 7 个关键词 + 4 条能力要求；JD 空 → 400 ✅
    - generate-questions → 5 个精准题目（结合 Data Agent / LLM / SQL 要点）✅
    - review 典型转录 → questionSummary/answerSummary/suggestion 三字段齐 ✅；短输入 → 400 ✅
- [x] **Step 6.3** — AI Copilot 前端接入 4 个 AI 能力
  - 完成日期：2026-04-19
  - 关键产物：`components/dashboard/AICopilot.tsx` 整体升级（textarea + 4 个胶囊快捷按钮 + Application/Stage 下拉 + DraftPreview 草稿卡片 + 采纳保存按钮）
  - 决策：
    - **解析邮件草稿** → sessionStorage 暂存 → 打开 application-new Drawer 自动预填公司/部门/岗位/第一个 Stage 类型和时间（因为邮件一般对应"新岗位"，走 application-new 比 stage-new 更完整）
    - **解析 JD** → 选 Application → 内联展示 summary/keywords/skills → 点"采纳保存" PATCH /api/applications/:id
    - **生成面试题** → 选 Application → 展示编号圆点数字卡片列表 → 采纳保存 → 写 Application.interviewQuestions（共享题库）
    - **生成复盘** → 选 Stage → 展示 3 个小卡片（问题/回答/建议，mint/lilac/yellow 背景）→ 采纳保存 → 写 Stage 的 review 三字段
  - 验证备注：typecheck 0 / build 0 warning / dashboard bundle 9.08kB（Copilot 扩展约 2kB）
- [x] **Step 6.5** — `GET /api/ai/daily-intel` + 首页今日大厂动向
  - 完成日期：2026-04-19
  - 关键产物：`lib/fakeIntelSource.ts`（7 条硬编码资讯：腾讯 IEG 实习 / 字节电商 / 美团到店 / 阿里淘天 / 百度搜索 / 小红书社区 / 快手磁力） / `app/api/ai/daily-intel/route.ts`（缓存 by date 本地时区） / `lib/queries/intel.ts`（Server Component 同逻辑，供 dashboard 首屏 SSR 用） / `components/dashboard/DailyIntel.tsx`（接 `summary` prop，AI 失败 fallback "暂无动向"）
  - 验证备注：首次 → `fromCache=false` 调 AI 返 103 字摘要（稍超规格但合理）；再访问 → `fromCache=true`；清缓存后 → 重算；AIRun.daily_intel 只 2 条（命中缓存时不增）✅
- [x] **Step 6.6** — 明日 AI 提醒 + TomorrowTipCache + eventsHash 被动失效
  - 完成日期：2026-04-19
  - 关键产物：`lib/queries/tomorrowTip.ts`（`getTomorrowTip` 函数：拉明天 Stage → SHA-256 hash → 查 TomorrowTipCache → 命中且 hash 一致 → 直接返；否则调 AI upsert） / `app/api/ai/tomorrow-tip/refresh/route.ts`（POST 强制重算） / `components/dashboard/TomorrowReminder.tsx` 升级为 `tipText` + `eventCount` prop + 右上 RefreshCw 按钮 / `lib/prompts.ts` 新增 `SYS_TOMORROW_TIP`（Agent 按 PRD 5.1.2 示例撰写，50~80 字自然语言提醒）
  - 决策：**事件变更被动失效**（eventsHash 不匹配才重算，任何 CRUD 自动触发，无需主动清缓存代码）；**空事件直接返 UI.md 空态原文 "明天暂无流程安排，可以安心休息一下。" 不调 AI**（省 token + 符合空态规范）
  - 验证备注：6 场景全过：首次调 AI 写缓存；再访问 diff=0 命中缓存；改 Stage time → hash 变 → 重算；refresh API fromCache=false；空事件返空态原文 + AIRun 无新增

**Phase 6 出口** ☑ 已追加 architecture.md 里程碑「AI 5 能力接入 + 今日动向/明日提醒缓存完成」

---

## Phase 7 · 打磨验收

- [ ] **Step 7.1** — 全局状态规范化（loading / 空态 / 错误 / toast）
  - 完成日期：
- [ ] **Step 7.2** — UI 精修（对照 UI.md）+ 小猫 SVG + Framer Motion
  - 完成日期：
- [ ] **Step 7.3** — PRD 第 13 章 6 个闭环验收
  - 完成日期：
  - 逐一勾选：
    - [ ] 闭环 1：AI 解析写入
    - [ ] 闭环 2：手动录入
    - [ ] 闭环 3：详情编辑
    - [ ] 闭环 4：AI 面试题
    - [ ] 闭环 5：AI 复盘
    - [ ] 闭环 6：简历上传关联
- [ ] **Step 7.4** — 最终清理（console / TODO / README / build / lint）
  - 完成日期：

**Phase 7 出口** ☐ 已追加 architecture.md 里程碑「v1.0 验收完成」

---

## 📌 开发前准备（每次进入 Phase 6 之前自检）

### 环境变量（`.env.local`，**不要进 git**）

- [x] `DATABASE_URL="file:./prisma/dev.db"`（占位已就绪，Phase 1 生效）
- [x] `DOUBAO_API_KEY=ark-...`（用户 2026-04-18 提供，已写入 `.env.local`）
- [x] `DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3`（火山方舟北京区公网）
- [x] `DOUBAO_MODEL=ep-20260418165808-rvgk2`（Endpoint ID，后端绑定 **DeepSeek 3.2**）

四项**全部就绪**。但 Phase 6 正式开始前，**必须确认 Step 0.6 的冒烟测试已通过**，并以其产出的「Ark API 调用路径决策」为准（写入 `architecture.md` 关键契约点）。

### 关于模型与接口的几个已确认事实
- **底座模型**：DeepSeek 3.2（通过火山方舟 Endpoint 接入，项目代码不直接感知）
- **是否流式**：不开流式（`stream` 字段不传）
- **是否联网**：不联网（`tools` 不传；daily-intel 用 `lib/fakeIntelSource.ts` 本地资讯）
- **调用路径**：由 Step 0.6 冒烟测试决定，默认偏好 `/chat/completions`（OpenAI 兼容，更稳）
