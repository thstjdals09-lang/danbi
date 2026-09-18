import type { EvidenceDef, EvidenceId } from "@/room0/state/types";

/* 단서 정의. 화면 코드는 이 파일을 모른 채 id 만 다룬다.
   kind 는 Notebook 에서 기록이 어떤 형태로 보이는지를 정한다.
   unresolved 는 CASE 00 의 가설로는 설명되지 않는 기록 — 장기 미스터리로 남는다. */
export const EVIDENCE: EvidenceDef[] = [
  {
    id: "plan-5fw",
    code: "5 UNITS",
    label: "FLOOR PLAN 5F-W",
    source: "PROPERTY RECORD / REV 03",
    caseId: "case00",
    kind: "plan",
    note: "503 옆은 곧바로 505 다. 현재 기록에 5층 서측은 다섯 개의 객실뿐이고, 그 사이에는 개구부가 없다.",
  },
  {
    id: "wall-0417",
    code: "04:17",
    label: "WALL MARKING",
    source: "5F WEST CORRIDOR",
    caseId: "case00",
    kind: "field",
    note: "503 과 505 사이 회벽에 긁혀 있다. 방 번호가 아니다. 네 자리와 콜론 하나.",
  },
  {
    id: "cam-05w",
    code: "CAM 05-W",
    label: "SURVEILLANCE UNIT",
    source: "5F WEST / ARCHIVE",
    caseId: "case00",
    kind: "record",
    note: "서측 복도를 보는 고정 카메라 한 대. 아카이브는 남아 있고 관리자 테이프만 없다.",
  },
  {
    id: "cctv-504-door",
    code: "DOOR 504",
    label: "ARCHIVE FRAME",
    source: "CAM 05-W 04:17",
    caseId: "case00",
    kind: "cctv",
    note: "영상 속 503 과 505 사이에는 문이 서 있다. 같은 자리를 층 기록은 벽이라고 적어 두었다.",
  },
  {
    id: "room-504",
    code: "ROOM 504",
    label: "RECOVERED LOCATION",
    source: "FLOOR RECORD 5F-W",
    caseId: "case00",
    kind: "record",
    note: "조작자의 복구로 기록에 다시 쓰였다. 들어가 보면 방은 실제로 있다. 점유 이력은 붙어 있지 않다.",
  },
  {
    id: "photo-1987",
    code: "OCT 17, 1987",
    label: "PHOTOGRAPH / REVERSE",
    source: "ROOM 504",
    caseId: "case00",
    kind: "photo",
    unresolved: true,
    note: "액자 뒤에 연필로 적혀 있다. 사진 속은 같은 방이고, 벽에는 아직 시계가 걸려 있다.",
  },
  {
    id: "clock-0213",
    code: "02:13",
    label: "CLOCK MARK",
    source: "ROOM 504 / EAST WALL",
    caseId: "case00",
    kind: "object",
    unresolved: true,
    note: "시계가 걸려 있던 자리만 덜 바랬다. 바늘이 그림자를 남겼고, 그 뒤로 움직이지 않았다.",
  },

  /* 다음 조사로 넘어가는 기록 */
  {
    id: "ext-3317",
    code: "3317",
    label: "EXTENSION",
    source: "ROOM 504 / TELEPHONE",
    caseId: "case01",
    kind: "object",
    unresolved: true,
    note: "다이얼 아래에 찍혀 있다. 키 인덱스에는 3317 이 없다. 교환대에는 있다.",
  },
];

const BY_ID = new Map<EvidenceId, EvidenceDef>(EVIDENCE.map((e) => [e.id, e]));

export function evidenceById(id: EvidenceId): EvidenceDef | undefined {
  return BY_ID.get(id);
}
