/**
 * 제작 에셋 목록 (Asset Sheet 와 같은 기준, 105 파일).
 * 경로는 public/assets 기준이며 확장자를 뺀 형태다.
 *
 * alpha: "required"  투명 배경 필수
 *        "forbidden" 배경 포함 필수 (투명 불가)
 *        "optional"  둘 다 가능
 * wired: false 면 아직 화면에 연결되지 않은 제안 슬롯 (파일은 먼저 모아둔다)
 */

const FAMILIES = ["architect", "shark", "strategist", "hunter"];
const RASTER = ["webp", "png", "jpg"];
const SVG = ["svg"];

const entries = [];
function add(id, prio, path, spec) {
  entries.push({ id, prio, path, ext: RASTER, wired: true, ...spec });
}

// 1. Persona 캐릭터
for (const f of FAMILIES) {
  add("A1", "P0", `personas/${f}/full`, { w: 1600, h: 2000, alpha: "required", label: `${f} 전신` });
  add("A2", "P0", `personas/${f}/reveal`, { w: 2000, h: 2000, alpha: "optional", label: `${f} Reveal 히어로` });
  add("A3", "P0", `personas/${f}/pfp`, { w: 1080, h: 1080, alpha: "forbidden", ext: ["png", "webp", "jpg"], label: `${f} PFP (SNS 업로드용 PNG 권장)` });
  add("A4", "P0", `personas/${f}/bust`, { w: 1200, h: 1600, alpha: "optional", label: `${f} 상반신` });
}
add("A5", "P1", "hero/landing", { w: 1800, h: 2000, alpha: "optional", wired: false, label: "Landing 전용 히어로" });

// 2. Persona Test
for (const [axis, values] of [["mind", ["study", "instinct"]], ["play", ["solid", "aggressive"]], ["game", ["cash", "tournament"]], ["table", ["calm", "expressive"]]]) {
  for (const v of values) add("B1", "P1", `persona-test/${axis}-${v}`, { w: 1280, h: 720, alpha: "optional", label: `선택지 조각 ${axis}-${v}` });
}
add("B3", "P2", "persona-test/silhouette", { w: 1200, h: 1500, alpha: "required", wired: false, label: "Q1 공통 실루엣" });

// 3. Home
for (const t of ["skills", "certifications", "collection", "stats", "my-room"]) {
  add("C5", "P2", `ui/tiles/${t}`, { ext: SVG, wired: false, label: `타일 아이콘 ${t}` });
}

// 4. Exam / Result
for (const g of ["S", "A", "B", "C", "locked"]) {
  add("D1", "P1", `certifications/basic-terms/${g}`, { w: 640, h: 717, alpha: "required", label: `Poker Basics 메달 ${g}` });
  add("D2", "P2", `certifications/preflop-40bb/${g}`, { w: 640, h: 717, alpha: "required", label: `40BB Preflop 메달 ${g}` });
}
add("D3", "P2", "ui/grade-ornament", { ext: SVG, wired: false, label: "등급 월계 장식" });
for (const type of ["result", "s-rank", "promotion", "evolution"]) {
  add("D6", "P2", `share/${type}-feed`, { w: 1080, h: 1350, alpha: "optional", wired: false, label: `공유 카드 ${type} 피드` });
  add("D6", "P2", `share/${type}-story`, { w: 1080, h: 1920, alpha: "optional", wired: false, label: `공유 카드 ${type} 스토리` });
}

// 5. Collection / Showcase — gear
const gearIcons = [
  ["E2a", "P0", ["academy-player-tag"]],
  ["E2b", "P1", ["rulebook-pin", "academy-hall"]],
  ["E2c", "P1", ["architect-halo", "shark-visor", "strategist-goggles", "hunter-hood"]],
  ["E2d", "P2", ["40bb-tournament-patch", "grinder-headphones", "graphite-card-protector", "final-table-light"]],
];
for (const [id, prio, list] of gearIcons) {
  for (const g of list) add(id, prio, `gear/${g}/icon`, { w: 512, h: 512, alpha: "required", label: `${g} 아이콘` });
}
const familyOverlays = [
  ["E3a", "P0", ["academy-player-tag"]],
  ["E3b", "P1", ["rulebook-pin"]],
  ["E3d", "P2", ["40bb-tournament-patch", "grinder-headphones", "graphite-card-protector"]],
];
for (const [id, prio, list] of familyOverlays) {
  for (const g of list) for (const f of FAMILIES) {
    add(id, prio, `gear/${g}/overlay-${f}`, { w: 1600, h: 2000, alpha: "required", label: `${g} 레이어 (${f})` });
  }
}
for (const g of ["architect-halo", "shark-visor", "strategist-goggles", "hunter-hood"]) {
  add("E3c", "P1", `gear/${g}/overlay`, { w: 1600, h: 2000, alpha: "required", label: `${g} 레이어` });
}
add("E4a", "P1", "gear/academy-hall/overlay", { w: 1600, h: 2000, alpha: "forbidden", label: "Academy Hall 배경 레이어" });
add("E4b", "P2", "gear/final-table-light/overlay", { w: 1600, h: 2000, alpha: "forbidden", label: "Final Table Light 배경 레이어" });
for (const t of ["first-certification", "perfect-exam"]) {
  add("E5", "P1", `trophies/${t}`, { w: 512, h: 512, alpha: "required", label: `트로피 ${t}` });
}

// 6. Public Profile
for (const f of FAMILIES) {
  add("F3", "P1", `og/profile-${f}`, { w: 1200, h: 630, alpha: "forbidden", wired: false, label: `프로필 공유 카드 ${f}` });
  add("F5", "P2", `backgrounds/profile-${f}`, { w: 1600, h: 2000, alpha: "forbidden", wired: false, label: `프로필 기본 배경 ${f}` });
}

// 7. Environment
add("G1", "P2", "backgrounds/player-room-desktop", { w: 2880, h: 1620, alpha: "forbidden", wired: false, label: "Player Room 데스크톱" });
add("G1", "P2", "backgrounds/player-room-mobile", { w: 1080, h: 1920, alpha: "forbidden", wired: false, label: "Player Room 모바일" });
add("G2", "P2", "backgrounds/paper-grain", { w: 1024, h: 1024, alpha: "required", wired: false, label: "종이 질감 타일" });

// 8. Brand · Share
add("H1", "P1", "brand/mark", { ext: SVG, wired: false, label: "브랜드 마크" });
add("H2", "P1", "brand/app-icon", { ext: SVG, wired: false, label: "파비콘 SVG" });
add("H2", "P1", "brand/apple-icon", { w: 180, h: 180, alpha: "forbidden", wired: false, label: "Apple 터치 아이콘" });
add("H2", "P1", "brand/icon-512", { w: 512, h: 512, alpha: "forbidden", wired: false, label: "앱 아이콘 512" });
add("H3", "P1", "og/default", { w: 1200, h: 630, alpha: "forbidden", wired: false, label: "기본 링크 미리보기" });

export const ASSET_MANIFEST = entries;
