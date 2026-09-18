"use client";

import { useState } from "react";
import { useGame } from "@/room0/state/GameProvider";
import { hintsForStage } from "@/room0/data/hints";
import type { Stage } from "@/room0/state/types";

/* 조사관 수첩에 끼워진 안내 쪽지. 정답을 말하지 않고 3단계로 좁힌다. */
export function AssistPanel({ stage, onClose }: { stage: Stage; onClose: () => void }) {
  const { game, dispatch, fx, reset } = useGame();
  const [confirmPurge, setConfirmPurge] = useState(false);
  const set = hintsForStage(stage);
  const used = game.hintsUsed[stage] ?? 0;
  const revealed = set ? set.steps.slice(0, used) : [];
  const remaining = set ? set.steps.length - used : 0;

  return (
    <div className="r0-sheet" role="dialog" aria-modal="true" aria-label="ASSIST">
      <div className="r0-sheet__scrim" onClick={onClose} />
      <div className="r0-sheet__paper">
        <div className="r0-sheet__head">
          <span className="r0-sheet__tag">OPERATOR NOTE</span>
          <button type="button" className="r0-sheet__close" onClick={onClose} aria-label="닫기">
            CLOSE
          </button>
        </div>

        <h2 className="r0-sheet__title">{set ? set.heading : "기록 없음"}</h2>

        {!set && <p className="r0-sheet__body">지금 국면에 대한 안내가 없다. 화면 안의 물건을 직접 조사하라.</p>}

        {revealed.length === 0 && set && (
          <p className="r0-sheet__body">
            막혔다면 한 줄씩 열어볼 수 있다. 먼저 화면을 조금 더 들여다보는 쪽을 권한다.
          </p>
        )}

        <ol className="r0-sheet__steps">
          {revealed.map((text, i) => (
            <li key={text}>
              <span className="r0-sheet__step">{i + 1}</span>
              {text}
            </li>
          ))}
        </ol>

        {remaining > 0 && (
          <button
            type="button"
            className="r0-sheet__more"
            onClick={() => {
              fx("tap", "touch");
              dispatch({ type: "hint/use", stage });
            }}
          >
            {used === 0 ? "안내 열기" : "한 줄 더 열기"} <span className="r0-sheet__count">남은 {remaining}</span>
          </button>
        )}

        <div className="r0-sheet__foot">
          <span>
            사용한 안내 {Object.values(game.hintsUsed).reduce((a, b) => a + (b ?? 0), 0)}줄 · 기록{" "}
            {game.evidenceCollected.length}건 · 가설 {game.hypothesesConfirmed.length}건
          </span>
          <button
            type="button"
            className="r0-sheet__purge"
            onClick={() => {
              if (!confirmPurge) {
                setConfirmPurge(true);
                return;
              }
              fx("deny", "deny");
              reset();
              onClose();
            }}
          >
            {confirmPurge ? "한 번 더 누르면 전부 지워진다" : "RECORD PURGE — 진행 초기화"}
          </button>
        </div>
      </div>
    </div>
  );
}
