/* ROOM 0 를 Next 런타임 없이 정적 사이트로 빌드한다.
   게임은 서버 · DB · 로그인을 쓰지 않으므로 정적 호스팅(GitHub Pages 등)으로 충분하고,
   dev 서버의 cross-origin 제약 없이 어디서든 열린다.

   사용: npm run room0:static   →  dist/room0/ */

import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outdir = path.join(root, "dist", "room0");

fs.rmSync(outdir, { recursive: true, force: true });
fs.mkdirSync(outdir, { recursive: true });

await build({
  entryPoints: [path.join(root, "scripts", "room0-entry.tsx")],
  outfile: path.join(outdir, "room0.js"),
  bundle: true,
  minify: true,
  format: "iife",
  target: ["es2020", "safari15"],
  jsx: "automatic",
  alias: { "@": path.join(root, "src") },
  define: { "process.env.NODE_ENV": '"production"' },
  legalComments: "none",
  logLevel: "info",
});

fs.copyFileSync(path.join(root, "src", "room0", "room0.css"), path.join(outdir, "room0.css"));

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#0a0b08" />
<meta name="color-scheme" content="dark" />
<meta name="description" content="이 건물에는 존재하지 않는 방이 하나 있다." />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<title>ROOM 0 — NULL HOTEL</title>
<link rel="icon" href="data:," />
<link rel="stylesheet" href="./room0.css" />
<style>
  html, body { margin: 0; padding: 0; height: 100%; background: #0a0b08; overscroll-behavior: none; }
  /* 스크립트가 아직 안 붙었을 때의 최소 화면 — 검은 화면만 남지 않게 한다 */
  #boot-fallback {
    position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
    color: #59604f; background: #0a0b08;
    font: 12px ui-monospace, "SF Mono", Menlo, Consolas, monospace; letter-spacing: 0.2em;
  }
  #root:not(:empty) + #boot-fallback { display: none; }
</style>
</head>
<body>
<div id="root"></div>
<div id="boot-fallback">CONNECTING TO TERMINAL ...</div>
<noscript><div style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;color:#c9cdba;background:#0a0b08;font:13px monospace;letter-spacing:.14em">JAVASCRIPT REQUIRED</div></noscript>
<script src="./room0.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(outdir, "index.html"), html);
fs.writeFileSync(path.join(outdir, ".nojekyll"), "");

const size = fs.statSync(path.join(outdir, "room0.js")).size;
console.log(`\nROOM 0 static build → ${path.relative(root, outdir)}  (room0.js ${(size / 1024).toFixed(1)} kB)`);
