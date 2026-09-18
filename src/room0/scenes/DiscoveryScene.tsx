"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/room0/state/GameProvider";
import { SCENE_ASSETS } from "@/room0/assets";
import { Hotspot, SceneImage } from "@/room0/components/SceneImage";

/* 504호 최초 발견.
   1) 기록이 덮어써지는 것을 보여주고
   2) 방금 전에 본 도면이 실제로 바뀌는 것을 보여주고
   3) 시스템 화면이 끊긴 뒤
   4) 처음으로 실제 호텔 복도의 문이 나온다. SYSTEM SPACE → PHYSICAL SPACE. */

const WRITE_LOG = [
  "WRITING TO FLOOR RECORD 5F-W ...",
  "SECTOR 5W / OFFSET 0504 / 118 BYTES",
  "REMOVING WALL SEGMENT W-503/505",
  "UNIT 504 ................ RESTORED",
  "PROPERTY RECORD UPDATED — 6 UNITS ON FILE",
];

type Phase = 0 | 1 | 2 | 3;

/** 도면이 바뀌는 장면 — 왼쪽 열만 축약해서 다시 그린다 */
function PlanChange({ changed }: { changed: boolean }) {
  return (
    <svg viewBox="0 0 220 300" className="r0-planchg" aria-label="5F 도면 변경">
      <defs>
        <pattern id="r0-chg-solid" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke="rgba(190,196,176,0.30)" strokeWidth="1.6" />
        </pattern>
      </defs>
      <rect x="20" y="10" width="120" height="60" className="r0-planchg__room" />
      <text x="80" y="46" className="r0-planchg__no">503</text>

      {/* 503 과 505 사이 */}
      {!changed ? (
        <>
          <rect x="20" y="78" width="120" height="84" fill="url(#r0-chg-solid)" className="r0-planchg__void" />
          <text x="164" y="124" className="r0-planchg__dim">5.10</text>
        </>
      ) : (
        <>
          <rect x="20" y="86" width="120" height="60" className="r0-planchg__room r0-planchg__room--new" />
          <text x="80" y="122" className="r0-planchg__no r0-planchg__no--new">504</text>
          <text x="164" y="124" className="r0-planchg__dim">3.60</text>
        </>
      )}

      <rect x="20" y="170" width="120" height="60" className="r0-planchg__room" />
      <text x="80" y="206" className="r0-planchg__no">505</text>

      <text x="20" y="262" className="r0-planchg__rev">
        {changed ? "REV 04 — 6 UNITS" : "REV 03 — 5 UNITS"}
      </text>
    </svg>
  );
}

export function DiscoveryScene() {
  const { dispatch, fx, reducedMotion } = useGame();
  const [phase, setPhase] = useState<Phase>(reducedMotion ? 3 : 0);
  const [written, setWritten] = useState(reducedMotion ? WRITE_LOG.length : 0);
  const [planChanged, setPlanChanged] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      dispatch({ type: "discovery/ack" });
      return;
    }
    const timers: number[] = [];
    WRITE_LOG.forEach((_, i) => {
      timers.push(window.setTimeout(() => setWritten(i + 1), 220 + i * 340));
    });
    const afterLog = 220 + WRITE_LOG.length * 340;

    /* 기록이 아니라 세계가 바뀌는 것을 직접 보여준다 */
    timers.push(window.setTimeout(() => setPhase(1), afterLog + 220));
    timers.push(
      window.setTimeout(() => {
        setPlanChanged(true);
        fx("reveal", "clue");
      }, afterLog + 1100),
    );
    /* 시스템 신호가 끊긴다 */
    timers.push(window.setTimeout(() => setPhase(2), afterLog + 2600));
    /* 그리고 실제 문 */
    timers.push(
      window.setTimeout(() => {
        setPhase(3);
        fx("door", "recover");
        dispatch({ type: "discovery/ack" });
      }, afterLog + 3500),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [dispatch, fx, reducedMotion]);

  const enter = () => {
    fx("door", "recover");
    dispatch({ type: "room/enter504" });
  };

  return (
    <div className="r0-discovery" data-phase={phase}>
      {phase === 0 && (
        <pre className="r0-discovery__write">
          {WRITE_LOG.slice(0, written).map((line) => (
            <span key={line}>{line}</span>
          ))}
        </pre>
      )}

      {phase === 1 && (
        <div className="r0-discovery__plan">
          <p className="r0-discovery__eyebrow">FLOOR RECORD 5F-W</p>
          <PlanChange changed={planChanged} />
        </div>
      )}

      {phase === 2 && (
        <div className="r0-discovery__lost">
          <span>SIGNAL LOST</span>
        </div>
      )}

      {phase === 3 && (
        <div className="r0-discovery__reveal">
          <SceneImage
            scene={SCENE_ASSETS.door504}
            className="r0-ps--door r0-ps--fill"
            fallback={<div className="r0-ps__blank" aria-hidden />}
          >
            <Hotspot x={22} y={6} w={56} h={88} label="504호로 들어간다" onActivate={enter} />
          </SceneImage>

          <div className="r0-discovery__plate">
            <p className="r0-discovery__eyebrow">NEW LOCATION DISCOVERED</p>
            <h2 className="r0-discovery__title">ROOM 504</h2>
            <p className="r0-discovery__sub">This room is absent from the current property record.</p>
            <button type="button" className="r0-discovery__enter" onClick={enter}>
              ENTER
            </button>
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
        </div>
      )}
    </div>
  );
}
