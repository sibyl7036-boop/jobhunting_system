/**
 * POST /api/resumes/upload
 *
 * multipart/form-data
 *   file : PDF 文件（必填）
 *   name : 简历名称（必填）
 *   tag  : 产品 / 运营 / 算法 / 通用 （必填）
 *
 * 处理：
 *   - 校验 MIME + 扩展名 + 大小（≤ 10MB）
 *   - 写盘到 uploads/<cuid>.pdf（文件名 = Resume.id）
 *   - 尝试 pdf-parse 提取 extractedText，失败不阻断（warning 字段）
 *   - Prisma 存 Resume 行
 *
 * 返回：
 *   201 { ...resume, fileUrl: "/api/resumes/:id/file", warning?: string }
 *   400 MIME/扩展名不对；413 超过 10MB
 *
 * 对应 PRD 7.1 / implementation_plan Step 5.1
 */

import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";
import {
  jsonOk,
  withApiHandler,
  validationError,
  ApiError,
} from "@/lib/api";
import { RESUME_TAGS } from "@/lib/schemas";
import { requireCurrentUser } from "@/lib/auth";

// 强制 Node.js runtime
export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024;
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export const POST = withApiHandler(async (req) => {
  const user = await requireCurrentUser();

  if (process.env.VERCEL === "1") {
    throw new ApiError(
      "FEATURE_UNAVAILABLE_IN_DEMO",
      "演示环境暂不支持简历上传，本地运行可体验完整功能",
      503
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    throw validationError("请求体必须是 multipart/form-data");
  }

  const file = form.get("file");
  const name = form.get("name");
  const tag = form.get("tag");

  if (!(file instanceof File) || file.size === 0) {
    throw validationError("缺少文件字段 file（PDF）");
  }
  if (typeof name !== "string" || name.trim() === "") {
    throw validationError("缺少字段 name");
  }
  if (typeof tag !== "string" || !RESUME_TAGS.includes(tag as (typeof RESUME_TAGS)[number])) {
    throw validationError(
      `非法 tag，必须是 ${RESUME_TAGS.join(" / ")} 之一`
    );
  }

  const isPdfType =
    file.type === "application/pdf" || file.type === "application/x-pdf";
  const isPdfExt =
    file.name.toLowerCase().endsWith(".pdf") ||
    (file as File & { name?: string }).name?.toLowerCase().endsWith(".pdf");
  if (!isPdfType && !isPdfExt) {
    throw validationError("只支持 PDF 文件");
  }

  if (file.size > MAX_BYTES) {
    throw new ApiError(
      "VALIDATION_ERROR",
      `文件超过 10MB 上限（当前 ${(file.size / 1024 / 1024).toFixed(1)}MB）`,
      413
    );
  }

  // ── userId 加入 create ──
  const created = await prisma.resume.create({
    data: {
      userId: user.id,
      name: name.trim(),
      tag,
      fileName: file.name,
      fileUrl: "",
      extractedText: null,
    },
  });

  const savedPath = path.join(UPLOADS_DIR, `${created.id}.pdf`);
  const fileUrl = `/api/resumes/${created.id}/file`;

  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(savedPath, buf);

    let extractedText: string | null = null;
    let warning: string | undefined;
    try {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: new Uint8Array(buf) });
      const result = await parser.getText();
      const raw = (result.text ?? "").trim();
      const cleaned = raw
        .replace(/\r\n/g, "\n")
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
      extractedText = cleaned || null;
    } catch (e) {
      warning = `文本提取失败：${e instanceof Error ? e.message : String(e)}`;
    }

    const updated = await prisma.resume.update({
      where: { id: created.id },
      data: { fileUrl, extractedText },
    });

    return jsonOk(
      warning ? { ...updated, warning } : updated,
      { status: 201 }
    );
  } catch (e) {
    try {
      await prisma.resume.delete({ where: { id: created.id } });
    } catch {
      /* ignore */
    }
    throw e;
  }
});