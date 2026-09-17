"use client";

import { useState, useTransition } from "react";
import type { PublicExam, PublicQuestion } from "@/lib/exams/types";
import { submitExamAction } from "../actions";

export function ExamRunner({ exam, devMode }: { exam: PublicExam; devMode: boolean }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  const question = exam.questions[index];
  const total = exam.questions.length;
  const answeredCount = Object.keys(answers).length;
  const isLast = index === total - 1;

  function select(choiceId: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: choiceId }));
  }

  function submit(finalAnswers: Record<string, string>) {
    startTransition(() => submitExamAction(exam.id, finalAnswers));
  }

  function devFillCorrect() {
    const filled = Object.fromEntries(
      exam.questions.filter((q) => q.devCorrect).map((q) => [q.id, q.devCorrect as string]),
    );
    setAnswers(filled);
    setIndex(total - 1);
  }

  return (
    <div className="stack">
      <div>
        <p className="eyebrow">{exam.domain} · {exam.skill}</p>
        <h1>{exam.title}</h1>
      </div>

      <div className="progress">
        <div style={{ width: `${(answeredCount / total) * 100}%` }} />
      </div>

      <div className="card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="eyebrow">Question {index + 1} / {total}</span>
          <span className="pill">{question.category}</span>
        </div>

        {question.spot && <SpotHeader spot={question.spot} />}

        <h2>{question.prompt}</h2>

        <div className="stack">
          {question.choices.map((choice) => {
            const selected = answers[question.id] === choice.id;
            const devCorrect = devMode && question.devCorrect === choice.id;
            return (
              <button
                key={choice.id}
                type="button"
                className={`choice${selected ? " selected" : ""}${devCorrect ? " dev-correct" : ""}`}
                onClick={() => select(choice.id)}
              >
                {choice.text}
              </button>
            );
          })}
        </div>

        <div className="row" style={{ justifyContent: "space-between" }}>
          <button type="button" className="btn" disabled={index === 0} onClick={() => setIndex(index - 1)}>
            이전
          </button>
          {isLast ? (
            <button
              type="button"
              className="btn btn-primary"
              disabled={pending || answeredCount < total}
              onClick={() => submit(answers)}
            >
              {pending ? "채점 중…" : "시험 종료하고 결과 보기"}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              disabled={!answers[question.id]}
              onClick={() => setIndex(index + 1)}
            >
              다음
            </button>
          )}
        </div>
      </div>

      {devMode && (
        <div className="card row" style={{ borderColor: "var(--dev)" }}>
          <strong style={{ color: "var(--dev)" }}>DEV</strong>
          <span className="muted" style={{ fontSize: 13 }}>보라색 표시 = 정답</span>
          <button type="button" className="btn btn-dev" onClick={devFillCorrect}>정답 자동 채우기</button>
          <button type="button" className="btn btn-dev" disabled={pending} onClick={() => submit(answers)}>
            남은 문제 무시하고 바로 제출
          </button>
        </div>
      )}
    </div>
  );
}

function SpotHeader({ spot }: { spot: NonNullable<PublicQuestion["spot"]> }) {
  return (
    <div className="row" style={{ fontSize: 14 }}>
      <span className="pill">{spot.game} · {spot.table} · {spot.stackBb}BB</span>
      <span className="pill">Hero {spot.heroPosition}</span>
      <span className="pill">{spot.situation}</span>
      <strong>{spot.hand}</strong>
      {spot.villainSizing && <span className="muted">Villain {spot.villainSizing}</span>}
    </div>
  );
}
