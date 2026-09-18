import { evidenceById } from "@/room0/data/evidence";
import { findRelation } from "@/room0/data/relations";
import { planSlot } from "@/room0/data/locations";
import { hypothesisById, hypothesisSatisfied, slotKey } from "@/room0/data/hypotheses";
import type { CaseId, EvidenceId, GameState, HypothesisId, SceneId, Stage } from "@/room0/state/types";

export const SCHEMA_VERSION = 1;

export const INITIAL_GAME: GameState = {
  schemaVersion: SCHEMA_VERSION,
  currentScene: "boot",
  currentCase: "case00",

  bootCompleted: false,
  wallTapCount: 0,
  wallInvestigated: false,
  clue0417Found: false,
  cctvUnlocked: false,
  cctvOpened: false,
  cctv0417Observed: false,
  recordConflictSeen: false,
  room504Recovered: false,
  room504Revealed: false,
  room504Entered: false,
  photoInspected: false,
  photoBackInspected: false,
  clockMarkTapCount: 0,
  clockMarkFound: false,
  notebookUnlocked: false,

  frontDeskUnlocked: false,
  keyLogOpened: false,
  key3317Inspected: false,
  cabinetInspected: false,
  routingInspected: false,
  dialed: [],
  phoneRinging: false,
  phoneAnswered: false,

  evidenceCollected: [],
  evidenceReviewed: [],
  hypothesisSlots: {},
  hypothesesConfirmed: [],
  hypothesisRejected: 0,
  relationsConfirmed: [],
  relationsRejected: 0,
  discoveries: [],
  inspected: [],
  casesClosed: [],
  secrets: [],

  hintsUsed: {},
  elapsedMs: 0,
  startedAt: 0,
  savedAt: 0,
  muted: false,
};

export type LogTone = "sys" | "alert" | "record";

export interface LogLine {
  id: number;
  text: string;
  tone: LogTone;
}

export interface Room0State {
  game: GameState;
  log: LogLine[];
  /** 방금 획득한 단서 — 상단 배너용. 소비 후 null. */
  banner: { code: string; label: string } | null;
}

export const INITIAL_STATE: Room0State = { game: INITIAL_GAME, log: [], banner: null };

export type Action =
  | { type: "hydrate"; game: GameState }
  | { type: "boot/complete" }
  | { type: "scene/go"; scene: SceneId }
  | { type: "map/tapWall" }
  | { type: "map/inspect"; slotId: string }
  | { type: "cctv/observe" }
  | { type: "cctv/recover" }
  | { type: "discovery/ack" }
  | { type: "room/enter504" }
  | { type: "room/inspect"; id: string; log: string }
  | { type: "room/photoOpen" }
  | { type: "room/photoFlip" }
  | { type: "room/clockTap" }
  | { type: "room/phone" }
  | { type: "desk/keyLog" }
  | { type: "desk/inspect"; id: string; log: string }
  | { type: "desk/key3317" }
  | { type: "desk/cabinet" }
  | { type: "desk/routing" }
  | { type: "desk/dial"; number: string }
  | { type: "room/answerPhone" }
  | { type: "note/review"; id: EvidenceId }
  | { type: "note/assign"; hypothesisId: HypothesisId; slotId: string; evidenceId: EvidenceId }
  | { type: "note/unassign"; hypothesisId: HypothesisId; slotId: string }
  | { type: "note/confirm"; hypothesisId: HypothesisId }
  | { type: "note/test"; a: EvidenceId; b: EvidenceId }
  | { type: "hint/use"; stage: Stage }
  | { type: "audio/toggleMute" }
  | { type: "time/tick"; ms: number }
  | { type: "banner/clear" }
  | { type: "game/reset" };

let logSeq = 0;

function pushLog(state: Room0State, text: string, tone: LogTone = "sys"): LogLine[] {
  logSeq += 1;
  return [...state.log, { id: logSeq, text, tone }].slice(-6);
}

/** 단서 획득. 이미 가진 단서는 조용히 무시한다. */
function grant(state: Room0State, game: GameState, id: EvidenceId): Room0State {
  if (game.evidenceCollected.includes(id)) return { ...state, game };
  const def = evidenceById(id);
  const nextGame: GameState = {
    ...game,
    evidenceCollected: [...game.evidenceCollected, id],
    notebookUnlocked: true,
  };
  return {
    game: nextGame,
    log: pushLog(state, `RECORDED — ${def ? `${def.label} / ${def.code}` : id}`, "record"),
    banner: def ? { code: def.code, label: def.label } : state.banner,
  };
}

export function reducer(state: Room0State, action: Action): Room0State {
  const g = state.game;

  switch (action.type) {
    case "hydrate":
      return { ...state, game: action.game };

    case "boot/complete": {
      const scene: SceneId = g.currentScene === "boot" ? "map" : g.currentScene;
      return {
        ...state,
        game: { ...g, bootCompleted: true, currentScene: scene, startedAt: g.startedAt || Date.now() },
        log: pushLog(state, "TERMINAL CONNECTED — 5F WEST WING", "sys"),
      };
    }

    case "scene/go": {
      if (action.scene === g.currentScene) return state;
      let next: Room0State = { ...state, game: { ...g, currentScene: action.scene } };
      if (action.scene === "cctv" && !g.cctvOpened) {
        next = { ...next, game: { ...next.game, cctvOpened: true } };
        next = { ...next, log: pushLog(next, "ARCHIVE MOUNTED — CAM 05-W / 5F WEST", "sys") };
        next = grant(next, next.game, "cam-05w");
      }
      return next;
    }

    case "map/tapWall": {
      if (g.clue0417Found) {
        return { ...state, log: pushLog(state, "THE MARKING IS ALREADY ON RECORD.", "sys") };
      }
      const count = g.wallTapCount + 1;
      const game = { ...g, wallTapCount: count, wallInvestigated: true };
      if (count === 1) {
        return { ...state, game, log: pushLog(state, "THE SURFACE IS COLDER THAN THE WALL BESIDE IT.", "sys") };
      }
      if (count === 2) {
        return { ...state, game, log: pushLog(state, "PLASTER OVER SOMETHING. THE SOUND IS HOLLOW.", "sys") };
      }
      const found: GameState = { ...game, clue0417Found: true, cctvUnlocked: true };
      let next: Room0State = {
        ...state,
        game: found,
        log: pushLog(state, "SCRATCHED INTO THE PLASTER. FOUR DIGITS.", "alert"),
      };
      next = grant(next, next.game, "plan-5fw");
      next = grant(next, next.game, "wall-0417");
      return { ...next, log: pushLog(next, "ARCHIVE REVIEW AVAILABLE — CAM 05-W", "alert") };
    }

    case "map/inspect": {
      const slot = planSlot(action.slotId);
      if (!slot) return state;
      return {
        ...state,
        game: g.inspected.includes(slot.id) ? g : { ...g, inspected: [...g.inspected, slot.id] },
        log: pushLog(state, slot.log, "sys"),
      };
    }

    case "cctv/observe": {
      if (g.cctv0417Observed) return state;
      const game: GameState = { ...g, cctv0417Observed: true, recordConflictSeen: true };
      let next: Room0State = {
        ...state,
        game,
        log: pushLog(state, "FRAME 04:17 — AN OPENING BETWEEN 503 AND 505.", "alert"),
      };
      next = grant(next, next.game, "cctv-504-door");
      return {
        ...next,
        log: pushLog(next, "RECORD CONFLICT — ARCHIVE 5F-W DOES NOT MATCH FLOOR RECORD 5F-W", "alert"),
      };
    }

    case "cctv/recover": {
      if (g.room504Recovered) return { ...state, game: { ...g, currentScene: "map" } };
      const game: GameState = {
        ...g,
        room504Recovered: true,
        currentScene: "discovery",
        discoveries: g.discoveries.includes("r504") ? g.discoveries : [...g.discoveries, "r504"],
      };
      let next: Room0State = { ...state, game, log: pushLog(state, "WRITING TO FLOOR RECORD 5F-W ...", "alert") };
      next = grant(next, next.game, "room-504");
      return next;
    }

    case "discovery/ack":
      return { ...state, game: { ...g, room504Revealed: true } };

    case "room/enter504":
      return {
        ...state,
        game: { ...g, room504Entered: true, room504Revealed: true, currentScene: "room504" },
        log: pushLog(state, "504 — DOOR UNSECURED. ENTERING.", "sys"),
      };

    case "room/inspect":
      return {
        ...state,
        game: g.inspected.includes(action.id) ? g : { ...g, inspected: [...g.inspected, action.id] },
        log: pushLog(state, action.log, "sys"),
      };

    case "room/photoOpen":
      if (g.photoInspected) return state;
      return {
        ...state,
        game: { ...g, photoInspected: true },
        log: pushLog(state, "THE SAME ROOM. SOMETHING HANGS ON THE EAST WALL.", "sys"),
      };

    case "room/photoFlip": {
      if (g.photoBackInspected) return state;
      const next: Room0State = { ...state, game: { ...g, photoBackInspected: true, photoInspected: true } };
      return grant(next, next.game, "photo-1987");
    }

    case "room/clockTap": {
      if (g.clockMarkFound) return { ...state, log: pushLog(state, "THE MARK IS ALREADY ON RECORD.", "sys") };
      const count = g.clockMarkTapCount + 1;
      if (count < 2) {
        return {
          ...state,
          game: { ...g, clockMarkTapCount: count },
          log: pushLog(state, "A RING OF UNFADED WALLPAPER. SOMETHING HUNG HERE FOR YEARS.", "sys"),
        };
      }
      const next: Room0State = {
        ...state,
        game: { ...g, clockMarkTapCount: count, clockMarkFound: true },
        log: pushLog(state, "TWO SHADOWS INSIDE THE RING. THE HANDS DID NOT MOVE AGAIN.", "alert"),
      };
      return grant(next, next.game, "clock-0213");
    }

    case "room/phone": {
      const next: Room0State = {
        ...state,
        game: g.inspected.includes("phone") ? g : { ...g, inspected: [...g.inspected, "phone"] },
        log: pushLog(state, "NO DIAL TONE. A NUMBER IS STAMPED UNDER THE DIAL.", "sys"),
      };
      return grant(next, next.game, "ext-3317");
    }

    /* 기록을 펼쳐 읽었다 */
    /* ── FRONT DESK ─────────────────────────────────── */

    case "desk/keyLog":
      if (g.keyLogOpened) return state;
      return {
        ...state,
        game: { ...g, keyLogOpened: true },
        log: pushLog(state, "KEY CONTROL — LEGACY LOG MOUNTED. RETURNS ONLY.", "sys"),
      };

    case "desk/inspect":
      return {
        ...state,
        game: g.inspected.includes(action.id) ? g : { ...g, inspected: [...g.inspected, action.id] },
        log: pushLog(state, action.log, "sys"),
      };

    case "desk/key3317": {
      if (g.key3317Inspected) return { ...state, log: pushLog(state, "NO MATCHING KEY PROFILE.", "sys") };
      const next: Room0State = {
        ...state,
        game: { ...g, key3317Inspected: true },
        log: pushLog(state, "KEY 3317 NOT FOUND. NO MATCHING KEY PROFILE.", "alert"),
      };
      return grant(next, next.game, "key-3317");
    }

    case "desk/cabinet": {
      if (g.cabinetInspected) return state;
      const next: Room0State = {
        ...state,
        game: { ...g, cabinetInspected: true },
        log: pushLog(state, "EVERY HOOK CHECKED. NO TAG IN THIS CABINET CARRIES 3317.", "alert"),
      };
      return grant(next, next.game, "cabinet-3317");
    }

    case "desk/routing": {
      if (g.routingInspected) return state;
      const next: Room0State = {
        ...state,
        game: { ...g, routingInspected: true },
        log: pushLog(state, "EXCHANGE WIRING TABLE — ONE LINE LEFT BLANK.", "alert"),
      };
      return grant(next, next.game, "routing-3314");
    }

    case "desk/dial": {
      const dialed = g.dialed.includes(action.number) ? g.dialed : [...g.dialed, action.number];
      if (action.number === "3317") {
        const next: Room0State = {
          ...state,
          game: { ...g, dialed, phoneRinging: true },
          log: pushLog(state, "RINGBACK. THE LINE IS OPEN SOMEWHERE IN THE BUILDING.", "alert"),
        };
        return { ...next, log: pushLog(next, "RING SIGNAL DETECTED — SOURCE NOT AT THIS DESK.", "alert") };
      }
      const responses: Record<string, string> = {
        "3314": "ROOM 501 — NO ANSWER.",
        "3315": "ROOM 502 — NO ANSWER.",
        "3316": "ROOM 503 — LINE DISCONNECTED.",
        "3318": "ROOM 505 — NO ANSWER.",
        "3319": "ROOM 506 — NO ANSWER.",
      };
      return {
        ...state,
        game: { ...g, dialed },
        log: pushLog(state, responses[action.number] ?? "INVALID INTERNAL EXTENSION.", "sys"),
      };
    }

    case "room/answerPhone": {
      if (!g.phoneRinging || g.phoneAnswered) return state;
      const next: Room0State = {
        ...state,
        game: { ...g, phoneAnswered: true, phoneRinging: false },
        log: pushLog(state, "LINE SOURCE CONFIRMED — EXT 3317 / ROOM 504.", "record"),
      };
      return grant(next, next.game, "line-3317");
    }

    case "note/review":
      if (g.evidenceReviewed.includes(action.id)) return state;
      return { ...state, game: { ...g, evidenceReviewed: [...g.evidenceReviewed, action.id] } };

    /* 가설의 한 칸에 기록을 배치한다. 맞지 않으면 시스템이 이유를 말할 뿐, 틀렸다고 하지 않는다. */
    case "note/assign": {
      const def = hypothesisById(action.hypothesisId);
      const slot = def?.slots.find((s) => s.id === action.slotId);
      if (!def || !slot) return state;

      if (!slot.accepts.includes(action.evidenceId)) {
        const ev = evidenceById(action.evidenceId);
        const reason = ev?.unresolved
          ? "NO DIRECT CONFLICT FOUND. THIS ENTRY REMAINS UNRESOLVED."
          : slot.reject;
        return {
          ...state,
          game: { ...g, hypothesisRejected: g.hypothesisRejected + 1 },
          log: pushLog(state, reason, "sys"),
        };
      }

      /* 같은 기록이 다른 칸에 들어가 있으면 옮긴다 */
      const slots: Record<string, EvidenceId> = { ...g.hypothesisSlots };
      for (const [k, v] of Object.entries(slots)) {
        if (v === action.evidenceId && k.startsWith(`${def.id}:`)) delete slots[k];
      }
      slots[slotKey(def.id, slot.id)] = action.evidenceId;

      const game: GameState = { ...g, hypothesisSlots: slots };
      const ready = hypothesisSatisfied(def, slots);
      let next: Room0State = {
        ...state,
        game,
        log: pushLog(state, `${slot.label} — ENTRY ACCEPTED.`, "record"),
      };
      if (ready && !g.hypothesesConfirmed.includes(def.id)) {
        next = { ...next, log: pushLog(next, "SUPPORT IS SUFFICIENT. HYPOTHESIS READY FOR REVIEW.", "alert") };
      }
      return next;
    }

    case "note/unassign": {
      const key = slotKey(action.hypothesisId, action.slotId);
      if (!(key in g.hypothesisSlots)) return state;
      const slots = { ...g.hypothesisSlots };
      delete slots[key];
      return { ...state, game: { ...g, hypothesisSlots: slots }, log: pushLog(state, "ENTRY WITHDRAWN.", "sys") };
    }

    /* 가설 검증 — 세계 상태가 함께 갱신된다 */
    case "note/confirm": {
      const def = hypothesisById(action.hypothesisId);
      if (!def) return state;
      if (g.hypothesesConfirmed.includes(def.id)) return state;
      if (!hypothesisSatisfied(def, g.hypothesisSlots)) {
        return { ...state, log: pushLog(state, "INSUFFICIENT CORRELATION.", "sys") };
      }

      /* 가설에 채택된 기록들 사이의 관계는 시스템이 자동으로 정리한다 */
      const used = def.slots
        .map((s) => g.hypothesisSlots[slotKey(def.id, s.id)])
        .filter((id): id is EvidenceId => Boolean(id));
      const auto = new Set(g.relationsConfirmed);
      for (let i = 0; i < used.length; i += 1) {
        for (let j = i + 1; j < used.length; j += 1) {
          const rel = findRelation(used[i], used[j]);
          if (rel) auto.add(rel.id);
        }
      }

      const casesClosed: CaseId[] = g.casesClosed.includes(def.caseId)
        ? g.casesClosed
        : [...g.casesClosed, def.caseId];

      const game: GameState = {
        ...g,
        hypothesesConfirmed: [...g.hypothesesConfirmed, def.id],
        relationsConfirmed: [...auto],
        casesClosed,
        currentCase: def.caseId === "case00" ? "case01" : g.currentCase,
        /* CASE 00 이 정리되면 프런트의 옛 기록에 접근할 수 있게 된다 */
        frontDeskUnlocked: def.caseId === "case00" ? true : g.frontDeskUnlocked,
      };

      let next: Room0State = { ...state, game, log: pushLog(state, "HYPOTHESIS SUPPORTED.", "record") };
      next = { ...next, log: pushLog(next, def.statement, "record") };
      next = { ...next, log: pushLog(next, `STATUS — ${def.status}`, "alert") };
      next = { ...next, log: pushLog(next, def.followupQuestion, "alert") };
      if (def.caseId === "case00") {
        next = { ...next, log: pushLog(next, "KEY CONTROL ARCHIVE AVAILABLE — FRONT DESK, GF", "alert") };
      }
      return next;
    }

    /* 참고용 교차 조회. 진행에는 관여하지 않는다. */
    case "note/test": {
      const rel = findRelation(action.a, action.b);
      if (!rel) {
        return {
          ...state,
          game: { ...g, relationsRejected: g.relationsRejected + 1 },
          log: pushLog(state, "NO DIRECT RELATION ESTABLISHED.", "sys"),
        };
      }
      if (g.relationsConfirmed.includes(rel.id)) {
        return { ...state, log: pushLog(state, "ALREADY ESTABLISHED.", "sys") };
      }
      return {
        ...state,
        game: { ...g, relationsConfirmed: [...g.relationsConfirmed, rel.id] },
        log: pushLog(state, rel.deduction, "record"),
      };
    }

    case "hint/use": {
      const used = g.hintsUsed[action.stage] ?? 0;
      return { ...state, game: { ...g, hintsUsed: { ...g.hintsUsed, [action.stage]: used + 1 } } };
    }

    case "audio/toggleMute":
      return { ...state, game: { ...g, muted: !g.muted } };

    case "time/tick":
      return { ...state, game: { ...g, elapsedMs: g.elapsedMs + action.ms } };

    case "banner/clear":
      return { ...state, banner: null };

    case "game/reset":
      return { game: { ...INITIAL_GAME, startedAt: Date.now() }, log: [], banner: null };

    default:
      return state;
  }
}

/** 기획서 §10 의 상태 머신을 플래그에서 파생한다. */
export function deriveStage(g: GameState): Stage {
  if (!g.bootCompleted) return "BOOT";
  if (g.casesClosed.includes("case01")) return "CASE_01_CLOSED";
  if (g.phoneAnswered) return "CASE_01_ANSWERED";
  if (g.phoneRinging) return "CASE_01_RINGING";
  if (g.routingInspected) return "CASE_01_PATTERN";
  if (g.frontDeskUnlocked) return "CASE_01_OPEN";
  if (g.casesClosed.includes("case00")) return "CASE_00_CLOSED";
  if (Object.keys(g.hypothesisSlots).length > 0) return "NOTEBOOK_LINKED";
  if (g.photoBackInspected && g.clockMarkFound) return "EVIDENCE_COLLECTED";
  if (g.room504Entered) return "ROOM_504_ENTERED";
  if (g.room504Recovered) return "ROOM_504_DISCOVERED";
  if (g.cctv0417Observed) return "CCTV_0417_FOUND";
  if (g.clue0417Found) return "WALL_CLUE_FOUND";
  return "MAP_UNDISCOVERED";
}
