import type { GameState } from "@/room0/state/types";
import { INITIAL_GAME, SCHEMA_VERSION } from "@/room0/state/reducer";

const KEY = "room0.save";

/** 저장 스키마가 올라가면 여기서 이전 세이브를 끌어올린다. */
function migrate(raw: Partial<GameState> & { schemaVersion?: number }): GameState {
  const merged: GameState = { ...INITIAL_GAME, ...raw, schemaVersion: SCHEMA_VERSION };
  // 배열 필드가 손상된 세이브에서도 게임이 깨지지 않도록 방어한다.
  const arrays = ["evidenceCollected", "evidenceReviewed", "hypothesesConfirmed", "relationsConfirmed", "discoveries", "inspected", "casesClosed", "secrets", "dialed", "auditDatesOpened"] as const;
  for (const k of arrays) if (!Array.isArray(merged[k])) (merged[k] as unknown as string[]) = [];
  if (typeof merged.hintsUsed !== "object" || merged.hintsUsed === null) merged.hintsUsed = {};
  if (typeof merged.hypothesisSlots !== "object" || merged.hypothesisSlots === null) merged.hypothesisSlots = {};
  /* 예전 세이브에서 CASE 00 을 이미 끝냈다면 프런트 접근을 열어 준다 */
  if (merged.casesClosed.includes("case00")) merged.frontDeskUnlocked = true;
  if (merged.casesClosed.includes("case01")) merged.archiveUnlocked = true;
  if (merged.currentScene === "boot" || merged.currentScene === "discovery") {
    // 부팅/연출 장면은 복원 대상이 아니다. 진행도에 맞는 장면으로 되돌린다.
    merged.currentScene = merged.room504Entered ? "room504" : "map";
  }
  return merged;
}

export function loadGame(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GameState>;
    if (!parsed || typeof parsed !== "object") return null;
    return migrate(parsed);
  } catch {
    return null;
  }
}

export function saveGame(game: GameState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...game, savedAt: Date.now() }));
  } catch {
    /* 사파리 프라이빗 모드 등에서 저장이 막혀도 플레이는 계속된다. */
  }
}

export function clearGame(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}
