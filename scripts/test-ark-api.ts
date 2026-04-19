/**
 * scripts/test-ark-api.ts · Phase 0 Step 0.6 临时脚本
 *
 * 目的：实测火山方舟两条 API 路径（/chat/completions vs /responses）
 *       × 两种 JSON 约束方式（response_format / text.format vs prompt-only）的组合，
 *       决定本项目 lib/llmClient.ts 的 callAI 走哪条路径。
 *
 * 本脚本是一次性工具，Phase 6 Step 6.1 完成后删除。
 *
 * 使用：pnpm tsx scripts/test-ark-api.ts
 *
 * 规则：
 * - API Key / BaseUrl / Model 全部从 .env.local 读，严禁硬编码
 * - Authorization 头和 Key 值不得 console.log
 * - 单个用例崩了不影响后续用例（用 try/catch 隔离）
 */

import fs from "node:fs";
import path from "node:path";

// ── 读 .env.local（Next.js 运行时会自动读，但本脚本是独立 tsx，需手动加载） ──
function loadEnvLocal(): Record<string, string> {
  const file = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) {
    throw new Error(`.env.local 不存在: ${file}`);
  }
  const text = fs.readFileSync(file, "utf8");
  const env: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let val = m[2];
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    env[m[1]] = val;
  }
  return env;
}

const env = loadEnvLocal();
const API_KEY = env.DOUBAO_API_KEY;
const BASE_URL = env.DOUBAO_BASE_URL;
const MODEL = env.DOUBAO_MODEL;

if (!API_KEY || !BASE_URL || !MODEL) {
  console.error("❌ .env.local 缺变量：", {
    DOUBAO_API_KEY: API_KEY ? "[ok]" : "[missing]",
    DOUBAO_BASE_URL: BASE_URL ? "[ok]" : "[missing]",
    DOUBAO_MODEL: MODEL ? "[ok]" : "[missing]",
  });
  process.exit(1);
}

// ── 测试输入 ──
const JSON_PROMPT =
  '请返回一个 JSON 对象，包含两个字段：ok（布尔值）、message（字符串"hello from ark"）。不要输出任何其他内容。';
const TEXT_PROMPT = "用一句话（30字以内）介绍今天的天气。";

type CaseKey = "A" | "B" | "C" | "D" | "E";
interface CaseResult {
  key: CaseKey;
  path: string;
  desc: string;
  httpStatus: number | null;
  ok: boolean;
  jsonParsable: boolean | null;
  preview: string;
  error?: string;
}

const results: CaseResult[] = [];

// ── 安全 log：脱敏 ──
function safeErrorMsg(e: unknown): string {
  let msg = e instanceof Error ? e.message : String(e);
  // 兜底脱敏：如果 Key 或 Authorization 误落进消息里
  if (API_KEY && msg.includes(API_KEY)) {
    msg = msg.replaceAll(API_KEY, "[REDACTED_KEY]");
  }
  return msg.replaceAll(/Bearer\s+[^\s"']+/gi, "Bearer [REDACTED]");
}

async function postJson(
  urlPath: string,
  body: unknown,
  signal: AbortSignal
): Promise<{ httpStatus: number; text: string }> {
  const res = await fetch(`${BASE_URL}${urlPath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal,
  });
  const text = await res.text();
  return { httpStatus: res.status, text };
}

function extractChatCompletionsText(raw: string): string {
  const parsed = JSON.parse(raw);
  return parsed?.choices?.[0]?.message?.content ?? "";
}

function extractResponsesText(raw: string): string {
  const parsed = JSON.parse(raw);
  // 火山方舟 Responses API：遍历 output 找 type=='message' 的项，读 content[*].text
  const out = parsed?.output;
  if (!Array.isArray(out)) return "";
  const parts: string[] = [];
  for (const item of out) {
    if (item?.type !== "message") continue;
    const content = item.content;
    if (!Array.isArray(content)) continue;
    for (const c of content) {
      if (typeof c?.text === "string") parts.push(c.text);
    }
  }
  return parts.join("");
}

async function runCase(
  key: CaseKey,
  path: string,
  desc: string,
  body: unknown,
  extractor: (raw: string) => string,
  expectJson: boolean
): Promise<void> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 30_000);
  try {
    const { httpStatus, text } = await postJson(path, body, ctrl.signal);
    const preview = text.slice(0, 500);

    if (httpStatus < 200 || httpStatus >= 300) {
      results.push({
        key,
        path,
        desc,
        httpStatus,
        ok: false,
        jsonParsable: null,
        preview,
      });
      return;
    }

    const content = extractor(text);
    let jsonParsable: boolean | null = null;
    if (expectJson) {
      try {
        JSON.parse(content);
        jsonParsable = true;
      } catch {
        jsonParsable = false;
      }
    }

    results.push({
      key,
      path,
      desc,
      httpStatus,
      ok: expectJson ? jsonParsable === true : content.length > 0,
      jsonParsable,
      preview: `content=${content.slice(0, 200)} | raw=${preview.slice(0, 200)}`,
    });
  } catch (e) {
    results.push({
      key,
      path,
      desc,
      httpStatus: null,
      ok: false,
      jsonParsable: null,
      preview: "",
      error: safeErrorMsg(e),
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  console.log("▶ Ark API 冒烟测试开始");
  console.log("  Endpoint:", MODEL);
  console.log("  BaseURL :", BASE_URL);
  console.log("  Key     : [REDACTED]");
  console.log("");

  // Case A · /chat/completions + response_format:json_object
  await runCase(
    "A",
    "/chat/completions",
    "chat/completions + response_format",
    {
      model: MODEL,
      messages: [{ role: "user", content: JSON_PROMPT }],
      response_format: { type: "json_object" },
    },
    extractChatCompletionsText,
    true
  );

  // Case B · /chat/completions + 纯 prompt 要求 JSON
  await runCase(
    "B",
    "/chat/completions",
    "chat/completions + prompt-only JSON",
    {
      model: MODEL,
      messages: [{ role: "user", content: JSON_PROMPT }],
    },
    extractChatCompletionsText,
    true
  );

  // Case C · /responses + text.format:json_object
  await runCase(
    "C",
    "/responses",
    "responses + text.format",
    {
      model: MODEL,
      input: [
        {
          role: "user",
          content: [{ type: "input_text", text: JSON_PROMPT }],
        },
      ],
      text: { format: { type: "json_object" } },
    },
    extractResponsesText,
    true
  );

  // Case D · /responses + 纯 prompt 要求 JSON
  await runCase(
    "D",
    "/responses",
    "responses + prompt-only JSON",
    {
      model: MODEL,
      input: [
        {
          role: "user",
          content: [{ type: "input_text", text: JSON_PROMPT }],
        },
      ],
    },
    extractResponsesText,
    true
  );

  // Case E · 纯文本（用 /chat/completions 作为默认路径；若 A~D 显示更适合 /responses 再手动改）
  await runCase(
    "E",
    "/chat/completions",
    "chat/completions + 纯文本（非 JSON 场景）",
    {
      model: MODEL,
      messages: [{ role: "user", content: TEXT_PROMPT }],
    },
    extractChatCompletionsText,
    false
  );

  // ── 汇总 ──
  console.log("─".repeat(100));
  console.log("Case | Path                  | Description                                  | HTTP | OK  | JSON | Preview");
  console.log("─".repeat(100));
  for (const r of results) {
    const http = r.httpStatus ?? "ERR ";
    const ok = r.ok ? "✓" : "✗";
    const json =
      r.jsonParsable === null ? "-" : r.jsonParsable ? "✓" : "✗";
    const preview = (r.error ? `error=${r.error}` : r.preview).slice(0, 200);
    console.log(
      `  ${r.key}  | ${r.path.padEnd(22)}| ${r.desc.padEnd(45)}| ${http} | ${ok}  |  ${json}  | ${preview}`
    );
  }
  console.log("─".repeat(100));

  // ── 退出码：A~D 至少一个 ok = pass ──
  const anyJsonOk = results
    .filter((r) => ["A", "B", "C", "D"].includes(r.key))
    .some((r) => r.ok);
  const caseE = results.find((r) => r.key === "E");
  const textOk = caseE?.ok ?? false;

  console.log("");
  console.log(`JSON 用例（A~D）至少一个通过：${anyJsonOk ? "✅" : "❌"}`);
  console.log(`纯文本用例（E）通过：${textOk ? "✅" : "❌"}`);

  if (!anyJsonOk) {
    console.error("❌ A~D 全部失败，停止推进。请把以上输出发给用户。");
    process.exit(2);
  }

  // 建议决策
  const preferred = results.find(
    (r) => ["A", "B", "C", "D"].includes(r.key) && r.ok
  );
  console.log("");
  console.log(
    `🎯 建议选用：Case ${preferred?.key}（${preferred?.path} / ${preferred?.desc}）`
  );
  console.log(
    `   理由：首个通过的 JSON 用例。若多个通过，规则优先选 A > B > C > D（OpenAI 兼容性、稳定性、工具链）。`
  );
  console.log(
    `   请在 architecture.md「关键契约点 · Ark API 调用路径决策」里记录。`
  );
}

main().catch((e) => {
  console.error("uncaught:", safeErrorMsg(e));
  process.exit(3);
});
