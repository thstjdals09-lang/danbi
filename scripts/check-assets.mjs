#!/usr/bin/env node
/**
 * 제작 에셋 수집 현황 검사.
 *
 *   npm run assets:check            제출 현황 + 규격 검사
 *   npm run assets:check -- --todo  아직 없는 파일만 나열
 *   npm run assets:init             폴더 구조 생성 (빈 폴더 유지용 .gitkeep)
 *
 * 검사 항목: 파일명(경로), 해상도(규격 이상 + 같은 비율), 투명 채널, 파일 크기, 목록에 없는 파일.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ASSET_MANIFEST } from "./asset-manifest.mjs";

const ROOT = process.env.ASSETS_ROOT
  ? path.resolve(process.env.ASSETS_ROOT)
  : path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "assets");
const args = new Set(process.argv.slice(2));
const MAX_BYTES = 1.5 * 1024 * 1024;

// ---------------------------------------------------------------- image header parsing (no dependencies)

function readImageInfo(file) {
  const buf = readFileSync(file);
  const ext = path.extname(file).slice(1).toLowerCase();

  if (ext === "svg") {
    const text = buf.toString("utf8");
    return { format: "svg", viewBox: /viewBox\s*=/.test(text), valid: /<svg[\s>]/i.test(text) };
  }

  // PNG
  if (buf.length > 26 && buf.readUInt32BE(0) === 0x89504e47) {
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    const colorType = buf[25];
    let alpha = colorType === 4 || colorType === 6;
    for (let offset = 8; offset + 8 <= buf.length; ) {
      const length = buf.readUInt32BE(offset);
      const type = buf.toString("ascii", offset + 4, offset + 8);
      if (type === "tRNS") alpha = true;
      if (type === "IDAT" || type === "IEND") break;
      offset += 12 + length;
    }
    return { format: "png", w, h, alpha };
  }

  // WebP
  if (buf.length > 30 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const chunk = buf.toString("ascii", 12, 16);
    if (chunk === "VP8X") {
      return {
        format: "webp",
        alpha: (buf[20] & 0x10) !== 0,
        w: 1 + buf.readUIntLE(24, 3),
        h: 1 + buf.readUIntLE(27, 3),
      };
    }
    if (chunk === "VP8L") {
      const bits = buf.readUInt32LE(21);
      return { format: "webp", w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1, alpha: ((bits >> 28) & 1) === 1 };
    }
    if (chunk === "VP8 ") {
      return { format: "webp", w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff, alpha: false };
    }
  }

  // JPEG
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    for (let offset = 2; offset + 9 < buf.length; ) {
      if (buf[offset] !== 0xff) { offset++; continue; }
      const marker = buf[offset + 1];
      const size = buf.readUInt16BE(offset + 2);
      const isSof = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
      if (isSof) return { format: "jpg", h: buf.readUInt16BE(offset + 5), w: buf.readUInt16BE(offset + 7), alpha: false };
      offset += 2 + size;
    }
  }

  return { format: "unknown" };
}

// ---------------------------------------------------------------- checks

/** 대소문자까지 정확히 일치하는지 확인 (Windows 는 대소문자를 무시하지만 배포 서버는 구분한다) */
function existsExact(file) {
  const dir = path.dirname(file);
  return existsSync(dir) && readdirSync(dir).includes(path.basename(file));
}

function findDelivered(entry) {
  for (const ext of entry.ext) {
    const file = path.join(ROOT, `${entry.path}.${ext}`);
    if (existsExact(file)) return file;
  }
  return null;
}

function checkEntry(entry, file) {
  const errors = [];
  const warnings = [];
  const info = readImageInfo(file);
  const bytes = statSync(file).size;

  if (info.format === "unknown") {
    errors.push("이미지 형식을 읽을 수 없음 (확장자와 실제 형식이 다른지 확인)");
    return { errors, warnings, info, bytes };
  }
  if (info.format === "svg") {
    if (!info.valid) errors.push("<svg> 요소가 없음");
    if (!info.viewBox) warnings.push("viewBox 없음 — 크기 조절이 깨질 수 있음");
    return { errors, warnings, info, bytes };
  }
  if (path.extname(file).slice(1).toLowerCase() !== info.format && !(info.format === "jpg" && /jpe?g$/i.test(file))) {
    warnings.push(`확장자와 실제 형식(${info.format})이 다름`);
  }

  const specRatio = entry.w / entry.h;
  const ratio = info.w / info.h;
  if (Math.abs(ratio - specRatio) / specRatio > 0.01) {
    errors.push(`비율 불일치: ${info.w}×${info.h} (규격 ${entry.w}×${entry.h})`);
  } else if (info.w < entry.w) {
    errors.push(`해상도 부족: ${info.w}×${info.h} (규격 ${entry.w}×${entry.h} 이상)`);
  } else if (info.w > entry.w) {
    warnings.push(`규격보다 큼: ${info.w}×${info.h} — 웹용은 ${entry.w}×${entry.h}로 내보내기 권장`);
  }

  if (entry.alpha === "required" && !info.alpha) errors.push("투명 배경 필요 — 알파 채널 없음");
  if (entry.alpha === "forbidden" && info.alpha) warnings.push("알파 채널 있음 — 배경이 모두 채워져 있는지 확인 (투명이면 안 됨)");
  if (bytes > MAX_BYTES) warnings.push(`파일이 큼: ${(bytes / 1024 / 1024).toFixed(1)}MB — 1.5MB 이하 권장`);

  return { errors, warnings, info, bytes };
}

function listFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = path.join(dir, d.name);
    return d.isDirectory() ? listFiles(full) : [full];
  });
}

// ---------------------------------------------------------------- commands

if (args.has("--init")) {
  let created = 0;
  for (const dir of new Set(ASSET_MANIFEST.map((e) => path.join(ROOT, path.dirname(e.path))))) {
    if (!existsSync(dir)) created++;
    mkdirSync(dir, { recursive: true });
    const keep = path.join(dir, ".gitkeep");
    if (!existsSync(keep)) writeFileSync(keep, "");
  }
  console.log(`폴더 준비 완료: ${created}개 생성 (public/assets)`);
  process.exit(0);
}

const results = ASSET_MANIFEST.map((entry) => {
  const file = findDelivered(entry);
  return { entry, file, ...(file ? checkEntry(entry, file) : { errors: [], warnings: [] }) };
});

const rel = (file) => path.relative(ROOT, file).split(path.sep).join("/");

if (args.has("--todo")) {
  for (const prio of ["P0", "P1", "P2"]) {
    const todo = results.filter((r) => !r.file && r.entry.prio === prio);
    if (!todo.length) continue;
    console.log(`\n${prio} — 남은 ${todo.length}개`);
    for (const r of todo) {
      const size = r.entry.w ? `${r.entry.w}×${r.entry.h}` : "SVG";
      console.log(`  ${r.entry.id.padEnd(4)} ${r.entry.path}.${r.entry.ext[0]}  ${size}  ${r.entry.label}`);
    }
  }
  process.exit(0);
}

const expected = new Set(results.filter((r) => r.file).map((r) => path.resolve(r.file)));
const unknown = listFiles(ROOT).filter((f) => {
  const name = path.basename(f);
  return !expected.has(path.resolve(f)) && name !== ".gitkeep" && name !== "README.md";
});

let errorCount = 0;
console.log(`POKER PLAYER GROW — asset status (${path.relative(process.cwd(), ROOT) || ROOT})\n`);
for (const prio of ["P0", "P1", "P2"]) {
  const group = results.filter((r) => r.entry.prio === prio);
  const delivered = group.filter((r) => r.file);
  console.log(`${prio}  ${delivered.length} / ${group.length} 제출`);
  for (const r of delivered) {
    const mark = r.errors.length ? "✗" : r.warnings.length ? "!" : "✓";
    const dims = r.info?.w ? ` ${r.info.w}×${r.info.h}${r.info.alpha ? " α" : ""}` : "";
    const pending = r.entry.wired ? "" : "  (화면 연결 전 — 수집만)";
    console.log(`  ${mark} ${rel(r.file)}${dims}${pending}`);
    for (const e of r.errors) console.log(`      ✗ ${e}`);
    for (const w of r.warnings) console.log(`      ! ${w}`);
    errorCount += r.errors.length;
  }
}

if (unknown.length) {
  console.log(`\n목록에 없는 파일 ${unknown.length}개 — 이름/폴더 오타인지 확인`);
  for (const f of unknown) {
    const dir = path.dirname(rel(f));
    const nearby = ASSET_MANIFEST.filter((e) => path.dirname(e.path) === dir).map((e) => path.basename(e.path));
    console.log(`  ? ${rel(f)}${nearby.length ? `  → 이 폴더의 파일명: ${[...new Set(nearby)].join(", ")}` : "  → 이 폴더는 목록에 없음"}`);
  }
}

const total = results.length;
const done = results.filter((r) => r.file && !r.errors.length).length;
console.log(`\n합계 ${done} / ${total} 통과 · 규격 오류 ${errorCount} · 미제출 ${results.filter((r) => !r.file).length}`);
console.log("남은 파일 목록: npm run assets:check -- --todo");

if (args.has("--strict") && (errorCount > 0 || unknown.length > 0)) process.exit(1);
