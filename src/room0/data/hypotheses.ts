import type { CaseId, EvidenceId, HypothesisDef, HypothesisId } from "@/room0/state/types";

/* 가설 정의.
   Notebook 의 목표는 증거 두 개를 잇는 것이 아니라, 관찰한 모순으로부터 결론을 내리는 것이다.
   각 칸(slot)은 "왜 그렇게 생각하는가" 의 한 부분이며, accepts 에 든 기록 중 하나면 충족된다.

   CASE 01~09 는 이 배열에 항목을 추가하는 것만으로 같은 시스템을 쓴다. */
export const HYPOTHESES: HypothesisDef[] = [
  {
    id: "hyp-case00",
    caseId: "case00",
    guidance: "guided",
    question: "WHAT HAPPENED TO ROOM 504?",
    questionKo: "504호에는 무슨 일이 있었는가?",
    slots: [
      {
        id: "current",
        label: "CURRENT STATE",
        ask: "What does the current record claim?",
        askKo: "현재 기록은 무엇을 주장하는가?",
        accepts: ["plan-5fw"],
        reject: "THIS IS NOT WHAT THE CURRENT RECORD SAYS.",
      },
      {
        id: "conflict",
        label: "CONFLICTING RECORD",
        ask: "What contradicts that claim?",
        askKo: "그 주장과 충돌하는 기록은 무엇인가?",
        accepts: ["cctv-504-door", "cam-05w"],
        reject: "NO DIRECT CONFLICT FOUND IN THIS ENTRY.",
      },
      {
        id: "confirm",
        label: "CONFIRMING EVIDENCE",
        ask: "What proves which version is real?",
        askKo: "어느 기록이 실제 상황과 일치하는가?",
        accepts: ["room-504"],
        reject: "THIS DOES NOT CONFIRM THE ROOM ITSELF.",
      },
    ],
    statement: "ROOM 504 IS PHYSICALLY PRESENT, BUT HAS BEEN REMOVED FROM THE CURRENT PROPERTY RECORD.",
    statementKo: "504호는 실제로 존재하지만, 현재 건물 기록에서는 삭제되어 있다.",
    finding: [
      "Room 504 exists physically.",
      "It does not appear in the current property record.",
      "Archive footage confirms the room existed before the record was recovered.",
    ],
    status: "UNRESOLVED CAUSE",
    followupQuestion: "WHO REMOVED ROOM 504 FROM THE RECORD?",
    followupQuestionKo: "누가 504호를 기록에서 지웠는가?",
  },
];

const BY_ID = new Map<HypothesisId, HypothesisDef>(HYPOTHESES.map((h) => [h.id, h]));

export function hypothesisById(id: HypothesisId): HypothesisDef | undefined {
  return BY_ID.get(id);
}

export function hypothesesForCase(caseId: CaseId): HypothesisDef[] {
  return HYPOTHESES.filter((h) => h.caseId === caseId);
}

/** 슬롯 배치 상태를 저장할 때 쓰는 키 */
export function slotKey(hypothesisId: HypothesisId, slotId: string): string {
  return `${hypothesisId}:${slotId}`;
}

/** 이 가설을 세우기 시작할 수 있는가 — 칸 하나라도 채울 기록이 있으면 열린다 */
export function hypothesisAvailable(def: HypothesisDef, collected: EvidenceId[]): boolean {
  return def.slots.some((s) => s.accepts.some((id) => collected.includes(id)));
}

/** 모든 칸이 유효한 기록으로 채워졌는가 */
export function hypothesisSatisfied(
  def: HypothesisDef,
  slots: Record<string, EvidenceId>,
): boolean {
  return def.slots.every((s) => {
    const placed = slots[slotKey(def.id, s.id)];
    return placed !== undefined && s.accepts.includes(placed);
  });
}
