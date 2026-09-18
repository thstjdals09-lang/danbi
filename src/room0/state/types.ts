/* ROOM 0 — core domain types.
   Location / Scene / Puzzle / Evidence / Record / Case 는 서로 분리되어 있고,
   CASE 01~09 추가 시 데이터 파일만 늘어나도록 설계한다. */

export type SceneId = "boot" | "map" | "cctv" | "discovery" | "room504" | "notebook";

export type CaseId =
  | "case00" | "case01" | "case02" | "case03" | "case04"
  | "case05" | "case06" | "case07" | "case08" | "case09";

export type EvidenceId = string;
export type RelationId = string;
export type LocationId = string;

/** 단서 1건. 발견 전에는 Notebook에서 잠긴 슬롯으로만 보인다. */
export interface EvidenceDef {
  id: EvidenceId;
  /** 노트에 크게 찍히는 값. "04:17", "OCT 17, 1987" */
  code: string;
  /** 분류 라벨. "WALL MARKING" */
  label: string;
  /** 출처 기록. "5F WEST CORRIDOR" */
  source: string;
  caseId: CaseId;
  /** 카드를 펼쳤을 때의 기록 원문 */
  note: string;
}

/** 두 단서 사이의 관계. Notebook 의 추리 판정 기준. */
export interface RelationDef {
  id: RelationId;
  pair: [EvidenceId, EvidenceId];
  caseId: CaseId;
  /** 연결 성립 시 기록되는 추론 문장 */
  deduction: string;
  /** 이 관계가 확정되면 해당 CASE 가 종결된다 */
  closesCase?: CaseId;
}

export type CaseStatus = "sealed" | "open" | "closed";

export interface CaseDef {
  id: CaseId;
  /** "00" */
  index: string;
  title: string;
  /** 사건의 핵심 질문 */
  question: string;
  /** 아직 열리지 않은 사건에 표시되는 한 줄 */
  teaser: string;
  evidenceIds: EvidenceId[];
  relationIds: RelationId[];
}

/** 평면도 위의 한 구획. 객실 / 벽 / 설비 모두 같은 구조로 다룬다. */
export type PlanSlotKind = "room" | "void" | "service" | "core";

export interface PlanSlot {
  id: LocationId;
  kind: PlanSlotKind;
  /** 브라스 번호판에 찍히는 문자열. void 는 없음 */
  number?: string;
  /** 도면 좌표 (viewBox 390 x 620 기준) */
  x: number; y: number; w: number; h: number;
  /** 도면 좌측 치수선에 찍히는 값 */
  dimension?: string;
  /** 복도 기준 어느 쪽 벽인가 */
  side: "west" | "east";
  /** 조사 시 시스템 로그 */
  log: string;
  /** 현재 층 기록에 존재하지 않는 구획 (복구 후 등장) */
  recoveredOnly?: boolean;
}

/** 3단계 힌트. 정답을 말하지 않고 관찰 → 관계 → 행동 순으로 좁힌다. */
export interface HintSet {
  /** 어떤 stage 에서 제공되는 힌트인가 */
  stage: Stage;
  /** 조사관 수첩 상단에 찍히는 현재 국면 */
  heading: string;
  steps: [string, string, string];
}

/** 기획서 §10 상태 머신 */
export type Stage =
  | "BOOT"
  | "MAP_UNDISCOVERED"
  | "WALL_CLUE_FOUND"
  | "CCTV_0417_FOUND"
  | "ROOM_504_DISCOVERED"
  | "ROOM_504_ENTERED"
  | "EVIDENCE_COLLECTED"
  | "NOTEBOOK_LINKED"
  | "CASE_00_CLOSED";

export interface GameState {
  schemaVersion: number;

  currentScene: SceneId;
  currentCase: CaseId;

  /* CASE 00 진행 플래그 */
  bootCompleted: boolean;
  wallTapCount: number;
  wallInvestigated: boolean;
  clue0417Found: boolean;
  cctvUnlocked: boolean;
  cctvOpened: boolean;
  cctv0417Observed: boolean;
  recordConflictSeen: boolean;
  room504Recovered: boolean;
  room504Revealed: boolean;
  room504Entered: boolean;
  photoInspected: boolean;
  photoBackInspected: boolean;
  clockMarkTapCount: number;
  clockMarkFound: boolean;
  notebookUnlocked: boolean;

  /* 누적 기록 */
  evidenceCollected: EvidenceId[];
  relationsConfirmed: RelationId[];
  relationsRejected: number;
  discoveries: LocationId[];
  inspected: string[];
  casesClosed: CaseId[];
  secrets: string[];

  /* 메타 */
  hintsUsed: Partial<Record<Stage, number>>;
  elapsedMs: number;
  startedAt: number;
  savedAt: number;
  muted: boolean;
}
