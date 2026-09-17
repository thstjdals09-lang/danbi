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

/** 후보 경로를 순서대로 찾는다. 없으면 첫 번째 후보를 "필요한 파일"로 안내한다. */
function resolve(...candidatesWithoutExt: string[]): AssetRef {
  for (const candidate of candidatesWithoutExt) {
    for (const ext of EXTENSIONS) {
      const rel = `assets/${candidate}.${ext}`;
      if (existsSync(path.join(process.cwd(), "public", rel))) return { src: `/${rel}`, expected: `/${rel}` };
    }
  }
  return { src: null, expected: `/assets/${candidatesWithoutExt[0]}.webp` };
}

export type PersonaAssetKind = "full" | "bust" | "pfp" | "reveal";

/** 계열별 캐릭터. full(전신) / bust(상반신) / pfp(정사각) / reveal(공개 연출용) */
export function personaAsset(familyId: string, kind: PersonaAssetKind): AssetRef {
  return resolve(`personas/${familyId}/${kind}`);
}

/** 기어 수집물 이미지 (1:1, 투명) */
export function gearIcon(gearId: string): AssetRef {
  return resolve(`gear/${gearId}/icon`);
}

/**
 * 캐릭터 위에 겹치는 기어 레이어. 해당 계열 full.webp 와 같은 캔버스.
 * 계열마다 체형/포즈가 다르므로 계열별 파일을 먼저 찾고, 없으면 공용 파일을 쓴다.
 * 배경(background) 기어는 이 레이어가 캐릭터 뒤에 깔린다.
 */
export function gearOverlay(gearId: string, familyId: string): AssetRef {
  return resolve(`gear/${gearId}/overlay-${familyId}`, `gear/${gearId}/overlay`);
}

/** 인증 메달 완성 이미지. 등급 글자가 이미지에 포함되므로 등급별 파일이 필요하다. 미획득은 locked. */
export function certificationAsset(examId: string, grade: string | null): AssetRef {
  return resolve(`certifications/${examId}/${grade && grade !== "F" ? grade : "locked"}`);
}

export function trophyAsset(key: string): AssetRef {
  return resolve(`trophies/${key}`);
}

/** Persona Test 선택지의 Visual Fragment */
export function testFragmentAsset(axis: string, value: string): AssetRef {
  return resolve(`persona-test/${axis}-${value}`);
}
