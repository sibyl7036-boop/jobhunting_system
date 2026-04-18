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
| 3 | 三页骨架 | 5 | 0/5 | ⬜⬜⬜⬜⬜ |
| 4 | Drawer + 手动 CRUD | 4 | 0/4 | ⬜⬜⬜⬜ |
| 5 | Resume 上传预览关联 | 3 | 0/3 | ⬜⬜⬜ |
| 6 | 豆包 AI 接入 | 6 | 0/6 | ⬜⬜⬜⬜⬜⬜ |
| 7 | 打磨验收 | 4 | 0/4 | ⬜⬜⬜⬜ |
| **合计** | | **39** | **17/39** | **44%** |

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

- [ ] **Step 3.1** — 数据请求层封装
  - 完成日期：
  - 关键产物：`lib/fetcher.ts` / `lib/queries/*`
- [ ] **Step 3.2** — `/dashboard` 时间维度流程表格
  - 完成日期：
  - 关键产物：`app/dashboard/page.tsx` / `components/dashboard/EventTable.tsx`
- [ ] **Step 3.3** — `/dashboard` 其余 4 个模块占位
  - 完成日期：
  - 关键产物：`components/dashboard/TomorrowReminder.tsx` / `DailyIntel.tsx` / `ResumeCard.tsx` / `AICopilot.tsx`
- [ ] **Step 3.4** — `/calendar` 月视图
  - 完成日期：
  - 关键产物：`app/calendar/page.tsx` / `components/calendar/MonthView.tsx`
- [ ] **Step 3.5** — `/companies` 大厂流程页
  - 完成日期：
  - 关键产物：`app/companies/page.tsx` / `components/companies/CompanyRow.tsx`

**Phase 3 出口** ☐ 已追加 architecture.md 里程碑「三页面骨架完成（只读）」

---

## Phase 4 · Drawer + 手动 CRUD

- [ ] **Step 4.1** — 全局 Drawer 容器
  - 完成日期：
  - 关键产物：`components/drawer/DetailDrawer.tsx`（或类似）+ URL 参数方案
- [ ] **Step 4.2** — StageDrawerContent 展示 + 编辑基础信息
  - 完成日期：
  - 关键产物：`components/drawer/StageDrawerContent.tsx`
- [ ] **Step 4.3** — 三页接入行/节点点击 → 打开 Drawer
  - 完成日期：
- [ ] **Step 4.4** — 手动新增 / 删除事件
  - 完成日期：
  - 关键产物：`components/drawer/NewStageDrawer.tsx` + 三页入口按钮

**Phase 4 出口** ☐ 已追加 architecture.md 里程碑「手动 CRUD 闭环完成（含 Drawer）」

---

## Phase 5 · Resume 上传预览关联

- [ ] **Step 5.1** — `POST /api/resumes/upload` + `GET /api/resumes/:id/file`
  - 完成日期：
  - 关键产物：`app/api/resumes/upload/route.ts` / `app/api/resumes/[id]/file/route.ts` / `uploads/` 目录
- [ ] **Step 5.2** — 首页「我的简历」卡片接入
  - 完成日期：
  - 关键产物：`components/dashboard/ResumeCard.tsx`（完整态）
- [ ] **Step 5.3** — Drawer 中切换关联简历
  - 完成日期：

**Phase 5 出口** ☐ 已追加 architecture.md 里程碑「Resume 模块完整闭环」

---

## Phase 6 · 豆包 AI 接入

**开工前必须确认** `.env.local` 已包含所有豆包必需变量（见下方"开发前准备"小节）。

- [ ] **Step 6.1** — `lib/llmClient.ts` + AIRun 日志
  - 完成日期：
  - 关键产物：`lib/llmClient.ts`（导出 `callAI`，按 Step 0.6 决策的路径实现）/ `lib/prompts.ts`（PRD 9.1~9.5 原文常量）
- [ ] **Step 6.2** — `POST /api/ai/parse-email`
  - 完成日期：
  - 关键产物：`app/api/ai/parse-email/route.ts`
- [ ] **Step 6.3** — AI Copilot 前端接入 4 个能力
  - 完成日期：
- [ ] **Step 6.4** — `parse-jd` / `generate-questions` / `review` 三个 AI API
  - 完成日期：
  - 关键产物：`app/api/ai/parse-jd/route.ts` / `app/api/ai/generate-questions/route.ts` / `app/api/ai/review/route.ts`
- [ ] **Step 6.5** — `GET /api/ai/daily-intel` + 首页大厂动向
  - 完成日期：
  - 关键产物：`app/api/ai/daily-intel/route.ts` / `lib/fakeIntelSource.ts`
- [ ] **Step 6.6** — 明日 AI 提醒
  - 完成日期：

**Phase 6 出口** ☐ 已追加 architecture.md 里程碑「AI 能力 5/5 全部接入」

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
