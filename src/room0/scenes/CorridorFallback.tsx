"use client";

/* 복도 사진(cctv/corridor.webp)이 아직 없을 때만 그려지는 임시 장면.
   최종 화면이 아니다 — 에셋이 들어오면 자동으로 대체된다. */

const CAM = { w: 390, h: 330 };
const FAR = { x0: 158, x1: 232, y0: 118, y1: 212 };

const wallX = (t: number) => FAR.x0 * t;
const wallTop = (t: number) => FAR.y0 * t;
const wallBot = (t: number) => CAM.h + (FAR.y1 - CAM.h) * t;
const wallY = (t: number, f: number) => wallTop(t) + f * (wallBot(t) - wallTop(t));
const rightX = (t: number) => CAM.w + (FAR.x1 - CAM.w) * t;

function doorPoints(t0: number, t1: number, f0: number, f1: number): string {
  return [
    `${wallX(t0)},${wallY(t0, f0)}`,
    `${wallX(t1)},${wallY(t1, f0)}`,
    `${wallX(t1)},${wallY(t1, f1)}`,
    `${wallX(t0)},${wallY(t0, f1)}`,
  ].join(" ");
}

const DOORS = [
  { id: "d501", number: "501", t0: 0.02, t1: 0.19 },
  { id: "d502", number: "502", t0: 0.28, t1: 0.41 },
  { id: "d503", number: "503", t0: 0.49, t1: 0.59 },
  { id: "d505", number: "505", t0: 0.75, t1: 0.82 },
];

const HIDDEN_DOOR = { t0: 0.64, t1: 0.71 };

function Door({ t0, t1, number, ghost }: { t0: number; t1: number; number: string; ghost?: boolean }) {
  const F0 = 0.26;
  const F1 = 0.9;
  const mid = (t0 + t1) / 2;
  const cx = (wallX(t0) + wallX(t1)) / 2;
  const scale = 1 - t0 * 0.72;
  const plateY = wallY(mid, F0) + 9 * scale;
  return (
    <g className={`r0-fb__door${ghost ? " r0-fb__door--ghost" : ""}`}>
      <polygon points={doorPoints(t0, t1, F0, F1)} />
      <line x1={wallX(t0)} y1={wallY(t0, F0)} x2={wallX(t0)} y2={wallY(t0, F1)} className="r0-fb__jamb" />
      <polygon points={doorPoints(t0, t1, F1 - 0.025, F1)} className="r0-fb__sill" />
      <rect x={cx - 10 * scale} y={plateY - 7 * scale} width={20 * scale} height={10 * scale} className="r0-fb__plateBack" />
      <text x={cx} y={plateY + 1 * scale} fontSize={Math.max(6, 8 * scale)} className="r0-fb__plate">
        {number}
      </text>
    </g>
  );
}

export function CorridorFallback({ showHiddenDoor }: { showHiddenDoor: boolean }) {
  return (
    <svg viewBox={`0 0 ${CAM.w} ${CAM.h}`} className="r0-fb" role="img" aria-label="복도 임시 장면">
      <defs>
        <linearGradient id="r0-fb-floor" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#14160f" />
          <stop offset="100%" stopColor="#272a1e" />
        </linearGradient>
        <linearGradient id="r0-fb-wallL" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2a2e20" />
          <stop offset="100%" stopColor="#171a11" />
        </linearGradient>
        <linearGradient id="r0-fb-wallR" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#23271b" />
          <stop offset="100%" stopColor="#15180f" />
        </linearGradient>
        <radialGradient id="r0-fb-vig" cx="50%" cy="50%" r="70%">
          <stop offset="55%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.85)" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width={CAM.w} height={CAM.h} fill="#0d0f0a" />
      <polygon points={`0,0 ${CAM.w},0 ${FAR.x1},${FAR.y0} ${FAR.x0},${FAR.y0}`} fill="#171a11" />
      <polygon points={`0,${CAM.h} ${CAM.w},${CAM.h} ${FAR.x1},${FAR.y1} ${FAR.x0},${FAR.y1}`} fill="url(#r0-fb-floor)" />
      <polygon points={`${CAM.w},0 ${FAR.x1},${FAR.y0} ${FAR.x1},${FAR.y1} ${CAM.w},${CAM.h}`} fill="url(#r0-fb-wallR)" />
      <polygon points={`0,0 ${FAR.x0},${FAR.y0} ${FAR.x0},${FAR.y1} 0,${CAM.h}`} fill="url(#r0-fb-wallL)" />
      <rect x={FAR.x0} y={FAR.y0} width={FAR.x1 - FAR.x0} height={FAR.y1 - FAR.y0} fill="#0f1109" />

      {[0.1, 0.32, 0.54, 0.72].map((t) => (
        <rect
          key={t}
          x={(CAM.w / 2) * (1 - t) + ((FAR.x0 + FAR.x1) / 2) * t - 28 * (1 - t) - 5}
          y={10 + (FAR.y0 - 24) * t}
          width={56 * (1 - t) + 10}
          height={6 * (1 - t) + 2}
          className="r0-fb__lamp"
        />
      ))}

      {[0.34, 0.9].map((f) => (
        <g key={`rail${f}`}>
          <line x1={wallX(0)} y1={wallY(0, f)} x2={wallX(0.985)} y2={wallY(0.985, f)} className="r0-fb__rail" />
          <line x1={rightX(0)} y1={wallY(0, f)} x2={rightX(0.985)} y2={wallY(0.985, f)} className="r0-fb__rail" />
        </g>
      ))}

      {[0.18, 0.42, 0.64, 0.82].map((t) => (
        <line key={`c${t}`} x1={wallX(t)} y1={wallBot(t)} x2={rightX(t)} y2={wallBot(t)} className="r0-fb__carpet" />
      ))}

      {DOORS.map((d) => (
        <Door key={d.id} t0={d.t0} t1={d.t1} number={d.number} />
      ))}
      {showHiddenDoor && <Door t0={HIDDEN_DOOR.t0} t1={HIDDEN_DOOR.t1} number="504" ghost />}

      <rect x="0" y="0" width={CAM.w} height={CAM.h} fill="url(#r0-fb-vig)" />
    </svg>
  );
}
