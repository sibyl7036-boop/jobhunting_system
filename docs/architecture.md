# architecture.md · 文件地图 + 关键契约点

> **本文件是当前仓库的文件地图 + 架构决策清单。**
> 任何 Agent 进入仓库后，**30 秒内就能知道每个文件/文件夹是干什么的 + 改动前要对齐哪些决策**。
>
> **职责边界**（互不越位）：
> - 本文件记录 **"是什么"**（文件地图）+ **"为什么这么做"**（关键契约点）
> - [`CHANGELOG.md`](../CHANGELOG.md) 记录 **"改过啥"**（维护期动作流水）
> - [`../.workbuddy/memory/MEMORY.md`](../.workbuddy/memory/MEMORY.md) 记录 **"用户偏好"**（跨会话稳定事实）
> - [`prd.md`](./prd.md) / [`ui-guide.md`](./ui-guide.md) 记录 **"产品规格"**（长期参照）
> - [`legacy/`](./legacy/) 是 v1.0 建设期历史快照，**冻结不维护**
>
> **更新规则**：新增 / 删除 / 重命名 / 移动任何文件或目录时，必须同步更新本文件对应行。做出新的架构决策时，在"关键契约点"末尾追加一条。

---

## 🗺️ 当前仓库文件地图（v2.0-maintenance-r1 · 2026-04-26）

**生产环境**：[https://system-pi-three.vercel.app](https://system-pi-three.vercel.app) · Vercel Hobby + Neon Postgres (Singapore pooled) + 豆包 API (DeepSeek 3.2 Endpoint)

```
system/
├── README.md                      · 面向最终用户（含在线 demo 链接 + 快速启动）
├── CODEBUDDY.md                   · 面向 AI Agent 的入口（强制阅读门禁 · 红线守则）
├── CHANGELOG.md                   · 维护期动作流水（按时间倒序 · 最新在最上）
│
├── docs/                          ← 所有长文档归这里
│   ├── architecture.md            · 本文件：文件地图 + 30 条契约点
│   ├── tech-stack.md              · 技术栈详解（版本锁定 + 选型理由）
│   ├── prd.md                     · 产品需求文档（长期参照）
│   ├── ui-guide.md                · 视觉规范（马卡龙配色 + 组件视觉规则）
│   └── legacy/                    ← v1.0 建设期冻结快照（不再维护）
│       ├── README.md              · 说明为什么冻结 + 如何查阅
│       ├── implementation_plan.md · v1.0 的 7 Phase / 39 Step 指令手册
│       ├── progress.md            · v1.0 的逐步勾选清单（39/39 ✅）
│       ├── architecture.md        · v1.0 版本的旧文件地图
│       └── tech_stack.md          · v1.0 版本的旧技术栈文档
│
├── .workbuddy/                    · 工作记忆（不进 git；跨会话上下文）
│   └── memory/
│       ├── MEMORY.md              · 长期事实（用户偏好 · 项目约定）
│       └── YYYY-MM-DD.md          · 日度笔记
│
├── .env / .env.local              · Prisma CLI / Next.js runtime 用；不进 git
├── .gitignore / .eslintrc.json
├── package.json / pnpm-lock.yaml / pnpm-workspace.yaml
├── tsconfig.json / next-env.d.ts / next.config.ts
├── tailwind.config.ts / postcss.config.mjs / components.json
│
├── middleware.ts                  · Edge 运行时 · JWT 验签 + 路由保护（契约点 27）
│
├── app/                           ← Next.js App Router
│   ├── layout.tsx                 · 全局 Shell（鉴权感知 · Toaster · DetailDrawer）
│   ├── page.tsx                   · / → 重定向 /dashboard
│   ├── globals.css / favicon.ico
│   ├── loading.tsx / error.tsx    · 全局 loading / error 边界
│   │
│   ├── login/
│   │   └── page.tsx               · 登录/注册页（左侧 4 能力卡 + 右侧 LoginForm）
│   │
│   ├── dashboard/
│   │   ├── page.tsx               · 首页 v2 布局（契约点 29）
│   │   └── loading.tsx
│   ├── calendar/
│   │   ├── page.tsx               · 日历月视图 + 右侧便签书签
│   │   └── loading.tsx
│   ├── companies/
│   │   ├── page.tsx               · 公司流程页（预置 + 自定义 · 契约点 30）
│   │   └── loading.tsx
│   │
│   └── api/                       ← 所有后端 Route Handler
│       ├── auth/                  · /login /register /logout /me（契约点 27）
│       ├── resumes/               · GET 列表 / PATCH / DELETE / upload / [id]/file
│       ├── applications/          · GET / POST / PATCH / DELETE
│       ├── stages/                · POST / PATCH / DELETE / [id]/detail
│       ├── companies/             · 自定义公司 CRUD（progress 子路由是聚合查询）
│       ├── weekly-todos/          · 周便签 Todo CRUD
│       ├── dashboard/events/      · 首页事件半开区间查询
│       ├── calendar/events/       · 日历事件闭区间查询
│       └── ai/                    · chat / parse-email / parse-jd / generate-questions /
│                                    review / daily-intel / tomorrow-tip/refresh
│
├── components/
│   ├── ui/                        · shadcn/ui 复制进项目的组件（可自由改）
│   │   ├── button / dialog / input / label / select / sheet / skeleton
│   │   └── JobCombobox.tsx        · 自研 · 岗位选择器
│   │
│   ├── auth/LoginForm.tsx         · 登录/注册表单
│   ├── onboarding/OnboardingDialog.tsx · 新手引导多步向导
│   │
│   ├── layout/
│   │   ├── AppShell.tsx           · 按 pathname 条件渲染（/login 走全屏）
│   │   ├── Sidebar.tsx            · 76px 窄边 + 花朵 Logo + 底部引导按钮
│   │   └── Header.tsx             · 日期胶囊 + 昵称首字母头像 + 下拉菜单
│   │
│   ├── dashboard/                 · 首页组件
│   │   ├── EventTable.tsx         · 流程表格（今日/明日/本周 Tab）
│   │   ├── AIChatPanel.tsx        · AI 聊天主入口（紧凑卡 + 全屏弹窗双形态）
│   │   ├── AIWorkstation.tsx      · AI 解析工作区（挂在全屏弹窗内）
│   │   ├── AICopilot.tsx          · v1 版 Copilot（保留备用 · 页面未引用）
│   │   ├── TomorrowReminder.tsx   · 明日提醒卡
│   │   ├── DailyIntel.tsx         · 今日大厂动向卡
│   │   ├── MiniResumePanel.tsx    · 右栏迷你简历
│   │   ├── MiniStatsColumn.tsx    · 3 格统计（今日/明日/近 7 天）
│   │   ├── QuickAddFab.tsx        · 全局右下浮动新增按钮
│   │   ├── QuickStats.tsx / TodayTimeline.tsx · 组件库件（备用）
│   │   └── ResumeCard.tsx         · 简历列表卡（旧版 · 某些位置仍引用）
│   │
│   ├── calendar/MonthView.tsx     · 月视图 7 列 grid（契约点 15）
│   ├── companies/
│   │   ├── CompanyRow.tsx         · 单公司行 · 9 节点胶囊 + 菜单
│   │   ├── CustomCompanyManager.tsx · 自定义公司管理
│   │   ├── NewApplicationButton.tsx · 右上新增申请
│   │   └── hiddenPresetStore.ts   · localStorage 隐藏偏好（契约点 30）
│   │
│   ├── drawer/
│   │   ├── DetailDrawer.tsx       · URL 参数驱动的 Drawer 容器（契约点 16）
│   │   ├── StageDrawerContent.tsx · Stage 详情 + 编辑 + 三子 Tab 切换
│   │   ├── NewStageDrawerContent.tsx · 新建 Stage
│   │   ├── NewApplicationDrawerContent.tsx · 新建 Application（支持 AI 草稿预填）
│   │   └── tabs/                  · Stage 子 Tab（契约点 28）
│   │       ├── InterviewQuestionsTab.tsx · 面试题
│   │       ├── PersonalNotesTab.tsx      · 随手记
│   │       └── ReviewTab.tsx             · 复盘 + 原始转录
│   │
│   ├── widgets/StickyTodoPanel.tsx · 便签式周 Todo（card / bookmark 双形态）
│   ├── resume/                    · 上传 / 改名 / 预览 Dialog
│   ├── common/                    · EmptyState / ErrorState / ConfirmDeleteDialog
│   └── CatIcon.tsx                · 自定义小猫 SVG（支持 busy / staticIcon prop）
│
├── lib/
│   ├── db.ts                      · Prisma Client 单例（契约点 1）
│   ├── auth.ts                    · bcryptjs + jose + Cookie Session（契约点 27）
│   ├── llmClient.ts               · 豆包 API 唯一出口 · callAI（契约点 2 · 3）
│   ├── prompts.ts                 · PRD 9.1~9.5 system prompt 原文 + userPrompt 模板
│   ├── fakeIntelSource.ts         · 7 条硬编码大厂资讯（daily-intel 数据源）
│   ├── api.ts                     · ApiError / withApiHandler / jsonOk 等（契约点 12）
│   ├── serialize.ts               · JSON 字符串数组字段序列化（契约点 11）
│   ├── dates.ts                   · 本地时区日期工具（契约点 13）
│   ├── drawerUrl.ts               · useOpenDrawer / useCloseDrawer（契约点 16）
│   ├── fetcher.ts                 · 客户端 fetchJson + FetchError
│   ├── utils.ts                   · cn() 等
│   ├── schemas/                   · zod schema（契约点 10）
│   │   ├── enums.ts / entities.ts / ai-outputs.ts / index.ts
│   └── queries/                   · Server Component 直调 Prisma（契约点 14）
│       ├── dashboard.ts / calendar.ts / companies.ts / resumes.ts
│       ├── intel.ts / tomorrowTip.ts
│       └── index.ts
│
├── prisma/
│   ├── schema.prisma              · 9 个 model（User + 6 业务 + CustomCompany + WeeklyTodo）
│   │                                provider=postgresql
│   ├── seed.ts                    · 幂等种子：10 家大厂（系统级 · 不绑 userId）
│   ├── dev.db                     · 本地 SQLite 遗留（gitignore · 回退用）
│   └── migrations/                · 迁移目录（Vercel 构建用 db push，本地才用 migrate）
│
├── scripts/
│   ├── smoke-api.ts               · 非 AI CRUD 烟测（本地 dev server 用）
│   ├── smoke-closures.ts          · PRD 6 闭环 E2E（含真实 AI 调用 · 数据自清理）
│   └── fixtures/closure-tiny.pdf  · 580B 合法 PDF · 闭环 6 上传 fixture
│
├── public/                        · 静态资源（5 个 SVG）
├── uploads/                       · PDF 上传目录（gitignore · 本地开发用）
└── node_modules/                  · pnpm 产物（不进 git）
```

---

## 📂 文件分类速查

### A. 文档层（纯 Markdown · 不是代码）

| 文件 | 角色 | 谁读 |
|---|---|---|
| `README.md` | 仓库门面（面向最终用户） | 人类 |
| `CODEBUDDY.md` | AI Agent 入口（两种模式门禁） | Agent |
| `CHANGELOG.md` | 维护期动作流水 | Agent |
| `docs/architecture.md`（本文件） | 文件地图 + 关键契约点 | Agent |
| `docs/tech-stack.md` | 技术栈详解 + 版本锁定 | Agent |
| `docs/prd.md` | 产品真相（长期参照） | 所有人 |
| `docs/ui-guide.md` | 视觉真相（长期参照） | 所有人 |
| `docs/legacy/**` | v1.0 建设期冻结快照 | 按需查阅 |

### B. 配置层

`package.json` / `tsconfig.json` / `next.config.ts` / `tailwind.config.ts` / `postcss.config.mjs` / `components.json` / `.env` / `.env.local` / `.gitignore` / `.eslintrc.json` / `middleware.ts`

### C. 代码层

| 目录 | 写入规则 |
|---|---|
| `app/` | 页面是 Server Component；API 用 route.ts；所有业务 API 开头 `requireCurrentUser()` |
| `components/ui/` | shadcn 生成物 · 可自由改；业务组件不放这里 |
| `components/<domain>/` | 按业务域（auth / dashboard / calendar / companies / drawer / widgets / resume / common / layout / onboarding） |
| `lib/` | 无副作用工具；AI 调用必须走 `llmClient.ts`；Prisma 访问必须走 `db.ts` |
| `prisma/` | schema 改动必跟 migration（本地）；Vercel 走 `db push` |

### D. 运行时产物（都不进 git）

`node_modules/` · `.next/` · `prisma/dev.db*` · `uploads/*` · `.env.local` · `.workbuddy/` · `tsconfig.tsbuildinfo`

---

## 🔑 关键契约点（按领域分组 · 30 条）

> 约束级别：✅ 强制 · ⚠️ 强烈建议 · 💡 经验法则
>
> 改动涉及任一契约点时，在 CHANGELOG 条目末尾标注 "关联契约点 N"。

### 数据访问层（1 ~ 3）

**1. ✅ Prisma 单例** → 所有 DB 访问只走 `lib/db.ts` 导出的实例，不要 `new PrismaClient()`。

**2. ✅ 豆包 AI 唯一出口** → 所有 AI 调用只走 `lib/llmClient.ts` 的 `callAI`（别名 `callDoubao`），它负责 fetch + 日志 + 错误分类。

**3. ✅ AI 接口路径已锁定** → 走 `/chat/completions` + `response_format: { type: "json_object" }`（OpenAI 兼容格式）。纯文本场景（daily-intel / tomorrow-tip）走同一路径但不传 `response_format`。`lib/llmClient.ts` 按此实现，不再保留运行时切换能力。

### 数据模型层（4 ~ 11）

**4. ✅ Prompt 原文** → `lib/prompts.ts` 的 5 个 system prompt 必须和 `docs/prd.md` 9.1~9.5 **逐字一致**。

**5. ✅ 中文枚举** → `stageType` / `currentStatus` / `stage.status` / `resume.tag` 等字段永远存中文原值（`HR面`、`待参加`、`产品`）。不要自作主张改英文代号。

**6. ✅ API Key 边界** → `process.env.DOUBAO_*` 和 `process.env.AUTH_SECRET` 只允许在 `app/api/**/route.ts` / `lib/llmClient.ts` / `lib/auth.ts` / `middleware.ts` 里被读取，绝不下发到客户端 bundle。

**7. ✅ AI 草稿态** → 任何 AI 路由**不写业务表**（只写 `AIRun` 日志），返回结果由前端收下 → 人工确认 → 再调 PATCH/POST 入库。这是 PRD 3.2 的硬性规则。

**8. ⚠️ 底座模型** → Endpoint `ep-20260418165808-rvgk2` 后端绑 **DeepSeek 3.2**。切模型由用户在火山方舟控制台操作，项目代码不动。

**9. ✅ 技术栈版本锁定** → Next 15 + Tailwind 3 + React 18 + ESLint 8 + Prisma 5.22 + Node ≥ 20。`create-next-app@latest` 会默认拉 Next 16 + Tailwind 4 + React 19，与本项目不兼容，升级需同步重写 `tailwind.config.ts` 和相关文档。

**10. ✅ zod schema 落 `lib/schemas/`** → 同时承担"运行时校验"+ "`z.infer` 出 TS 类型源"两个角色。不单独建 `types/`。

**11. ✅ JSON 字符串数组** → `Application.jdKeywords` / `Application.expectedSkills` / `Application.interviewQuestions` / `Stage.interviewQuestions` / `AIRun.outputJson` 在 DB 里统一用 `String?` 存 JSON 字符串（历史沿用 SQLite 约束，迁到 Postgres 后保持不变）。应用层 `JSON.parse` / `JSON.stringify` 转换。

### API 层（12 ~ 14）

**12. ✅ API 错误结构** → 所有 route 必经 `withApiHandler` 包装。成功返数据；失败返 `{ error: { code, message, details? } }` + HTTP 4xx/5xx。`code` 枚举：`UNAUTHORIZED`（401）/ `VALIDATION_ERROR`（400）/ `NOT_FOUND`（404）/ `CONFLICT`（409）/ `FEATURE_UNAVAILABLE_IN_DEMO`（503）/ `INTERNAL_ERROR`（500）。Prisma 外键 update 必须用 nested `connect/disconnect`。

**13. ✅ API 时间语义** → 全部本地时区（Asia/Shanghai）。
- `/api/dashboard/events?range=Nd` → `[今天 00:00, 今天+N 天 00:00)` 半开区间
- `/api/calendar/events?start&end` → `[start 00:00:00, end 23:59:59.999]` 闭区间
- 日期字符串只接 `YYYY-MM-DD`，range 只接 `Nd`（N ∈ [1, 365]）

**14. ✅ 数据请求分层** → 读写分层：
- **首屏 SSR 读** → `lib/queries/*`（Server Component 直调 Prisma · 零 HTTP 开销）· 顶部 `import "server-only"` 守卫
- **客户端交互（CUD）** → `lib/fetcher.ts` 的 `fetchJson` 调 `/api/*`

### 前端交互层（15 ~ 22）

**15. ⚠️ 日历视图自研** → `components/calendar/MonthView.tsx` 手写 7×N grid（date-fns + Tailwind）。不装 react-day-picker（强项用不上，手写仅需已装依赖）。

**16. ✅ Drawer 状态走 URL search params** → 不用 Context / Zustand。三种类型：`?drawer=stage&id=…` / `?drawer=stage-new[&applicationId=…][&date=YYYY-MM-DD]` / `?drawer=application-new`。优点：刷新恢复状态 + 可分享链接。工具：`lib/drawerUrl.ts` 的 `useOpenDrawer` / `useCloseDrawer`。

**17. ⚠️ 客户端三方库栈** → Form: `react-hook-form` + `@hookform/resolvers` + zod；Data fetching (Client): `swr`；Toast: `sonner`；Dialog 底座: `@radix-ui/react-dialog`。**没装** @radix-ui/react-select / Zustand / Jotai / react-query。

**18. ⚠️ PDF 处理栈** → 解析用 `pdf-parse 2.4`（v2 API：`new PDFParse({ data }).getText()`）；**预览用浏览器原生 iframe**（不用 react-pdf）。`next.config.ts` 必须把 `pdf-parse` + `pdfjs-dist` 放进 `serverExternalPackages`。上传 route 必须 `export const runtime = "nodejs"`。文件存盘 `uploads/<resumeId>.pdf`，DELETE Resume 时同步清。

**19. ✅ PDF 文本清洗** → pdf-parse 输出的原文可能含裸控制字符（U+0000~001F），会让严格 JSON 解析器挂掉。服务端在落库前做清洗：`\r\n`→`\n`、删除除 `\t\n` 外的 C0/DEL 控制字符（换成空格）、连续空白压缩。

**20. ⚠️ 明日提醒缓存（被动失效）** → `TomorrowTipCache` 表按"事件集合 SHA-256 哈希"被动失效。`eventsHash = sha256(JSON.stringify(明天 Stage[].map({id,time,type,status}).sortById))`。hash 匹配 → 直接返；不匹配 → 调 AI + upsert；明天事件为空 → 返空态原文不调 AI。手动 RefreshCw 按钮走 `/api/ai/tomorrow-tip/refresh`。

**21. ✅ AI 错误分类** → `lib/llmClient.ts` 的 `AIError.code`：`AI_CONFIG_MISSING`（env 缺）/ `AI_CALL_TIMEOUT`（30s）/ `AI_CALL_FAILED`（网络/HTTP）/ `AI_PARSE_FAILED`（expectJson 但 JSON.parse 失败）。AI route 包成 502 `INTERNAL_ERROR`，`details.code` 带细分。日志脱敏：catch 时 `console.error` 只打 taskType + code，禁止打 Authorization / key / 完整 url。

**22. ✅ AI 草稿态前端流程** → 详见契约点 7。4 条具体路径：
- 解析邮件 → sessionStorage 暂存 → 打开 `application-new` Drawer 预填 → 保存时一次建 Application + 首个 Stage
- 解析 JD → 选 Application → 采纳 PATCH `/api/applications/:id`
- 生成面试题 → 选 Application → 采纳 PATCH 写 `Application.interviewQuestions`（共享题库）
- 生成复盘 → 选 Stage → 采纳 PATCH 写 Stage 的 review 三字段

### 维护 · 部署层（23 ~ 25）

**23. ✅ 维护期工作流** → v1.0 交付后进入维护期，**不再**读 `docs/legacy/implementation_plan.md` / `docs/legacy/progress.md`。工作流：
1. 进门先读 `CODEBUDDY.md` + 本文件 + `CHANGELOG.md` 最近 3 条 + `MEMORY.md`
2. 发"自检单"（影响范围 / 数据模型 / 契约冲突 / 验证方法）给用户点头
3. 建独立分支（`tweak/*` / `feat/*` / `deploy/*` / `refactor/*` / `fix/*`）或直接 main（小改动）
4. 关键改动处加 `// [YYYY-MM-DD <branch>] <原因>` 中文 inline 注释
5. 完工必做：三件套 0 警告 → 追加 `CHANGELOG.md` 条目 → 更新本文件（若动文件结构/新决策）→ commit + push

**24. ✅ 部署环境上传降级** → Vercel Serverless 容器无持久化文件系统。`app/api/resumes/upload/route.ts` 在 `process.env.VERCEL === "1"` 时 early return `503 FEATURE_UNAVAILABLE_IN_DEMO`，文案 "演示环境暂不支持简历上传，本地运行可体验完整功能"。本地开发不受影响。未来若要支持云端上传：移除 early return + 装 `@vercel/blob` + 改三个 route 走 Blob API。

**25. ✅ 数据库策略（Postgres）** → provider 已切 `postgresql`。本地开发和生产 Vercel 连**同一个 Neon 实例**（Singapore pooled，主机名带 `-pooler`）。连接串必须用 pooled 版本。Neon 免费版闲置 5 分钟休眠，下次访问唤醒 5~10 秒属正常。Vercel 构建走 `prisma db push --accept-data-loss`（Neon 已有 schema 时 `migrate deploy` 会报 P3005）。本地改 schema 仍用 `pnpm exec prisma migrate dev`。

### v2.0 维护期新增（26 ~ 30）

**26. ✅ 用户数据强制隔离** → 所有业务实体（`Resume` / `Application` / `IntelSummary` / `TomorrowTipCache` / `AIRun` / `CustomCompany` / `WeeklyTodo`）**必须**通过 `userId` 外键绑到 `User`，`onDelete: Cascade`。`Stage` 不直接存 `userId`，通过 `Application.userId` 间接归属。硬规则：
- 所有 `lib/queries/*.ts` 函数**第一个参数必须是 `userId: string`**，内部 `where: { userId, ... }`
- 所有 `app/api/**/route.ts` handler 开头调 `await requireCurrentUser()`
- 前端永远不传 `userId`（服务端从 Cookie Session 解出）
- `IntelSummary` / `TomorrowTipCache` 唯一键 `@@unique([userId, date])`，每用户每天一份
- `CustomCompany` 唯一键 `@@unique([userId, name])`

**27. ✅ 鉴权栈** → `bcryptjs`（密码 hash · 盐轮 10）+ `jose`（JWT HS256 · **Edge 兼容**）+ Next 15 `cookies()`（async）。**不**引入 NextAuth / Auth.js / iron-session。硬规则：
- JWT 签名密钥 `AUTH_SECRET` 不小于 32 字节（dev 硬编码兜底，**生产 Vercel 必须通过环境变量注入**）
- Cookie 名 `jhb_session`，`httpOnly / sameSite=lax / secure(prod) / maxAge=7d`
- Session payload 只含 `{ sub: userId, nickname, email }`
- `middleware.ts` 只用 jose 验签（Edge 跑不了 bcryptjs 的 Node 原生库）
- 白名单前缀：`/login` / `/api/auth/` / `/_next/` / `/favicon`
- 未登录业务页 → 302 `/login?redirect=<原路径>`；未登录 API → 401 JSON
- 已登录访问 `/login` → 302 `/dashboard`

**28. ✅ Stage 子信息三件套** → `Stage` 扩展 3 个字段承载 AI 产物 + 用户随手记：
- `interviewQuestions: String?` — 本场面试实际问到的题（JSON 字符串化 `string[]`）；与 `Application.interviewQuestions`（岗位共享题库）并存
- `personalNotes: String?` — 用户自由文字（markdown 友好，前端按纯文本渲染）
- `reviewTranscript: String?` — 面试原始转录文本，供二次调用复盘 AI 用

前端承载：`components/drawer/tabs/` 下 3 个 Tab 组件 + `StageDrawerContent.tsx` 顶部 Tab 切换器。读写继续走 `/api/stages/[id]` PATCH。

**29. ✅ AI 聊天面板为首页核心入口** → v2 升级为**对话流 + 能力挂载**：
- 主视图 `AIChatPanel`（首页左栏紧凑卡 · 用户直接自然语言提问）
- 点"展开" → 全屏 Dialog 承载 `AIChatPanel`（`variant="modal"`）+ 能力 chips（邮件解析 / JD 解析 / 面试题 / 复盘）
- 选中能力后调 `/api/ai/chat`，orchestrator 根据 tag 决定调哪条具体 AI route
- 草稿态流程不变（契约点 7 · 22）
- `AICopilot.tsx` 保留未删（fallback / A/B 备用），当前页面未引用

**30. ✅ Companies 预置+自定义混合策略** → 预置 10 家大厂（`lib/queries/companies.ts` 的 `COMPANY_ORDER` 常量）+ 用户自定义（`CustomCompany` 表 · `@@unique([userId, name])`）+ localStorage 隐藏偏好（key `jhb:hidden-preset-companies`）。**为什么隐藏偏好存 localStorage 不存 DB**：端侧视觉喜好、不需跨设备同步、避免服务端状态膨胀。渲染顺序：未隐藏的预置 → 用户自定义（按 `sortOrder` 升序）。删除操作：预置走 hiddenPresetStore；自定义走 `DELETE /api/companies/[id]`。

---

## 🔄 维护规则（给 Agent）

1. **文件动了就更新本文件**。新增 / 删除 / 重命名 / 移动，任何一种都算。
2. **不要把进度写进来**。进度已在 v1.0 后不再跟踪；维护期只记"是什么"。
3. **实际 ≠ 本文件时，以实际代码为准**。立刻补登记，并在对应 commit message 里说明偏差。
4. **新决策必须追加契约点**。沿用"编号 + 简短标题 + 约束级别 + 硬规则"格式，续在 30 条之后。
