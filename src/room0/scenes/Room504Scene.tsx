"use client";

import { useState } from "react";
import { useGame } from "@/room0/state/GameProvider";

/* ROOM 504 — 하나의 장면. 오브젝트는 카드가 아니라 방 안의 물건이다.
   좌표는 viewBox 390 x 620 기준이며, 최종 아트는 이 SVG 레이어만 교체하면 된다. */

interface Hotspot {
  id: string;
  label: string;
  /** 터치 영역 (viewBox 단위). 최소 변 44 이상 유지할 것. */
  x: number; y: number; w: number; h: number;
  log?: string;
}

const HOTSPOTS: Hotspot[] = [
  { id: "window", label: "창", x: 6, y: 180, w: 62, h: 260, log: "FIFTH FLOOR. THE COURTYARD BELOW HAS BEEN BRICKED OVER." },
  { id: "bed", label: "침대", x: 62, y: 392, w: 128, h: 92, log: "THE BED IS MADE. THE DUST ON IT IS UNDISTURBED." },
  { id: "rug", label: "카펫", x: 132, y: 516, w: 164, h: 78, log: "A RECTANGLE OF LESS-FADED CARPET. SOMETHING STOOD HERE. NOT THIS FURNITURE." },
  { id: "nightstand", label: "협탁", x: 194, y: 382, w: 62, h: 62, log: "ONE DRAWER. A HOTEL PEN INSIDE. NO HOTEL NAME ON IT." },
];

export function Room504Scene() {
  const { game, dispatch, fx } = useGame();
  const [photoOpen, setPhotoOpen] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [clockOpen, setClockOpen] = useState(false);

  const inspect = (h: Hotspot) => {
    fx("tap", "touch");
    if (h.log) dispatch({ type: "room/inspect", id: h.id, log: h.log });
  };

  const openPhoto = () => {
    fx("tap", "clue");
    setFlipped(false);
    setPhotoOpen(true);
    dispatch({ type: "room/photoOpen" });
  };

  const flipPhoto = () => {
    const next = !flipped;
    setFlipped(next);
    if (next && !game.photoBackInspected) {
      fx("reveal", "clue");
      dispatch({ type: "room/photoFlip" });
    } else {
      fx("tap", "touch");
    }
  };

  const tapClock = () => {
    const willFind = game.clockMarkTapCount >= 1 && !game.clockMarkFound;
    if (willFind) fx("reveal", "clue");
    else fx("tap", "touch");
    dispatch({ type: "room/clockTap" });
    if (willFind || game.clockMarkFound) setClockOpen(true);
  };

  const tapPhone = () => {
    fx("deny", "touch");
    dispatch({ type: "room/phone" });
  };

  const leave = () => {
    fx("door", "touch");
    dispatch({ type: "scene/go", scene: "map" });
  };

  const hit = (h: Hotspot, onActivate: () => void, label = h.label) => (
    <g
      key={h.id}
      className="r0-hot"
      data-seen={game.inspected.includes(h.id) ? "true" : undefined}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate();
        }
      }}
    >
      <rect x={h.x} y={h.y} width={h.w} height={h.h} className="r0-hot__area" />
    </g>
  );

  return (
    <div className="r0-scene r0-scene--room">
      <svg viewBox="0 0 390 620" className="r0-room" preserveAspectRatio="xMidYMid meet" aria-label="504호 내부">
        <defs>
          <linearGradient id="r0-room-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2e2b24" />
            <stop offset="100%" stopColor="#1d1b16" />
          </linearGradient>
          <linearGradient id="r0-room-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#241f18" />
            <stop offset="100%" stopColor="#15120d" />
          </linearGradient>
          <radialGradient id="r0-room-lamp" cx="50%" cy="18%" r="72%">
            <stop offset="0%" stopColor="rgba(226,205,150,0.16)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <radialGradient id="r0-room-ring" cx="50%" cy="50%" r="50%">
            <stop offset="74%" stopColor="rgba(196,182,150,0.055)" />
            <stop offset="88%" stopColor="rgba(196,182,150,0.02)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <pattern id="r0-room-paper" width="16" height="16" patternUnits="userSpaceOnUse">
            <rect width="16" height="16" fill="none" />
            <line x1="0" y1="0" x2="0" y2="16" stroke="rgba(255,255,255,0.02)" strokeWidth="6" />
          </pattern>
        </defs>

        {/* 공간 */}
        <rect x="0" y="0" width="390" height="620" fill="#100e0a" />
        <polygon points="0,0 390,0 320,150 70,150" fill="#191712" />
        <polygon points="0,620 390,620 320,420 70,420" fill="url(#r0-room-floor)" />
        <polygon points="0,0 70,150 70,420 0,620" fill="#221f19" />
        <polygon points="390,0 320,150 320,420 390,620" fill="#1b1814" />
        <rect x="70" y="150" width="250" height="270" fill="url(#r0-room-wall)" />
        <rect x="70" y="150" width="250" height="270" fill="url(#r0-room-paper)" />
        <rect x="0" y="0" width="390" height="620" fill="url(#r0-room-lamp)" />

        {/* 걸레받이 */}
        <line x1="70" y1="420" x2="320" y2="420" className="r0-room__skirt" />

        {/* 창 (좌측 벽) */}
        <polygon points="12,184 62,210 62,398 12,444" className="r0-room__window" />
        <polygon points="16,192 58,214 58,292 16,300" className="r0-room__pane" />
        <polygon points="16,310 58,300 58,390 16,432" className="r0-room__pane" />

        {/* 침대 */}
        <rect x="92" y="288" width="98" height="62" className="r0-room__headboard" />
        <polygon points="86,350 196,350 216,478 66,478" className="r0-room__bed" />
        <polygon points="86,350 196,350 201,386 81,386" className="r0-room__pillow" />

        {/* 협탁 + 전화기 */}
        <polygon points="200,378 248,378 253,428 195,428" className="r0-room__stand" />
        <polygon points="200,372 248,372 252,378 196,378" className="r0-room__standTop" />
        <rect x="207" y="354" width="36" height="18" rx="2" className="r0-room__phone" />
        <rect x="211" y="347" width="28" height="8" rx="3" className="r0-room__phoneHandset" />

        {/* 액자 */}
        <g className="r0-room__frameGroup">
          <rect x="106" y="186" width="70" height="56" className="r0-room__frame" />
          <rect x="111" y="191" width="60" height="46" className="r0-room__photo" />
          <line x1="141" y1="186" x2="141" y2="176" className="r0-room__wire" />
        </g>

        {/* 시계가 걸려 있던 자국 */}
        <g className="r0-room__mark" data-taps={Math.min(game.clockMarkTapCount, 2)} data-found={game.clockMarkFound ? "true" : undefined}>
          <circle cx="256" cy="224" r="31" fill="url(#r0-room-ring)" />
          <circle cx="256" cy="224" r="28" className="r0-room__ring" />
          <circle cx="256" cy="224" r="2" className="r0-room__nail" />
        </g>

        {/* 러그 */}
        <polygon points="148,518 270,518 302,592 116,592" className="r0-room__rug" />

        {/* 문 (우측 벽) */}
        <polygon points="326,170 384,142 384,478 326,440" className="r0-room__door" />
        <circle cx="336" cy="318" r="5" className="r0-room__knob" />
        <rect x="352" y="186" width="26" height="15" rx="1" className="r0-room__doorplate" />
        <text x="365" y="198" className="r0-room__doorNum">504</text>

        {/* 터치 영역 */}
        {HOTSPOTS.map((h) => hit(h, () => inspect(h)))}
        {hit({ id: "photo", label: "액자", x: 98, y: 172, w: 86, h: 82 }, openPhoto, "벽에 걸린 액자")}
        {hit({ id: "clockmark", label: "빈 벽", x: 218, y: 186, w: 76, h: 76 }, tapClock, "빈 벽의 둥근 자국")}
        {hit({ id: "phone", label: "전화기", x: 194, y: 320, w: 62, h: 60 }, tapPhone, "협탁 위 전화기")}
        {hit({ id: "door", label: "문", x: 324, y: 142, w: 64, h: 336 }, leave, "복도로 나가기")}
      </svg>

      {/* 액자 확대 */}
      {photoOpen && (
        <div className="r0-detail" role="dialog" aria-modal="true" aria-label="사진">
          <div className="r0-detail__scrim" onClick={() => setPhotoOpen(false)} />
          <div className="r0-detail__stage">
            <button
              type="button"
              className={`r0-photo${flipped ? " r0-photo--back" : ""}`}
              onClick={flipPhoto}
              aria-label={flipped ? "사진 앞면 보기" : "사진 뒤집기"}
            >
              <span className="r0-photo__face r0-photo__face--front">
                <svg viewBox="0 0 240 190" className="r0-photo__img" aria-hidden>
                  <rect x="0" y="0" width="240" height="190" fill="#8d8571" />
                  <rect x="0" y="0" width="240" height="190" fill="#6f6754" />
                  <polygon points="0,0 240,0 208,34 32,34" fill="#5c5544" />
                  <rect x="32" y="34" width="176" height="108" fill="#7d7460" />
                  <polygon points="0,190 240,190 208,142 32,142" fill="#4d4737" />
                  <rect x="46" y="70" width="70" height="34" fill="#655c49" />
                  <polygon points="44,104 120,104 130,140 34,140" fill="#6d6450" />
                  {/* 벽시계 — 지금 이 방에는 없다 */}
                  <circle cx="168" cy="72" r="19" fill="#d8cfb4" stroke="#3b3527" strokeWidth="2" />
                  {/* 02:13 */}
                  <line x1="168" y1="72" x2="177" y2="67" stroke="#2c2719" strokeWidth="2.6" />
                  <line x1="168" y1="72" x2="183" y2="69" stroke="#2c2719" strokeWidth="1.8" />
                  <circle cx="168" cy="72" r="1.8" fill="#2c2719" />
                  <rect x="0" y="0" width="240" height="190" fill="rgba(120,100,60,0.12)" />
                </svg>
                <span className="r0-photo__caption">ROOM 504 — UNDATED</span>
              </span>
              <span className="r0-photo__face r0-photo__face--rear">
                <span className="r0-photo__hand">OCT 17, 1987</span>
                <span className="r0-photo__scrawl">504 — EAST WALL</span>
                <span className="r0-photo__stamp">PROPERTY OF NULL HOTEL</span>
              </span>
            </button>
            <p className="r0-detail__hint">{flipped ? "PENCIL, ON THE REVERSE." : "TAP TO TURN IT OVER."}</p>
            <button type="button" className="r0-detail__close" onClick={() => { fx("tap", "touch"); setPhotoOpen(false); }}>
              PUT IT BACK
            </button>
          </div>
        </div>
      )}

      {/* 시계 자국 확대 */}
      {clockOpen && (
        <div className="r0-detail" role="dialog" aria-modal="true" aria-label="벽의 자국">
          <div className="r0-detail__scrim" onClick={() => setClockOpen(false)} />
          <div className="r0-detail__stage">
            <svg viewBox="0 0 240 240" className="r0-markDetail" aria-hidden>
              <rect x="0" y="0" width="240" height="240" fill="#28241c" />
              <circle cx="120" cy="120" r="82" fill="#3a3428" />
              <circle cx="120" cy="120" r="82" fill="none" stroke="#484132" strokeWidth="3" />
              <line x1="120" y1="120" x2="120" y2="66" stroke="rgba(20,18,12,0.55)" strokeWidth="7" strokeLinecap="round" />
              <line x1="120" y1="120" x2="168" y2="140" stroke="rgba(20,18,12,0.55)" strokeWidth="7" strokeLinecap="round" />
              <circle cx="120" cy="120" r="4" fill="#211e16" />
            </svg>
            <p className="r0-detail__read">02:13</p>
            <p className="r0-detail__hint">THE HANDS LEFT THEIR SHADOW. THEY DID NOT MOVE AGAIN.</p>
            <button type="button" className="r0-detail__close" onClick={() => { fx("tap", "touch"); setClockOpen(false); }}>
              STEP BACK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
