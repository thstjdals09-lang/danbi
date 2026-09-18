import type { PlanSlot } from "@/room0/state/types";

/* 5F WEST WING 평면도 기하. viewBox 390 x 720.
   숫자는 도면 좌표이며, 최종 도면 아트로 교체할 때 이 파일만 맞추면 된다. */

export const PLAN = {
  viewBox: "0 0 390 720",
  outline: { x: 24, y: 66, w: 342, h: 570 },
  corridor: { x: 168, y: 78, w: 64, h: 548 },
  westRun: { x: 52, w: 116 },
  eastRun: { x: 232, w: 116 },
  dimensionX: 38,
  dimensionTop: 96,
  dimensionBottom: 590,
  titleY: 652,
  floorLabel: "5F — WEST WING",
} as const;

export const PLAN_SLOTS: PlanSlot[] = [
  { id: "r501", kind: "room", number: "501", side: "west", x: 52, y: 96, w: 116, h: 86, dimension: "3.60",
    log: "501 — VACANT. LAST CLEANED 11 DAYS AGO." },
  { id: "r502", kind: "room", number: "502", side: "west", x: 52, y: 190, w: 116, h: 86, dimension: "3.60",
    log: "502 — VACANT. DOOR CHAIN REPLACED 1994." },
  { id: "r503", kind: "room", number: "503", side: "west", x: 52, y: 284, w: 116, h: 86, dimension: "3.60",
    log: "503 — VACANT. SHARES EAST WALL WITH STRUCTURE." },

  /* 503 과 505 사이. 기록상으로는 그냥 벽이다. */
  { id: "void-5w", kind: "void", side: "west", x: 52, y: 378, w: 116, h: 118, dimension: "5.10",
    log: "SOLID CONSTRUCTION. NO OPENING ON RECORD." },

  { id: "r504", kind: "room", number: "504", side: "west", x: 52, y: 390, w: 116, h: 86, dimension: "3.60",
    recoveredOnly: true, log: "504 — RECOVERED FROM ARCHIVE. NOT IN CURRENT PROPERTY RECORD." },

  { id: "r505", kind: "room", number: "505", side: "west", x: 52, y: 504, w: 116, h: 86, dimension: "3.60",
    log: "505 — VACANT. WINDOW SEALED BY MAINTENANCE." },

  { id: "r506", kind: "room", number: "506", side: "east", x: 232, y: 96, w: 116, h: 86,
    log: "506 — VACANT. EAST EXPOSURE." },
  { id: "linen", kind: "service", number: "LINEN", side: "east", x: 232, y: 190, w: 116, h: 72,
    log: "LINEN STORE — LOCKED. KEY HELD AT FRONT DESK." },
  { id: "elev", kind: "core", number: "ELEV", side: "east", x: 232, y: 270, w: 116, h: 90,
    log: "CAR 2 — IN SERVICE. MAINTENANCE NOTE ATTACHED. NOTE UNREADABLE." },
  { id: "stair", kind: "core", number: "STAIR", side: "east", x: 232, y: 368, w: 116, h: 86,
    log: "WEST STAIR — FIRE DOOR. ALARM ARMED." },
  { id: "mech", kind: "service", number: "MECH", side: "east", x: 232, y: 462, w: 116, h: 128,
    log: "MECHANICAL — RISER ACCESS. CONTINUES BELOW 5F." },
];

export function planSlot(id: string): PlanSlot | undefined {
  return PLAN_SLOTS.find((s) => s.id === id);
}
