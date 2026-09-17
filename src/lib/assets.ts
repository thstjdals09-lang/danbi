import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";

/**
 * 프로덕션 에셋 슬롯.
 * 모든 이미지는 외부에서 제작해 public/assets 아래에 넣는다. 코드에서 캐릭터를 그리지 않는다.
 * 파일이 없으면 src 는 null 이고, 화면은 슬롯 상태(자리만 있는 프레임)로 표시된다.
 * 규칙: public/assets/README.md
 */

export type AssetRef = { src: string | null; expected: string };

const EXTENSIONS = ["webp", "png", "jpg"];

function resolve(relativeWithoutExt: string): AssetRef {
  for (const ext of EXTENSIONS) {
    const rel = `assets/${relativeWithoutExt}.${ext}`;
    if (existsSync(path.join(process.cwd(), "public", rel))) return { src: `/${rel}`, expected: `/${rel}` };
  }
  return { src: null, expected: `/assets/${relativeWithoutExt}.webp` };
}

export type PersonaAssetKind = "full" | "bust" | "pfp" | "reveal";

/** 계열별 캐릭터. full(전신) / bust(상반신) / pfp(정사각) / reveal(공개 연출용) */
export function personaAsset(familyId: string, kind: PersonaAssetKind): AssetRef {
  return resolve(`personas/${familyId}/${kind}`);
}

/** 기어: icon(수집물 이미지) / overlay(full 과 같은 캔버스 크기의 투명 레이어) */
export function gearAsset(gearId: string, kind: "icon" | "overlay"): AssetRef {
  return resolve(`gear/${gearId}/${kind}`);
}

export function certificationAsset(examId: string): AssetRef {
  return resolve(`certifications/${examId}`);
}

export function trophyAsset(key: string): AssetRef {
  return resolve(`trophies/${key}`);
}

/** Persona Test 선택지의 Visual Fragment */
export function testFragmentAsset(axis: string, value: string): AssetRef {
  return resolve(`persona-test/${axis}-${value}`);
}
