"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/room0/state/GameProvider";
import { AssistPanel } from "@/room0/components/AssistPanel";
import { caseById } from "@/room0/data/cases";
import type { SceneId } from "@/room0/state/types";

function clock(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

/** 시스템 로그 — 화면 하단에 흘러가는 터미널 줄. 퍼즐 정보가 아니라 반응이다. */
function SystemLog() {
  const { state } = useGame();
  const lines = state.log.slice(-3);
  return (
    <div className="r0-log" aria-live="polite">
      {lines.map((line, i) => (
        <p key={line.id} className={`r0-log__line r0-log__line--${line.tone}`} data-depth={lines.length - 1 - i}>
          <span aria-hidden className="r0-log__mark">{line.tone === "alert" ? "!" : line.tone === "record" ? "+" : ">"}</span>
          {line.text}
        </p>
      ))}
    </div>
  );
}

/** 단서 획득 시 상단에 잠깐 찍히는 기록 스트립. */
function RecordBanner() {
  const { state, dispatch } = useGame();
  const banner = state.banner;
  useEffect(() => {
    if (!banner) return;
    const id = window.setTimeout(() => dispatch({ type: "banner/clear" }), 2800);
    return () => window.clearTimeout(id);
  }, [banner, dispatch]);
  if (!banner) return null;
  return (
    <div className="r0-banner" role="status">
      <span className="r0-banner__tag">RECORDED</span>
      <span className="r0-banner__label">{banner.label}</span>
      <span className="r0-banner__code">{banner.code}</span>
    </div>
  );
}

const NAV: { scene: SceneId; label: string }[] = [
  { scene: "map", label: "MAP" },
  { scene: "cctv", label: "CCTV" },
  { scene: "notebook", label: "NOTE" },
];

export function SystemFrame({ children }: { children: React.ReactNode }) {
  const { game, stage, dispatch, fx } = useGame();
  const [assistOpen, setAssistOpen] = useState(false);
  const activeId = game.casesClosed.includes("case00") ? "case01" : "case00";
  const activeCase = caseById(activeId);
  const caseState = game.casesClosed.includes(activeId) ? "CLOSED" : "OPEN";

  const locked = (scene: SceneId) =>
    (scene === "cctv" && !game.cctvUnlocked) || (scene === "notebook" && !game.notebookUnlocked);

  const alerting = (scene: SceneId) =>
    (scene === "cctv" && game.cctvUnlocked && !game.cctv0417Observed) ||
    (scene === "notebook" &&
      game.evidenceCollected.length >= 2 &&
      game.hypothesesConfirmed.length === 0);

  const go = (scene: SceneId) => {
    if (locked(scene)) {
      fx("deny", "deny");
      dispatch({
        type: "room/inspect",
        id: `nav-${scene}`,
        log: scene === "cctv" ? "NO ARCHIVE REVIEW SCHEDULED." : "NO RECORDS FILED YET.",
      });
      return;
    }
    fx("tap", "touch");
    dispatch({ type: "scene/go", scene });
  };

  return (
    <div className="r0-frame">
      <header className="r0-bar">
        <div className="r0-bar__row">
          <span className="r0-bar__brand">NULL HOTEL</span>
          <span className="r0-bar__sys">PMS 4.11</span>
          <div className="r0-bar__tools">
            <button
              type="button"
              className="r0-chip"
              aria-pressed={game.muted}
              onClick={() => {
                dispatch({ type: "audio/toggleMute" });
                fx(null, "touch");
              }}
            >
              AUDIO {game.muted ? "OFF" : "ON"}
            </button>
            <button type="button" className="r0-chip" onClick={() => { fx("tap", "touch"); setAssistOpen(true); }}>
              ASSIST
            </button>
          </div>
        </div>
        <div className="r0-bar__row r0-bar__row--meta">
          <span>{game.currentScene === "frontdesk" ? "GF — FRONT DESK" : "5F WEST WING"}</span>
          <span className="r0-bar__sep" aria-hidden>·</span>
          <span>
            CASE {activeCase.index} {caseState}
          </span>
          <span className="r0-bar__sep" aria-hidden>·</span>
          <span className="r0-bar__time">{clock(game.elapsedMs)}</span>
        </div>
      </header>

      <div className="r0-stage">
        <RecordBanner />
        {children}
        <SystemLog />
      </div>

      <nav className="r0-nav" aria-label="SYSTEM">
        {NAV.map((item) => (
          <button
            key={item.scene}
            type="button"
            className="r0-nav__item"
            data-active={game.currentScene === item.scene}
            data-locked={locked(item.scene)}
            aria-current={game.currentScene === item.scene ? "page" : undefined}
            onClick={() => go(item.scene)}
          >
            <span className="r0-nav__label">{item.label}</span>
            <span className="r0-nav__state">
              {locked(item.scene)
                ? "LOCKED"
                : alerting(item.scene)
                  ? "REVIEW"
                  : item.scene === "notebook"
                    ? `${game.evidenceCollected.length} REC`
                    : item.scene === "cctv"
                      ? "05-W"
                      : "5F-W"}
            </span>
            {alerting(item.scene) && <span className="r0-nav__alert" aria-hidden />}
          </button>
        ))}
      </nav>

      {assistOpen && <AssistPanel stage={stage} onClose={() => setAssistOpen(false)} />}
    </div>
  );
}
