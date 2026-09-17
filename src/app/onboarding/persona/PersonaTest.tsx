"use client";

import { useState, useTransition } from "react";
import type { Axis } from "@/content/personas";
import { savePersonaAction } from "../actions";

export function PersonaTest({ axes }: { axes: Axis[] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  const axis = axes[step];
  const done = step >= axes.length;

  function choose(value: string) {
    const next = { ...answers, [axis.key]: value };
    setAnswers(next);
    setStep(step + 1);

    if (step + 1 >= axes.length) {
      const formData = new FormData();
      for (const [key, v] of Object.entries(next)) formData.set(key, v);
      startTransition(() => savePersonaAction(formData));
    }
  }

  return (
    <div className="card stack">
      <div className="progress">
        <div style={{ width: `${(Math.min(step, axes.length) / axes.length) * 100}%` }} />
      </div>

      {done ? (
        <p className="muted">{pending ? "당신의 플레이어를 찾는 중…" : "잠시만요…"}</p>
      ) : (
        <>
          <p className="eyebrow">
            {step + 1} / {axes.length}
          </p>
          <h2>{axis.question}</h2>
          <div className="stack">
            {axis.options.map((option) => (
              <button key={option.value} type="button" className="choice" onClick={() => choose(option.value)}>
                {option.prompt}
              </button>
            ))}
          </div>
          {step > 0 && (
            <button type="button" className="btn" onClick={() => setStep(step - 1)}>
              이전
            </button>
          )}
        </>
      )}
    </div>
  );
}
