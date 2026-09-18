"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/room0/state/GameProvider";
import { PLAN, PLAN_SLOTS } from "@/room0/data/locations";
import type { PlanSlot } from "@/room0/state/types";

/* 문 심볼 — 복도 쪽 벽에 개구부, 방 안쪽으로 열리는 호. */
function Door({ slot }: { slot: PlanSlot }) {
  const doorY = slot.y + slot.h * 0.72;
  const west = slot.side === "west";
  const hinge = west ? slot.x + slot.w : slot.x;
  const leafX = west ? hinge - 22 : hinge + 22;
  const sweep = west ? 1 : 0;
  return (
    <g className="r0-plan__door">
      <line x1={hinge} y1={doorY} x2={hinge} y2={doorY - 22} className="r0-plan__opening" />
      <line x1={hinge} y1={doorY} x2={leafX} y2={doorY} className="r0-plan__leaf" />
      <path d={`M ${leafX} ${doorY} A 22 22 0 0 ${sweep} ${hinge} ${doorY - 22}`} className="r0-plan__swing" />
    </g>
  );
}

export function FloorMapScene() {
  const { game, dispatch, fx, reducedMotion } = useGame();
  const [shudder, setShudder] = useState(0);
  const [justRecovered, setJustRecovered] = useState(false);

  /* 복구 직후 지도로 돌아왔을 때 한 번만 도면이 다시 그려지는 연출 */
  useEffect(() => {
    if (game.room504Recovered && game.room504Revealed) {
      setJustRecovered(true);
      const t = window.setTimeout(() => setJustRecovered(false), 2600);
      return () => window.clearTimeout(t);
    }
  }, [game.room504Recovered, game.room504Revealed]);

  const tapWall = () => {
    const next = game.wallTapCount + 1;
    if (game.clue0417Found) {
      fx("tap", "touch");
      dispatch({ type: "map/tapWall" });
      return;
    }
    setShudder((n) => n + 1);
    window.setTimeout(() => setShudder(0), 520);
    if (next >= 3) fx("reveal", "clue");
    else fx("tap", next === 2 ? "clue" : "touch");
    dispatch({ type: "map/tapWall" });
  };

  const tapSlot = (slot: PlanSlot) => {
    /* CASE 00 이 정리되면 승강기로 1층 프런트에 내려갈 수 있다 */
    if (slot.id === "elev" && game.frontDeskUnlocked) {
      fx("door", "touch");
      dispatch({ type: "scene/go", scene: "frontdesk" });
      return;
    }
    if (slot.id === "r504") {
      fx("door", "recover");
      dispatch({ type: "room/enter504" });
      return;
    }
    fx("tap", "touch");
    dispatch({ type: "map/inspect", slotId: slot.id });
  };

  const visible = PLAN_SLOTS.filter((s) => !s.recoveredOnly || game.room504Recovered);
  const voidSlot = PLAN_SLOTS.find((s) => s.id === "void-5w")!;
  const recovered = game.room504Recovered;

  return (
    <div className="r0-scene r0-scene--plan">
      <svg
        viewBox={PLAN.viewBox}
        className="r0-plan"
        role="group"
        aria-label="5층 서측 평면도"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id="r0-grid" width="13" height="13" patternUnits="userSpaceOnUse">
            <path d="M 13 0 L 0 0 0 13" fill="none" stroke="rgba(150,160,140,0.07)" strokeWidth="0.5" />
          </pattern>
          <pattern id="r0-solid" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="7" stroke="rgba(190,196,176,0.30)" strokeWidth="1.6" />
          </pattern>
          <pattern id="r0-corridor" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="9" stroke="rgba(150,160,140,0.055)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect x="0" y="0" width="390" height="720" fill="url(#r0-grid)" />

        {/* 도면 외곽 */}
        <rect x={PLAN.outline.x} y={PLAN.outline.y} width={PLAN.outline.w} height={PLAN.outline.h} className="r0-plan__outline" />

        {/* 복도 */}
        <rect x={PLAN.corridor.x} y={PLAN.corridor.y} width={PLAN.corridor.w} height={PLAN.corridor.h} fill="url(#r0-corridor)" className="r0-plan__corridor" />
        <text x={200} y={352} className="r0-plan__corridorLabel" transform="rotate(-90 200 352)">
          CORRIDOR 5F-W
        </text>

        {/* 치수선 */}
        <g className="r0-plan__dims" aria-hidden>
          <line x1={PLAN.dimensionX} y1={PLAN.dimensionTop} x2={PLAN.dimensionX} y2={PLAN.dimensionBottom} />
          {PLAN_SLOTS.filter((s) => s.side === "west" && (!s.recoveredOnly || recovered)).map((s) => (
            <g key={`dim-${s.id}`}>
              <line x1={PLAN.dimensionX - 5} y1={s.y} x2={PLAN.dimensionX + 5} y2={s.y} />
              <line x1={PLAN.dimensionX - 5} y1={s.y + s.h} x2={PLAN.dimensionX + 5} y2={s.y + s.h} />
              {s.dimension && !(s.id === "void-5w" && recovered) && (
                <text
                  x={PLAN.dimensionX - 9}
                  y={s.y + s.h / 2}
                  className={`r0-plan__dimText${s.id === "void-5w" && !recovered ? " r0-plan__dimText--odd" : ""}`}
                  transform={`rotate(-90 ${PLAN.dimensionX - 9} ${s.y + s.h / 2})`}
                >
                  {s.dimension}
                </text>
              )}
            </g>
          ))}
        </g>

        {/* 503 과 505 사이 — 기록상 벽 */}
        <g
          className="r0-plan__void"
          data-taps={Math.min(game.wallTapCount, 3)}
          data-found={game.clue0417Found ? "true" : undefined}
          data-shudder={shudder && !reducedMotion ? "true" : undefined}
          data-recovered={recovered ? "true" : undefined}
          role="button"
          tabIndex={0}
          aria-label="503과 505 사이 벽면 조사"
          onClick={tapWall}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              tapWall();
            }
          }}
        >
          <rect
            x={voidSlot.x}
            y={voidSlot.y}
            width={voidSlot.w}
            height={voidSlot.h}
            fill="url(#r0-solid)"
            className="r0-plan__voidFill"
          />
          {game.wallTapCount >= 2 && !recovered && (
            <line
              x1={voidSlot.x + 4}
              y1={voidSlot.y + 10}
              x2={voidSlot.x + voidSlot.w - 4}
              y2={voidSlot.y + 10}
              className="r0-plan__seam"
            />
          )}
          {game.clue0417Found && !recovered && (
            <text x={voidSlot.x + voidSlot.w / 2} y={voidSlot.y + voidSlot.h - 16} className="r0-plan__mark">
              04:17
            </text>
          )}
        </g>

        {/* 구획 */}
        {visible.map((slot) => {
          if (slot.id === "void-5w") return null;
          const isRecoveredRoom = slot.id === "r504";
          return (
            <g
              key={slot.id}
              className={`r0-plan__slot r0-plan__slot--${slot.kind}${isRecoveredRoom ? " r0-plan__slot--recovered" : ""}`}
              data-fresh={isRecoveredRoom && justRecovered ? "true" : undefined}
              role="button"
              tabIndex={0}
              aria-label={slot.number ? `${slot.number} 조사` : "구획 조사"}
              onClick={() => tapSlot(slot)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  tapSlot(slot);
                }
              }}
            >
              <rect x={slot.x} y={slot.y} width={slot.w} height={slot.h} className="r0-plan__room" />
              {slot.kind === "room" && <Door slot={slot} />}
              {slot.number && (
                <text
                  x={slot.x + slot.w / 2}
                  y={slot.y + slot.h / 2 + 5}
                  className={`r0-plan__number${slot.kind === "room" ? "" : " r0-plan__number--svc"}`}
                >
                  {slot.number}
                </text>
              )}
              {isRecoveredRoom && (
                <text x={slot.x + slot.w / 2} y={slot.y + slot.h - 12} className="r0-plan__stamp">
                  NOT IN RECORD
                </text>
              )}
              {slot.id === "elev" && game.frontDeskUnlocked && (
                <text x={slot.x + slot.w / 2} y={slot.y + slot.h - 14} className="r0-plan__gf">
                  GF — FRONT DESK
                </text>
              )}
              {slot.id === "r504" && game.phoneRinging && (
                <text x={slot.x + slot.w / 2} y={slot.y + 20} className="r0-plan__ring">
                  ((( )))
                </text>
              )}
            </g>
          );
        })}

        {/* 타이틀 블록 */}
        <g className="r0-plan__title" aria-hidden>
          <line x1="24" y1={PLAN.titleY} x2="366" y2={PLAN.titleY} />
          <text x="24" y={PLAN.titleY + 18}>SHEET A-5W · WEST WING · 1:100</text>
          <text x="24" y={PLAN.titleY + 36}>
            {recovered ? "REV 04 — RECORD RECOVERED FROM ARCHIVE" : "REV 03 — CURRENT PROPERTY RECORD"}
          </text>
          <text x="366" y={PLAN.titleY + 18} textAnchor="end">
            {recovered ? "6 UNITS" : "5 UNITS"}
          </text>
        </g>
      </svg>
    </div>
  );
}
