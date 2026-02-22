import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join, resolve } from "path";
import { existsSync } from "fs";

const UPLOADS_DIR = "uploads";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  try {
    const pathSegments = (await params).path ?? [];
    if (pathSegments.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (pathSegments.some((p) => p.includes("..") || p === "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const root = resolve(process.cwd(), UPLOADS_DIR);
    const filePath = resolve(root, ...pathSegments);
    if (!filePath.startsWith(root + "/") && !filePath.startsWith(root + "\\")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const ext = pathSegments[pathSegments.length - 1]?.split(".").pop() ?? "";
    const contentType = MIME[`.${ext}`] ?? "application/octet-stream";
    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
