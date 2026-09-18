import type { EvidenceId, RelationDef } from "@/room0/state/types";

/* 성립하는 관계만 정의한다. 나머지 조합은 전부 "기록이 뒷받침하지 않음". */
export const RELATIONS: RelationDef[] = [
  {
    id: "rel-0417-cam",
    pair: ["wall-0417", "cam-05w"],
    caseId: "case00",
    deduction: "THE MARKING IS NOT A NUMBER. IT IS A TIME INDEX FOR CAM 05-W.",
  },
  {
    id: "rel-door-room",
    pair: ["cctv-504-door", "room-504"],
    caseId: "case00",
    deduction: "THE DOOR IN THE ARCHIVE AND THE RECOVERED LOCATION ARE THE SAME OPENING.",
  },
  {
    id: "rel-photo-clock",
    pair: ["photo-1987", "clock-0213"],
    caseId: "case00",
    deduction: "THE CLOCK IN THE PHOTOGRAPH LEFT THE MARK ON THAT WALL. ROOM 504 STOPPED AT 02:13 ON OCT 17, 1987.",
    closesCase: "case00",
  },
];

export function findRelation(a: EvidenceId, b: EvidenceId): RelationDef | undefined {
  return RELATIONS.find(
    (r) => (r.pair[0] === a && r.pair[1] === b) || (r.pair[0] === b && r.pair[1] === a),
  );
}

export function relationById(id: string): RelationDef | undefined {
  return RELATIONS.find((r) => r.id === id);
}
