"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

export type ResultStep = "complete" | "grade" | "certification" | "gear" | "evolution" | "final";

const DURATION: Record<ResultStep, number> = {
  complete: 1600,
  grade: 2400,
  certification: 2800,
  gear: 2800,
  evolution: 3200,
  final: 0,
};

type Props = {
  steps: ResultStep[];
  panels: Partial<Record<ResultStep, ReactNode>>;
  figure: ReactNode;
};

/**
 * Exam Complete → Grade → Certification → Gear → Character Change → Add to Showcase
 * 순서로 자동 진행한다. 클릭으로 넘기거나 Skip 으로 바로 요약을 볼 수 있다.
 */
export function ResultSequence({ steps, panels, figure }: Props) {
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const evolutionIndex = steps.indexOf("evolution");
  const evolved = evolutionIndex === -1 || index >= evolutionIndex;

  useEffect(() => {
    if (step === "final") return;
    const timer = window.setTimeout(() => setIndex((i) => Math.min(i + 1, steps.length - 1)), DURATION[step]);
    return () => window.clearTimeout(timer);
  }, [step, steps.length]);

  return (
    <section className="shell result" data-step={step} data-evolved={evolved}>
      <div className="result__figure">{figure}</div>
      <div className="result__panel" style={{ position: "relative" }}>
        {step !== "final" && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <span className="progress-line" aria-hidden style={{ maxWidth: 200 }}>
              <span style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
            </span>
            <span style={{ display: "flex", gap: 22 }}>
              <button type="button" className="link" onClick={() => setIndex(index + 1)}>
                Next
              </button>
              <button type="button" className="link link--mute" onClick={() => setIndex(steps.length - 1)}>
                Skip
              </button>
            </span>
          </div>
        )}
        <div key={step} className="result__step">
          {panels[step]}
        </div>
      </div>
    </section>
  );
}

export function CountUp({ to, duration = 1100 }: { to: number; duration?: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [to, duration]);
  return <>{value}</>;
}
