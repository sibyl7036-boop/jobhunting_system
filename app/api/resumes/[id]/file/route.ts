/**
 * GET /api/resumes/:id/file
 *
 * 流式返回用户上传的 PDF 文件（application/pdf）。
 * 浏览器直接打开或 <iframe> 嵌入预览都走这里。
 *
 * 对应 PRD 7.1 / implementation_plan Step 5.1
 */

import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withApiHandler, notFound } from "@/lib/api";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const GET = withApiHandler<RouteContext>(async (_req, ctx) => {
  const { id } = await ctx.params;

  const resume = await prisma.resume.findUnique({ where: { id } });
  if (!resume) throw notFound(`Resume ${id} 不存在`);

  const filePath = path.join(UPLOADS_DIR, `${id}.pdf`);
  try {
    const buf = await fs.readFile(filePath);
    // 用 Uint8Array 构造 Response body 避免 Buffer 的 ArrayBufferLike 类型不匹配
    const body = new Uint8Array(buf);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(buf.length),
        "Content-Disposition": `inline; filename="${encodeURIComponent(resume.fileName)}"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch {
    throw notFound(`文件不存在：uploads/${id}.pdf`);
  }
});
