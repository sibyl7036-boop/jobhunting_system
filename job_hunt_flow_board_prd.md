# 求职流程管理看板 PRD（AI Coding 版）

> 本文档的阅读对象是 **AI coding agent / AI 开发助手**。  
> 目标不是产品汇报，而是让 AI 能直接据此实现一个 **前后端一体、可运行、可演示** 的系统。

---

## 0. 文档目标

请根据本文档实现一个 **求职流程管理看板系统**，用于帮助大学生在求职季管理：

- 每天的面试 / 笔试 / 测评 / HR 面 / Offer 沟通
- 各互联网大厂的投递进度与完整流程
- 2~3 份 PDF 简历的上传、预览、关联
- AI 解析面试邮件 / JD
- AI 生成面试题
- AI 生成面试复盘
- AI 提醒明日流程
- AI 汇总近期大厂招聘动向

本系统必须是：

- **前后端一体实现**
- **有数据库**
- **有文件上传**
- **有真实 AI 调用（豆包 API）**
- **所有 AI 结果都支持人工手动编辑后再保存**

---

## 1. 产品定位

这是一个面向大学生求职季的 **智能求职流程管理看板**。

核心价值：

1. 用 **时间维度** 帮用户看清未来几天有哪些流程事件。
2. 用 **公司维度** 帮用户看清每家大厂当前推进到哪个阶段。
3. 用 **AI** 减少录入成本，辅助面试准备与复盘。
4. 用 **右侧详情侧边栏** 统一承载查看、编辑、AI 辅助、保存。

---

## 2. 交付目标

请实现一个可演示的 Web 系统，满足以下要求：

### 2.1 必须实现

- 首页 `/dashboard`
- 日历页 `/calendar`
- 大厂流程页 `/companies`
- 全局右侧详情 Drawer
- 后端 API
- 数据库存储
- PDF 上传与预览
- 真实豆包 API 接入
- AI 结果可手动编辑

### 2.2 不做

- 不做真实邮箱登录
- 不做自动抓邮箱
- 不做音频转文字（用户直接提供转写文本）
- 不做复杂权限系统
- 不做复杂多用户协作
- 不做复杂自动化 agent 编排
- 不做消息推送 / 系统通知

---

## 3. 全局实现原则

### 3.1 真实后端

禁止将最终版本实现为纯前端 mock/localStorage 页面。  
必须包含：

- 后端 API
- 数据库存储
- 文件上传能力
- 真实 AI 调用能力

### 3.2 所有 AI 结果必须可编辑

以下 AI 能力全部必须支持 **人工确认 / 手动修改 / 保存**：

- 解析面试邮件
- 解析 JD
- 生成面试题
- 生成面试复盘
- 生成今日招聘动向摘要

规则：

1. AI 结果先进入“草稿态”。
2. 用户可以修改任意字段。
3. 只有点击保存后，才写入数据库。
4. 后续页面展示的是用户最终保存值。
5. 后续再次调用 AI 时，不能静默覆盖用户已有编辑结果。

### 3.3 所有关键数据都支持手动新增 / 编辑 / 删除

即使 AI 能解析填写，也必须支持手动维护。

---

## 4. 页面结构

系统只做 3 个页面 + 1 个全局右侧侧边栏。

### 4.1 `/dashboard` 首页

包含 5 个模块：

1. 时间维度流程表格
2. 明日 AI 提醒
3. 今日大厂动向 AI 摘要
4. 我的简历（小板块）
5. AI Copilot

### 4.2 `/calendar` 日历页

同一份流程事件数据的 **日期视图**。

展示：

- 面试
- 笔试
- 测评
- HR 面
- Offer 沟通

### 4.3 `/companies` 大厂流程页

按公司维度展示所有互联网大厂。

- 纵轴：公司名称
- 横轴：该公司下已投递岗位的完整流程图

### 4.4 全局右侧详情 Drawer

点击以下任意对象时打开：

- 首页表格行
- 日历事件
- 大厂流程节点
- 大厂流程条

Drawer 用于展示并编辑：

- 岗位详情
- 流程详情
- JD 信息
- 简历关联
- AI 面试题
- AI 面试复盘

---

## 5. 页面功能详情

---

## 5.1 首页 `/dashboard`

### 5.1.1 模块一：时间维度流程表格

#### 目标
让用户快速看到未来几天有哪些流程事件。

#### 默认展示范围
- 今天到未来 7 天

#### 表格列
- 日期
- 时间
- 事件类型
- 公司
- 部门
- 岗位
- 当前状态
- 关联简历
- 操作

#### 事件类型枚举
- 一面
- 二面
- 三面
- HR 面
- 笔试
- 测评
- Offer 沟通
- 其他

#### 当前状态枚举
- 待参加
- 已完成
- 已通过
- 未通过

#### 行交互
- 点击整行：打开右侧 Drawer
- 操作列：
  - 查看详情
  - 标记完成
  - 编辑
  - 删除

#### 手动编辑要求
该表格必须支持：
- 手动新增事件
- 手动编辑事件
- 手动修改时间
- 手动修改事件类型
- 手动修改公司 / 部门 / 岗位
- 手动修改会议链接
- 手动修改状态
- 手动关联简历
- 删除事件

#### AI 填充要求
用户可通过 AI Copilot 粘贴面试邮件 / 通知文本，AI 自动生成流程事件；用户确认后写入表格。

---

### 5.1.2 模块二：明日 AI 提醒

#### 目标
告诉用户明天有哪些重要流程。

#### 展示逻辑
- 如果明天有事件：显示 1 段精炼提醒
- 如果明天无事件：显示“明天暂无流程安排”

#### 示例
- 你明天有 2 个流程：腾讯广告一面、字节电商测评，记得提前确认会议链接和关联简历。

#### 数据来源
后端查询明天事件 + AI 可选做自然语言压缩。

---

### 5.1.3 模块三：今日大厂动向 AI 摘要

#### 目标
在首页展示一段简洁的招聘动向摘要，不单独做页面。

#### 展示形式
只展示 **一段话**，不做长列表。

#### 示例
- 今日动向：字节和美团已开放部分暑期实习网申，腾讯产品方向近期有更新，建议优先关注官网入口。

#### 数据来源
后端可维护原始资讯列表，再调用 AI 压缩为首页摘要。

---

### 5.1.4 模块四：我的简历

#### 目标
在首页小模块中存放用户常用的 2~3 份 PDF 简历。

#### 支持能力
- 上传 PDF
- 预览 PDF
- 删除 PDF
- 修改简历名称
- 修改简历标签
- 将简历关联到岗位

#### 展示字段
- 简历名称
- 标签（产品 / 运营 / 算法 / 通用）
- 上传时间

#### 约束
- 不支持在线编辑 PDF
- 上传后尝试提取纯文本存入 `extractedText`
- 解析失败不影响上传与预览

---

### 5.1.5 模块五：AI Copilot

#### 目标
作为统一 AI 入口，支持快速粘贴文本并触发 AI 功能。

#### 支持 4 个 AI 能力
1. 解析面试邮件 / 文本并自动填入流程
2. 解析 JD
3. 生成面试题
4. 生成面试复盘

#### 交互形式
- 一个多行输入框
- 一个发送按钮
- 4 个快捷按钮：
  - 解析面试邮件
  - 解析 JD
  - 生成面试题
  - 生成复盘

#### 关键要求
- AI 返回结果后，不直接落库
- 先展示草稿结果
- 用户可修改
- 点击确认保存后写入数据库

---

## 5.2 日历页 `/calendar`

### 5.2.1 目标
用日期视图查看所有流程事件。

### 5.2.2 数据来源
与首页表格共享同一份事件数据。

### 5.2.3 展示内容
- 一面
- 二面
- 三面
- HR 面
- 笔试
- 测评
- Offer 沟通
- 其他

### 5.2.4 交互
- 点击某天：可新增事件
- 点击事件：打开 Drawer
- 可编辑事件详情
- 可删除事件

### 5.2.5 手动编辑要求
日历页必须支持：
- 手动新增事件
- 手动编辑时间
- 手动编辑公司 / 部门 / 岗位 / 事件类型 / 状态 / 会议链接
- 删除事件

> 拖拽改时间不是必须；若实现成本高，可不做。

---

## 5.3 大厂流程页 `/companies`

### 5.3.1 目标
按公司维度查看所有求职流程。

### 5.3.2 页面结构
- 纵轴：公司名称
- 横轴：该公司下每个岗位的完整流程图

### 5.3.3 预置大厂名单
至少包含：
- 阿里
- 腾讯
- 字节
- 美团
- 百度
- 京东
- 拼多多
- 小红书
- 快手
- 滴滴

### 5.3.4 展示逻辑
#### 未投递公司
- 显示“未投递”

#### 已投递公司
每个岗位一条流程条：
- 左侧：部门名称 + 岗位名称
- 右侧：完整流程节点

### 5.3.5 流程节点枚举
- 已投递
- 笔试
- 测评
- 一面
- 二面
- 三面
- HR 面
- Offer
- 挂了

### 5.3.6 节点状态表现
- 已通过
- 当前进行中
- 未开始
- 未通过

### 5.3.7 交互
- 点击流程节点：打开 Drawer
- 点击整条岗位流程：也可打开 Drawer
- 支持手动新增岗位申请
- 支持手动新增流程节点
- 支持手动修改节点状态 / 时间 / 链接
- 支持删除节点
- 支持删除整个岗位申请

---

## 5.4 全局右侧详情 Drawer

### 5.4.1 目标
统一承载“查看详情 + 手动编辑 + AI 辅助 + 保存”。

### 5.4.2 内容结构

#### A. 基础信息
- 公司
- 部门
- 岗位
- 当前流程状态
- 当前阶段时间
- 面试会议链接

#### B. JD 信息
- JD 原文
- JD 摘要
- JD 关键词
- 岗位希望具备的能力

#### C. 关联简历
- 当前关联简历名称
- 简历标签
- 简历预览入口
- 切换关联简历

#### D. AI 面试辅助
- 解析 JD 按钮
- 生成面试题按钮
- 结果展示区

#### E. AI 面试复盘
- 转录文本输入区
- AI 解析复盘按钮
- 输出：
  - 面试问题概述
  - 我的回答概述
  - 简短建议

### 5.4.3 手动编辑要求
Drawer 中所有信息都必须支持编辑：
- 基础信息可编辑
- JD 原文可编辑
- JD 摘要 / 关键词 / 能力要求可编辑
- AI 生成的面试题可编辑
- AI 生成的复盘可编辑
- 关联简历可切换

### 5.4.4 保存规则
- 保存前在前端展示编辑态
- 点击保存后调用后端 API
- 保存成功后更新首页、日历页、大厂流程页

---

## 6. 数据模型

建议使用关系型数据库。  
推荐：**PostgreSQL + Prisma** 或 **SQLite + Prisma**。

---

## 6.1 Resume

```ts
export type ResumeTag = '产品' | '运营' | '算法' | '通用'

export type Resume = {
  id: string
  name: string
  tag: ResumeTag
  fileName: string
  fileUrl: string
  extractedText?: string | null
  createdAt: string
  updatedAt: string
}
```

---

## 6.2 Application

```ts
export type StageType =
  | '已投递'
  | '笔试'
  | '测评'
  | '一面'
  | '二面'
  | '三面'
  | 'HR面'
  | 'Offer'
  | '挂了'

export type Application = {
  id: string
  companyName: string
  departmentName: string
  roleName: string
  jdText?: string | null
  jdSummary?: string | null
  jdKeywords?: string[] | null
  expectedSkills?: string[] | null
  linkedResumeId?: string | null
  currentStatus: StageType | '未投递'
  createdAt: string
  updatedAt: string
}
```

---

## 6.3 Stage

```ts
export type StageStatus = '待参加' | '已完成' | '已通过' | '未通过'

export type Stage = {
  id: string
  applicationId: string
  type: StageType
  time?: string | null
  meetingLink?: string | null
  status: StageStatus
  reviewQuestionSummary?: string | null
  reviewAnswerSummary?: string | null
  reviewSuggestion?: string | null
  createdAt: string
  updatedAt: string
}
```

---

## 6.4 AI Run Log

用于记录 AI 调用日志，便于调试与回放。

```ts
export type AIRun = {
  id: string
  taskType: 'parse_email' | 'parse_jd' | 'generate_questions' | 'review' | 'daily_intel'
  inputText: string
  outputText: string
  outputJson?: Record<string, unknown> | null
  status: 'success' | 'failed'
  errorMessage?: string | null
  createdAt: string
}
```

---

## 6.5 Intel Summary

```ts
export type IntelSummary = {
  id: string
  date: string
  summaryText: string
  createdAt: string
  updatedAt: string
}
```

---

## 7. API 设计

---

## 7.1 Resume API

```http
GET    /api/resumes
POST   /api/resumes/upload
PATCH  /api/resumes/:id
DELETE /api/resumes/:id
```

### `POST /api/resumes/upload`
支持：
- 接收 PDF 文件
- 存储文件
- 提取纯文本
- 写入数据库

---

## 7.2 Application API

```http
GET    /api/applications/:id
POST   /api/applications
PATCH  /api/applications/:id
DELETE /api/applications/:id
```

用途：
- 创建 / 更新 / 删除岗位申请记录

---

## 7.3 Stage API

```http
GET    /api/dashboard/events?range=7d
GET    /api/calendar/events?start=...&end=...
POST   /api/stages
PATCH  /api/stages/:id
DELETE /api/stages/:id
```

用途：
- 首页表格数据
- 日历页数据
- 流程节点创建 / 修改 / 删除

---

## 7.4 Companies API

```http
GET /api/companies/progress
```

返回：
- 预置大厂列表
- 每家公司下已投递岗位
- 每个岗位的流程节点

---

## 7.5 AI API

```http
POST /api/ai/parse-email
POST /api/ai/parse-jd
POST /api/ai/generate-questions
POST /api/ai/review
GET  /api/ai/daily-intel
```

规则：
- AI 只能通过后端调用
- 前端不能直接携带 API Key 请求豆包
- 所有 AI 调用都写 `ai_runs` 日志

---

## 8. 豆包 AI 接入要求

### 8.1 接入方式
通过后端统一调用豆包 API。  
前端只请求本系统自己的后端 API。

### 8.2 环境变量

```env
DOUBAO_API_KEY=your_api_key
DOUBAO_BASE_URL=your_base_url
DOUBAO_MODEL=your_model_name
```

### 8.3 安全要求
- API Key 只能放后端环境变量
- 前端代码中不得出现 API Key
- 后端负责模型调用、结构化解析、异常处理

### 8.4 调用策略
- 优先要求模型输出 JSON
- 如果模型输出异常，后端进行兜底清洗
- 每次调用写日志到 `ai_runs`

---

## 9. 豆包提示词（必须按此实现）

---

## 9.1 解析面试邮件 / 文本

### 用途
从面试邮件、聊天记录、通知文本中提取流程信息。

### system prompt

```text
你是一个求职流程信息抽取助手。你的任务是从用户提供的面试邮件、招聘通知、聊天记录或任意求职相关文本中，提取结构化字段。

要求：
1. 只提取与求职流程录入相关的信息。
2. 如果某字段无法确定，返回 null，不要编造。
3. 输出必须是合法 JSON，不要输出解释文字，不要输出 Markdown。
4. 时间字段尽量保留原文语义，若可明确到标准时间则输出标准格式。
5. stageType 只允许以下枚举：
["已投递","笔试","测评","一面","二面","三面","HR面","Offer","挂了"]

输出 JSON 结构：
{
  "companyName": string | null,
  "departmentName": string | null,
  "roleName": string | null,
  "stageType": string | null,
  "time": string | null,
  "meetingLink": string | null,
  "jdText": string | null
}
```

### user prompt 模板

```text
请从下面文本中提取求职流程信息，并按约定 JSON 输出：

{{inputText}}
```

---

## 9.2 解析 JD

### 用途
提炼岗位 JD 摘要、关键词、能力要求。

### system prompt

```text
你是一个求职 JD 分析助手。你的任务是把岗位 JD 提炼成适合求职看板展示的简洁结构。

要求：
1. 输出必须是合法 JSON。
2. 语言简洁，不要长篇解释。
3. jdSummary 控制在 80~120 字。
4. jdKeywords 输出 5~8 个关键词。
5. expectedSkills 输出 3~6 条能力要求，使用短句。
6. 如果用户输入信息不足，也要尽量提炼，不要返回空对象。

输出 JSON 结构：
{
  "jdSummary": string,
  "jdKeywords": string[],
  "expectedSkills": string[]
}
```

### user prompt 模板

```text
请分析下面的岗位 JD，并输出结构化结果：

{{jdText}}
```

---

## 9.3 生成面试题

### 用途
基于 JD 和简历文本生成 3~5 个面试题。

### system prompt

```text
你是一个中文求职面试辅助助手。请基于岗位 JD 和候选人简历内容，生成适合该岗位的一组面试题。

要求：
1. 输出必须是合法 JSON。
2. 问题要贴近真实面试，不要太空泛。
3. 优先生成 3~5 个问题。
4. 问题要结合岗位职责和候选人经历。
5. 如果简历内容缺失，也可以仅基于 JD 生成。

输出 JSON 结构：
{
  "questions": string[]
}
```

### user prompt 模板

```text
岗位 JD：
{{jdText}}

候选人简历文本：
{{resumeText}}

请生成适合这个岗位的 3~5 个面试问题。
```

---

## 9.4 面试复盘

### 用途
根据录音转文字内容生成简洁复盘。

### system prompt

```text
你是一个求职面试复盘助手。你的任务是根据面试录音转文字内容，生成简洁、结构化、可读性强的复盘结果。

要求：
1. 输出必须是合法 JSON。
2. 不要长篇复述原文。
3. questionSummary 总结面试主要问了什么，控制在 50~80 字。
4. answerSummary 总结候选人主要是怎么回答的，控制在 50~100 字。
5. suggestion 给出 2~3 条非常精炼的建议，合并成一段话。
6. 如果原文信息不足，也尽量总结，不要返回空对象。

输出 JSON 结构：
{
  "questionSummary": string,
  "answerSummary": string,
  "suggestion": string
}
```

### user prompt 模板

```text
以下是一次面试的录音转文字内容，请输出精炼复盘：

{{transcriptText}}
```

---

## 9.5 今日大厂动向摘要

### 用途
将原始招聘资讯压缩成首页展示的一小段摘要。

### system prompt

```text
你是一个求职市场动态摘要助手。请根据输入的多条招聘动态，生成一段适合展示在求职看板首页的小摘要。

要求：
1. 输出纯文本，不要 JSON。
2. 控制在 50~90 字。
3. 语言精炼，像“今日动向”小卡片。
4. 只保留对投递节奏有帮助的信息，例如开放时间、岗位方向、近期变化。
```

### user prompt 模板

```text
请把下面这些招聘动态压缩成一段适合首页展示的“今日动向”摘要：

{{intelItems}}
```

---

## 10. 前端实现要求

### 10.1 推荐技术栈
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- lucide-react

### 10.2 UI 风格
- 浅色、精致、简洁
- 白底 / 浅灰底 / 轻马卡龙色
- 右侧 Drawer 风格要统一
- AI Copilot 视觉上需要有识别度

### 10.3 状态处理
必须有：
- loading 状态
- 空状态
- 保存成功提示
- 保存失败提示
- AI 调用失败提示
- 文件上传失败提示

### 10.4 表单规则
- 所有 AI 结果展示后都可编辑
- 保存前必须可人工校正
- 表单变更后要有 dirty state 提示

---

## 11. 后端实现要求

### 11.1 推荐技术栈
- Next.js Route Handlers 或 Node.js + Express/NestJS
- Prisma ORM
- SQLite（本地演示）或 PostgreSQL（正式）

### 11.2 文件上传
- 接收 PDF
- 存本地 `uploads/` 或对象存储
- 保存文件 URL 到数据库
- 提取 PDF 文本

### 11.3 数据一致性
- 首页表格、日历页、大厂流程页必须共享同一份后端数据
- 修改某条记录后，三个页面展示应保持一致

### 11.4 AI 调用
- 前端不能直连模型
- 后端统一封装 `llmClient`
- 所有模型调用统一异常处理

---

## 12. 核心用户流程

### 12.1 录入流程（AI）
1. 用户在首页 AI Copilot 粘贴面试邮件
2. 点击“解析面试邮件”
3. AI 返回草稿字段
4. 用户修改 / 确认
5. 创建 Application + Stage
6. 数据同时出现在：
   - 首页表格
   - 日历页
   - 大厂流程页

### 12.2 录入流程（手动）
1. 用户在首页表格 / 日历页 / 大厂流程页点击新增
2. 手动填写公司、部门、岗位、时间、类型、链接
3. 保存
4. 数据写入数据库并同步到各视图

### 12.3 面试准备流程
1. 用户点击某个事件 / 节点
2. 打开 Drawer
3. 填写或修改 JD
4. 点击“解析 JD”
5. 点击“生成面试题”
6. 用户可修改结果并保存

### 12.4 面试复盘流程
1. 用户在 Drawer 或 AI Copilot 中粘贴转录文本
2. 点击“AI 解析复盘”
3. 获得结构化结果
4. 用户修改 / 确认
5. 保存到对应 Stage

### 12.5 简历关联流程
1. 用户上传 PDF 简历
2. 系统提取文本
3. 用户在 Drawer 中将简历关联到某岗位
4. 后续生成面试题时带上 `resume.extractedText`

---

## 13. 验收标准

系统至少必须跑通以下闭环：

### 闭环 1：AI 解析写入
- 粘贴面试邮件
- AI 自动解析
- 用户确认 / 编辑
- 写入数据库
- 首页表格 / 日历页 / 大厂流程页同步展示

### 闭环 2：手动录入
- 用户手动新增事件
- 保存后在三个视图中可见

### 闭环 3：详情编辑
- 点击首页表格行或流程节点
- 打开 Drawer
- 编辑基础信息 / JD / 关联简历
- 保存成功

### 闭环 4：AI 面试题
- 解析 JD
- 生成面试题
- 用户编辑后保存

### 闭环 5：AI 复盘
- 粘贴转录文本
- AI 输出复盘
- 用户编辑后保存到对应流程节点

### 闭环 6：简历上传关联
- 上传 PDF
- 成功预览
- 提取文本
- 关联到岗位

---

## 14. 开发优先级

### P0（必须先完成）
- 后端数据模型
- 首页表格
- 日历页
- 大厂流程页
- 全局 Drawer
- Resume 上传 / 预览 / 关联
- AI 解析面试邮件
- AI 解析 JD
- AI 生成面试题
- AI 生成复盘
- 手动编辑和保存

### P1（可优化）
- 首页今日动向摘要
- AI 调用日志查看
- 更好的空状态 / loading 动画
- 更精细的流程节点视觉样式

---

## 15. 给 AI coding agent 的最终执行指令

请基于本 PRD 直接实现一个 **前后端一体的求职流程管理系统**。

严格遵守以下要求：

1. 不是纯前端 Demo，必须有后端、数据库、文件上传、真实豆包 API 调用。
2. 所有 AI 结果都必须支持人工编辑后再保存。
3. 首页、日历页、大厂流程页共享同一份后端数据。
4. 右侧 Drawer 是统一详情与编辑入口。
5. 所有关键实体都支持手动新增 / 编辑 / 删除。
6. 前端不能暴露豆包 API Key。
7. 优先保证功能闭环，其次再做视觉细节。

---

## 16. 输出要求

最终代码应满足：

- 本地可运行
- 可演示
- 有真实数据持久化
- 有真实 AI 调用
- 数据刷新后不丢失
- UI 清晰、简洁、适合面试展示

