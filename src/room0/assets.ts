/* ROOM 0 — PHYSICAL SPACE 씬 에셋.
   코드는 이 파일의 id 만 다루고, 실제 파일은 public/assets/room0/ 아래에 둔다.
   최종 아트를 교체할 때 코드를 고칠 필요가 없어야 한다.

   경로 기준:
   - Next 라우트(/room0)에서는 "/assets/room0/..." 로 서비스된다.
   - 정적 빌드(npm run room0:static)에서는 번들 옆의 "./assets/room0/..." 를 쓴다.
     esbuild 가 __ROOM0_ASSET_BASE__ 를 치환한다. */

declare const __ROOM0_ASSET_BASE__: string | undefined;

export const ASSET_BASE: string =
  typeof __ROOM0_ASSET_BASE__ !== "undefined" ? __ROOM0_ASSET_BASE__ : "/assets/room0/";

export function asset(file: string): string {
  return `${ASSET_BASE}${file}`;
}

export interface SceneAsset {
  id: string;
  /** public/assets/room0/ 기준 상대 경로 */
  file: string;
  /** 가로 / 세로 비율. 씬 박스가 이 비율을 그대로 쓴다 */
  ratio: number;
  /** 어떤 장면의 무엇인가 */
  use: string;
  /** 권장 해상도 */
  size: string;
  /** 아트 디렉션 요약 — 재제작 시 이 문장이 사양이다 */
  brief: string;
}

export const SCENE_ASSETS: Record<string, SceneAsset> = {
  corridor: {
    id: "corridor",
    file: "cctv/corridor.webp",
    ratio: 4 / 3,
    use: "CCTV CAM 05-W 아카이브 프레임. 04:17(문 있음) / 그 외(문 없음) 두 상태의 원본 한 장.",
    size: "2048 x 1536 (4:3)",
    brief:
      "천장 감시카메라 시점, 1소점 투시로 뻗은 1980년대 중급 호텔 복도. 왼쪽 벽에 동일한 객실 문 다섯 개가 " +
      "균등 간격으로 늘어서 있고 각 문에 황동 번호판. 누런 벽지, 어두운 나무 몰딩, 적갈색 카펫, 형광등. " +
      "사람 없음. 공포 연출 없음. 문자·타임스탬프 없음.",
  },
  door504: {
    id: "door504",
    file: "504/door-504.webp",
    ratio: 3 / 4,
    use: "Discovery — 504호 문 최초 등장.",
    size: "1536 x 2048 (3:4)",
    brief:
      "어두운 호텔 복도에서 정면으로 본 닫힌 객실 문 하나. 오래된 진한 나무 문, 눈높이에 '504' 가 " +
      "새겨진 황동 번호판, 황동 손잡이, 문 아래로 새어 나오는 아주 약한 빛. 위협적이지 않고 평범할 것.",
  },
  room: {
    id: "room",
    file: "504/room-504-wide.webp",
    ratio: 3 / 4,
    use: "Room 504 내부 메인 장면. 모든 hotspot 이 이 이미지 위에 놓인다.",
    size: "1536 x 2048 (3:4)",
    brief:
      "1980년대 후반 호텔 객실 내부, 문에서 정면으로 본 세로 구도. 침대 · 협탁 · 유선 전화기 · 벽에 걸린 " +
      "액자 · 창 · 러그 · 오른쪽 벽의 문. 뒷벽 오른쪽에는 시계가 걸려 있던 원형 자국만 남아 있고 시계는 없다. " +
      "낮은 조도, 탁한 녹갈색 톤, 아무도 없지만 방금 전까지 누가 있었던 것 같은 방.",
  },
  photoFront: {
    id: "photoFront",
    file: "504/photo-front.webp",
    ratio: 4 / 3,
    use: "액자 확대 — 사진 앞면. 사진 속 벽에는 지금은 없는 벽시계가 02:13 을 가리킨다.",
    size: "1600 x 1200 (4:3)",
    brief:
      "1987년에 찍힌 빛바랜 컬러 스냅사진. 같은 호텔 객실 내부이며 벽에 둥근 벽시계가 걸려 있고 바늘은 " +
      "2시 13분을 가리킨다. 흰 테두리, 누런 변색, 입자, 모서리 눌림.",
  },
  photoBack: {
    id: "photoBack",
    file: "504/photo-back.webp",
    ratio: 4 / 3,
    use: "액자 확대 — 사진 뒷면. 연필 글씨 OCT 17, 1987.",
    size: "1600 x 1200 (4:3)",
    brief:
      "오래된 인화지의 뒷면. 누렇게 변한 무광 종이, 닳은 모서리. 가운데에 연필로 비스듬히 " +
      "'OCT 17, 1987' 이라고만 적혀 있다. 다른 글씨 없음.",
  },
  clockMark: {
    id: "clockMark",
    file: "504/clock-mark.webp",
    ratio: 1,
    use: "벽의 시계 자국 확대. 여기서 02:13 을 읽어낸다.",
    size: "1100 x 1100 (1:1)",
    brief:
      "줄무늬 벽지에 남은 원형 자국 클로즈업. 주변보다 덜 바랜 원, 선명한 먼지 경계, 가운데 남은 못. " +
      "시계 자체는 없다. 측광, 얕은 심도.",
  },
};

/** 아직 파일이 없는 에셋은 코드가 플레이스홀더로 자동 대체되고 TODO 가 표시된다. */
export const ASSET_LIST = Object.values(SCENE_ASSETS);
