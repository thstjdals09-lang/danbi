import type { CaseDef, CaseId } from "@/room0/state/types";

/* CASE 00 만 플레이 가능. 나머지는 파일 구조만 잡아 둔다. */
export const CASES: CaseDef[] = [
  {
    id: "case00",
    index: "00",
    title: "THE MISSING ROOM",
    question: "WHERE IS ROOM 504?",
    teaser: "ONE ROOM UNACCOUNTED FOR.",
    evidenceIds: ["wall-0417", "cam-05w", "cctv-504-door", "room-504", "photo-1987", "clock-0213"],
    relationIds: ["rel-0417-cam", "rel-door-room", "rel-photo-clock"],
  },
  {
    id: "case01",
    index: "01",
    title: "THE KEY THAT DOESN'T EXIST",
    question: "WHY IS 3317 MISSING FROM THE KEY INDEX?",
    teaser: "KEY INDEX 5F — 3317 NOT ISSUED. SWITCHBOARD DISAGREES.",
    evidenceIds: ["ext-3317"],
    relationIds: [],
  },
  { id: "case02", index: "02", title: "ROOM 504", question: "WHO WAS IN THE ROOM?", teaser: "SEALED.", evidenceIds: [], relationIds: [] },
  { id: "case03", index: "03", title: "THE MANAGER", question: "HOW LONG HAS HE WORKED HERE?", teaser: "SEALED.", evidenceIds: [], relationIds: [] },
  { id: "case04", index: "04", title: "FLOOR 4 1/2", question: "WHAT IS BETWEEN 4 AND 5?", teaser: "SEALED.", evidenceIds: [], relationIds: [] },
  { id: "case05", index: "05", title: "CCTV 17", question: "WHAT DOES CAMERA 17 SEE?", teaser: "SEALED.", evidenceIds: [], relationIds: [] },
  { id: "case06", index: "06", title: "GUEST 302", question: "WHO CHECKED IN AND NEVER OUT?", teaser: "SEALED.", evidenceIds: [], relationIds: [] },
  { id: "case07", index: "07", title: "RED HALLWAY", question: "WHY IS THE CORRIDOR LIT RED?", teaser: "SEALED.", evidenceIds: [], relationIds: [] },
  { id: "case08", index: "08", title: "EMERGENCY MAP", question: "WHICH MAP IS THE REAL ONE?", teaser: "SEALED.", evidenceIds: [], relationIds: [] },
  { id: "case09", index: "09", title: "ROOM 0", question: "WHAT IS ROOM 0?", teaser: "SEALED.", evidenceIds: [], relationIds: [] },
];

export function caseById(id: CaseId): CaseDef {
  const found = CASES.find((c) => c.id === id);
  if (!found) throw new Error(`unknown case: ${id}`);
  return found;
}
