# CODEBUDDY.md · AI Agent 入口

本仓库是"**求职流程管理看板**（Job Hunt Flow Board）"，面向求职季学生，当前为 **v2.0-maintenance-r1（2026-04-25）维护期**。
**任何 AI Agent 进入本仓库时，本文件是第一读物。**

生产环境：**https://system-pi-three.vercel.app**（Vercel + Neon Postgres + 豆包 DeepSeek 3.2）

---

## 🚨 1. 强制阅读门禁（动手前必读 4 份）

**顺序即优先级**。任何一份没读完，不准改代码。

| # | 文件 | 为什么必须读 |
|---|---|---|
| 1 | [`CODEBUDDY.md`](./CODEBUDDY.md)（本文件） | 工作守则 + 红线 + 文档分工规则 |
| 2 | [`docs/architecture.md`](./docs/architecture.md) | 文件地图 + 30 条关键契约点（30 秒定位代码 · 防止改动与已有决策冲突） |
| 3 | [`CHANGELOG.md`](./CHANGELOG.md) 最近 3 条 | 最近改过什么 · 避免重复造轮子或破坏前次改动 |
| 4 | [`.workbuddy/memory/MEMORY.md`](./.workbuddy/memory/MEMORY.md) | 用户偏好 + 项目约定（跨会话稳定事实） |

### 按需查阅（不在必读清单）

- [`docs/prd.md`](./docs/prd.md) — 改产品行为时查（AI prompt 原文 / 枚举值 / 闭环定义）
- [`docs/ui-guide.md`](./docs/ui-guide.md) — 改 UI 时查（马卡龙配色 / 组件视觉规则）
- [`docs/tech-stack.md`](./docs/tech-stack.md) — 引入新依赖 / 升版本前查
- [`docs/legacy/`](./docs/legacy/) — v1.0 建设期历史快照（**冻结 · 仅历史参照 · 禁改**）

### 动手前自检单（放进对话给用户点头）

1. **影响范围**：动哪些文件 / 哪些模块
2. **数据模型**：是否改 Prisma schema（要跟 migration）
3. **契约冲突**：改动与 `docs/architecture.md` 30 条契约点有无冲突
4. **验证方法**：typecheck / lint / build / smoke-* 哪些需要跑

**任何一条没答，就不要动代码。**

冲突时的权威优先级：**`docs/prd.md` > `docs/ui-guide.md` > `docs/tech-stack.md`**。
`docs/architecture.md` 记"**是什么**"、`CHANGELOG.md` 记"**改过啥**"、`MEMORY.md` 记"**用户偏好**"，互不越位。

---

## 2. 仓库当前状态

**v2.0-maintenance-r1（2026-04-25 交付，仍在维护）**。
在 v1.0 公网 demo 基础上完成第一波维护期大迭代：

- 🔐 多用户登录与数据隔离（User 表 + Cookie Session + Edge middleware）
- 📊 首页 v2 布局（AI 聊天前置 · 便签 Todo · 迷你简历）
- 🗂️ Stage 子信息三 Tab（面试题 / 复盘 / 随手记）
- 🏢 Companies 预置 + 自定义 + 隐藏（localStorage）
- 🤖 AI 聊天面板（对话流 + 能力挂载）
- 👋 新手引导 OnboardingDialog
- ☁️ Vercel + Neon Postgres 公网 demo 正常运行

`pnpm typecheck / lint / build` 三件套均 **0 warning 0 error**。

详情见 [`CHANGELOG.md`](./CHANGELOG.md) 顶部条目和 [`docs/architecture.md`](./docs/architecture.md) 契约点 26~30。

**v1.0 基线**（2026-04-19）：39/39 Step 全绿 · 18 个 API route · 6 闭环 E2E 31/0。建设期文档已归档到 [`docs/legacy/`](./docs/legacy/)。

---

## 3. 项目一览

- **前后端一体** Web 系统（Next.js App Router · 禁纯前端 localStorage demo）
- **3 个业务页 + 1 个登录页 + 全局右侧 Drawer**：
  - `/dashboard` 首页 v2（流程表 · AI 聊天 · 便签 · 迷你简历 · 明日提醒 · 今日动向）
  - `/calendar` 日历月视图 + 右侧便签书签
  - `/companies` 公司流程页（预置 10 家 + 自定义）
  - `/login` 登录/注册页
- **5 个真实豆包 AI 调用**：解析邮件 / 解析 JD / 生成面试题 / 面试复盘 / 今日大厂动向
- **PDF 简历**：上传、预览（原生 iframe）、文本提取、与岗位关联
- **多用户隔离**：所有业务数据按 `userId` 强制过滤

---

## 4. 红线守则（不可违反）

1. 🔴 **AI 结果必须草稿态** → AI 路由不写业务表（只写 `AIRun` 日志），草稿返前端 → 用户编辑 → 保存才 PATCH/POST 入库（契约点 7）
2. 🔴 **API Key / AUTH_SECRET 禁前端** → 只能在 `app/api/**/route.ts` / `lib/llmClient.ts` / `lib/auth.ts` / `middleware.ts` 读 env（契约点 6）
3. 🔴 **中文枚举原值** → `stageType` / `status` / `resume.tag` 永远存中文（`HR面` / `待参加` / `产品`），不要英文代号（契约点 5）
4. 🔴 **用户数据强制隔离** → `lib/queries/*.ts` 首参 `userId: string`；API handler 开头 `await requireCurrentUser()`（契约点 26）
5. 🔴 **AI 调用唯一出口** → 全部走 `lib/llmClient.ts` 的 `callAI`，禁止在 route 里直接 fetch 豆包（契约点 2）
6. 🔴 **Prisma 单例** → 全部走 `lib/db.ts`，禁止 `new PrismaClient()`（契约点 1）
7. 🔴 **middleware 只用 jose** → Edge 跑不了 bcryptjs 的 Node 原生库，middleware 禁止引 `lib/auth.ts`（契约点 27）

---

## 5. 文档分工

| 文件 | 记录什么 | 什么时候必须更新 |
|---|---|---|
| `docs/architecture.md` | **是什么** · 文件地图 + 30 条契约点 | 新增/删除/重命名/移动文件时 · 做新决策时追加契约点 |
| `CHANGELOG.md` | **改过啥** · 维护期动作流水 | **每次维护期改动必须追加一条** |
| `.workbuddy/memory/YYYY-MM-DD.md` | **日度笔记** · append-only | 每次完成实质工作后 |
| `.workbuddy/memory/MEMORY.md` | **长期事实** · 用户偏好 / 项目约定 | 用户告知新偏好时 in-place 更新 |
| `docs/legacy/**` | v1.0 建设期冻结快照 | **禁止修改** |

---

## 6. 维护期工作流（契约点 23）

### 开工前
1. 读必读 4 份（上文"强制阅读门禁"）
2. 发"自检单"（4 问题格式）给用户点头

### 工作中
1. 小改动直接 main；跨模块 / schema 迁移建独立分支（`tweak/*` / `feat/*` / `fix/*` / `deploy/*` / `refactor/*`）
2. 关键改动处加中文 inline 注释：`// [YYYY-MM-DD <branch>] <一句话原因>`
3. schema 改动必跟 `pnpm exec prisma migrate dev --name <name>`（本地）；Vercel 构建走 `db push`

### 完工后（5 件必做）
1. 跑三件套 → `pnpm typecheck / lint / build` 必须 **0 warning 0 error**
2. 追加 `CHANGELOG.md` 条目（"做了什么 / 为什么 / 验证 / 踩坑"四问题格式）
3. 若动了文件结构 → 更新 `docs/architecture.md` 目录树
4. 若有新决策 → 追加 `docs/architecture.md` 契约点（编号续在 30 之后）
5. Git commit + push；大节点打 tag `<type>-<描述>-<yyyymmdd>`
6. 追加 `.workbuddy/memory/YYYY-MM-DD.md` 日度笔记

---

## 7. 常用命令

```bash
# 开发
pnpm dev                      # localhost:3000
pnpm build                    # 生产构建（含 prisma db push + next build）

# 代码质量（三件套 · 必须全 0 warning 0 error）
pnpm typecheck
pnpm lint
pnpm build

# Prisma
pnpm exec prisma studio                           # 可视化 DB
pnpm exec prisma migrate dev --name <name>        # 本地改 schema
pnpm exec prisma db push --accept-data-loss       # 生产环境同步（Vercel 构建自动跑）

# 烟测
pnpm tsx scripts/smoke-api.ts                     # 非 AI CRUD（需先起 dev server）
pnpm tsx scripts/smoke-closures.ts                # PRD 6 闭环 E2E（含真实 AI 调用）
```

---

## 8. 环境变量

5 条 · 只存在于 `.env.local`（gitignore）+ Vercel Project Settings：

```env
DATABASE_URL            # Neon Postgres pooled URL
AUTH_SECRET             # JWT 签名密钥 · openssl rand -base64 32 生成
DOUBAO_API_KEY          # 火山方舟 Ark API Key
DOUBAO_BASE_URL         # https://ark.cn-beijing.volces.com/api/v3
DOUBAO_MODEL            # Endpoint ID · ep-{时间戳}-{hash}
```

详见 [`docs/tech-stack.md`](./docs/tech-stack.md) 第 4 节。

---

## 9. 红色信号 · 看到这些停下来问

- 🚩 要在 `app/**` 之外的地方读 `process.env.DOUBAO_*` → 违反契约点 6
- 🚩 要在 API handler 里不调 `requireCurrentUser()` → 违反契约点 26
- 🚩 要让 AI 结果直接写业务表 → 违反契约点 7（草稿态）
- 🚩 要把枚举改成英文 → 违反契约点 5
- 🚩 要在 middleware 里 `import bcrypt` → Edge 跑不了 → 违反契约点 27
- 🚩 要引入 NextAuth / Redux / react-pdf / Docker → 看 `docs/tech-stack.md` 第 3 节禁用清单
- 🚩 要升 Next 16 / Tailwind 4 / React 19 → 看 `docs/tech-stack.md` 第 2.1 节版本锁定
