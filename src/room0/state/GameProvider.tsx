"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { INITIAL_STATE, deriveStage, reducer, type Action, type Room0State } from "@/room0/state/reducer";
import { clearGame, loadGame, saveGame } from "@/room0/state/persist";
import { roomTone, type Cue } from "@/room0/fx/audio";
import { haptic, type HapticKind } from "@/room0/fx/haptics";
import type { EvidenceId, GameState, Stage } from "@/room0/state/types";

interface GameContextValue {
  state: Room0State;
  game: GameState;
  stage: Stage;
  dispatch: (action: Action) => void;
  /** 소리 + 진동을 한 번에. 둘 다 없어도 게임은 성립한다. */
  fx: (cue: Cue | null, kind?: HapticKind | null) => void;
  has: (id: EvidenceId) => boolean;
  reducedMotion: boolean;
  startAudio: () => void;
  /** 이번 페이지 로드에서 단말에 접속했는가. 새로고침 시 RECONNECT 게이트가 된다. */
  connected: boolean;
  markConnected: () => void;
  reset: () => void;
  restored: boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

const TICK_MS = 5000;

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [restored, setRestored] = useState(false);
  const [connected, setConnected] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const saveTimer = useRef<number | null>(null);

  /* 저장된 진행 복원 */
  useEffect(() => {
    const saved = loadGame();
    if (saved) {
      dispatch({ type: "hydrate", game: saved });
      setRestored(saved.bootCompleted);
    }
    setHydrated(true);
  }, []);

  /* 자동 저장 */
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => saveGame(state.game), 250);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [state.game, hydrated]);

  /* 탭을 닫거나 숨길 때 즉시 저장 */
  useEffect(() => {
    if (!hydrated) return;
    const flush = () => saveGame(state.game);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flush);
    };
  }, [state.game, hydrated]);

  /* 플레이 시간 누적 */
  useEffect(() => {
    if (!hydrated || !state.game.bootCompleted) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") dispatch({ type: "time/tick", ms: TICK_MS });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [hydrated, state.game.bootCompleted]);

  /* reduced-motion */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  /* mute 상태 반영 */
  useEffect(() => {
    roomTone.setMuted(state.game.muted);
  }, [state.game.muted]);

  const markConnected = useCallback(() => setConnected(true), []);

  const startAudio = useCallback(() => {
    roomTone.start(state.game.muted);
  }, [state.game.muted]);

  const fx = useCallback((cue: Cue | null, kind: HapticKind | null = "touch") => {
    if (cue) roomTone.cue(cue);
    if (kind) haptic(kind);
  }, []);

  const has = useCallback((id: EvidenceId) => state.game.evidenceCollected.includes(id), [state.game.evidenceCollected]);

  const reset = useCallback(() => {
    clearGame();
    dispatch({ type: "game/reset" });
    setRestored(false);
    setConnected(false);
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      game: state.game,
      stage: deriveStage(state.game),
      dispatch,
      fx,
      has,
      reducedMotion,
      startAudio,
      connected,
      markConnected,
      reset,
      restored,
    }),
    [state, fx, has, reducedMotion, startAudio, connected, markConnected, reset, restored],
  );

  if (!hydrated) return null;

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
