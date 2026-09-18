"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGame } from "@/room0/state/GameProvider";
import { SCENE_ASSETS } from "@/room0/assets";
import { SceneImage, patchStyle } from "@/room0/components/SceneImage";
import { CorridorFallback } from "@/room0/scenes/CorridorFallback";

/* CAM 05-W — 5F 서측 복도 아카이브.
   게임 로직(타임라인 · 04:17 · 기록 충돌 · HOLD 복구)은 그대로 두고
   화면만 실제 복도 사진으로 바꾼다.

   NORMAL 과 04:17 은 같은 사진 한 장에서 나온다:
   평소에는 504 자리의 문을 같은 사진의 벽면으로 덮어 두고, 04:17 에만 그 패치를 걷는다.
   그래서 카메라 · 구도 · 조명 · 카펫이 완전히 동일하고,
   플레이어는 "이미지가 바뀌었다" 가 아니라 "원래 저기에 문이 있었나?" 라고 느낀다. */

const ANOMALY_MINUTE = 17;
const HOLD_MS = 1600;
/** 04:17 에 도달하고 나서 시스템이 끼어들기까지. 먼저 플레이어가 직접 본다. */
const NOTICE_DELAY_MS = 700;

/* 사진 기준 좌표(%) — 최종 아트를 교체하면 이 값만 맞추면 된다. */
const DOOR_PATCH = { x: 21.2, y: 31.4, w: 6.8, h: 45.6 };
const PATCH_SOURCE = { x: 62, y: 31.4 };

const PLATES = [
  { id: "505", number: "505", x: 12.7, y: 42.6, w: 4.2 },
  { id: "503", number: "503", x: 30.4, y: 43.2, w: 2.2 },
];
const ANOMALY_PLATE = { number: "504", x: 24.7, y: 42.9, w: 2.9 };

const HOLD_STEPS = [
  "VERIFYING ARCHIVE",
  "LOCATING CONFLICT",
  "REMOVING WALL SEGMENT W-503/505",
  "WRITING UNIT RECORD",
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function Plate({ number, x, y, w }: { number: string; x: number; y: number; w: number }) {
  return (
    <span
      className="r0-cam__plate"
      style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, fontSize: `${(w * 0.5).toFixed(2)}cqw` }}
    >
      {number}
    </span>
  );
}

export function CCTVScene() {
  const { game, dispatch, fx, reducedMotion } = useGame();
  const [minute, setMinute] = useState(game.cctv0417Observed ? ANOMALY_MINUTE : 0);
  const [holding, setHolding] = useState(0);
  const [noticed, setNoticed] = useState(game.cctv0417Observed);
  const trackRef = useRef<HTMLDivElement>(null);
  const holdRef = useRef<number | null>(null);
  const seenRef = useRef(game.cctv0417Observed);

  const atAnomaly = minute === ANOMALY_MINUTE;

  /* 04:17 도달 — 장면이 먼저 바뀌고, 잠깐 뒤에 시스템이 끼어든다. */
  useEffect(() => {
    if (!atAnomaly) {
      setNoticed(game.cctv0417Observed);
      return;
    }
    if (seenRef.current) return;
    const t = window.setTimeout(() => {
      seenRef.current = true;
      setNoticed(true);
      fx("anomaly", "anomaly");
      dispatch({ type: "cctv/observe" });
    }, NOTICE_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [atAnomaly, dispatch, fx, game.cctv0417Observed]);

  const minuteRef = useRef(minute);
  minuteRef.current = minute;

  const setFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const next = Math.round(ratio * 59);
      if (next === minuteRef.current) return;
      minuteRef.current = next;
      fx("tap", null);
      setMinute(next);
    },
    [fx],
  );

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

  /* RECOVER RECORD — 손을 떼면 취소된다. */
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
  const holdStep = holding > 0 ? HOLD_STEPS[Math.min(HOLD_STEPS.length - 1, Math.floor(holding * HOLD_STEPS.length))] : null;

  return (
    <div className="r0-scene r0-scene--cctv">
      <div className="r0-cam__head">
        <span className="r0-cam__id">CAM 05-W</span>
        <span className="r0-cam__loc">5F WEST CORRIDOR</span>
        <span className="r0-cam__date">17 OCT ▟▚▟▚</span>
      </div>

      <div
        className="r0-cam__monitor"
        data-anomaly={atAnomaly && noticed ? "true" : undefined}
        data-still={reducedMotion ? "true" : undefined}
      >
        <SceneImage
          scene={SCENE_ASSETS.corridor}
          className="r0-ps--inline r0-ps--cam"
          fallback={<CorridorFallback showHiddenDoor={atAnomaly} />}
          grade={false}
          overlay={
            /* 04:17 이 아닐 때에만 504 자리를 같은 벽면으로 덮는다 */
            !atAnomaly ? (
              <span className="r0-ps__patch r0-cam__wall" style={patchStyle(SCENE_ASSETS.corridor, DOOR_PATCH, PATCH_SOURCE)} />
            ) : null
          }
        >
          {PLATES.map((p) => (
            <Plate key={p.id} {...p} />
          ))}
          {atAnomaly && <Plate {...ANOMALY_PLATE} />}
          <span className="r0-cam__tube" aria-hidden />
          <span className="r0-cam__scan" aria-hidden />
        </SceneImage>

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
              if (e.key === "ArrowLeft") {
                e.preventDefault();
                step(-1);
              }
              if (e.key === "ArrowRight") {
                e.preventDefault();
                step(1);
              }
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
              FRAME CONFLICT — ARCHIVE 5F-W SHOWS 6 OPENINGS. FLOOR RECORD 5F-W SHOWS 5.
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
              <span className="r0-conflict__text">{holdStep ?? "HOLD — RECOVER FLOOR RECORD"}</span>
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
