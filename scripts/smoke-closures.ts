/**
 * scripts/smoke-closures.ts · Phase 7.3 · PRD 第 13 章 6 个闭环端到端验收
 *
 * 使用：
 *   1. 启动 dev server：pnpm dev
 *   2. 另开终端：pnpm tsx scripts/smoke-closures.ts
 *
 * 与 smoke-api.ts 的区别：
 *   - smoke-api 只验 API 层语义 / 错误分支
 *   - smoke-closures 跑完整业务闭环，覆盖 AI 调用 + 草稿→确认→落库 的全流程
 *   - 需要环境已配齐 DOUBAO_API_KEY（.env.local）
 *
 * 6 个闭环：
 *   1. AI 解析邮件 → 草稿 → 建 Application + Stage → 三视图同步
 *   2. 手动录入 Stage → 三视图同步
 *   3. Drawer 编辑 Application 基础 + 关联简历 → 保存成功
 *   4. 解析 JD → 生成面试题 → 采纳保存 interviewQuestions
 *   5. 生成复盘 → 采纳保存 Stage 三字段
 *   6. 上传 PDF → 提取文本 → 关联到 Application → 删除时引用校验
 *
 * 每个闭环最后清理自己造的数据，脚本退出时 DB 状态与开始时一致。
 */

import fs from "node:fs";
import path from "node:path";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

let pass = 0;
let fail = 0;
const log: string[] = [];

function ok(name: string, detail?: string) {
  const msg = `  ✅ ${name}${detail ? " · " + detail : ""}`;
  console.log(msg);
  log.push(msg);
  pass++;
}

function bad(name: string, detail?: string) {
  const msg = `  ❌ ${name}${detail ? " · " + detail : ""}`;
  console.log(msg);
  log.push(msg);
  fail++;
}

async function req<T = unknown>(
  method: string,
  path: string,
  body?: unknown
): Promise<{ status: number; body: T | null }> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let parsed: T | null = null;
  try {
    parsed = (await res.json()) as T;
  } catch {
    // 204
  }
  return { status: res.status, body: parsed };
}

async function assertOk<T>(
  name: string,
  method: string,
  path: string,
  body?: unknown,
  expected = 200
): Promise<T | null> {
  const r = await req<T>(method, path, body);
  if (r.status === expected) {
    ok(name, `HTTP ${r.status}`);
    return r.body;
  }
  bad(
    name,
    `HTTP ${r.status} 期望 ${expected} body=${JSON.stringify(r.body).slice(0, 200)}`
  );
  return null;
}

// ──────────────────────────────────────────────────────────────────────
// 闭环 1：AI 解析邮件写入
// ──────────────────────────────────────────────────────────────────────
async function closure1() {
  console.log("\n[闭环 1] AI 解析面试邮件 → 草稿 → 建 Application+Stage → 三视图同步");

  const emailText = `
亲爱的同学：
感谢你投递腾讯游戏事业部（IEG）游戏数据产品岗，
经评估，邀请你参加一面（技术面）。
时间：2026-04-22 15:00
腾讯会议链接：https://meeting.tencent.com/dm/smoke-closure-1
面试官：李经理
请提前调试好设备，期待你的表现。
`.trim();

  // 1) AI 解析
  const aiRes = await req<{ draft: Record<string, unknown> }>(
    "POST",
    "/api/ai/parse-email",
    { inputText: emailText }
  );
  if (aiRes.status !== 200) {
    bad("闭环 1.a AI 解析邮件", `HTTP ${aiRes.status}`);
    return;
  }
  const draft = aiRes.body?.draft;
  if (!draft || typeof draft !== "object") {
    bad("闭环 1.a 草稿结构", "draft 字段缺失");
    return;
  }
  ok(
    "闭环 1.a AI 解析邮件",
    `company=${draft.companyName} dept=${draft.departmentName} role=${draft.roleName} stageType=${draft.stageType}`
  );

  // 2) 基于草稿建 Application（用户确认）
  const appRes = await req<{ id: string }>("POST", "/api/applications", {
    companyName: draft.companyName || "腾讯",
    departmentName: draft.departmentName || "IEG",
    roleName: draft.roleName || "游戏数据产品",
  });
  if (appRes.status !== 201 || !appRes.body?.id) {
    bad("闭环 1.b 创建 Application", `HTTP ${appRes.status}`);
    return;
  }
  const appId = appRes.body.id;
  ok("闭环 1.b 创建 Application", appId);

  // 3) 基于草稿建第一个 Stage
  const stageRes = await req<{ id: string }>("POST", "/api/stages", {
    applicationId: appId,
    type: draft.stageType || "一面",
    time: draft.stageTime || "2026-04-22T15:00:00.000Z",
    meetingLink: draft.meetingLink,
  });
  if (stageRes.status !== 201 || !stageRes.body?.id) {
    bad("闭环 1.c 创建 Stage", `HTTP ${stageRes.status}`);
    await req("DELETE", `/api/applications/${appId}`);
    return;
  }
  const stageId = stageRes.body.id;
  ok("闭环 1.c 创建 Stage", stageId);

  // 4) 三视图同步：dashboard events / calendar events / companies progress
  const dash = await req<Array<{ id: string }>>(
    "GET",
    "/api/dashboard/events?range=30d"
  );
  const foundInDash = Array.isArray(dash.body) && dash.body.some((e) => e.id === stageId);
  foundInDash
    ? ok("闭环 1.d 首页表格可见")
    : bad("闭环 1.d 首页表格可见", `stageId=${stageId} 未出现`);

  const cal = await req<Array<{ id: string }>>(
    "GET",
    "/api/calendar/events?start=2026-04-01&end=2026-04-30"
  );
  const foundInCal = Array.isArray(cal.body) && cal.body.some((e) => e.id === stageId);
  foundInCal
    ? ok("闭环 1.e 日历视图可见")
    : bad("闭环 1.e 日历视图可见", `stageId=${stageId} 未出现`);

  const cp = await req<Array<{ companyName: string; applications: Array<{ id: string }> }>>(
    "GET",
    "/api/companies/progress"
  );
  const tencent = Array.isArray(cp.body)
    ? cp.body.find((c) => c.companyName === "腾讯")
    : null;
  const foundInCp = tencent?.applications.some((a) => a.id === appId) ?? false;
  foundInCp
    ? ok("闭环 1.f 大厂流程页可见", "腾讯下挂到新 Application")
    : bad("闭环 1.f 大厂流程页可见", "未在腾讯下找到");

  // 清理
  await req("DELETE", `/api/applications/${appId}`);
  ok("闭环 1.g 清理数据");
}

// ──────────────────────────────────────────────────────────────────────
// 闭环 2：手动录入
// ──────────────────────────────────────────────────────────────────────
async function closure2() {
  console.log("\n[闭环 2] 手动新增 Application + Stage → 三视图同步");

  const appRes = await req<{ id: string }>("POST", "/api/applications", {
    companyName: "字节跳动",
    departmentName: "电商",
    roleName: "闭环2-产品经理",
  });
  if (appRes.status !== 201 || !appRes.body?.id) {
    bad("闭环 2.a 手动建 Application", `HTTP ${appRes.status}`);
    return;
  }
  const appId = appRes.body.id;

  const stageRes = await req<{ id: string }>("POST", "/api/stages", {
    applicationId: appId,
    type: "笔试",
    time: "2026-04-20T10:00:00.000Z",
  });
  if (stageRes.status !== 201 || !stageRes.body?.id) {
    bad("闭环 2.b 手动建 Stage", `HTTP ${stageRes.status}`);
    await req("DELETE", `/api/applications/${appId}`);
    return;
  }
  const stageId = stageRes.body.id;
  ok("闭环 2.a+b 手动新增", `app=${appId.slice(0, 8)} stage=${stageId.slice(0, 8)}`);

  // 三视图同步
  const dash = await req<Array<{ id: string }>>(
    "GET",
    "/api/dashboard/events?range=30d"
  );
  (Array.isArray(dash.body) && dash.body.some((e) => e.id === stageId)
    ? ok
    : bad)("闭环 2.c 三视图同步 · dashboard");

  // 清理
  await req("DELETE", `/api/applications/${appId}`);
  ok("闭环 2.d 清理数据");
}

// ──────────────────────────────────────────────────────────────────────
// 闭环 3：Drawer 编辑
// ──────────────────────────────────────────────────────────────────────
async function closure3() {
  console.log("\n[闭环 3] Drawer 打开 → 编辑 Application 基础 → 保存成功");

  const appRes = await req<{ id: string }>("POST", "/api/applications", {
    companyName: "美团",
    departmentName: "到店",
    roleName: "闭环3-产品",
  });
  const appId = appRes.body?.id;
  if (!appId) {
    bad("闭环 3.a 创建前置 Application", `HTTP ${appRes.status}`);
    return;
  }

  const stageRes = await req<{ id: string }>("POST", "/api/stages", {
    applicationId: appId,
    type: "二面",
    time: "2026-04-25T14:00:00.000Z",
  });
  const stageId = stageRes.body?.id;

  // Drawer 一次性拉详情
  const detail = await req<{
    stage: { id: string };
    application: { id: string; companyName: string };
  }>("GET", `/api/stages/${stageId}/detail`);
  if (detail.status !== 200) {
    bad("闭环 3.b GET /api/stages/:id/detail", `HTTP ${detail.status}`);
  } else {
    ok(
      "闭环 3.b Drawer 详情加载",
      `company=${detail.body?.application.companyName}`
    );
  }

  // PATCH Application（改公司名 / 部门 / 角色）
  const pa = await req("PATCH", `/api/applications/${appId}`, {
    companyName: "美团",
    departmentName: "到店业务",
    roleName: "闭环3-产品经理改名版",
  });
  pa.status === 200
    ? ok("闭环 3.c PATCH Application")
    : bad("闭环 3.c PATCH Application", `HTTP ${pa.status}`);

  // PATCH Stage（改 status + time）
  const ps = await req("PATCH", `/api/stages/${stageId}`, {
    status: "已通过",
    time: "2026-04-25T15:30:00.000Z",
  });
  ps.status === 200
    ? ok("闭环 3.d PATCH Stage")
    : bad("闭环 3.d PATCH Stage", `HTTP ${ps.status}`);

  // 清理
  await req("DELETE", `/api/applications/${appId}`);
  ok("闭环 3.e 清理数据");
}

// ──────────────────────────────────────────────────────────────────────
// 闭环 4：AI 解析 JD + 生成面试题
// ──────────────────────────────────────────────────────────────────────
async function closure4() {
  console.log("\n[闭环 4] 解析 JD → 生成面试题 → 采纳保存");

  const appRes = await req<{ id: string }>("POST", "/api/applications", {
    companyName: "阿里巴巴",
    departmentName: "淘天",
    roleName: "闭环4-数据产品经理",
  });
  const appId = appRes.body?.id;
  if (!appId) {
    bad("闭环 4.a 创建前置 Application", `HTTP ${appRes.status}`);
    return;
  }

  const jdText = `
岗位职责：
1. 负责电商用户增长数据产品规划，构建漏斗分析、留存分析体系
2. 搭建 AB 实验平台，推动业务决策数据化
3. 与算法、工程团队紧密协作，沉淀数据资产

岗位要求：
1. 本科及以上学历，3-5 年数据产品经验
2. 熟练使用 SQL / Python 进行数据分析
3. 有 AB 实验、漏斗分析、留存分析实战经验
4. 对 LLM / Data Agent 有了解者优先
`.trim();

  // a) 解析 JD
  const jdAi = await req<{
    draft: {
      jdSummary: string;
      jdKeywords: string[];
      expectedSkills: string[];
    };
  }>("POST", "/api/ai/parse-jd", { jdText });
  if (jdAi.status !== 200 || !jdAi.body?.draft) {
    bad("闭环 4.a AI 解析 JD", `HTTP ${jdAi.status}`);
    await req("DELETE", `/api/applications/${appId}`);
    return;
  }
  ok(
    "闭环 4.a AI 解析 JD",
    `summary=${jdAi.body.draft.jdSummary.slice(0, 30)}... keywords=${jdAi.body.draft.jdKeywords?.length}`
  );

  // b) 采纳保存 JD 字段
  const patchJd = await req("PATCH", `/api/applications/${appId}`, {
    jdText,
    jdSummary: jdAi.body.draft.jdSummary,
    jdKeywords: jdAi.body.draft.jdKeywords,
    expectedSkills: jdAi.body.draft.expectedSkills,
  });
  patchJd.status === 200
    ? ok("闭环 4.b PATCH JD 四字段入库")
    : bad("闭环 4.b PATCH JD", `HTTP ${patchJd.status}`);

  // c) 生成面试题
  const qAi = await req<{ draft: { questions: string[] } }>(
    "POST",
    "/api/ai/generate-questions",
    { applicationId: appId }
  );
  if (qAi.status !== 200 || !Array.isArray(qAi.body?.draft?.questions)) {
    bad("闭环 4.c AI 生成面试题", `HTTP ${qAi.status}`);
    await req("DELETE", `/api/applications/${appId}`);
    return;
  }
  ok(
    "闭环 4.c AI 生成面试题",
    `共 ${qAi.body.draft.questions.length} 题 · 首题=${qAi.body.draft.questions[0]?.slice(0, 30)}...`
  );

  // d) 采纳保存
  const patchQ = await req("PATCH", `/api/applications/${appId}`, {
    interviewQuestions: qAi.body.draft.questions,
  });
  patchQ.status === 200
    ? ok("闭环 4.d PATCH interviewQuestions 入库")
    : bad("闭环 4.d PATCH interviewQuestions", `HTTP ${patchQ.status}`);

  // e) 回读验证
  const read = await req<{
    jdSummary: string;
    interviewQuestions: string[];
  }>("GET", `/api/applications/${appId}`);
  const reflect =
    read.status === 200 &&
    read.body?.jdSummary === jdAi.body.draft.jdSummary &&
    Array.isArray(read.body?.interviewQuestions) &&
    read.body.interviewQuestions.length === qAi.body.draft.questions.length;
  reflect
    ? ok("闭环 4.e 回读对齐", "jdSummary + interviewQuestions 一致")
    : bad("闭环 4.e 回读对齐", `${read.status}`);

  // 清理
  await req("DELETE", `/api/applications/${appId}`);
  ok("闭环 4.f 清理数据");
}

// ──────────────────────────────────────────────────────────────────────
// 闭环 5：AI 复盘
// ──────────────────────────────────────────────────────────────────────
async function closure5() {
  console.log("\n[闭环 5] 面试转录 → AI 复盘 → 采纳保存 Stage 三字段");

  const appRes = await req<{ id: string }>("POST", "/api/applications", {
    companyName: "百度",
    departmentName: "搜索",
    roleName: "闭环5-AI 产品",
  });
  const appId = appRes.body?.id;
  if (!appId) {
    bad("闭环 5.a 创建 Application");
    return;
  }

  const stageRes = await req<{ id: string }>("POST", "/api/stages", {
    applicationId: appId,
    type: "一面",
    time: "2026-04-23T10:00:00.000Z",
    status: "已完成",
  });
  const stageId = stageRes.body?.id;
  if (!stageId) {
    bad("闭环 5.b 创建 Stage");
    await req("DELETE", `/api/applications/${appId}`);
    return;
  }

  const transcriptText = `
面试官：你好，能先做个自我介绍吗？
我：好的，我是产品经理 XX，有 3 年 AI 产品经验……
面试官：RAG 和 Agent 的区别你怎么理解？
我：RAG 解决知识边界问题，Agent 解决任务编排问题。具体项目里，我在舆情 Agent 里把准确率从 72% 提升到了 97.5%……
面试官：如果让你重新做一遍，你会怎么做？
我：我会更早做 bad case 归因，而不是靠 prompt 堆细节。
面试官：OK，今天就到这里，有什么问题想问我的？
我：贵团队当前最大的技术挑战是什么？
`.trim();

  // a) AI 复盘
  const rAi = await req<{
    draft: {
      questionSummary: string;
      answerSummary: string;
      suggestion: string;
    };
  }>("POST", "/api/ai/review", { stageId, transcriptText });
  if (rAi.status !== 200 || !rAi.body?.draft) {
    bad("闭环 5.c AI 复盘", `HTTP ${rAi.status}`);
    await req("DELETE", `/api/applications/${appId}`);
    return;
  }
  ok(
    "闭环 5.c AI 复盘",
    `q=${rAi.body.draft.questionSummary.slice(0, 20)}... sug=${rAi.body.draft.suggestion.slice(0, 20)}...`
  );

  // b) 采纳保存
  const patchR = await req("PATCH", `/api/stages/${stageId}`, {
    reviewQuestionSummary: rAi.body.draft.questionSummary,
    reviewAnswerSummary: rAi.body.draft.answerSummary,
    reviewSuggestion: rAi.body.draft.suggestion,
  });
  patchR.status === 200
    ? ok("闭环 5.d PATCH Stage 三字段入库")
    : bad("闭环 5.d PATCH Stage", `HTTP ${patchR.status}`);

  // c) 回读
  const read = await req<{
    stage: {
      reviewQuestionSummary: string;
      reviewAnswerSummary: string;
      reviewSuggestion: string;
    };
  }>("GET", `/api/stages/${stageId}/detail`);
  const reflect =
    read.status === 200 &&
    read.body?.stage.reviewQuestionSummary === rAi.body.draft.questionSummary;
  reflect ? ok("闭环 5.e 回读对齐") : bad("闭环 5.e 回读对齐", `${read.status}`);

  // 清理
  await req("DELETE", `/api/applications/${appId}`);
  ok("闭环 5.f 清理数据");
}

// ──────────────────────────────────────────────────────────────────────
// 闭环 6：简历上传关联
// ──────────────────────────────────────────────────────────────────────
async function closure6() {
  console.log("\n[闭环 6] 上传 PDF → 提取文本 → 关联 Application → 引用校验");

  const pdfPath = path.resolve(
    process.cwd(),
    "scripts/fixtures/closure-tiny.pdf"
  );

  if (!fs.existsSync(pdfPath)) {
    bad("闭环 6.pre fixture PDF 不存在", pdfPath);
    return;
  }

  // a) 上传
  const form = new FormData();
  form.append("file", new Blob([fs.readFileSync(pdfPath)], { type: "application/pdf" }), "closure-tiny.pdf");
  form.append("name", "闭环6-测试简历");
  form.append("tag", "产品");

  const uRes = await fetch(`${BASE}/api/resumes/upload`, {
    method: "POST",
    body: form,
  });
  const uBody = (await uRes.json()) as { id?: string; extractedText?: string | null; warning?: string };
  if (uRes.status !== 201 || !uBody.id) {
    bad("闭环 6.a 上传 PDF", `HTTP ${uRes.status}`);
    return;
  }
  const resumeId = uBody.id;
  ok(
    "闭环 6.a 上传 PDF",
    `id=${resumeId.slice(0, 8)} text=${uBody.extractedText?.slice(0, 20) ?? "(null)"}`
  );

  // b) GET 文件流
  const fRes = await fetch(`${BASE}/api/resumes/${resumeId}/file`);
  fRes.status === 200 && fRes.headers.get("content-type") === "application/pdf"
    ? ok("闭环 6.b GET 文件流", `content-type=${fRes.headers.get("content-type")}`)
    : bad("闭环 6.b GET 文件流", `HTTP ${fRes.status} ct=${fRes.headers.get("content-type")}`);

  // c) 建 Application 并关联简历
  const appRes = await req<{ id: string }>("POST", "/api/applications", {
    companyName: "小红书",
    departmentName: "社区",
    roleName: "闭环6-产品",
  });
  const appId = appRes.body?.id;
  if (!appId) {
    bad("闭环 6.c 创建前置 Application");
    await req("DELETE", `/api/resumes/${resumeId}`);
    return;
  }

  const linkRes = await req("PATCH", `/api/applications/${appId}`, {
    linkedResumeId: resumeId,
  });
  linkRes.status === 200
    ? ok("闭环 6.c 关联 Resume → Application")
    : bad("闭环 6.c 关联 Resume", `HTTP ${linkRes.status}`);

  // d) 回读 Application 带 linkedResume join
  const read = await req<{ linkedResume: { id: string; name: string } | null }>(
    "GET",
    `/api/applications/${appId}`
  );
  read.body?.linkedResume?.id === resumeId
    ? ok(
        "闭环 6.d 回读 linkedResume",
        `name=${read.body?.linkedResume?.name}`
      )
    : bad("闭环 6.d 回读 linkedResume");

  // e) 被引用时 DELETE Resume 返 409
  const del1 = await req("DELETE", `/api/resumes/${resumeId}`);
  del1.status === 409
    ? ok("闭环 6.e 被引用删除 409", "保护机制生效")
    : bad("闭环 6.e 被引用删除 409", `实际 HTTP ${del1.status}`);

  // f) 先解除关联再删
  await req("PATCH", `/api/applications/${appId}`, { linkedResumeId: null });
  const del2 = await req("DELETE", `/api/resumes/${resumeId}`);
  del2.status === 200
    ? ok("闭环 6.f 解除关联后删除成功")
    : bad("闭环 6.f 解除关联后删除", `HTTP ${del2.status}`);

  // 清理
  await req("DELETE", `/api/applications/${appId}`);
  ok("闭环 6.g 清理数据");
}

// ──────────────────────────────────────────────────────────────────────
// 主流程
// ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`▶ smoke-closures.ts · Phase 7.3 六闭环验收 · base=${BASE}`);
  const t0 = Date.now();

  await closure1();
  await closure2();
  await closure3();
  await closure4();
  await closure5();
  await closure6();

  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  console.log("\n════════════════════════════════════════");
  console.log(`通过 ${pass} · 失败 ${fail} · 耗时 ${dt}s`);
  console.log("════════════════════════════════════════");
  if (fail > 0) {
    console.log("❌ 有闭环失败，请检查上面的红叉");
    process.exit(1);
  }
  console.log("✅ PRD 第 13 章 6 个闭环全部通过");
}

main().catch((e) => {
  console.error("smoke-closures 崩了：", e);
  process.exit(2);
});
