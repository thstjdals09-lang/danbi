import { evidenceById } from "@/room0/data/evidence";
import { findRelation } from "@/room0/data/relations";
import { planSlot } from "@/room0/data/locations";
import type { CaseId, EvidenceId, GameState, SceneId, Stage } from "@/room0/state/types";

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

  evidenceCollected: [],
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

    case "note/test": {
      const rel = findRelation(action.a, action.b);
      if (!rel) {
        return {
          ...state,
          game: { ...g, relationsRejected: g.relationsRejected + 1 },
          log: pushLog(state, "THE RECORD DOES NOT SUPPORT THAT.", "sys"),
        };
      }
      if (g.relationsConfirmed.includes(rel.id)) {
        return { ...state, log: pushLog(state, "ALREADY ESTABLISHED.", "sys") };
      }
      const casesClosed: CaseId[] =
        rel.closesCase && !g.casesClosed.includes(rel.closesCase)
          ? [...g.casesClosed, rel.closesCase]
          : g.casesClosed;
      const game: GameState = {
        ...g,
        relationsConfirmed: [...g.relationsConfirmed, rel.id],
        casesClosed,
        currentCase: rel.closesCase === "case00" ? "case01" : g.currentCase,
      };
      let next: Room0State = { ...state, game, log: pushLog(state, rel.deduction, "record") };
      if (rel.closesCase) {
        next = { ...next, log: pushLog(next, "CASE 00 CLOSED — FILE SEALED AND FORWARDED.", "alert") };
        next = { ...next, log: pushLog(next, "INCOMING — KEY INDEX 5F: 3317 NOT ISSUED.", "alert") };
      }
      return next;
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
  if (g.casesClosed.includes("case00")) return "CASE_00_CLOSED";
  if (g.relationsConfirmed.length > 0) return "NOTEBOOK_LINKED";
  if (g.photoBackInspected && g.clockMarkFound) return "EVIDENCE_COLLECTED";
  if (g.room504Entered) return "ROOM_504_ENTERED";
  if (g.room504Recovered) return "ROOM_504_DISCOVERED";
  if (g.cctv0417Observed) return "CCTV_0417_FOUND";
  if (g.clue0417Found) return "WALL_CLUE_FOUND";
  return "MAP_UNDISCOVERED";
}
