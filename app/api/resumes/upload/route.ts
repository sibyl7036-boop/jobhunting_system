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

// 强制 Node.js runtime（pdf-parse / pdfjs-dist 不能在 edge-light 跑）
export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export const POST = withApiHandler(async (req) => {
  // [2026-04-19 deploy/vercel-postgres] 演示环境降级：Vercel Serverless 容器无持久化
  // 文件系统，本地 uploads/ 写盘在云上会随函数冷启动丢失。部署目标只是 demo，
  // 不做 Blob 改造，直接友好报错即可。详见 architecture.md 契约点 24。
  if (process.env.VERCEL === "1") {
    throw new ApiError(
      "FEATURE_UNAVAILABLE_IN_DEMO",
      "演示环境暂不支持简历上传，本地运行可体验完整功能",
      503
    );
  }

  // 1. 拿 multipart body
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    throw validationError("请求体必须是 multipart/form-data");
  }

  const file = form.get("file");
  const name = form.get("name");
  const tag = form.get("tag");

  // 2. 基础校验
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

  // 3. MIME + 扩展名（PRD 5.1.4 只支持 PDF）
  const isPdfType =
    file.type === "application/pdf" || file.type === "application/x-pdf";
  const isPdfExt =
    file.name.toLowerCase().endsWith(".pdf") ||
    (file as File & { name?: string }).name?.toLowerCase().endsWith(".pdf");
  if (!isPdfType && !isPdfExt) {
    throw validationError("只支持 PDF 文件");
  }

  // 4. 大小限制
  if (file.size > MAX_BYTES) {
    throw new ApiError(
      "VALIDATION_ERROR",
      `文件超过 10MB 上限（当前 ${(file.size / 1024 / 1024).toFixed(1)}MB）`,
      413
    );
  }

  // 5. Resume 落库（先拿 id，再用 id 命名文件）
  const created = await prisma.resume.create({
    data: {
      name: name.trim(),
      tag,
      fileName: file.name,
      // fileUrl 之后回填；先放占位
      fileUrl: "",
      extractedText: null,
    },
  });

  const savedPath = path.join(UPLOADS_DIR, `${created.id}.pdf`);
  const fileUrl = `/api/resumes/${created.id}/file`;

  // 6. 写文件到 uploads/
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(savedPath, buf);

    // 7. 尝试提取文本（失败不阻断）
    let extractedText: string | null = null;
    let warning: string | undefined;
    try {
      // pdf-parse v2：new PDFParse({ data }).getText()
      // 动态 import 避免构建时 bundler 触碰 node:fs / worker 等
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: new Uint8Array(buf) });
      const result = await parser.getText();
      const raw = (result.text ?? "").trim();
      // 清洗控制字符：保留换行（\n）和制表（\t），其他 C0 / DEL 一律替换为单空格
      const cleaned = raw
        .replace(/\r\n/g, "\n")
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ")
        // 连续多空格压成单空格，多空行压成双换行
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
      extractedText = cleaned || null;
    } catch (e) {
      warning = `文本提取失败：${e instanceof Error ? e.message : String(e)}`;
    }

    // 8. 更新 fileUrl + extractedText
    const updated = await prisma.resume.update({
      where: { id: created.id },
      data: { fileUrl, extractedText },
    });

    return jsonOk(
      warning ? { ...updated, warning } : updated,
      { status: 201 }
    );
  } catch (e) {
    // 失败时清掉 Resume 行，避免脏数据
    try {
      await prisma.resume.delete({ where: { id: created.id } });
    } catch {
      /* ignore */
    }
    throw e;
  }
});
