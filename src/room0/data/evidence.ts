import type { EvidenceDef, EvidenceId } from "@/room0/state/types";

/* 단서 정의. 화면 코드는 이 파일을 모른 채 id 만 다룬다. */
export const EVIDENCE: EvidenceDef[] = [
  {
    id: "wall-0417",
    code: "04:17",
    label: "WALL MARKING",
    source: "5F WEST CORRIDOR",
    caseId: "case00",
    note: "SCRATCHED INTO PLASTER BETWEEN 503 AND 505. NOT A ROOM NUMBER. FOUR DIGITS, ONE COLON.",
  },
  {
    id: "cam-05w",
    code: "CAM 05-W",
    label: "SURVEILLANCE UNIT",
    source: "5F WEST / ARCHIVE",
    caseId: "case00",
    note: "SINGLE FIXED CAMERA COVERING THE WEST CORRIDOR. ARCHIVE RETAINED. SUPERVISOR TAPE MISSING.",
  },
  {
    id: "cctv-504-door",
    code: "DOOR 504",
    label: "ARCHIVE FRAME",
    source: "CAM 05-W 04:17",
    caseId: "case00",
    note: "A DOOR STANDS BETWEEN 503 AND 505 IN THE RECORDING. THE FLOOR RECORD SHOWS SOLID WALL.",
  },
  {
    id: "room-504",
    code: "ROOM 504",
    label: "RECOVERED LOCATION",
    source: "FLOOR RECORD 5F-W",
    caseId: "case00",
    note: "WRITTEN BACK INTO THE PROPERTY RECORD BY OPERATOR ACTION. NO OCCUPANCY HISTORY ATTACHED.",
  },
  {
    id: "photo-1987",
    code: "OCT 17, 1987",
    label: "PHOTOGRAPH / REVERSE",
    source: "ROOM 504",
    caseId: "case00",
    note: "PENCIL, ON THE BACK OF A FRAMED PRINT. THE SAME ROOM. THE WALL CLOCK IS STILL ON THE WALL.",
  },
  {
    id: "clock-0213",
    code: "02:13",
    label: "CLOCK MARK",
    source: "ROOM 504 / EAST WALL",
    caseId: "case00",
    note: "A RING OF UNFADED PAPER WHERE A CLOCK HUNG. THE HANDS LEFT THEIR SHADOW. THEY DID NOT MOVE AGAIN.",
  },

  /* CASE 01 티저 — 발견 전 잠긴 슬롯으로만 존재 */
  {
    id: "ext-3317",
    code: "3317",
    label: "EXTENSION",
    source: "ROOM 504 / TELEPHONE",
    caseId: "case01",
    note: "STAMPED UNDER THE DIAL. THE KEY INDEX HAS NO 3317. THE SWITCHBOARD DOES.",
  },
];

const BY_ID = new Map<EvidenceId, EvidenceDef>(EVIDENCE.map((e) => [e.id, e]));

export function evidenceById(id: EvidenceId): EvidenceDef | undefined {
  return BY_ID.get(id);
}
