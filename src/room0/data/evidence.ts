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

  /* CASE 01 — 존재하지 않는 열쇠 */
  {
    id: "ext-3317",
    code: "3317",
    label: "EXTENSION",
    source: "ROOM 504 / TELEPHONE",
    caseId: "case01",
    kind: "object",
    unresolved: true,
    note: "다이얼 아래에 찍혀 있다. 키 인덱스에는 이 번호가 없다.",
  },
  {
    id: "key-3317",
    code: "3317",
    label: "KEY CONTROL / LEGACY LOG",
    source: "FRONT DESK / GF",
    caseId: "case01",
    kind: "record",
    note: "반납 기록 사이에 이 번호가 한 줄 끼어 있다. NO PHYSICAL KEY. 어느 객실의 것인지는 적혀 있지 않다.",
  },
  {
    id: "cabinet-3317",
    code: "NOT PRESENT",
    label: "KEY CABINET",
    source: "FRONT DESK / GF",
    caseId: "case01",
    kind: "object",
    note: "열쇠함의 모든 고리를 확인했다. 이 번호를 단 열쇠는 함에도, 반납함에도, 예비 서랍에도 없다.",
  },
  {
    id: "routing-3314",
    code: "3314 — 3319",
    label: "SWITCHBOARD ROUTING",
    source: "FRONT DESK / EXCHANGE",
    caseId: "case01",
    kind: "record",
    note: "교환대 배선표. 501→3314, 502→3315, 503→3316, 505→3318, 506→3319. 한 줄이 비어 있다.",
  },
  {
    id: "line-3317",
    code: "EXT 3317 → ROOM 504",
    label: "LINE SOURCE",
    source: "FRONT DESK / EXCHANGE",
    caseId: "case01",
    kind: "record",
    note: "회선이 연결된 곳이 기록으로 남았다. 교환기는 이 번호가 어디로 가는지 알고 있었다.",
  },

  /* CASE 02 — 마지막 기록 */
  {
    id: "audit-1017",
    code: "OCT 17, 1987",
    label: "NIGHT AUDIT",
    source: "LEGACY PROPERTY ARCHIVE",
    caseId: "case02",
    kind: "record",
    note: "그날 밤의 감사 기록이 통째로 남아 있다. 00:00 마감 개시부터 새벽까지, 한 줄도 빠짐없이.",
  },
  {
    id: "index-0212",
    code: "68 UNITS",
    label: "PROPERTY INDEX / 02:12",
    source: "NIGHT AUDIT OCT 17 1987",
    caseId: "case02",
    kind: "record",
    note: "그 시각의 객실 목록. 5F WEST 는 501 502 503 504 505 506 여섯 칸이다.",
  },
  {
    id: "rebuild-0213",
    code: "02:13",
    label: "PROPERTY INDEX REBUILD",
    source: "SECTOR 5W / OFFSET 0504",
    caseId: "case02",
    kind: "record",
    note: "인덱스를 다시 만든 기록. 대상 구역은 5W, 오프셋은 0504. 결과만 남고 이유는 적혀 있지 않다.",
  },
  {
    id: "index-0214",
    code: "67 UNITS",
    label: "PROPERTY INDEX / 02:14",
    source: "NIGHT AUDIT OCT 17 1987",
    caseId: "case02",
    kind: "record",
    note: "1분 뒤의 객실 목록. 5F WEST 는 501 502 503 505 506 다섯 칸이다.",
  },
  {
    id: "mgr-01",
    code: "MGR-01",
    label: "AUDIT SOURCE",
    source: "PRINTED NIGHT AUDIT / OCT 17 1987",
    caseId: "case02",
    kind: "field",
    unresolved: true,
    note: "디지털 사본에는 없고 출력물에만 남아 있다. 인쇄된 SOURCE 옆에 같은 값이 손으로 한 번 더 적혀 있다.",
  },
];

const BY_ID = new Map<EvidenceId, EvidenceDef>(EVIDENCE.map((e) => [e.id, e]));

export function evidenceById(id: EvidenceId): EvidenceDef | undefined {
  return BY_ID.get(id);
}
