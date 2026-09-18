"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/room0/state/GameProvider";

/* 504호 최초 발견. 토스트 하나로 끝내지 않는다:
   기록이 덮어써지고, 화면이 꺼지고, 실제 문이 남는다. */

const WRITE_LOG = [
  "WRITING TO FLOOR RECORD 5F-W ...",
  "SECTOR 5W / OFFSET 0504 / 118 BYTES",
  "REMOVING WALL SEGMENT W-503/505",
  "UNIT 504 ................ RESTORED",
  "PROPERTY RECORD UPDATED — 6 UNITS ON FILE",
];

export function DiscoveryScene() {
  const { dispatch, fx, reducedMotion } = useGame();
  const [phase, setPhase] = useState<0 | 1 | 2>(reducedMotion ? 2 : 0);
  const [written, setWritten] = useState(reducedMotion ? WRITE_LOG.length : 0);

  useEffect(() => {
    if (reducedMotion) {
      dispatch({ type: "discovery/ack" });
      return;
    }
    const timers: number[] = [];
    WRITE_LOG.forEach((_, i) => {
      timers.push(window.setTimeout(() => setWritten(i + 1), 260 + i * 420));
    });
    timers.push(window.setTimeout(() => setPhase(1), 260 + WRITE_LOG.length * 420 + 500));
    timers.push(
      window.setTimeout(() => {
        setPhase(2);
        fx("door", "recover");
        dispatch({ type: "discovery/ack" });
      }, 260 + WRITE_LOG.length * 420 + 1400),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [dispatch, fx, reducedMotion]);

  return (
    <div className="r0-discovery" data-phase={phase}>
      {phase === 0 && (
        <pre className="r0-discovery__write">
          {WRITE_LOG.slice(0, written).map((line) => (
            <span key={line}>{line}</span>
          ))}
        </pre>
      )}

      {phase === 1 && <div className="r0-discovery__dark" aria-hidden />}

      {phase === 2 && (
        <div className="r0-discovery__reveal">
          <p className="r0-discovery__eyebrow">NEW LOCATION DISCOVERED</p>

          <button
            type="button"
            className="r0-door"
            onClick={() => {
              fx("door", "recover");
              dispatch({ type: "room/enter504" });
            }}
            aria-label="504호 진입"
          >
            <svg viewBox="0 0 260 400" className="r0-door__svg" aria-hidden>
              <defs>
                <linearGradient id="r0-door-wood" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2a2118" />
                  <stop offset="45%" stopColor="#3a2e21" />
                  <stop offset="100%" stopColor="#241c14" />
                </linearGradient>
                <linearGradient id="r0-brass" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c9a86a" />
                  <stop offset="55%" stopColor="#8d7239" />
                  <stop offset="100%" stopColor="#b59a5f" />
                </linearGradient>
              </defs>

              <rect x="0" y="0" width="260" height="400" fill="#141510" />
              <rect x="18" y="8" width="224" height="374" fill="#191a13" />
              <rect x="30" y="16" width="200" height="366" fill="url(#r0-door-wood)" />
              <rect x="46" y="40" width="168" height="130" className="r0-door__panel" />
              <rect x="46" y="196" width="168" height="150" className="r0-door__panel" />

              {/* 브라스 번호판 */}
              <rect x="96" y="66" width="68" height="34" rx="2" fill="url(#r0-brass)" />
              <text x="130" y="91" className="r0-door__plate">504</text>

              {/* 손잡이 */}
              <circle cx="206" cy="212" r="9" fill="url(#r0-brass)" />
              <rect x="200" y="226" width="12" height="16" rx="2" fill="#7a6432" />

              {/* 문 밑 빛 */}
              <rect x="30" y="376" width="200" height="6" className="r0-door__light" />
              <rect x="0" y="382" width="260" height="18" fill="#1a160f" />
            </svg>

            <span className="r0-door__cta">ENTER</span>
          </button>

          <h2 className="r0-discovery__title">ROOM 504</h2>
          <p className="r0-discovery__sub">This room is absent from the current property record.</p>

          <button
            type="button"
            className="r0-discovery__later"
            onClick={() => {
              fx("tap", "touch");
              dispatch({ type: "scene/go", scene: "map" });
            }}
          >
            BACK TO FLOOR PLAN
          </button>
        </div>
      )}
    </div>
  );
}
