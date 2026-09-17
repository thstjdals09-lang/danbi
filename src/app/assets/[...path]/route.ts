import { readFile, stat } from "node:fs/promises";
import path from "node:path";

/**
 * public/assets 에 "빌드 이후" 추가된 이미지를 서빙한다.
 * 프로덕션(next start)은 빌드 시점에 있던 public 파일만 정적으로 서빙하므로,
 * 서버 실행 중 넣은 이미지는 이 라우트가 디스크에서 직접 읽어 404 없이 바로 보이게 한다.
 * (빌드 때 이미 있던 파일은 Next.js 정적 서빙이 먼저 처리한다)
 */

const ROOT = path.join(process.cwd(), "public", "assets");

const TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const segments = (await params).path;
  const file = path.resolve(ROOT, ...segments);
  const type = TYPES[path.extname(file).toLowerCase()];

  // public/assets 밖으로 나가는 경로, 이미지가 아닌 파일은 거부
  if (!type || !file.startsWith(ROOT + path.sep)) return new Response("Not found", { status: 404 });

  try {
    if (!(await stat(file)).isFile()) return new Response("Not found", { status: 404 });
    const body = await readFile(file);
    const headers: Record<string, string> = {
      "Content-Type": type,
      "Cache-Control": "public, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    };
    // SVG 안의 스크립트가 실행되지 않도록 격리
    if (type === "image/svg+xml") headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
    return new Response(body, { headers });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
