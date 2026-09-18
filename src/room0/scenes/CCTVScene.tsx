"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGame } from "@/room0/state/GameProvider";

/* CAM 05-W — 5F 서측 복도. 1소점 투시로 그린 정지 아카이브.
   04:17 프레임에만 503 과 505 사이에 개구부가 존재한다. */

const ANOMALY_MINUTE = 17;
const HOLD_MS = 1200;

/* 1소점 투시. 소실점은 화면 중앙, 복도 끝면은 FAR 사각형.
   t = 깊이 (0 = 카메라 바로 앞, 1 = 복도 끝), f = 벽면 높이 비율 (0 = 천장, 1 = 바닥) */
const CAM = { w: 390, h: 330 };
const FAR = { x0: 158, x1: 232, y0: 118, y1: 212 };

const wallX = (t: number) => FAR.x0 * t;
const wallTop = (t: number) => FAR.y0 * t;
const wallBot = (t: number) => CAM.h + (FAR.y1 - CAM.h) * t;
const wallY = (t: number, f: number) => wallTop(t) + f * (wallBot(t) - wallTop(t));

/* 오른쪽 벽면 (대칭) */
const rightX = (t: number) => CAM.w + (FAR.x1 - CAM.w) * t;

function doorPoints(t0: number, t1: number, f0 = 0.2, f1 = 0.88): string {
  return [
    `${wallX(t0)},${wallY(t0, f0)}`,
    `${wallX(t1)},${wallY(t1, f0)}`,
    `${wallX(t1)},${wallY(t1, f1)}`,
    `${wallX(t0)},${wallY(t0, f1)}`,
  ].join(" ");
}

const DOORS: { id: string; number: string; t0: number; t1: number }[] = [
  { id: "d501", number: "501", t0: 0.02, t1: 0.19 },
  { id: "d502", number: "502", t0: 0.28, t1: 0.41 },
  { id: "d503", number: "503", t0: 0.49, t1: 0.59 },
  { id: "d505", number: "505", t0: 0.75, t1: 0.82 },
];

/* 기록에 없는 문. 503 과 505 사이. */
const HIDDEN_DOOR = { t0: 0.64, t1: 0.71 };

/* 문은 벽면에 파인 개구부다. 가까운 쪽 문설주만 빛을 받는다. */
function CamDoor({ t0, t1, number, ghost }: { t0: number; t1: number; number: string; ghost?: boolean }) {
  const F0 = 0.26;
  const F1 = 0.9;
  const mid = (t0 + t1) / 2;
  const cx = (wallX(t0) + wallX(t1)) / 2;
  const scale = 1 - t0 * 0.72;
  const plateY = wallY(mid, F0) + 9 * scale;
  return (
    <g className={`r0-cam__door${ghost ? " r0-cam__door--ghost" : ""}`}>
      <polygon points={doorPoints(t0, t1, F0, F1)} />
      {/* 문설주 */}
      <line x1={wallX(t0)} y1={wallY(t0, F0)} x2={wallX(t0)} y2={wallY(t0, F1)} className="r0-cam__jamb" />
      <line x1={wallX(t0)} y1={wallY(t0, F0)} x2={wallX(t1)} y2={wallY(t1, F0)} className="r0-cam__lintel" />
      {/* 문 밑으로 새는 빛 */}
      <polygon points={doorPoints(t0, t1, F1 - 0.025, F1)} className="r0-cam__sill" />
      <rect
        x={cx - 10 * scale}
        y={plateY - 7 * scale}
        width={20 * scale}
        height={10 * scale}
        className="r0-cam__plateBack"
      />
      <text x={cx} y={plateY + 1 * scale} fontSize={Math.max(6, 8 * scale)} className="r0-cam__plate">
        {number}
      </text>
    </g>
  );
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function CCTVScene() {
  const { game, dispatch, fx, reducedMotion } = useGame();
  const [minute, setMinute] = useState(game.cctv0417Observed ? ANOMALY_MINUTE : 0);
  const [holding, setHolding] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const holdRef = useRef<number | null>(null);
  const seenRef = useRef(game.cctv0417Observed);

  const atAnomaly = minute === ANOMALY_MINUTE;

  /* 04:17 도달 — 최초 1회만 기록에 남는다. */
  useEffect(() => {
    if (!atAnomaly) return;
    if (!seenRef.current) {
      seenRef.current = true;
      fx("anomaly", "anomaly");
      dispatch({ type: "cctv/observe" });
    }
  }, [atAnomaly, dispatch, fx]);

  const minuteRef = useRef(minute);
  minuteRef.current = minute;

  const setFromClientX = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const next = Math.round(ratio * 59);
    if (next === minuteRef.current) return;
    minuteRef.current = next;
    fx("tap", null);
    setMinute(next);
  }, [fx]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons === 0 && e.pointerType === "mouse") return;
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    setFromClientX(e.clientX);
  };

  const step = (delta: number) => {
    setMinute((m) => Math.min(59, Math.max(0, m + delta)));
    fx("tap", "touch");
  };

  /* RECOVER RECORD — 길게 눌러야 기록이 덮어써진다. */
  const startHold = () => {
    if (holdRef.current) return;
    const began = Date.now();
    fx("tap", "touch");
    holdRef.current = window.setInterval(() => {
      const p = Math.min(1, (Date.now() - began) / HOLD_MS);
      setHolding(p);
      if (p >= 1) {
        stopHold(true);
        fx("recover", "recover");
        dispatch({ type: "cctv/recover" });
      }
    }, 40);
  };

  const stopHold = (done = false) => {
    if (holdRef.current) {
      window.clearInterval(holdRef.current);
      holdRef.current = null;
    }
    if (!done) setHolding(0);
  };

  useEffect(() => () => stopHold(), []);

  const conflict = game.cctv0417Observed && !game.room504Recovered;

  return (
    <div className="r0-scene r0-scene--cctv">
      <div className="r0-cam__head">
        <span className="r0-cam__id">CAM 05-W</span>
        <span className="r0-cam__loc">5F WEST CORRIDOR</span>
        <span className="r0-cam__date">17 OCT ▟▚▟▚</span>
      </div>

      <div
        className="r0-cam__monitor"
        data-anomaly={atAnomaly ? "true" : undefined}
        data-still={reducedMotion ? "true" : undefined}
      >
        <svg viewBox={`0 0 ${CAM.w} ${CAM.h}`} className="r0-cam__feed" role="img" aria-label={`CAM 05-W 04:${pad(minute)} 정지 화면`}>
          <defs>
            <linearGradient id="r0-cam-floor" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#14160f" />
              <stop offset="100%" stopColor="#272a1e" />
            </linearGradient>
            <radialGradient id="r0-cam-vig" cx="50%" cy="50%" r="70%">
              <stop offset="55%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.85)" />
            </radialGradient>
            <linearGradient id="r0-cam-wallL" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2a2e20" />
              <stop offset="100%" stopColor="#171a11" />
            </linearGradient>
            <linearGradient id="r0-cam-wallR" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor="#23271b" />
              <stop offset="100%" stopColor="#15180f" />
            </linearGradient>
            <filter id="r0-cam-noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={minute} />
              <feColorMatrix type="saturate" values="0" />
            </filter>
          </defs>

          <rect x="0" y="0" width={CAM.w} height={CAM.h} fill="#0d0f0a" />
          {/* 천장 / 바닥 / 양쪽 벽 / 복도 끝면 */}
          <polygon points={`0,0 ${CAM.w},0 ${FAR.x1},${FAR.y0} ${FAR.x0},${FAR.y0}`} fill="#171a11" />
          <polygon points={`0,${CAM.h} ${CAM.w},${CAM.h} ${FAR.x1},${FAR.y1} ${FAR.x0},${FAR.y1}`} fill="url(#r0-cam-floor)" />
          <polygon points={`${CAM.w},0 ${FAR.x1},${FAR.y0} ${FAR.x1},${FAR.y1} ${CAM.w},${CAM.h}`} fill="url(#r0-cam-wallR)" />
          <polygon points={`0,0 ${FAR.x0},${FAR.y0} ${FAR.x0},${FAR.y1} 0,${CAM.h}`} fill="url(#r0-cam-wallL)" />
          <rect x={FAR.x0} y={FAR.y0} width={FAR.x1 - FAR.x0} height={FAR.y1 - FAR.y0} fill="#0f1109" />
          <rect x={FAR.x0 + 16} y={FAR.y0 + 12} width={FAR.x1 - FAR.x0 - 32} height={26} className="r0-cam__endWindow" />

          {/* 천장 조명 */}
          {[0.1, 0.32, 0.54, 0.72].map((t) => (
            <rect
              key={t}
              x={(CAM.w / 2) * (1 - t) + ((FAR.x0 + FAR.x1) / 2) * t - 28 * (1 - t) - 5}
              y={10 + (FAR.y0 - 14 - 10) * t}
              width={56 * (1 - t) + 10}
              height={6 * (1 - t) + 2}
              className="r0-cam__lamp"
            />
          ))}

          {/* 벽면 수평선 — 굽도리와 허리높이 몰딩. 이 두 선이 벽을 벽처럼 보이게 한다 */}
          {[0.34, 0.9].map((f) => (
            <g key={`rail${f}`}>
              <line x1={wallX(0)} y1={wallY(0, f)} x2={wallX(0.985)} y2={wallY(0.985, f)} className="r0-cam__rail" />
              <line x1={rightX(0)} y1={wallY(0, f)} x2={rightX(0.985)} y2={wallY(0.985, f)} className="r0-cam__rail" />
            </g>
          ))}

          {/* 카펫 이음선 */}
          {[0.18, 0.42, 0.64, 0.82].map((t) => (
            <line key={`c${t}`} x1={wallX(t)} y1={wallBot(t)} x2={rightX(t)} y2={wallBot(t)} className="r0-cam__carpet" />
          ))}

          {/* 기록에 있는 문 */}
          {DOORS.map((d) => (
            <CamDoor key={d.id} t0={d.t0} t1={d.t1} number={d.number} />
          ))}

          {/* 기록에 없는 문 — 04:17 프레임에만 존재한다 */}
          {atAnomaly && <CamDoor t0={HIDDEN_DOOR.t0} t1={HIDDEN_DOOR.t1} number="504" ghost />}

          <rect x="0" y="0" width={CAM.w} height={CAM.h} fill="url(#r0-cam-vig)" />
          <rect x="0" y="0" width={CAM.w} height={CAM.h} filter="url(#r0-cam-noise)" className="r0-cam__grain" />
        </svg>

        <div className="r0-cam__scan" aria-hidden />
        <div className="r0-cam__osd">
          <span className="r0-cam__rec">
            <i aria-hidden /> REC
          </span>
          <span className="r0-cam__stamp">
            17 OCT ▟▚▟▚ &nbsp; 04:{pad(minute)}:0▚
          </span>
        </div>
      </div>

      <div className="r0-cam__deck">
        <div className="r0-cam__readout">
          <span className="r0-cam__read">04:{pad(minute)}</span>
          <span className="r0-cam__span">ARCHIVE 04:00 — 04:59</span>
        </div>

        <div className="r0-cam__transport">
          <button type="button" className="r0-cam__step" onClick={() => step(-1)} aria-label="1분 뒤로">
            ◀
          </button>
          <div
            ref={trackRef}
            className="r0-cam__track"
            role="slider"
            tabIndex={0}
            aria-label="아카이브 타임라인"
            aria-valuemin={0}
            aria-valuemax={59}
            aria-valuenow={minute}
            aria-valuetext={`04:${pad(minute)}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
              if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
            }}
          >
            {[0, 15, 30, 45, 59].map((m) => (
              <span key={m} className="r0-cam__tick" style={{ left: `${(m / 59) * 100}%` }}>
                <i aria-hidden />
                <em>04:{pad(m)}</em>
              </span>
            ))}
            <span className="r0-cam__knob" style={{ left: `${(minute / 59) * 100}%` }} aria-hidden />
          </div>
          <button type="button" className="r0-cam__step" onClick={() => step(1)} aria-label="1분 앞으로">
            ▶
          </button>
        </div>

        {conflict && (
          <div className="r0-conflict" role="alert">
            <p className="r0-conflict__line">
              RECORD CONFLICT — ARCHIVE 5F-W SHOWS 6 OPENINGS. FLOOR RECORD 5F-W SHOWS 5.
            </p>
            <button
              type="button"
              className="r0-conflict__hold"
              style={{ ["--p" as string]: `${Math.round(holding * 100)}%` }}
              onPointerDown={startHold}
              onPointerUp={() => stopHold()}
              onPointerLeave={() => stopHold()}
              onPointerCancel={() => stopHold()}
            >
              <span className="r0-conflict__fill" aria-hidden />
              <span className="r0-conflict__text">HOLD — RECOVER FLOOR RECORD</span>
            </button>
          </div>
        )}

        {game.room504Recovered && (
          <p className="r0-cam__done">FLOOR RECORD 5F-W ALREADY RECOVERED. 6 UNITS ON FILE.</p>
        )}
      </div>
    </div>
  );
}
