"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import type { PublicExam, PublicQuestion } from "@/lib/exams/types";
import { ActionHistory, HeroHand, PokerTable, toCall } from "@/components/PokerTable";
import { submitExamAction } from "../actions";

const KEYS = ["A", "B", "C", "D", "E", "F"];

/**
 * 퀴즈 UI 가 아니라 Poker Decision Interface.
 * 읽는 순서: 테이블 상황 → 액션 히스토리 → 히어로 핸드 → 질문 → 선택.
 * 시험 중에는 정답/오답을 알려주지 않고, 끝까지 진행한 뒤 한 번에 제출한다.
 */
export function ExamRunner({ exam, devMode }: { exam: PublicExam; devMode: boolean }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  const question = exam.questions[index];
  const total = exam.questions.length;
  const answeredCount = exam.questions.filter((q) => answers[q.id]).length;
  const isLast = index === total - 1;
  const current = answers[question.id];

  const select = useCallback(
    (choiceId: string) => setAnswers((prev) => ({ ...prev, [question.id]: choiceId })),
    [question.id],
  );

  function submit(finalAnswers: Record<string, string>) {
    startTransition(() => submitExamAction(exam.id, finalAnswers));
  }

  function next() {
    if (!current) return;
    if (isLast) {
      if (answeredCount === total) submit(answers);
    } else {
      setIndex(index + 1);
    }
  }

  // 키보드: A~D 선택, Enter 다음
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey) return;
      const i = KEYS.indexOf(e.key.toUpperCase());
      if (i >= 0 && question.choices[i]) select(question.choices[i].id);
      if (e.key === "Enter") document.getElementById("exam-next")?.click();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [question, select]);

  function devFillCorrect() {
    setAnswers(Object.fromEntries(exam.questions.filter((q) => q.devCorrect).map((q) => [q.id, q.devCorrect as string])));
    setIndex(total - 1);
  }

  return (
    <div className="shell exam">
      <div className="exam__bar">
        <span className="exam__scope meta">
          {exam.scope.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </span>
        <span style={{ display: "flex", gap: 28, alignItems: "center" }}>
          <span className="exam__count">
            Q {index + 1} <span className="muted">/ {total}</span>
          </span>
          <Link
            href="/exams"
            className="link link--mute"
            onClick={(e) => {
              if (answeredCount > 0 && !window.confirm("시험을 포기할까요? 진행 상황은 저장되지 않습니다.")) e.preventDefault();
            }}
          >
            Surrender
          </Link>
        </span>
      </div>

      <div className="progress-line" style={{ maxWidth: "none", marginTop: -1 }} aria-hidden>
        <span style={{ width: `${(answeredCount / total) * 100}%` }} />
      </div>

      {question.kind === "spot" && question.spot ? (
        <SpotStage question={question} />
      ) : (
        <div className="exam__term">
          <p className="eyebrow">{question.category}</p>
          <h1 className="exam__prompt">{question.prompt}</h1>
        </div>
      )}

      <div className="choices" role="radiogroup" aria-label="Your decision">
        {question.choices.map((choice, i) => {
          const selected = current === choice.id;
          const devCorrect = devMode && question.devCorrect === choice.id;
          return (
            <button
              key={choice.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`choice${question.kind === "term" ? " choice--term" : ""}${selected ? " is-selected" : ""}${devCorrect ? " is-dev-correct" : ""}`}
              onClick={() => select(choice.id)}
            >
              <span className="choice__key">{KEYS[i]}</span>
              {choice.text}
            </button>
          );
        })}
      </div>

      <div className="exam__foot">
        <button type="button" className="link link--mute" disabled={index === 0} onClick={() => setIndex(index - 1)}>
          ← Previous
        </button>
        <span className="eyebrow">Play · Think · Grow</span>
        <button
          id="exam-next"
          type="button"
          className="btn"
          disabled={!current || pending || (isLast && answeredCount < total)}
          onClick={next}
        >
          {pending ? "Grading…" : isLast ? "Finish exam" : "Next"} <span className="arrow">→</span>
        </button>
      </div>

      {devMode && (
        <div className="exam__foot" style={{ borderTop: "1px solid var(--dev)", marginTop: 24 }}>
          <span className="dev-note">DEV · 보라색 표시 = 최고 빈도 액션</span>
          <span style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="btn btn--sm btn--dev" onClick={devFillCorrect}>
              정답 자동 채우기
            </button>
            <button type="button" className="btn btn--sm btn--dev" disabled={pending} onClick={() => submit(answers)}>
              바로 제출
            </button>
          </span>
        </div>
      )}
    </div>
  );
}

function SpotStage({ question }: { question: PublicQuestion }) {
  const spot = question.spot!;
  const call = toCall(spot);
  return (
    <div className="exam__stage">
      <div>
        <PokerTable spot={spot} />
        <ActionHistory spot={spot} />
        <p className="exam__prompt" style={{ marginTop: 22 }}>{question.prompt}</p>
      </div>
      <aside className="exam__aside">
        <div>
          <p className="eyebrow">Your hand · {spot.heroPosition}</p>
          {spot.heroCards && <HeroHand cards={spot.heroCards} />}
        </div>
        <div>
          <div className="aside-row">
            <span>Effective</span>
            <span>{spot.stackBb}BB</span>
          </div>
          <div className="aside-row">
            <span>Pot</span>
            <span>{spot.potBb}BB</span>
          </div>
          <div className="aside-row">
            <span>To call</span>
            <span>{call > 0 ? `${call}BB` : "—"}</span>
          </div>
          <div className="aside-row">
            <span>Spot</span>
            <span>{question.category}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
