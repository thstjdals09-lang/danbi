import type { CSSProperties } from "react";
import type { SpotQuestion } from "@/lib/exams/types";

type Spot = SpotQuestion["spot"];

const SUITS: Record<string, { glyph: string; red: boolean }> = {
  s: { glyph: "♠", red: false },
  h: { glyph: "♥", red: true },
  d: { glyph: "♦", red: true },
  c: { glyph: "♣", red: false },
};

/** 히어로를 항상 아래 중앙에 두고, 액션 순서(시계 방향)대로 좌석을 타원에 배치한다. */
function seatPosition(offset: number, count: number) {
  const angle = ((90 + (offset * 360) / count) * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: 50 + 45 * cos,
    y: 50 + 43 * sin,
    // 베팅 칩은 좌석에서 테이블 중앙 쪽으로
    bx: -cos * 64,
    by: -sin * 40,
  };
}

function formatBb(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function PokerTable({ spot }: { spot: Spot }) {
  const seats = spot.seats ?? [];
  const heroIndex = seats.findIndex((s) => s.status === "hero");
  return (
    <div className="poker-table" aria-label="Table">
      <div className="poker-table__felt" />
      <div className="poker-table__pot">
        <span className="eyebrow">Pot</span>
        <strong>{spot.potBb !== undefined ? `${formatBb(spot.potBb)}BB` : "—"}</strong>
        {spot.anteBb ? <span className="eyebrow">BB ante {formatBb(spot.anteBb)}</span> : null}
      </div>
      {seats.map((seat, i) => {
        const pos = seatPosition((i - heroIndex + seats.length) % seats.length, seats.length);
        const style = { "--x": `${pos.x}%`, "--y": `${pos.y}%`, "--bx": `${pos.bx}px`, "--by": `${pos.by}px` } as CSSProperties;
        return (
          <div key={seat.position} className={`seat seat--${seat.status}`} style={style}>
            {seat.status === "hero" && <span className="seat__label">Hero</span>}
            <span className="seat__pos">{seat.position}</span>
            <span className="seat__stack">{formatBb(seat.stackBb)}BB</span>
            {seat.investedBb ? <span className="seat__bet">{formatBb(seat.investedBb)}</span> : null}
          </div>
        );
      })}
    </div>
  );
}

export function HeroHand({ cards }: { cards: [string, string] }) {
  return (
    <div className="hand">
      {cards.map((card) => {
        const rank = card.slice(0, -1).replace("T", "10");
        const suit = SUITS[card.slice(-1)] ?? SUITS.s;
        return (
          <div key={card} className={`card${suit.red ? " card--red" : ""}`} aria-label={card}>
            <span className="card__rank">{rank}</span>
            <span className="card__suit">{suit.glyph}</span>
          </div>
        );
      })}
    </div>
  );
}

export function ActionHistory({ spot }: { spot: Spot }) {
  // 연속된 폴드는 한 줄로 묶는다: "UTG · UTG1 · LJ Fold"
  const actions: { positions: string[]; action: string; toBb?: number }[] = [];
  for (const a of spot.actions ?? []) {
    const last = actions[actions.length - 1];
    if (a.action === "Fold" && last?.action === "Fold") last.positions.push(a.position);
    else actions.push({ positions: [a.position], action: a.action, toBb: a.toBb });
  }
  return (
    <div className="action-history" aria-label="Action history">
      <span>
        <strong>SB</strong> 0.5
      </span>
      <span>
        <strong>BB</strong> 1{spot.anteBb ? ` + ante ${formatBb(spot.anteBb)}` : ""}
      </span>
      {actions.map((a, i) => (
        <span key={`${a.positions[0]}-${i}`}>
          <strong>{a.positions.join(" · ")}</strong> {a.action}
          {a.toBb !== undefined ? ` ${formatBb(a.toBb)}` : ""}
        </span>
      ))}
      <span>
        <strong>{spot.heroPosition}</strong> ?
      </span>
    </div>
  );
}

export function toCall(spot: Spot): number {
  const seats = spot.seats ?? [];
  const hero = seats.find((s) => s.status === "hero");
  const max = Math.max(0, ...seats.map((s) => s.investedBb ?? 0));
  return Math.max(0, Math.round((max - (hero?.investedBb ?? 0)) * 10) / 10);
}
