import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";

/**
 * 이미지는 외부에서 제작해 public/images 아래에 넣는다. (규칙은 public/images/README.md)
 * 파일이 아직 없으면 null 을 돌려주고, 화면에는 빈 슬롯이 표시된다.
 */
const EXTENSIONS = ["webp", "png", "jpg"];

function resolve(relativeWithoutExt: string): string | null {
  for (const ext of EXTENSIONS) {
    const rel = `${relativeWithoutExt}.${ext}`;
    if (existsSync(path.join(process.cwd(), "public", rel))) return `/${rel}`;
  }
  return null;
}

export type ImageRef = { src: string | null; expectedPath: string };

function ref(relativeWithoutExt: string): ImageRef {
  return { src: resolve(relativeWithoutExt), expectedPath: `public/${relativeWithoutExt}.png` };
}

/** 캐릭터 전신: 페르소나 × 성장 단계 */
export function characterImage(personaId: string, stageId: string): ImageRef {
  return ref(`images/characters/${personaId}/${stageId}`);
}

/** 프로필 사진(PFP): 페르소나 × 성장 단계 */
export function pfpImage(personaId: string, stageId: string): ImageRef {
  return ref(`images/pfp/${personaId}/${stageId}`);
}

/** 수집물 아이콘: 종류/키 (예: certification/basic-terms) */
export function collectibleImage(kind: string, key: string): ImageRef {
  return ref(`images/collectibles/${kind}/${key}`);
}
