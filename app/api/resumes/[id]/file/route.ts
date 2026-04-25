/**
 * GET /api/resumes/[id]/file
 *
 * 读取 uploads/<id>.pdf 并以 application/pdf 返回（供 <iframe> 预览）
 *
 * - 鉴权：必须登录，且简历归属当前用户
 * - 非 JSON 响应：直接构造 NextResponse，不走 withApiHandler
 * - inline 展示：Content-Disposition: inline（浏览器内置 PDF viewer 打开）
 *
 * [2026-04-25 bugfix] 之前该目录为空，导致简历预览 404/HTML 错误
 */

import fs from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTHORIZED", message: "请先登录" } },
      { status: 401 }
    );
  }

  const { id } = await ctx.params;

  const resume = await prisma.resume.findUnique({ where: { id } });
  if (!resume || resume.userId !== user.id) {
    return NextResponse.json(
      { ok: false, error: { code: "NOT_FOUND", message: "简历不存在或无权限" } },
      { status: 404 }
    );
  }

  const filePath = path.join(UPLOADS_DIR, `${id}.pdf`);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "FILE_MISSING",
          message: "文件已丢失（可能是部署重启导致），请重新上传",
        },
      },
      { status: 404 }
    );
  }

  const stat = fs.statSync(filePath);
  const buf = fs.readFileSync(filePath);

  // 文件名处理：中文安全编码
  const fallback = `${resume.id}.pdf`;
  const utf8Name = `${resume.name || resume.fileName || "resume"}.pdf`;
  const disposition = `inline; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(
    utf8Name
  )}`;

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(stat.size),
      "Content-Disposition": disposition,
      "Cache-Control": "private, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
