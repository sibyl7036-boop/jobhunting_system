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
| 0 | 项目骨架 + git 基线 + API 连通性验证 | 7 | 1/7 | ✅⬜⬜⬜⬜⬜⬜ |
| 1 | 数据层（6 个 model） | 4 | 0/4 | ⬜⬜⬜⬜ |
| 2 | REST API（非 AI） | 6 | 0/6 | ⬜⬜⬜⬜⬜⬜ |
| 3 | 三页骨架 | 5 | 0/5 | ⬜⬜⬜⬜⬜ |
| 4 | Drawer + 手动 CRUD | 4 | 0/4 | ⬜⬜⬜⬜ |
| 5 | Resume 上传预览关联 | 3 | 0/3 | ⬜⬜⬜ |
| 6 | 豆包 AI 接入 | 6 | 0/6 | ⬜⬜⬜⬜⬜⬜ |
| 7 | 打磨验收 | 4 | 0/4 | ⬜⬜⬜⬜ |
| **合计** | | **39** | **1/39** | **3%** |

---

## Phase 0 · 项目骨架

- [x] **Step 0.1** — Next.js 脚手架初始化
  - 完成日期：2026-04-18
  - 关键产物：`package.json` / `tsconfig.json` / `next.config.ts` / `tailwind.config.ts` / `postcss.config.mjs` / `.eslintrc.json` / `next-env.d.ts` / `app/` / `public/`
  - 验证备注：Next 15.5.15 + React 18.3 + Tailwind 3.4.19 + TS 5.9 + ESLint 8.57 + eslint-config-next 15.5（官方脚手架默认 Next 16 + Tailwind 4 + React 19，与 tech_stack 规格不符，已强制降版）。build 3.4s / lint 0 warn / dev 3000 HTTP 200 含中文内容。已去掉 Geist 字体引用（Step 0.2 换 PingFang SC）；页面暂保留脚手架欢迎页（Step 0.5 替换为重定向到 /dashboard）。
- [ ] **Step 0.1.5** — 验证 git 仓库状态并建立提交基线
  - 完成日期：
  - 关键产物：`.git` 初始化就绪 / 首次基线 commit / `phase0-step1-done` tag
  - 验证备注：
- [ ] **Step 0.2** — 配置 Tailwind 马卡龙粉主题
  - 完成日期：
  - 关键产物：`tailwind.config.*`（扩展 colors）/ `app/globals.css`
  - 验证备注：
- [ ] **Step 0.3** — 接入 shadcn/ui
  - 完成日期：
  - 关键产物：`components/ui/button.tsx` / `lib/utils.ts` / CSS 变量覆盖
  - 验证备注：
- [ ] **Step 0.4** — 接入 Prisma + SQLite（仅连通，不建模）
  - 完成日期：
  - 关键产物：`prisma/schema.prisma`（空）/ `lib/db.ts` / `.env` / `.gitignore` 增补
  - 验证备注：
- [ ] **Step 0.5** — 全局布局骨架（左导航 + 顶 Header + 内容区）
  - 完成日期：
  - 关键产物：`app/layout.tsx` / `app/dashboard/page.tsx` / `app/calendar/page.tsx` / `app/companies/page.tsx`
  - 验证备注：
- [ ] **Step 0.6** — 🧪 Ark API 连通性冒烟测试（强制）
  - 完成日期：
  - 关键产物：`scripts/test-ark-api.ts`（临时脚本）+ architecture.md "关键契约点 · Ark API 调用路径决策"
  - 测试结果：
    - [ ] A: `/chat/completions` + `response_format:json_object` → ＿＿
    - [ ] B: `/chat/completions` 纯 prompt 约束 → ＿＿
    - [ ] C: `/responses` + `text.format` → ＿＿
    - [ ] D: `/responses` 纯 prompt 约束 → ＿＿
  - 最终选定路径：`/chat/completions` 或 `/responses`
  - 验证备注：

**Phase 0 出口** ☐ 已追加 architecture.md 里程碑「项目骨架搭建完成 + Ark API 连通性已验证」

---

## Phase 1 · 数据层

- [ ] **Step 1.1** — Prisma schema 建 6 个 model
  - 完成日期：
  - 关键产物：`prisma/schema.prisma`（Resume / Application（含 interviewQuestions）/ Stage / AIRun / IntelSummary / TomorrowTipCache）
  - 验证备注：
- [ ] **Step 1.2** — 执行首次迁移
  - 完成日期：
  - 关键产物：`prisma/migrations/*_init/` / `prisma/dev.db`
  - 验证备注：
- [ ] **Step 1.3** — 种子脚本 + 10 家大厂
  - 完成日期：
  - 关键产物：`prisma/seed.ts` / `package.json` 的 `prisma.seed` 字段
  - 验证备注：
- [ ] **Step 1.4** — 全局 zod schema
  - 完成日期：
  - 关键产物：`lib/schemas/*`（或 `types/*`）
  - 验证备注：

**Phase 1 出口** ☐ 已追加 architecture.md 里程碑「数据层建模完成」

---

## Phase 2 · REST API（非 AI）

- [ ] **Step 2.1** — Resume API（不含上传）
  - 完成日期：
  - 关键产物：`app/api/resumes/route.ts` / `app/api/resumes/[id]/route.ts`
- [ ] **Step 2.2** — Application API
  - 完成日期：
  - 关键产物：`app/api/applications/[id]/route.ts` / `app/api/applications/route.ts`（POST）
- [ ] **Step 2.3** — Stage API + Dashboard / Calendar 事件查询
  - 完成日期：
  - 关键产物：`app/api/stages/**` / `app/api/dashboard/events/route.ts` / `app/api/calendar/events/route.ts`
- [ ] **Step 2.4** — Companies Progress API
  - 完成日期：
  - 关键产物：`app/api/companies/progress/route.ts`
- [ ] **Step 2.5** — 统一错误处理 + 日志
  - 完成日期：
  - 关键产物：`lib/api.ts` / 所有 route 重构
- [ ] **Step 2.6** — 烟测脚本
  - 完成日期：
  - 关键产物：`scripts/smoke-api.ts`

**Phase 2 出口** ☐ 已追加 architecture.md 里程碑「非 AI REST API 全部就绪」

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
