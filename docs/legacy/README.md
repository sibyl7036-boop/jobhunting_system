# docs/legacy/ · v1.0 建设期历史快照（冻结 · 不再维护）

本目录保留 **v1.0 建设期**（2026-04-18 ~ 2026-04-19）产生的 4 份文档，仅作历史参照：

| 文件 | 原用途 | 为什么冻结 |
|---|---|---|
| `implementation_plan.md` | 7 Phase / 39 Step 指令手册 | v1.0 已 39/39 全绿交付，指令手册本身已完成使命 |
| `progress.md` | 逐步勾选清单 | 39 个 Step 全勾完，后续维护期不再新增 Phase |
| `architecture.md` | v1.0 版本的文件地图 | 已被 `../architecture.md`（v2.0 版）替代 |
| `tech_stack.md` | v1.0 版本的技术栈文档 | 已被 `../tech-stack.md`（v2.0 版）替代（技术栈从 SQLite → Neon Postgres + 加鉴权栈） |

---

## ⚠️ 冻结规则

- **禁止修改本目录内任何文件**。如果需要记录新的架构决策 / 工作流变更，去 `../architecture.md` 的"关键契约点"追加；如果需要记录新的改动，去 `../../CHANGELOG.md` 追加新条目。
- **不要参考本目录做"下一步该做什么"的决策**。v1.0 已交付，没有"下一个未勾选 Step"。
- **只在以下情况按需查阅**：
  - 好奇某个设计决策历史上是怎么来的（比如"为什么 `Application.jdKeywords` 存 JSON 字符串而不是 Postgres 原生数组"→ 因为 v1.0 是 SQLite）
  - 想看某个组件第一版长什么样（比如 `AICopilot` v1 vs `AIChatPanel` v2）
  - 未来想重启某个新 Phase 时，参考 v1.0 的 Step 粒度写法

---

## 📂 当前应该读哪些文档？

进入仓库的 Agent 按 `../../CODEBUDDY.md` 的"模式 B 维护期必读 4 份"走：

1. [`../../CODEBUDDY.md`](../../CODEBUDDY.md) — 入口 + 红线守则
2. [`../architecture.md`](../architecture.md) — 当前文件地图 + 30 条契约点
3. [`../../CHANGELOG.md`](../../CHANGELOG.md) — 最近 3 条动作流水
4. [`../../.workbuddy/memory/MEMORY.md`](../../.workbuddy/memory/MEMORY.md) — 用户偏好

产品规格 / 视觉规范需要时查：
- [`../prd.md`](../prd.md)
- [`../ui-guide.md`](../ui-guide.md)

技术栈疑问查：
- [`../tech-stack.md`](../tech-stack.md)
