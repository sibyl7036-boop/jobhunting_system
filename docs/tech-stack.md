# tech-stack.md · 技术栈详解

> **本文件记录 v2.0-maintenance-r1 的真实技术栈与版本锁定**，以及"为什么选 / 不选"的决策。
> 引入新依赖前必读；升级主要版本前必读。
>
> v1.0 建设期的技术栈历史快照在 [`legacy/tech_stack.md`](./legacy/tech_stack.md)，仅作历史参照。

---

## 0. 一句话总结

**Next.js 15 全栈 + Neon Postgres + Prisma 5 + shadcn/ui + Cookie Session 鉴权 + 豆包 API 原生调用**，部署到 Vercel Hobby。

一条命令本地启动；`git push` 自动部署到公网。

---

## 1. 技术栈总表（当前真实状态）

| 层级 | 选型 | 版本 | 角色 |
|---|---|---|---|
| **运行时** | Node.js | ≥ 20 | Next 15 要求 |
| **包管理** | pnpm | 10.33 | `pnpm-workspace.yaml.onlyBuiltDependencies` 批准了 @prisma/engines / prisma / @tailwindcss/oxide |
| **全栈框架** | Next.js (App Router) | **15.5** | 前端 + 后端 + 中间件一体 |
| **语言** | TypeScript | **5.9** | `strict: true` |
| **UI 框架** | React | **18.3** | 不上 React 19（Next 16 才强制） |
| **样式** | Tailwind CSS | **3.4** | 不上 Tailwind 4（配置方式不兼容） |
| **组件库** | shadcn/ui | new-york style, neutral baseColor | 代码复制进项目，可改 |
| **图标** | lucide-react | ^1.8 | UI.md 指定 |
| **数据库** | Neon Postgres (Singapore pooled) | - | 免费 0.5GB · 闲置 5 分钟休眠 |
| **ORM** | Prisma | **5.22** | 不上 Prisma 6/7（配置结构大变） |
| **鉴权** | bcryptjs + jose (JWT HS256) + Cookie Session | bcryptjs ^3 · jose ^6.2 | 不引入 NextAuth / Auth.js |
| **AI 调用** | 原生 `fetch` → 火山方舟 `/chat/completions` | - | 底座模型 DeepSeek 3.2 |
| **PDF 文本** | `pdf-parse` v2 | ^2.4 | `new PDFParse({ data }).getText()` |
| **PDF 预览** | 浏览器原生 `<iframe>` | - | 不引入 react-pdf |
| **表单** | react-hook-form + zod + @hookform/resolvers | ^7.72 / ^4.3 / ^5.2 | 标准组合 |
| **Data Fetching (Client)** | SWR | ^2.4 | Drawer + AI 聊天用 |
| **Toast** | sonner | ^2.0 | 全局 Toaster 挂 `app/layout.tsx` |
| **Dialog 底座** | @radix-ui/react-dialog | ^1.1 | Sheet / Dialog 共享 |
| **日期** | date-fns | ^4.1 | 本地时区计算 |
| **部署** | Vercel Hobby | - | GitHub `sibyl7036-boop/jobhunting_system` main → 自动 deploy |
| **公网 URL** | https://system-pi-three.vercel.app | - | 免费 demo · 冷启动 10~15 秒 |

---

## 2. 关键版本锁定

### 2.1 为什么锁 Next 15 不上 Next 16

`create-next-app@latest` 默认拉：
- **Next 16** + **Tailwind 4** + **React 19** + **ESLint 9 flat config**

这会破坏本项目的多个约定：
- Tailwind 4 用 CSS `@theme` 块而不是 JS `tailwind.config.ts` 的 `theme.extend.colors`
- React 19 的 ref 语义变化、use() API 语义变化
- ESLint 9 的 flat config 与现有 `.eslintrc.json` 不兼容
- Prisma 6/7 的 `prisma.config.ts` 和自定义 output 路径与现有 `lib/db.ts` 不兼容

**所以 `package.json` 手写锁定**：
```json
{
  "next": "^15.1",
  "react": "^18.3",
  "react-dom": "^18.3",
  "tailwindcss": "^3.4",
  "eslint": "^8.57",
  "eslint-config-next": "^15.1",
  "prisma": "^5.22",
  "@prisma/client": "^5.22",
  "typescript": "^5.7"
}
```

升级这几个主要版本时，必须同步改：`tailwind.config.ts`、`.eslintrc.json`、`prisma` 相关配置、本文档。

### 2.2 Prisma 5.22 vs 6/7

- Prisma 6/7 默认产出 `prisma.config.ts` + 自定义 output 路径（`lib/generated/prisma`）
- 本项目 `lib/db.ts` 的 Prisma Client 导入路径假设是默认 `@prisma/client`
- Prisma CLI 命令前缀用 `pnpm exec prisma`（**不用 `pnpm dlx prisma`**，避免全局缓存走到新版本）

---

## 3. 为什么不用某些方案

| 方案 | 为什么不用 |
|---|---|
| 前后端分离（Express + React 独立） | Next.js App Router 一把梭，接口不会对不上 |
| NextAuth / Auth.js | 对单账号密码场景过重；本项目邮箱密码登录只需 bcryptjs + jose 30 行代码 |
| iron-session | 功能与 jose + cookies() 重复 |
| MongoDB | 无强 schema，AI 写代码容易字段打错；本项目数据模型是关系型 |
| LangChain / LangGraph | 5 个简单 Prompt 杀鸡用牛刀，黑盒多、调试难 |
| Redux / Zustand 全局状态 | 数据量小、页面少，SWR + URL 参数够 |
| react-query | SWR 更轻，本项目用不到 react-query 的 mutation 编排 |
| Ant Design / MUI | 组件黑盒，粉马卡龙定制难改 |
| Docker / K8s | Vercel Hobby 足够；v1.0 的 `Dockerfile` 已删 |
| tRPC / GraphQL | REST 更直观，AI 更熟悉 |
| react-pdf | 浏览器原生 `<iframe>` 足够稳，省打包体积 |
| react-day-picker | 月视图手写 7×N grid 更可控（UI.md 9.3） |

---

## 4. 环境变量（.env.local）

**所有密钥都只存在于 `.env.local`（已在 `.gitignore`）**。

```env
# 数据库
DATABASE_URL="postgresql://neondb_owner:***@ep-xxx-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# 鉴权
AUTH_SECRET="<openssl rand -base64 32 生成>"   # 生产必须注入

# 豆包 AI（火山方舟 · 北京区 · DeepSeek 3.2 Endpoint）
DOUBAO_API_KEY=ark-xxxxxxxx
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
DOUBAO_MODEL=ep-20260418165808-rvgk2
```

**字段含义**：
- `DATABASE_URL` → **必须是 pooled 版本**（主机名带 `-pooler`），否则 Serverless 并发会爆连接数
- `AUTH_SECRET` → JWT 签名密钥，不小于 32 字节。dev 有硬编码兜底，**生产 Vercel 必须通过环境变量注入**（否则 JWT 可被伪造）
- `DOUBAO_API_KEY` → 用户火山方舟 Ark API Key（`ark-...` 开头），等价于官方 `ARK_API_KEY`
- `DOUBAO_BASE_URL` → 火山方舟北京区公网固定域名
- `DOUBAO_MODEL` → **不是模型名字符串**，是控制台创建的推理接入点 ID（`ep-{时间戳}-{hash}`）。切模型靠在控制台改 Endpoint 绑定的底座模型，项目代码不动

Vercel 上同样的 5 条变量（除了 dev 专用的 SQLite fallback）必须在 Project Settings → Environment Variables 配置，**Production 和 Preview 勾选**，Development 不用勾（本地走 `.env.local`）。

---

## 5. 常用命令

```bash
# 开发
pnpm dev                         # localhost:3000
pnpm build                       # 生产构建（含 prisma db push + next build）
pnpm start                       # 启动构建后的产物

# 代码质量（三件套）
pnpm typecheck                   # TypeScript strict
pnpm lint                        # next lint (ESLint 8)
pnpm build                       # 必须 0 warning 0 error

# Prisma
pnpm exec prisma studio          # 可视化 DB
pnpm exec prisma migrate dev --name <name>    # 本地改 schema 产生迁移
pnpm exec prisma db push                      # Neon 上强制同步（破坏性，生产慎用）
pnpm exec prisma generate                     # 重新生成 Client

# 烟测
pnpm tsx scripts/smoke-api.ts                 # 非 AI CRUD 烟测（需先起 dev server）
pnpm tsx scripts/smoke-closures.ts            # PRD 6 闭环 E2E（含真实 AI 调用）
```

### Vercel 部署命令链

`package.json` 的 `build` 脚本：
```json
"build": "prisma generate && prisma db push --accept-data-loss && next build"
```

**为什么 `db push` 不是 `migrate deploy`**：Neon 已有 schema 时 `migrate deploy` 报 P3005（"database schema is not empty"）。本项目个人 demo 场景，schema 变更频率低，`db push` 幂等更稳。如果要转到多环境严格迁移模式，改回 `migrate deploy` 并手动 baseline 即可。

---

## 6. AI 调用契约（`lib/llmClient.ts`）

**接口路径已锁定**：`/chat/completions`（OpenAI 兼容），详见 [`architecture.md`](./architecture.md) 契约点 3。

```ts
// JSON 场景（parse-email / parse-jd / generate-questions / review）
callAI({
  taskType: "parse_email",
  systemPrompt: SYS_PARSE_EMAIL,  // PRD 9.1 原文
  userPrompt: `邮件内容如下：\n${inputText}`,
  expectJson: true,               // → response_format: { type: "json_object" }
})

// 纯文本场景（daily-intel / tomorrow-tip）
callAI({
  taskType: "daily_intel",
  systemPrompt: SYS_DAILY_INTEL,  // PRD 9.5 原文
  userPrompt: `今日资讯：\n${bulletList}`,
  expectJson: false,              // → 不传 response_format
})
```

**所有 AI 调用自动写 `AIRun` 日志**（契约点 2 · 21）。

---

## 7. 鉴权栈（`lib/auth.ts` + `middleware.ts`）

```ts
// lib/auth.ts
hashPassword(plain) → bcrypt.hash(plain, 10)
verifyPassword(plain, hash) → bcrypt.compare
signSession(user) → new SignJWT({...}).setSubject(user.id).sign(SECRET)
verifySession(token) → jwtVerify(token, SECRET)
getCurrentUser() → 从 cookies() 读 jhb_session → 验签 → 查 DB User
requireCurrentUser() → getCurrentUser() ?? throw ApiError("UNAUTHORIZED", 401)

// middleware.ts（Edge 运行时）
只能用 jose 验签，不能引 bcryptjs（Node 原生库 Edge 跑不了）
白名单：/login · /api/auth/ · /_next/ · /favicon
未登录业务页 → 302 /login?redirect=<原路径>
未登录 API → 401 JSON
```

详见 [`architecture.md`](./architecture.md) 契约点 27。

---

## 8. 引入新依赖的判断流程

1. **现有依赖能不能解决？** → 能就不引
2. **是不是官方标准方案？** → 不是要有强理由
3. **是不是打包体积 > 50KB？** → 考虑替代品或手写
4. **会不会和版本锁定冲突？** → 看 peerDependencies 是不是要 Next 16 / React 19 / Tailwind 4
5. **引入后更新 `package.json` + `pnpm-lock.yaml` + 本文件 `技术栈总表` + `CHANGELOG.md` 条目**

---

## 9. 风险与兜底

| 风险 | 兜底方案 |
|---|---|
| 豆包 API 调用失败 | `llmClient.ts` 统一 try-catch + 4 种错误分类，前端 toast "AI 暂不可用" |
| Neon 冷启动超时 | Vercel Function 默认 10s 超时够用；用户看到的是第一次访问慢 5~10 秒 |
| `AUTH_SECRET` 未注入生产 | `middleware.ts` 和 `lib/auth.ts` 有硬编码 dev 兜底，但**生产必须注入**，否则 JWT 可伪造 |
| PDF 文本提取失败 | 不阻断上传流程，`extractedText` 字段允许 null |
| Vercel 上传 503 | 符合预期（契约点 24）· 前端 toast 降级文案 |
| SQLite 本地遗留 | `prisma/dev.db` 保留（gitignore），改 `DATABASE_URL=file:./dev.db` 即可回退 |
| 豆包 Key 泄漏 | 只存 `.env.local` + Vercel env；`lib/llmClient.ts` catch 时剥 Authorization 头 |

---

## 10. v1.0 → v2.0 技术栈变更摘要

| 项 | v1.0（2026-04-19） | v2.0（2026-04-25） |
|---|---|---|
| 数据库 | SQLite (`prisma/dev.db`) | **Neon Postgres (Singapore pooled)** |
| 鉴权 | 无（单人使用） | **bcryptjs + jose + Cookie Session** |
| 首页布局 | v1（TodayTimeline + TomorrowReminder 分开） | **v2**（AI 聊天前置 + 便签 Todo + 迷你简历） |
| AI 入口 | AICopilot 4 按钮 | **AIChatPanel 对话流 + 能力挂载** |
| Stage 子信息 | 时间/状态/链接/复盘三件套 | **+ 面试题 / 随手记 / 原始转录 三子 Tab** |
| Companies | 10 家大厂写死 | **预置 + 自定义 + localStorage 隐藏** |
| 部署 | 本地 | **Vercel Hobby 公网 demo** |
| build 脚本 | `migrate deploy` | **`db push --accept-data-loss`** |

详见 [`../CHANGELOG.md`](../CHANGELOG.md) 的 `[v2.0-maintenance-r1]` 条目。
