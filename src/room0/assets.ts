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
  desk: {
    id: "desk",
    file: "frontdesk/desk.webp",
    ratio: 3 / 4,
    use: "FRONT DESK / GF — CASE 01 의 메인 장면. 모든 hotspot 좌표의 기준.",
    size: "1200 x 1600 (3:4)",
    brief:
      "1980년대 소형 호텔의 프런트 데스크를 손님 쪽에서 본 세로 구도. 어두운 나무 카운터 위에 베이지색 " +
      "유선 전화기 · 종이 장부 더미 · 카드 색인 상자 · 황동 호출 벨. 카운터 뒤에는 작은 칸이 격자로 난 " +
      "열쇠 선반. 초록 갓 스탠드 하나만 켜져 있고 사람은 없다.",
  },
  cabinet: {
    id: "cabinet",
    file: "frontdesk/cabinet.webp",
    ratio: 4 / 3,
    use: "열쇠 보관함 확대. 가운데 한 자리가 비어 있다.",
    size: "1400 x 1050 (4:3)",
    brief:
      "오래된 프런트 열쇠함 클로즈업. 정사각형 칸 다섯 개가 한 줄로 늘어서 있고 각 칸 아래에 빈 황동 " +
      "번호판이 붙어 있다. 네 칸에는 가죽 태그가 달린 황동 열쇠가 걸려 있고, 가운데 한 칸은 완전히 비어 " +
      "있다. 번호나 글자는 새기지 않는다 (번호판은 코드가 얹는다).",
  },
  deskPhone: {
    id: "deskPhone",
    file: "frontdesk/phone.webp",
    ratio: 3 / 4,
    use: "프런트 전화기. 키패드 영역만 잘라 확대해 실제로 누른다.",
    size: "1200 x 1600 (3:4)",
    brief:
      "베이지색 1980년대 탁상 전화기를 약간 위에서 정면으로 본 클로즈업. 수화기는 거치대에 놓여 있고 " +
      "그 아래 12개 버튼 키패드가 3x4 로 평평하게 보인다. 버튼에는 숫자를 인쇄하지 않는다 (코드가 얹는다).",
  },
  roomPhone: {
    id: "roomPhone",
    file: "504/phone-detail.webp",
    ratio: 4 / 3,
    use: "504호 협탁 위 전화기 확대. CASE 01 에서 이 전화가 울린다.",
    size: "1400 x 1050 (4:3)",
    brief:
      "어두운 객실의 나무 협탁 위에 놓인 베이지색 유선 전화기 클로즈업. 수화기는 거치대에 있고 코드가 " +
      "늘어져 있다. 줄무늬 벽지, 측면에서 들어오는 약한 빛, 먼지.",
  },
  drawer: {
    id: "drawer",
    file: "archive/drawer.webp",
    ratio: 4 / 3,
    use: "프런트 뒤 보관 서랍 — NIGHT AUDIT ARCHIVE 의 입구.",
    size: "1400 x 1050 (4:3)",
    brief:
      "1980년대 호텔 프런트 아래에서 꺼낸 나무 서랍 클로즈업. 누런 서류철이 빽빽하게 세워져 있고 " +
      "위쪽 탭에는 빈 라벨 홀더가 달려 있다. 따뜻한 텅스텐 측광, 먼지, 얕은 심도. 글자는 없다.",
  },
  auditSheet: {
    id: "auditSheet",
    file: "archive/audit-sheet.webp",
    ratio: 4 / 3,
    use: "OCT 17 1987 야간 감사 출력물. 디지털 사본에 없는 SOURCE 칸이 여기 찍혀 있다.",
    size: "1400 x 1050 (4:3)",
    brief:
      "도트 매트릭스로 인쇄된 오래된 연속 용지. 연녹색 줄무늬, 양쪽 스프로킷 구멍, 가운데 접힌 자국, " +
      "누렇게 변색, 커피 자국. 인쇄된 줄은 흐릿하게 (읽히는 글자는 코드가 얹는다).",
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
