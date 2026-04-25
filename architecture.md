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

> 当前仓库处于"**v2.0-maintenance-r1（2026-04-25）**"——在 v1.0 公网 demo 基础上完成第一波维护期大迭代：多用户登录与数据隔离 · 首页 v2 布局（AI 聊天前置 + 便签 Todo + 迷你简历） · Stage 子 Tab（面试题/复盘/随手记） · Companies 自管理 · 新手引导。`pnpm lint/typecheck/build` 均 0 警告 · Neon Postgres（Singapore pooled）+ 原有 Vercel 基线不变。**Demo: https://system-pi-three.vercel.app**

```
/Users/sibyl/Desktop/system/
├── job_hunt_flow_board_prd.md       ← 已有 · 产品真相（PRD）
├── UI.md                            ← 已有 · 视觉真相（界面规范）
├── tech_stack.md                    ← 已有 · 落地真相（技术栈 + 目录 + 启动命令）
├── implementation_plan.md           ← 已有 · 步骤真相（7 Phase / 39 Step 指令手册）
├── progress.md                      ← 已有 · 进度真相（逐步勾选清单）
├── architecture.md                  ← 已有 · 文件地图（本文件）
├── CODEBUDDY.md                     ← 已有 · AI Agent 入口（首读）
├── CHANGELOG.md                     ← 已有 · v1.0 后维护期动作流水（做了什么 / 为什么 / 验证 / 踩坑）
├── .env                             ← 已有 · Prisma CLI 专用（DATABASE_URL="file:./dev.db"）；不进 git
├── .env.local                       ← 已有 · Next.js runtime（DATABASE_URL="file:./dev.db" + DOUBAO_*）；不进 git
├── .gitignore                       ← 已有 · 保护 node_modules / .next / .env* / dev.db / uploads / .workbuddy 等
├── .workbuddy/                      ← 已有 · 工作记忆（不进 git）
│
│ ── Phase 0 产物（脚手架 + Tailwind + shadcn + Prisma 连通 + 布局 + Ark 冒烟） ──
├── package.json / pnpm-lock.yaml / pnpm-workspace.yaml / tsconfig.json
├── next.config.ts / next-env.d.ts / .eslintrc.json
├── tailwind.config.ts / postcss.config.mjs / components.json
├── app/
│   ├── layout.tsx / page.tsx / globals.css / favicon.ico
│   ├── dashboard/page.tsx           ← Step 3.1 临时改造：Server Component 直调 getDashboardEvents 并 console.log（Step 3.2 会替换为真实表格）
│   ├── calendar/page.tsx / companies/page.tsx   ← 占位，Step 3.4 / 3.5 实现
├── public/                          ← 静态资源
├── components/
│   ├── ui/button.tsx                ← shadcn Button（粉色 variant）
│   ├── layout/Sidebar.tsx           ← UI.md 6.2
│   ├── layout/Header.tsx            ← UI.md 6.3
│   └── CatIcon.tsx                  ← lucide Cat 占位（Phase 7.2 换 SVG）
├── lib/
│   ├── utils.ts                     ← cn()
│   └── db.ts                        ← Prisma Client 单例
├── scripts/
│   └── test-ark-api.ts              ← 【临时，Phase 6.1 完成后删除】Ark 冒烟
│
│ ── Phase 1 产物（6 个 model + 种子 + zod） ──
├── prisma/
│   ├── schema.prisma                ← 6 个 model（Resume / Application（含 interviewQuestions）/ Stage / AIRun / IntelSummary / TomorrowTipCache）· provider=postgresql（2026-04-19 起）
│   ├── seed.ts                      ← 幂等种子：10 家大厂占位
│   ├── migrations/20260419021839_init_postgres/  ← 现行 Postgres 初始迁移（6 表 + 索引）
│   ├── _sqlite_archive/             ← 归档：旧 SQLite 迁移（20260418121855_init + migration_lock.toml），历史参照用
│   └── dev.db                       ← SQLite 本地遗留文件（gitignore），回退 SQLite 时用
├── lib/schemas/
│   ├── enums.ts                     ← 6 组中文枚举 + zod enum
│   ├── entities.ts                  ← 6 实体 schema + Create/Update 派生 + z.infer 类型
│   ├── ai-outputs.ts                ← PRD 9.1~9.4 四个 AI JSON 输出 schema
│   └── index.ts                     ← barrel
│
│ ── Phase 2 产物（REST API 非 AI + 统一错误处理 + 烟测） ──
├── lib/
│   ├── api.ts                       ← 已有 · ApiError / jsonOk / jsonError / withApiHandler / parseJsonBody / notFound / conflict / validationError 工厂
│   ├── serialize.ts                 ← 已有 · JSON 字符串数组字段 ↔ 应用层数组（serializeApplication + parseStringArray + stringifyStringArray）
│   └── dates.ts                     ← 已有 · 本地时区日期工具（startOfToday / parseDateStartLocal / parseDateEndLocal / formatLocalDate / parseRangeDays）
├── app/api/
│   ├── resumes/
│   │   ├── route.ts                 ← 已有 · GET 列表（createdAt desc）
│   │   └── [id]/route.ts            ← 已有 · PATCH / DELETE（被 Application 引用返 409 + 提示岗位名）
│   ├── applications/
│   │   ├── route.ts                 ← 已有 · POST（currentStatus 默认 "未投递"）
│   │   └── [id]/route.ts            ← 已有 · GET（含 stages asc + linkedResume）/ PATCH（linkedResumeId 用 nested connect/disconnect）/ DELETE（级联删 Stage）
│   ├── stages/
│   │   ├── route.ts                 ← 已有 · POST（applicationId 外键校验 → 404）
│   │   └── [id]/route.ts            ← 已有 · PATCH / DELETE
│   ├── dashboard/events/route.ts    ← 已有 · GET ?range=Nd（半开区间 [今天 00:00, 今天+N 天 00:00)）
│   ├── calendar/events/route.ts     ← 已有 · GET ?start&end（闭区间 [start 00:00:00, end 23:59:59.999]）
│   └── companies/progress/route.ts  ← 已有 · GET 10 家公司按 PRD 顺序 × Application × Stage + isEmpty 标记
├── scripts/
│   └── smoke-api.ts                 ← 已有 · Phase 2 烟测脚本（14 断言，一条命令跑完 CRUD）
│
│ ── Phase 3 产物（数据请求层 + dashboard 主模块） ──
├── lib/
│   ├── fetcher.ts                   ← 已有 · 客户端 fetchJson 封装 + FetchError（供 Phase 4+ Client Component 做 CRUD 用）
│   └── queries/
│       ├── index.ts                 ← 已有 · barrel
│       ├── dashboard.ts             ← 已有 · getDashboardEvents(days) 服务端直调 Prisma（半开区间）
│       ├── calendar.ts              ← 已有 · getCalendarEvents(start, end) 服务端直调 Prisma（闭区间）
│       ├── companies.ts             ← 已有 · getCompaniesProgress() + COMPANY_ORDER 常量
│       └── resumes.ts               ← 已有 · getResumes()
├── components/dashboard/
│   ├── EventTable.tsx               ← 已有 · Step 3.2 · 首页时间维度流程表格（Client Component，胶囊颜色映射 + hover 浮起 + 空态，点击行 console.log）
│   ├── TomorrowReminder.tsx         ← 已有 · Step 3.3 · 明日提醒占位卡（粉黄渐变 + CatIcon + Bell）；Phase 6.6 接
│   ├── DailyIntel.tsx               ← 已有 · Step 3.3 · 今日动向占位卡（粉紫→浅黄 + Sparkles + "AI 摘要"标签）；Phase 6.5 接
│   ├── ResumeCard.tsx               ← 已有 · Step 3.3 · 我的简历卡（列表 / 空态；按钮全 disabled + title tooltip）；Phase 5.2 启用
│   └── AICopilot.tsx                ← 已有 · Step 3.3 · AI Copilot 占位大卡（粉紫渐变 + CatIcon + textarea + 4 胶囊按钮）；Phase 6.3 接
├── app/dashboard/page.tsx           ← Step 3.3 · Server Component 12 栏布局（lg:col-span-8 左 + lg:col-span-4 右），并发拉 events + resumes
├── components/calendar/
│   └── MonthView.tsx                ← 已有 · Step 3.4 · 月视图（7 列 grid + 当日事件列表 + 月份切换，Client Component 拉 /api/calendar/events）
├── app/calendar/page.tsx            ← Step 3.4 · Server Component SSR 注入首屏月网格事件，后续切月由 Client 端 fetch
├── components/companies/
│   ├── CompanyRow.tsx               ← 已有 · Step 3.5 + 4.3 + 4.4 · 9 节点胶囊 + 节点点击开 Drawer + MoreHorizontal 菜单（新增节点 / 删除岗位，带二次确认）
│   └── NewApplicationButton.tsx     ← 已有 · Step 4.4 · /companies 右上 "新增申请" Client 按钮（开 application-new Drawer）
├── app/companies/page.tsx           ← Step 3.5 · Server Component 拉 getCompaniesProgress，10 家按 PRD 顺序 divide-y 分隔

│ ── Phase 4 产物（全局 Drawer + 手动 CRUD + 二次确认 + toast） ──
├── components/ui/
│   ├── sheet.tsx                    ← 已有 · Step 4.1 · shadcn Sheet new-york（440px + 左侧大圆角 + 240ms + 圆形 X 关闭）
│   ├── dialog.tsx                   ← 已有 · Step 4.1 · shadcn Dialog 精简版（二次确认用）
│   ├── input.tsx                    ← 已有 · Step 4.1 · shadcn Input
│   ├── select.tsx                   ← 已有 · Step 4.1 · 原生 select 包 Tailwind（不引入 @radix-ui/react-select）
│   └── label.tsx                    ← 已有 · Step 4.1 · 简版 Label
├── components/drawer/
│   ├── DetailDrawer.tsx             ← 已有 · Step 4.1 · URL search params 驱动的 Drawer 容器（挂在 layout）
│   ├── StageDrawerContent.tsx       ← 已有 · Step 4.2 · Stage 详情 + 编辑（react-hook-form + zod + SWR + dirty 态 + 保存并发 PATCH）
│   ├── NewStageDrawerContent.tsx    ← 已有 · Step 4.4 · 新建 Stage（可预填 applicationId / date，下拉选已有 Application）
│   └── NewApplicationDrawerContent.tsx ← 已有 · Step 4.4 · 新建 Application + 可选第一个 Stage（原子化：先 POST app 后 POST stage，失败保留表单）
├── components/common/
│   └── ConfirmDeleteDialog.tsx      ← 已有 · Step 4.4 · 通用删除二次确认（title/description/loading/toast）
├── lib/
│   ├── drawerUrl.ts                 ← 已有 · Step 4.3 · useOpenDrawer / useCloseDrawer（URL 参数工具）
├── app/api/
│   ├── applications/route.ts        ← 升级 · Step 4.4 · GET 列表（支持 includeEmpty=true 查询参数）+ POST（已有）
│   └── stages/[id]/detail/route.ts  ← 已有 · Step 4.1 · Drawer 专用 GET，一次性返 stage+application+linkedResume（含 JSON 数组反序列化）
├── app/layout.tsx                   ← 升级 · Step 4.1 · 挂 Suspense+DetailDrawer + Toaster(sonner) + 粉色风格 toast 样式

│ ── Phase 5 产物（Resume 上传 / 预览 / 关联） ──
├── app/api/resumes/
│   ├── upload/route.ts              ← 已有 · Step 5.1 · POST multipart/form-data；存盘到 uploads/<id>.pdf；pdf-parse v2 提取文本 + 控制字符清洗；runtime='nodejs'
│   └── [id]/file/route.ts           ← 已有 · Step 5.1 · GET 流式返 application/pdf（浏览器 iframe 直接渲染）
├── components/resume/
│   ├── UploadResumeDialog.tsx       ← 已有 · Step 5.2 · 上传 Dialog（拖放区 + name 预填 + tag + warning toast）
│   ├── RenameResumeDialog.tsx       ← 已有 · Step 5.2 · 改名 / 改 tag（react-hook-form + dirty 控制保存）
│   └── ResumePreviewDialog.tsx      ← 已有 · Step 5.2 · 预览 Dialog（70vw × 85vh 内嵌 iframe；复用在 Step 5.3）
├── components/dashboard/ResumeCard.tsx  ← 升级 · Step 5.2 · 所有按钮实装（上传 / 预览 / 改名 / 删除）
├── components/drawer/StageDrawerContent.tsx  ← 升级 · Step 5.3 · 关联简历 Select + CurrentResumePreview 子组件 + 嵌套预览 Dialog
├── uploads/                         ← 已有 · Step 5.1 · 用户上传 PDF 存储目录（gitignore，DELETE Resume 时同步清）
├── next.config.ts                   ← 升级 · Step 5.1 · serverExternalPackages 标 pdf-parse / pdfjs-dist 为外部包

│ ── Phase 6 产物（豆包 AI 接入 + 5 能力 + 双缓存） ──
├── lib/
│   ├── llmClient.ts                 ← 已有 · Step 6.1 · callAI 唯一出口（/chat/completions + response_format + 30s 超时 + 4 种错误分类 + AIRun 日志 + 脱敏）
│   ├── prompts.ts                   ← 已有 · Step 6.1 · PRD 9.1~9.5 system prompt 原文 + 6 个 userPrompt 模板函数（含 SYS_TOMORROW_TIP）
│   ├── fakeIntelSource.ts           ← 已有 · Step 6.5 · 7 条硬编码大厂资讯（腾讯 IEG / 字节电商 / 美团到店 等）
│   └── queries/
│       ├── intel.ts                 ← 已有 · Step 6.5 · getDailyIntelSummary（Server Component 首屏用；等价于 /api/ai/daily-intel）
│       └── tomorrowTip.ts           ← 已有 · Step 6.6 · getTomorrowTip + clearTomorrowTipCache（SHA-256 eventsHash 被动失效）
├── app/api/ai/
│   ├── parse-email/route.ts         ← 已有 · Step 6.2 · POST 入参 inputText（5~20000）
│   ├── parse-jd/route.ts            ← 已有 · Step 6.4 · POST 入参 jdText（20~30000）
│   ├── generate-questions/route.ts  ← 已有 · Step 6.4 · POST 入参 applicationId（后端拉 jdText + resume.extractedText）
│   ├── review/route.ts              ← 已有 · Step 6.4 · POST 入参 stageId + transcriptText（30~40000）
│   ├── daily-intel/route.ts         ← 已有 · Step 6.5 · GET 本地时区 date 缓存
│   └── tomorrow-tip/refresh/route.ts ← 已有 · Step 6.6 · POST 清缓存 + 强制重算
├── components/dashboard/
│   ├── AICopilot.tsx                ← 升级 · Step 6.3 · 4 个 AI 按钮全接线 + 草稿预览卡 + 采纳保存
│   ├── DailyIntel.tsx               ← 升级 · Step 6.5 · 接 summary prop（SSR 注入）
│   └── TomorrowReminder.tsx         ← 升级 · Step 6.6 · 接 tipText + eventCount prop + 右上 RefreshCw 强制重算按钮
├── components/drawer/NewApplicationDrawerContent.tsx  ← 升级 · Step 6.3 · useEffect 读 sessionStorage 里的 emailDraft 自动预填字段
├── app/dashboard/page.tsx           ← 升级 · Step 6.5/6.6 · Promise.all 并发拉 events + resumes + intel + tip 四份数据

│ ── Phase 7 产物（打磨与验收） ──
├── components/ui/
│   └── skeleton.tsx                 ← 已有 · Step 7.1 · shadcn 骨架块（soft-panel pulse）
├── components/common/
│   ├── EmptyState.tsx               ← 已有 · Step 7.1 · 通用空态（icon + title + description + action，支持 compact）
│   └── ErrorState.tsx               ← 已有 · Step 7.1 · 通用错误态（可选 onRetry）
├── app/
│   ├── loading.tsx                  ← 已有 · Step 7.1 · 全局 fallback（UI.md 13.1 3 粉点 bounce）
│   ├── error.tsx                    ← 已有 · Step 7.1 · Next 15 全局错误边界，ErrorState + reset
│   ├── dashboard/loading.tsx        ← 已有 · Step 7.1 · 首页 12 栏布局骨架
│   ├── calendar/loading.tsx         ← 已有 · Step 7.1 · 月视图 7×5 格 + 当日列表骨架
│   └── companies/loading.tsx        ← 已有 · Step 7.1 · 10 行 × 9 节点胶囊骨架
├── lib/fetcher.ts                   ← 升级 · Step 7.1 · fetch 外层 try/catch 抛 NETWORK_ERROR + 导出 isNetworkError()
├── components/CatIcon.tsx           ← 升级 · Step 7.2 · 极简自定义 SVG（双耳 + 圆脸 + 双眼 + 弧嘴 + 腮红），支持 busy / staticIcon prop
├── tailwind.config.ts               ← 升级 · Step 7.2 · 追加 cat-breathe / cat-wobble keyframes + animation 工具类
├── components/dashboard/AICopilot.tsx ← 升级 · Step 7.2 · CatIcon busy={busy !== null}（AI 调用中晃动）
├── components/dashboard/TomorrowReminder.tsx ← 升级 · Step 7.2 · CatIcon busy={refreshing}
├── components/layout/Sidebar.tsx    ← 升级 · Step 7.2 · 底部 CatIcon staticIcon（关闭呼吸避免常驻分心）
├── scripts/smoke-closures.ts        ← 已有 · Step 7.3 · PRD 第 13 章 6 闭环 E2E 脚本（含真实 AI 调用 + 数据自清理）
├── scripts/fixtures/
│   └── closure-tiny.pdf             ← 已有 · Step 7.3 · 580B 合法 PDF v1.4，闭环 6 上传 fixture
├── README.md                        ← 已有 · Step 7.4 · 仓库门面（三步跑起来 + 环境变量 + 目录速查 + 文档索引）

（Phase 7 已完成，无新增计划项）

│ ── v2.0 维护期产物（2026-04-25 · 鉴权 + 多用户 + UI 重排 + Stage 子 Tab + Companies 自管理 + 便签 Todo + 新手引导） ──
├── middleware.ts                    ← 新增 · Edge 运行时 JWT 验签 + 未登录跳 /login（详见契约点 27）
├── lib/auth.ts                      ← 新增 · bcryptjs + jose + Cookie Session + getCurrentUser/requireCurrentUser（契约点 27）
├── app/login/page.tsx               ← 新增 · 登录/注册页（左侧 4 能力卡 + 右侧 Tab 切换表单）
├── components/auth/LoginForm.tsx    ← 新增 · 登录/注册表单（邮箱 + 密码 + 昵称 · 马卡龙配色）
├── app/api/auth/
│   ├── login/route.ts               ← 新增 · POST · 校验密码 + 签发 Session Cookie
│   ├── register/route.ts            ← 新增 · POST · 昵称 + 邮箱 + 密码（bcrypt 存 hash）
│   ├── logout/route.ts              ← 新增 · POST · 清 Cookie
│   └── me/route.ts                  ← 新增 · GET · 返当前登录用户（Header/组件内同步用）
├── app/api/weekly-todos/
│   ├── route.ts                     ← 新增 · GET ?weekStart=YYYY-MM-DD / POST
│   └── [id]/route.ts                ← 新增 · PATCH / DELETE
├── app/api/companies/
│   ├── route.ts                     ← 新增 · GET 用户自定义公司列表 / POST 新增（唯一键 userId+name）
│   └── [id]/route.ts                ← 新增 · DELETE 自定义公司
├── app/api/ai/chat/route.ts         ← 新增 · 通用对话流（可叠加 parse-email / parse-jd / 面试题 / 复盘 的 context）
├── components/layout/AppShell.tsx   ← 新增 · 按 pathname 条件渲染 Shell（/login 走全屏裸渲染）
├── components/layout/Sidebar.tsx    ← 重写 · 76px 窄 + 胶囊 + 花朵 Logo + 底部新手引导按钮
├── components/layout/Header.tsx     ← 重写 · 去 EN 切换；昵称首字母头像 + 下拉菜单（登出）
├── components/onboarding/OnboardingDialog.tsx  ← 新增 · 多步向导；首访自动弹 + Sidebar 左下按钮随时唤出
├── components/widgets/StickyTodoPanel.tsx      ← 新增 · 便签式周 Todo；variant: "card"（首页右栏内嵌） / "bookmark"（日历右侧书签）
├── components/dashboard/
│   ├── AIChatPanel.tsx              ← 新增 · 首页 AI 主入口；紧凑卡 + 展开全屏弹窗两形态（契约点 29）
│   ├── AIWorkstation.tsx            ← 新增 · AI 解析工作区；挂在 AIChatPanel 弹窗内
│   ├── MiniResumePanel.tsx          ← 新增 · 简历迷你卡（v2 右栏用）
│   ├── MiniStatsColumn.tsx          ← 新增 · 右栏 3 格统计（今日/明日/近 7 天） · 已去 "Passed" 维度
│   ├── QuickAddFab.tsx              ← 新增 · 全局浮动新增按钮（右下角）
│   ├── QuickStats.tsx               ← 新增 · 统计组件（备用）
│   └── TodayTimeline.tsx            ← 新增 · 今日时间轴（备用，页面未引用；保留作组件库件）
├── components/drawer/tabs/
│   ├── InterviewQuestionsTab.tsx    ← 新增 · Stage 面试题子 Tab（手工 + 批量粘贴 · 契约点 28）
│   ├── PersonalNotesTab.tsx        ← 新增 · Stage 随手记子 Tab（契约点 28）
│   └── ReviewTab.tsx                ← 新增 · Stage 复盘子 Tab（含 reviewTranscript 原始转录 · 契约点 28）
├── components/drawer/StageDrawerContent.tsx    ← 升级 · 集成三个子 Tab 切换
├── components/companies/
│   ├── CustomCompanyManager.tsx     ← 新增 · 自定义公司管理（契约点 30）
│   ├── hiddenPresetStore.ts         ← 新增 · localStorage 存"已隐藏的预置公司"（契约点 30）
│   └── CompanyRow.tsx               ← 升级 · 行可点击创建申请 + 每公司可删（预置走 hiddenPresetStore；自定义走 API）
├── prisma/schema.prisma             ← 升级 · 新增 User / CustomCompany / WeeklyTodo；6 张业务表全部加 userId 外键 + onDelete Cascade
│
│ ── v1.0 遗留物清理（2026-04-25 一并处理） ──
│   - 删：.next_old/                  ← 旧 Next 构建缓存整目录
│   - 删：prisma/_sqlite_archive/      ← 已空的 SQLite 迁移归档
│   - 删：prisma/migrations/20260419021839_init_postgres/  ← 空目录（迁移改走 db push）
│   - 删：app/api/_test-throw/ + app/api/test-throw/       ← 调试残留空目录
│   - 留：prisma/migrations/20260418121855_init/           ← SQL 是 SQLite 方言但 lock.toml 指 postgres；物理删会打破 Prisma 元数据，留作历史参照

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
| `implementation_plan.md` | **步骤真相**（v1.0 历史快照）。7 Phase / 39 Step 指令手册，每步含验证清单。维护期不修改。 | AI Agent |
| `progress.md` | **进度真相**（v1.0 历史快照）。逐步勾选清单，39/39 已完成。维护期不修改。 | AI Agent |
| `architecture.md` | **文件地图 + 关键契约点**（本文件）。每个文件/文件夹的作用 + 所有架构决策。 | AI Agent |
| `CHANGELOG.md` | **改过啥**。v1.0 后维护期每次改动的动作流水（做了什么 / 为什么 / 验证 / 踩坑）。 | AI Agent |
| `CODEBUDDY.md` | **入口**。AI Agent 进入仓库第一读物，含两种模式门禁 + 14 条工作守则。 | AI Agent |
| `README.md` | 仓库门面，人类读者看（Phase 7.4 产出）。 | 人类 |

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
12. **API 错误结构规约（2026-04-18 Step 2.1/2.5 决策）** → 所有 API route 必经 `withApiHandler` 包装。成功返数据；失败返 `{ error: { code, message, details? } }` + HTTP 4xx/5xx。`code` 枚举：`VALIDATION_ERROR`（400）/ `NOT_FOUND`（404）/ `CONFLICT`（409）/ `INTERNAL_ERROR`（500）。zod 校验失败会被 `withApiHandler` 自动转为 400。Prisma 外键 update 必须用 nested `connect/disconnect`（不能直接赋 `linkedResumeId`）。
13. **API 时间语义（2026-04-18 Step 2.3 决策）** → 全部本地时区。`/api/dashboard/events?range=Nd` 返回 `[今天 00:00:00.000, 今天+N 天 00:00:00.000)` 半开区间内的 Stage；`/api/calendar/events?start&end` 返回 `[start 00:00:00.000, end 23:59:59.999]` 闭区间内的 Stage。日期字符串只接受 `YYYY-MM-DD`，range 只接受 `Nd`（N ∈ [1, 365]）。
14. **数据请求方式（2026-04-18 Step 3.1 决策）** → 读写分层。**首屏 SSR 读**走 `lib/queries/*`（Server Component 直调 Prisma，零 HTTP 开销、无 absoluteUrl 烦恼），`lib/queries/` 所有模块顶部 `import "server-only"` 作为 Client Component 误引入的守卫。**客户端交互写（新增/编辑/删除）**走 `lib/fetcher.ts` 的 `fetchJson` 调 `/api/*`（错误结构遵守关键契约点 12）。两者共享同一份 Prisma 单例 + `lib/serialize.ts` 序列化规则。Phase 4 Drawer 之后的所有 CRUD 按这个约定落地。新增依赖：server-only 0.0.1。
15. **日历视图自研而非 react-day-picker（2026-04-18 Step 3.4 决策）** → `components/calendar/MonthView.tsx` 手写 7×N grid（date-fns + Tailwind `grid-cols-7`），不装 react-day-picker。理由：需求是"展示事件"而非"选日期"；react-day-picker 强项用不上，手写仅需已装依赖、布局更可控（UI.md 9.3 "每格足够留白" + 胶囊 + "+N" 省略都是自定义渲染）。首屏 SSR 注入月网格事件，切月由 Client 端直接 fetch `/api/calendar/events`（闭区间与 route 一致）。
16. **Drawer 状态管理方式（2026-04-18 Step 4.1 决策）** → **URL search params** 驱动，而非 React Context / Zustand。三种类型：`?drawer=stage&id=…` / `?drawer=stage-new[&applicationId=…][&date=YYYY-MM-DD]` / `?drawer=application-new`。优点：刷新恢复状态 + 可分享链接 + 三页共用一套逻辑。关闭时自动剥掉 drawer/id/applicationId/date 四个参数。工具：`lib/drawerUrl.ts` 的 `useOpenDrawer` / `useCloseDrawer`。挂载点：`app/layout.tsx` 下 Suspense + DetailDrawer（Next 15 对 useSearchParams 强制要求 Suspense 边界）。
17. **客户端三方库依赖栈（2026-04-18 Phase 4 锁定）** → Form：`react-hook-form 7.72` + `@hookform/resolvers 5.2`（zod integration）；Data fetching（Client）：`swr 2.4`（Drawer 详情拉取 + Phase 6 AI 轮询复用）；Toast：`sonner 2.0`（全局 Toaster 挂 layout）；Dialog 基础组件：`@radix-ui/react-dialog 1.1`（Sheet/Dialog 共享底座）。没装 @radix-ui/react-select（native select 够用），没装 Zustand / Jotai（URL 参数够用），没装 react-query（SWR 更轻）。
18. **PDF 处理栈（2026-04-18 Phase 5 锁定）** → 解析用 `pdf-parse 2.4`（v2 API：`new PDFParse({ data }).getText()`，和 v1 的 `pdf(buffer)` 不兼容）；**预览用浏览器原生 iframe**（tech_stack 禁用清单里的 react-pdf），70vw×85vh 的 Dialog 承载，内置 PDF 工具栏支持缩放/下载。`next.config.ts` 必须把 `pdf-parse` + `pdfjs-dist` 加进 `serverExternalPackages`，否则 Next 15 server bundler 会报 "Object.defineProperty called on non-object"。上传 route 必须 `export const runtime = "nodejs"`（默认 edge-light 跑不起来）。上传存盘路径统一 `uploads/<resumeId>.pdf`（文件名 = DB id），DELETE Resume 时同步清理物理文件。
19. **PDF 文本清洗规则（2026-04-18 Step 5.1 决策）** → pdf-parse 输出的原文可能含裸控制字符（U+0000~001F），直接 `NextResponse.json()` 产出的响应会让严格 JSON 解析器（jq / python json / node JSON.parse）炸掉（浏览器 fetch.json 能容忍）。服务端在落库前做清洗：`\r\n`→`\n`、删除除 `\t\n` 外的 C0/DEL 控制字符（换成空格）、连续空白压缩。清洗后的 `extractedText` 是"可直接拼进 prompt、可直接 JSON 序列化"的纯文本。
20. **明日提醒缓存方案（2026-04-19 Step 6.6 决策）** → 复用 Phase 1.1 已建的 `TomorrowTipCache` 表（`date @unique` + `tipText` + `eventsHash` + ...），**按"事件集合 SHA-256"被动失效**，而非主动清理。`eventsHash = sha256(JSON.stringify(明天 Stage[].map({id,time,type,status}).sortById))`；查 TomorrowTipCache(date=明天) + hash 一致 → 直接返；hash 不一致 / 未命中 → 调 AI + upsert；明天事件为空 → 返 UI.md 空态原文 "明天暂无流程安排，可以安心休息一下。"（不调 AI）。好处：任何手动/AI CRUD 改明天 Stage 都自动让 hash 不匹配，无需手动清缓存。前端 RefreshCw 按钮走 `POST /api/ai/tomorrow-tip/refresh`（先 delete 缓存，再调 `getTomorrowTip({force:true})`）。
21. **AI 调用 4 种错误分类（2026-04-19 Step 6.1 决策）** → `lib/llmClient.ts` 的 `AIError.code` 枚举：`AI_CONFIG_MISSING`（env 三件套缺）/ `AI_CALL_TIMEOUT`（30s）/ `AI_CALL_FAILED`（网络/HTTP 4xx-5xx/响应体异常）/ `AI_PARSE_FAILED`（expectJson=true 时 JSON.parse 失败）。所有 AI route 的 handler 在 catch 时把 `AIError` 包成 502 `INTERNAL_ERROR` 返前端，并在 `details.code` 里带上细分 code；`AIRun.errorMessage` 也用 `"<code>: <msg>"` 前缀，便于 Prisma Studio 里肉眼分类。日志脱敏：catch 时 `console.error` 只打 taskType + code，禁止打 Authorization / key / 完整 url。
22. **AI 草稿态前端流程（2026-04-19 Step 6.3 决策）** → PRD 3.2 硬性规则：AI 解析结果 **不写业务表**（只写 AIRun 日志），由前端收下作为 "草稿" 再由用户确认后走 PATCH/POST 入库。具体 4 条：(a) 解析邮件 → sessionStorage 暂存 → 打开 `application-new` Drawer 自动预填所有字段 → 保存时一次性建 Application + 首个 Stage；(b) 解析 JD → 选 Application → 内联展示 → 点"采纳保存" PATCH /api/applications/:id 写 jdText/jdSummary/jdKeywords/expectedSkills；(c) 生成面试题 → 选 Application → 点采纳 PATCH 写 `Application.interviewQuestions`（共享题库，同 Application 所有 Stage 共用）；(d) 生成复盘 → 选 Stage → 点采纳 PATCH 写 Stage 的 review 三字段。
23. **维护期工作流（2026-04-19 v1.0 交付后决策）** → v1.0 交付后进入"维护期"，工作模式与建设期不同：①进门先读 `CODEBUDDY.md` + `architecture.md`（本文件） + `CHANGELOG.md` 最近 3 条 + `MEMORY.md`，**不再读** `implementation_plan.md` / `progress.md`（v1.0 历史快照）；②任何改动都先发"自检单"（影响范围 / 数据模型 / 契约冲突 / 验证方法）给用户点头；③建独立分支（`tweak/*` / `feat/*` / `deploy/*` / `refactor/*` / `fix/*`）；④关键改动加 inline 注释格式 `// [YYYY-MM-DD <branch>] <原因>`；⑤完工后必做 5 件事：三件套 0 警告、追加 `CHANGELOG.md` 条目（4 问题格式）、更新本文件目录树（若动了文件）、追加新契约点（若有新决策）、`<type>-<描述>-<yyyymmdd>` 命名 tag + push。Commit message 里附 CHANGELOG 条目日期 + 本文件契约点编号作为交叉引用。
24. **部署环境上传路由降级（2026-04-19 feat-upload-demo-fallback 决策）** → 用户选择部署 demo 到 Vercel 时不做 PDF 存储改造（省 1 小时）。由于 Vercel Serverless 容器没有持久化文件系统，`app/api/resumes/upload/route.ts` 在函数入口处做环境探测：`process.env.VERCEL === "1"` 时直接 `throw new ApiError("FEATURE_UNAVAILABLE_IN_DEMO", "演示环境暂不支持简历上传，本地运行可体验完整功能", 503)`，不进入写盘流程。前端 `UploadResumeDialog.tsx` 无需改动——原有 catch 会把后端 error.message 直接 toast 给用户，降级文案体验友好。其他简历功能（GET 列表 / 预览 / 删除）在空 DB 下都自然走空态，不报错。未来若真要支持云端上传，改回去的路径是：移除这 5 行 early return + 装 `@vercel/blob` + 改 upload/file/delete 三个 route 走 Blob API，预计 60 分钟。为什么用 `process.env.VERCEL` 而不是自定义环境变量：这是 Vercel 平台自动注入的变量（Vercel 官方保证存在且值为 `"1"`），不用额外配置。
25. **数据库从 SQLite 迁到 Neon Postgres（2026-04-19 deploy-neon-postgres 决策）** → 为支持 Vercel Serverless 部署（容器无持久化文件系统），datasource provider 从 `sqlite` 改为 `postgresql`。本地开发和生产 Vercel 都连**同一个 Neon 实例**（Singapore pooled 连接），demo 项目无多环境隔离需求。迁移策略：①旧 SQLite 迁移归档到 `prisma/_sqlite_archive/` 不删（历史参照）；②新 Postgres 迁移由 `prisma migrate dev --name init_postgres` 重新生成，落在 `prisma/migrations/20260419021839_init_postgres/`；③`prisma/dev.db` 保留在本地（gitignore，需要回退时改 `DATABASE_URL="file:./dev.db"` 即可恢复）；④`package.json` 的 `build` 脚本前缀加 `prisma generate && prisma migrate deploy &&`，保证 Vercel 每次部署自动同步 Prisma Client + 幂等应用迁移。连接串必须用 Neon 的 **pooled** 版本（主机名带 `-pooler`），否则 Serverless 并发会爆连接数。Neon 免费版闲置 5 分钟会休眠，下次访问唤醒需 5~10 秒——不是 bug 是免费档特性。schema 6 个 model 字段类型全是 Prisma 通用类型（String / Int / DateTime / Boolean），SQLite 和 Postgres 都原生兼容，**零业务代码改动**。`Application.jdKeywords / expectedSkills / interviewQuestions / AIRun.outputJson` 继续沿用"存 JSON 字符串"的约定（契约点 11），Postgres 虽支持原生数组/JSONB 但保持既有约定零迁移成本。
26. **用户数据强制隔离（2026-04-25 auth-v1 决策）** → 所有业务实体（`Resume` / `Application` / `Stage` 间接 / `IntelSummary` / `TomorrowTipCache` / `AIRun` / `CustomCompany` / `WeeklyTodo`）**必须**通过 `userId` 外键绑到 `User`，`onDelete: Cascade`。`Stage` 本身不直接存 `userId`，通过 `Application.userId` 间接归属，查询时 `include: { application: true }` 后校验。实现硬规则：①所有 `lib/queries/*.ts` 函数**第一个参数必须是 `userId: string`**，内部 `where: { userId, ... }`；②所有 `app/api/**/route.ts` handler 开头调 `const user = await requireCurrentUser();`，拿到 `user.id` 作过滤条件；③前端永远不传 `userId`——由服务端从 Cookie Session 解出；④`IntelSummary` / `TomorrowTipCache` 的唯一键升级为 `@@unique([userId, date])`，每个用户每天一份独立缓存；⑤`CustomCompany` 的唯一键是 `@@unique([userId, name])`。校验方式：用第二个账号登录，必须看不到第一个账号的任何数据（包括 AIRun 日志）。
27. **鉴权栈：Cookie Session + Edge middleware + 白名单（2026-04-25 auth-v1 决策）** → 技术选型：`bcryptjs`（密码 hash）+ `jose`（JWT 签发/验签，**Edge 兼容**）+ `cookies()` API（Next 15 async）。**不引入** NextAuth / Auth.js / iron-session（避免额外 provider 层与配置负担）。实现硬规则：①密码 hash 盐轮 10；②JWT 算法 HS256，`AUTH_SECRET` 不小于 32 字节（环境变量注入，dev 有硬编码兜底字符串）；③Cookie 名 `jhb_session`，`httpOnly / sameSite=lax / secure(prod) / maxAge=7d`；④Session payload 只含 `{ sub: userId, nickname, email }`，不含敏感字段；⑤`middleware.ts` 必须只用 jose 验签（Edge 跑不了 bcryptjs 的 Node 原生库）；⑥白名单路径前缀：`/login` / `/api/auth/` / `/_next/` / `/favicon`；⑦未登录业务页 → 302 `/login?redirect=<原路径>`；⑧未登录 API → 401 JSON（结构与 `ApiError` 一致：`{ error: { code: "UNAUTHORIZED", message } }`）；⑨已登录访问 `/login` → 302 `/dashboard`。未来若要扩展第三方登录（GitHub / Google 等），新建 `/api/auth/oauth/[provider]/route.ts`，签发同一 Cookie 即可复用 middleware。
28. **Stage 子信息三件套（2026-04-25 stage-tabs-v1 决策）** → `Stage` 在 v1 仅有"时间 / 状态 / 链接 / 复盘三字段"（questionSummary/answerSummary/suggestion），v2 扩展 3 个字段承载 AI 产物 + 用户随手记：①`interviewQuestions: String?` — JSON 字符串化的 `string[]`，与 `Application.interviewQuestions`（岗位共享题库）并存，此字段是"**本场面试实际问到的题**"，AI 生成的默认题库由前端从 Application 拉取后可导入 Stage；②`personalNotes: String?` — 用户自由文字（markdown 友好，但前端按纯文本渲染），放这场面试的临场感受 / 收到的反馈 / 自己的启发；③`reviewTranscript: String?` — 面试原始转录文本，供二次调用复盘 AI 重新解析用（可选，复盘完成后用户可清空）。前端承载：`components/drawer/tabs/` 目录下三个 Tab 组件，`StageDrawerContent.tsx` 顶部用 Tab 切换器。读写继续走 `/api/stages/[id]` PATCH（单次提交可部分更新）。**不**新增 API route，不新增 zod schema 文件（entities.ts 里追加字段即可）。
29. **AI 聊天面板为首页核心入口（2026-04-25 ai-chat-v1 决策）** → v1 的 `AICopilot` 是"4 按钮 + 草稿预览卡"形态，v2 升级为**对话流 + 能力挂载**两种形态并存：①主视图 `AIChatPanel` 作为首页左栏（`EventTable` 下方）的紧凑对话卡，用户可直接自然语言提问（"帮我优化 xx 岗位的简历投递策略"等）；②顶部有"展开"按钮，点后打开全屏 `Dialog` 承载完整 `AIChatPanel`（`variant="modal"`），左侧能力 chips（邮件解析 / JD 解析 / 生成面试题 / 复盘）可点击作为"上下文 tag"叠加到当前对话；③选中能力后调用 `/api/ai/chat`（新增），内部 orchestrator 根据 tag 决定调哪条具体的 AI route（`parse-email` / `parse-jd` / `generate-questions` / `review`）；④**草稿态流程完全不变**（契约点 22）：AI 生成结果仍作为"草稿"由用户确认后 PATCH/POST 落库，chat 路径不例外。`AICopilot.tsx` 保留未删（作为 fallback / 后续 A/B 备用），当前页面未引用。`AIWorkstation.tsx`（30KB）是解析工作区的具体实现，挂在展开弹窗内。
30. **Companies 预置+自定义混合策略（2026-04-25 companies-custom-v1 决策）** → v1 的 `/companies` 写死 10 家大厂（`COMPANY_ORDER` 常量），v2 支持**预置隐藏 + 自定义扩展**：①预置 10 家继续由 `lib/queries/companies.ts` 的 `COMPANY_ORDER` 提供顺序；②用户可通过 `CustomCompany` 表扩展自己想追踪的公司（`@@unique([userId, name])`）；③用户也可"隐藏"任何一家预置公司——此偏好存 **localStorage**（key: `jhb:hidden-preset-companies`，`components/companies/hiddenPresetStore.ts` 封装读写），而非数据库，因为"隐藏偏好"是端侧视觉喜好、不需要跨设备同步且避免服务端状态膨胀；④前端渲染顺序：未隐藏的预置 → 用户自定义（按 `sortOrder` 升序）；⑤每家公司行支持"点击创建新申请"（预填 `companyName`）+ "删除该公司"（预置走 hiddenPresetStore，自定义走 `DELETE /api/companies/[id]`）。**未来扩展**：若要做多设备同步隐藏偏好，可把 hiddenPresetStore 迁到 User 一个 `hiddenPresetCompanies: String?`（JSON 数组）字段，最多 10 条，零侵入改造。

---

## 🔄 维护规则（给 Agent）

1. **文件动了就更新本文件**。新增/删除/重命名/移动，任何一种都算。
2. **不要把进度写进来**。状态（做没做）在 `progress.md`，这里只管"是什么"。
3. **计划中的条目**：当实际创建出来后，把行从"（以下 Phase X 起陆续产生）"区域挪到已有的 app/ 或 lib/ 等子树下（保留 Phase 注释）；若最终没做，就删掉那一行。
4. **若实际产物与本文件偏差**（例如 Agent 做了 `lib/foo.ts` 却没登记）：以**实际代码为准**，立刻补登记，并在对应的 git commit message 里说明。
