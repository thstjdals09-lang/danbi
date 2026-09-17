"use client";

import type { CSSProperties, ReactNode } from "react";
import { useState, useTransition } from "react";
import { familyOf, type Axis } from "@/content/personas";
import { savePersonaAction } from "../actions";

type Props = {
  axes: Axis[];
  /** `${axis}-${value}` → 서버에서 만든 Visual Fragment 슬롯 */
  fragments: Record<string, ReactNode>;
  /** family id → 서버에서 만든 reveal 슬롯 */
  backdrops: Record<string, ReactNode>;
};

/** 답할수록 배경의 캐릭터가 조금씩 드러난다. (mind + play 가 정해지면 계열이 확정된다) */
const REVEAL_BY_STEP = [0, 0, 0.42, 0.7, 1];

export function PersonaTest({ axes, fragments, backdrops }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  const total = axes.length;
  const done = step >= total;
  const axis = axes[Math.min(step, total - 1)];
  const family = answers.play && answers.mind ? familyOf(answers.play, answers.mind) : null;
  const answeredCount = axes.filter((a) => answers[a.key]).length;

  function choose(value: string) {
    const next = { ...answers, [axis.key]: value };
    setAnswers(next);
    if (step + 1 >= total) {
      setStep(total);
      const formData = new FormData();
      for (const [key, v] of Object.entries(next)) formData.set(key, v);
      startTransition(() => savePersonaAction(formData));
    } else {
      setStep(step + 1);
    }
  }

  function skip() {
    const option = axis.options[Math.floor(Math.random() * axis.options.length)];
    choose(option.value);
  }

  return (
    <section className="ptest" style={{ "--reveal": REVEAL_BY_STEP[Math.min(answeredCount, total)] } as CSSProperties}>
      <div className="ptest__backdrop" aria-hidden>
        {family && backdrops[family]}
      </div>

      <div className="shell">
        <div className="ptest__inner">
          <div className="ptest__top">
            <span className="ptest__count">
              Q{Math.min(step + 1, total)} <small>/ {total}</small>
            </span>
            <span className="progress-line" aria-hidden>
              <span style={{ width: `${(answeredCount / total) * 100}%` }} />
            </span>
            <span className="eyebrow" style={{ marginLeft: "auto" }}>Poker Persona Test</span>
          </div>

          {done ? (
            <div style={{ minHeight: 480, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18 }}>
              <p className="eyebrow">{pending ? "Discovering your player" : "One moment"}</p>
              <p className="serif-kr ptest__question">당신의 플레이어가{"\n"}모습을 드러냅니다.</p>
            </div>
          ) : (
            <>
              <h1 key={`q-${axis.key}`} className="serif-kr ptest__question">{axis.question}</h1>

              <div className="ptest__options" key={`o-${axis.key}`}>
                {axis.options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`option${answers[axis.key] === option.value ? " is-chosen" : ""}`}
                    onClick={() => choose(option.value)}
                  >
                    <span className="option__fragment">
                      {fragments[`${axis.key}-${option.value}`]}
                      <span className="option__letter">{option.letter}</span>
                    </span>
                    <span className="option__body">
                      <span className="option__title">{option.title}</span>
                      <span className="option__line">{option.line}</span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="ptest__nav">
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label="Previous question"
                    disabled={step === 0}
                    onClick={() => setStep(step - 1)}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="icon-btn icon-btn--ink"
                    aria-label="Next question"
                    disabled={!answers[axis.key]}
                    onClick={() => choose(answers[axis.key])}
                  >
                    →
                  </button>
                </div>
                <div className="ptest__hint">
                  <button type="button" className="link link--mute" onClick={skip}>
                    Skip
                  </button>
                  <p className="eyebrow" style={{ marginTop: 10 }}>Discover your player DNA</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
