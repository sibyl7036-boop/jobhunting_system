/**
 * scripts/smoke-api.ts · Phase 2 非 AI REST API 烟测
 *
 * 使用：
 *   1. 先启动 dev server：pnpm dev
 *   2. 另开终端运行：pnpm tsx scripts/smoke-api.ts
 *
 * 流程：Resume 走不了 create（Phase 5.1 才有 upload），此处只测 GET；
 *       Application / Stage 走完整 CRUD，脚本结束时清理自己造的数据。
 *
 * 退出码：0 = 全绿；非 0 = 失败数。
 */

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

let pass = 0;
let fail = 0;

async function expect(
  name: string,
  actual: number,
  expectedStatus: number,
  body?: unknown
) {
  if (actual === expectedStatus) {
    console.log(`  ✅ ${name} → HTTP ${actual}`);
    pass++;
  } else {
    console.log(
      `  ❌ ${name} → HTTP ${actual} (期望 ${expectedStatus}) body=${JSON.stringify(
        body
      ).slice(0, 200)}`
    );
    fail++;
  }
}

interface CurlRes {
  status: number;
  body: unknown;
}

async function req(
  method: string,
  path: string,
  body?: unknown
): Promise<CurlRes> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body
      ? { "Content-Type": "application/json" }
      : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let parsed: unknown = null;
  try {
    parsed = await res.json();
  } catch {
    // ignore
  }
  return { status: res.status, body: parsed };
}

async function main() {
  console.log(`▶ smoke-api.ts · base=${BASE}`);

  // ── /api/resumes GET ──
  console.log("\n[1] Resume API");
  const r1 = await req("GET", "/api/resumes");
  await expect("GET /api/resumes", r1.status, 200, r1.body);

  // ── /api/applications 完整 CRUD ──
  console.log("\n[2] Application API · CRUD");
  const cPost = await req("POST", "/api/applications", {
    companyName: "smoke-test-co",
    roleName: "smoke-test-role",
    departmentName: "烟测部",
  });
  await expect("POST /api/applications", cPost.status, 201, cPost.body);
  const appId = (cPost.body as { id?: string })?.id;
  if (!appId) {
    console.log("  ⚠️ 没拿到 Application id，后续步骤跳过");
  } else {
    const g = await req("GET", `/api/applications/${appId}`);
    await expect(
      `GET /api/applications/${appId.slice(0, 8)}…`,
      g.status,
      200,
      g.body
    );

    const p = await req("PATCH", `/api/applications/${appId}`, {
      currentStatus: "一面",
    });
    await expect(
      `PATCH /api/applications/${appId.slice(0, 8)}…`,
      p.status,
      200,
      p.body
    );

    // ── /api/stages · POST + PATCH + DELETE ──
    console.log("\n[3] Stage API · POST → PATCH → DELETE");
    const stagePost = await req("POST", "/api/stages", {
      applicationId: appId,
      type: "一面",
      time: new Date().toISOString(),
    });
    await expect("POST /api/stages", stagePost.status, 201, stagePost.body);
    const stageId = (stagePost.body as { id?: string })?.id;
    if (stageId) {
      const sp = await req("PATCH", `/api/stages/${stageId}`, {
        status: "已通过",
      });
      await expect(
        `PATCH /api/stages/${stageId.slice(0, 8)}…`,
        sp.status,
        200,
        sp.body
      );
      const sd = await req("DELETE", `/api/stages/${stageId}`);
      await expect(
        `DELETE /api/stages/${stageId.slice(0, 8)}…`,
        sd.status,
        200,
        sd.body
      );
    }

    // 清理：删 Application（Cascade 会带走 Stage，但上面已手动删了）
    const d = await req("DELETE", `/api/applications/${appId}`);
    await expect(
      `DELETE /api/applications/${appId.slice(0, 8)}…（清理）`,
      d.status,
      200,
      d.body
    );
  }

  // ── /api/dashboard/events ──
  console.log("\n[4] Dashboard events");
  const d1 = await req("GET", "/api/dashboard/events?range=7d");
  await expect("GET /api/dashboard/events?range=7d", d1.status, 200, d1.body);
  const d2 = await req("GET", "/api/dashboard/events?range=abc");
  await expect(
    "GET /api/dashboard/events?range=abc (非法)",
    d2.status,
    400,
    d2.body
  );

  // ── /api/calendar/events ──
  console.log("\n[5] Calendar events");
  const c1 = await req(
    "GET",
    "/api/calendar/events?start=2026-04-01&end=2026-04-30"
  );
  await expect("GET calendar 2026-04 整月", c1.status, 200, c1.body);
  const c2 = await req(
    "GET",
    "/api/calendar/events?start=2026-05-31&end=2026-05-01"
  );
  await expect("GET calendar start>end (非法)", c2.status, 400, c2.body);

  // ── /api/companies/progress ──
  console.log("\n[6] Companies progress");
  const cp = await req("GET", "/api/companies/progress");
  await expect("GET /api/companies/progress", cp.status, 200, cp.body);
  const companies = Array.isArray(cp.body) ? cp.body : [];
  await expect(
    "companies 数量 = 10",
    companies.length,
    10,
    companies.map((c: { companyName: string }) => c.companyName)
  );

  // ── 总结 ──
  console.log("\n────────────────────────────");
  console.log(`通过 ${pass} · 失败 ${fail}`);
  console.log("────────────────────────────");
  if (fail > 0) process.exit(1);
  console.log("✅ 全部通过");
}

main().catch((e) => {
  console.error("smoke-api 崩了：", e);
  process.exit(2);
});
