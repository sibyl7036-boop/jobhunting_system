# 求职流程管理看板 - 技术栈推荐

> 本文档的目标读者：产品经理本人 + AI Coding Agent
> 核心诉求：**简单、健壮、AI 能稳定实现完整功能**
> 核心原则：**能用一个技术解决的，绝不用两个；能用官方默认方案的，绝不引入三方库**

---

## 0. 一句话总结

**用 Next.js 全栈一把梭 + SQLite + shadcn/ui + 豆包 API 原生调用。**

一个项目、一条命令启动、一个数据库文件、一套组件库。AI 写代码不会跑偏，你本地演示不会崩。

---

## 1. 为什么不用"更专业"的方案

在推荐具体技术前，先说清楚**为什么不选某些看起来很专业的东西**，这比推荐本身更重要。

| 方案 | 为什么不用 |
|---|---|
| 前后端分离（React + Express/NestJS） | 两个项目、两个端口、两套部署，AI 容易在前后端接口对不上的地方犯错 |
| PostgreSQL / MySQL | 需要装服务、配连接、起 Docker，本地演示环境复杂度陡增 |
| MongoDB | 没有强 Schema，AI 写代码时容易字段打错，PRD 数据模型是关系型的，也不适合 |
| LangChain / LangGraph | 对 5 个简单 AI Prompt 来说是杀鸡用牛刀，黑盒多、调试难 |
| Redux / Zustand 全局状态 | 这个项目数据量小、页面少，`useState` + 服务端查询就够 |
| Ant Design / MUI | 组件是黑盒，样式深度定制（粉马卡龙）难改，shadcn/ui 是复制代码到本地，改起来透明 |
| Docker / K8s | 本地演示不需要，徒增复杂度 |
| tRPC / GraphQL | 普通 REST API 足够清晰，AI 更熟悉 |

**核心判断标准：AI 写错代码的概率 + 你修不好的概率。**

---

## 2. 推荐技术栈总表

| 层级 | 技术选型 | 版本 | 角色 |
|---|---|---|---|
| **全栈框架** | Next.js (App Router) | 14.x 或 15.x | 前端页面 + 后端 API 一体 |
| **语言** | TypeScript | 5.x | 强类型，减少 AI 写错字段 |
| **UI 组件库** | shadcn/ui | 最新 | 组件代码直接进项目，可改 |
| **样式** | Tailwind CSS | 3.x | 原子化 CSS，AI 最熟悉 |
| **图标** | lucide-react | 最新 | UI 文档指定 |
| **动效（可选）** | Framer Motion | 11.x | 仅用于 Drawer/小猫轻动效 |
| **数据库** | SQLite | 内置 | 单文件数据库，零配置 |
| **ORM** | Prisma | 5.x | 类型安全 + 迁移 + Studio 可视化 |
| **文件上传** | Next.js Route Handler + 本地 `uploads/` 目录 | - | 不引入对象存储 |
| **PDF 文本提取** | `pdf-parse` | 最新 | 纯 Node 库，无系统依赖 |
| **PDF 预览** | 浏览器原生 `<iframe>` 或 `<embed>` | - | 不引入 react-pdf，稳定性更高 |
| **AI 调用** | 原生 `fetch` 调用火山方舟（Ark）API | - | 接入点后端绑 DeepSeek 3.2；路径由 Step 0.6 实测决定 |
| **日期处理** | `date-fns` | 最新 | 比 moment 轻，比 dayjs 更类型友好 |
| **日历组件** | `react-day-picker`（shadcn/ui 自带封装） | 最新 | 与 shadcn/ui 原生集成 |
| **表单** | shadcn/ui Form + `react-hook-form` + `zod` | 最新 | 表单校验标准组合 |
| **环境变量** | `.env.local` | - | Next.js 内置支持 |
| **包管理** | pnpm（推荐）或 npm | - | pnpm 更快更省空间 |

---

## 3. 技术选型逐项解释

### 3.1 为什么是 Next.js（App Router）

**一个项目搞定前后端**：
- `app/dashboard/page.tsx` 写前端页面
- `app/api/applications/route.ts` 写后端接口
- 同一个 TypeScript 类型可以前后端共享，不存在"前端期望字段 A、后端返回字段 B"的低级错误

**AI 对 Next.js 最熟悉**：
- 训练数据中 Next.js 代码量巨大
- App Router 约定式路由，AI 写起来不容易走错目录

**文件上传 / SSR / 静态资源** 全都内置支持，不用拼装。

### 3.2 为什么是 SQLite + Prisma

**SQLite = 一个 `.db` 文件**：
- 不需要装数据库服务
- 不需要配连接字符串
- 你重装电脑，把 `prisma/dev.db` 拷走就能恢复所有数据
- Prisma 支持一条命令切换到 PostgreSQL，未来要上线也不用改业务代码

**Prisma 的核心价值**：
- `schema.prisma` 一份文件定义所有数据模型，AI 读一遍就懂整个数据结构
- `npx prisma studio` 打开浏览器 GUI 直接看/改数据，你不用写 SQL 就能调试
- 自动生成 TypeScript 类型，前后端共享，减少字段拼错

PRD 6.1~6.5 的 5 个数据模型用 Prisma 大约 60 行就能写完。

### 3.3 为什么是 shadcn/ui

**它不是组件库，是"组件代码复制粘贴工具"**：
- 你执行 `npx shadcn add drawer`，组件代码会被**复制到你项目的 `components/ui/drawer.tsx`**
- 你想改样式？直接改那个文件。AI 想改？也直接改那个文件
- 没有"升级了组件库之后样式全乱"这种问题

**UI 文档（UI.md）第 3 章明确推荐了 shadcn/ui**，和粉马卡龙色系配合最好，因为颜色全部是 Tailwind 变量，改 `tailwind.config.ts` 里的 `primary` 就全局生效。

### 3.4 为什么 AI 调用不用 LangChain

PRD 里只有 5 个独立的 Prompt（解析邮件、解析 JD、生成面试题、复盘、每日动向），**每个 Prompt 都是单次调用、无上下文、无 Agent 编排**。

用原生 fetch：
```ts
// lib/llmClient.ts
export async function callDoubao(systemPrompt: string, userPrompt: string) {
  const res = await fetch(`${process.env.DOUBAO_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DOUBAO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.DOUBAO_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' }, // 强制 JSON 输出
    }),
  })
  const data = await res.json()
  return data.choices[0].message.content
}
```

**30 行代码就能封装完**，出问题直接看网络请求，不用猜 LangChain 内部在干什么。

---

#### 3.4.1 关于两套接口的选择（火山方舟 / 2026-04-18 确认）

火山方舟同时对外提供两套接口，**同一个 Endpoint ID 对两者都有效**：

| 路径 | 请求格式 | 响应格式 | JSON 约束 |
|---|---|---|---|
| `/chat/completions` | OpenAI 兼容：`messages: [{role, content}]` | `choices[0].message.content` | `response_format: { type: 'json_object' }` |
| `/responses` | 新版 Responses API：`input: [{role, content: [{type: 'input_text', text}]}]` | `output` 数组，里面找 type==='message' 的项 | `text.format: { type: 'json_object' }` 或靠 prompt 兜底 |

**本项目的选择策略**：由 `implementation_plan.md` 的 **Step 0.6「Ark API 连通性冒烟测试」** 实测决定：
1. 同时测两条路径 + 两种 JSON 约束方式（共 4 个用例）
2. 谁能稳定返回合法 JSON，全项目就走谁
3. 两条都能用时，默认选 `/chat/completions`（更贴近 OpenAI 生态、解析更简单、工具链更丰富）
4. 最终决策写入 `architecture.md` 的「关键契约点 · Ark API 调用路径决策」

**`lib/llmClient.ts` 的 `callAI` 必须按该决策实现，不要硬编码路径。** 这样未来需要切换接口时只改一行常量即可。

**通用约束**（不论选哪条路径，本项目都统一不传这些字段）：
- `stream`：不需要流式（不影响用户体验，反而让 JSON 解析更稳）
- `tools`：不需要联网搜索（daily-intel 用 `lib/fakeIntelSource.ts` 本地硬编码资讯）

**火山方舟官方调用样例**（用户 2026-04-18 提供，仅作参考）：
```bash
# /responses 示例
curl --location 'https://ark.cn-beijing.volces.com/api/v3/responses' \
  --header "Authorization: Bearer $ARK_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{
    "model": "ep-xxx-xxx",
    "input": [{"role":"user","content":[{"type":"input_text","text":"..."}]}]
  }'
```
注意火山方舟官方环境变量约定是 `ARK_API_KEY`，本项目沿用历史命名 `DOUBAO_API_KEY`，语义等价。

### 3.5 为什么 PDF 预览用 `<iframe>` 而不是 react-pdf

- `react-pdf` 要引入 `pdf.js`，打包体积大，worker 配置容易出错
- 浏览器原生支持 PDF 预览（Chrome/Edge/Safari 都内置）
- 你只需要 `<iframe src={pdfUrl} />` 一行代码

---

## 4. 项目目录结构（AI 按此生成）

```
job-hunt-board/
├── app/
│   ├── layout.tsx                  # 全局布局（左侧导航 + 顶部 Header + Drawer 容器）
│   ├── page.tsx                    # 重定向到 /dashboard
│   ├── dashboard/
│   │   └── page.tsx                # 首页（5 个模块）
│   ├── calendar/
│   │   └── page.tsx                # 日历页
│   ├── companies/
│   │   └── page.tsx                # 大厂流程页
│   └── api/
│       ├── resumes/
│       │   ├── route.ts            # GET 列表 / POST 上传
│       │   └── [id]/route.ts       # PATCH / DELETE
│       ├── applications/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── stages/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── dashboard/
│       │   └── events/route.ts
│       ├── calendar/
│       │   └── events/route.ts
│       ├── companies/
│       │   └── progress/route.ts
│       └── ai/
│           ├── parse-email/route.ts
│           ├── parse-jd/route.ts
│           ├── generate-questions/route.ts
│           ├── review/route.ts
│           └── daily-intel/route.ts
├── components/
│   ├── ui/                         # shadcn/ui 组件（复制进来的）
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── dashboard/
│   │   ├── EventTable.tsx
│   │   ├── TomorrowReminder.tsx
│   │   ├── DailyIntel.tsx
│   │   ├── ResumeCard.tsx
│   │   └── AICopilot.tsx
│   ├── calendar/
│   │   └── MonthView.tsx
│   ├── companies/
│   │   └── CompanyRow.tsx
│   ├── drawer/
│   │   └── DetailDrawer.tsx        # 全局 Drawer
│   └── CatIcon.tsx                 # 自定义小猫 SVG
├── lib/
│   ├── db.ts                       # Prisma Client 单例
│   ├── llmClient.ts                # 豆包 API 封装
│   ├── prompts.ts                  # 5 个 system prompt 常量
│   └── utils.ts
├── prisma/
│   ├── schema.prisma               # 数据模型
│   ├── seed.ts                     # 预置 10 家大厂名单
│   └── dev.db                      # SQLite 数据库文件（自动生成）
├── uploads/                        # 用户上传的 PDF 简历
├── public/
├── .env.local                      # DOUBAO_API_KEY 等
├── tailwind.config.ts              # 粉马卡龙色系配置
├── package.json
└── tsconfig.json
```

**这个目录结构一眼就能看懂哪里是前端、哪里是后端、哪里是 AI、哪里是数据。AI 生成代码时不会乱放。**

---

## 5. 关键依赖清单（`package.json` 大致内容）

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@prisma/client": "^5.x",
    "typescript": "^5.x",
    "tailwindcss": "^3.4.0",
    "lucide-react": "latest",
    "framer-motion": "^11.x",
    "date-fns": "^3.x",
    "react-hook-form": "^7.x",
    "zod": "^3.x",
    "@hookform/resolvers": "^3.x",
    "pdf-parse": "^1.x",
    "react-day-picker": "^8.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x"
  },
  "devDependencies": {
    "prisma": "^5.x",
    "@types/node": "^20.x",
    "@types/react": "^18.x",
    "@types/pdf-parse": "^1.x",
    "tsx": "^4.x"
  }
}
```

**加上 shadcn/ui 按需添加的几个组件（Drawer/Dialog/Table/Button/Input/Form/Badge/Tabs 等），总依赖数控制在 20 个以内。**

---

## 6. 环境变量（`.env.local`）

**仓库根目录已存在 `.env.local`（不进 git，已加入 `.gitignore`）。** 以下是字段说明：

```env
# 数据库
DATABASE_URL="file:./prisma/dev.db"

# 豆包 AI（火山方舟 · 北京区）
# API Key 来源：用户提供（2026-04-18）
DOUBAO_API_KEY=ark-xxxxxxxxxxxxxxxx-xxxxx

# 接入点 Base URL：火山方舟公网固定域名（具体调用路径见 3.4.1，由 Step 0.6 决策）
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3

# 推理接入点 ID（Endpoint ID，形如 ep-YYYYMMDDHHMMSS-xxxxx）
# 从火山方舟控制台「在线推理 → 自定义推理接入点」复制
DOUBAO_MODEL=ep-xxxxxxxxxxxxxx-xxxxx

# 文件上传（可选，默认本地 uploads/）
UPLOAD_DIR=./uploads
```

**字段解释**：
- `DOUBAO_API_KEY`：用户的 Ark API Key（`ark-...` 开头）。**绝不写入任何进 git 的文件**，只存在于 `.env.local`
- `DOUBAO_BASE_URL`：火山方舟北京区公网接入点。项目调用 `/chat/completions`（OpenAI 兼容），见 3.4.1
- `DOUBAO_MODEL`：**不是模型名字符串**（如 `doubao-pro-32k`），而是控制台里创建的**推理接入点 ID**，格式 `ep-{创建时间}-{hash}`。切换模型靠在控制台改 Endpoint 绑定的底座模型，项目代码不用动

---

## 7. 启动命令（AI 必须跑通）

```bash
# 1. 安装依赖
pnpm install

# 2. 初始化数据库（创建表结构）
npx prisma migrate dev --name init

# 3. 预置大厂数据
npx prisma db seed

# 4. 启动开发服务器
pnpm dev

# 5. （调试用）打开数据库 GUI
npx prisma studio
```

**5 条命令，全部跑通即验收通过。**

---

## 8. AI Coding 实现顺序建议

按 PRD 第 14 章优先级 + 这里给出的依赖关系，建议让 AI 按这个顺序生成代码：

1. **Day 1 地基**
   - 初始化 Next.js + Tailwind + shadcn/ui
   - 写 `prisma/schema.prisma`，执行 migrate
   - 写 `prisma/seed.ts` 预置 10 家大厂
   - 实现左侧导航 + 顶部 Header + 整体布局

2. **Day 2 数据层**
   - 5 组 REST API（Resume / Application / Stage / Companies / Dashboard events）
   - 每个 API 都先写好再写前端，避免返工

3. **Day 3 三个主页面**
   - `/dashboard` 表格 + 简历卡片
   - `/calendar` 月视图
   - `/companies` 公司流程条

4. **Day 4 Drawer**
   - 全局 Drawer 组件
   - 基础信息 / JD / 关联简历展示+编辑

5. **Day 5 AI 接入**
   - `lib/llmClient.ts` 封装豆包 API
   - 5 个 AI 路由
   - Copilot 卡片 + Drawer 内的 AI 按钮
   - 关键：**AI 结果先显示为草稿，用户编辑后才落库**

6. **Day 6 打磨**
   - loading / 空状态 / 错误提示
   - 小猫 SVG + 轻动效
   - 粉马卡龙色系微调

---

## 9. 给产品经理的注意事项

1. **不要让 AI 自己选技术栈**。每次启动新需求时，把这份文档贴给 AI，让它严格按此执行。
2. **数据库不要删**：`prisma/dev.db` 是你所有数据，跟 Git 用 `.gitignore` 隔离，别误提交也别误删。
3. **豆包 API Key 绝不出现在前端代码里**。AI 如果把 Key 写到 `app/` 目录下的文件，立刻让它改。
4. **遇到"装不上依赖"的报错**：90% 是 Node 版本问题，保持 Node 20+ 即可。
5. **AI 说要引入新库时先问自己**：这个库解决的问题，能不能用已有技术解决？如果能，拒绝引入。
6. **开发时用 `npx prisma studio`**：可视化查看/修改数据，比写 SQL 直观。

---

## 10. 风险与兜底

| 风险 | 兜底方案 |
|---|---|
| 豆包 API 调用失败 | `llmClient.ts` 统一 try-catch，前端显示"AI 暂不可用，请手动填写" |
| PDF 文本提取失败 | 不阻断上传流程，`extractedText` 字段允许为空 |
| SQLite 文件损坏 | 删掉 `dev.db`，重跑 migrate + seed 即可（演示数据无所谓） |
| AI 返回非 JSON | 后端用 `JSON.parse` 套 try-catch，失败时让用户重试或手动填 |
| 打包到生产部署 | 如需上线，把 `DATABASE_URL` 换成 PostgreSQL URL，其余代码零改动 |

---


