# CHANGELOG

> **本仓库的改动日志**。v1.0 交付（2026-04-19）之后所有的维护期变更都记在这里。
>
> **与其他文档的分工**：
> - `implementation_plan.md` / `progress.md` / `job_hunt_flow_board_prd.md` / `UI.md` / `tech_stack.md` = **v1.0 的历史快照**，维护期**不修改**
> - `architecture.md` = **当下的文件地图 + 关键契约点**（做新决策时追加契约点）
> - 本文件 = **动作流水**（每次改了什么、为什么、怎么验证、踩了什么坑）
> - `MEMORY.md`（工作记忆）= **用户偏好 + 项目约定**（跨会话）
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
