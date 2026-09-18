"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useGame } from "@/room0/state/GameProvider";
import { EVIDENCE, evidenceById } from "@/room0/data/evidence";
import { RELATIONS, findRelation } from "@/room0/data/relations";
import { caseById } from "@/room0/data/cases";
import type { CaseId, EvidenceId } from "@/room0/state/types";

/* NOTEBOOK — 인벤토리가 아니라 추리판.
   확정된 관계는 좌측 여백에 실로 남고, 이후 Deduction Board 로 확장된다. */

interface Thread {
  id: string;
  y1: number;
  y2: number;
  depth: number;
}

function CaseFile({ caseId }: { caseId: CaseId }) {
  const { game, dispatch, fx } = useGame();
  const def = caseById(caseId);
  const closed = game.casesClosed.includes(caseId);
  const [selected, setSelected] = useState<EvidenceId[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const listRef = useRef<HTMLUListElement>(null);
  const rowRefs = useRef<Map<EvidenceId, HTMLLIElement>>(new Map());

  const rows = def.evidenceIds.map((id) => evidenceById(id)).filter((e) => e !== undefined);

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const base = list.getBoundingClientRect();
    const next: Thread[] = [];
    RELATIONS.filter((r) => r.caseId === caseId && game.relationsConfirmed.includes(r.id)).forEach((r, i) => {
      const a = rowRefs.current.get(r.pair[0]);
      const b = rowRefs.current.get(r.pair[1]);
      if (!a || !b) return;
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      next.push({
        id: r.id,
        y1: ra.top - base.top + ra.height / 2,
        y2: rb.top - base.top + rb.height / 2,
        depth: i,
      });
    });
    setThreads(next);
  }, [caseId, game.relationsConfirmed]);

  useLayoutEffect(() => { measure(); }, [measure]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const toggle = (id: EvidenceId, unlocked: boolean) => {
    if (!unlocked) {
      fx("deny", "deny");
      dispatch({ type: "room/inspect", id: `note-${id}`, log: "NOT ON RECORD YET." });
      return;
    }
    fx("tap", "touch");
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const test = () => {
    if (selected.length !== 2) return;
    const [a, b] = selected;
    const rel = findRelation(a, b);
    if (rel && !game.relationsConfirmed.includes(rel.id)) fx("record", "clue");
    else fx("deny", "deny");
    dispatch({ type: "note/test", a, b });
    setSelected([]);
  };

  const confirmed = RELATIONS.filter((r) => r.caseId === caseId && game.relationsConfirmed.includes(r.id));

  return (
    <section className="r0-file" data-closed={closed ? "true" : undefined}>
      <header className="r0-file__head">
        <span className="r0-file__no">CASE {def.index}</span>
        <h2 className="r0-file__title">{def.title}</h2>
        <p className="r0-file__q">{def.question}</p>
        <span className="r0-file__status">{closed ? "CLOSED" : def.id === game.currentCase ? "OPEN" : "PENDING"}</span>
      </header>

      <div className="r0-file__body">
        <svg className="r0-file__threads" aria-hidden>
          {threads.map((t) => (
            <path
              key={t.id}
              d={`M 22 ${t.y1} C ${6 - t.depth * 3} ${t.y1}, ${6 - t.depth * 3} ${t.y2}, 22 ${t.y2}`}
              className="r0-file__thread"
            />
          ))}
        </svg>

        <ul className="r0-file__list" ref={listRef}>
          {rows.map((ev, i) => {
            const unlocked = game.evidenceCollected.includes(ev.id);
            const linked = confirmed.some((r) => r.pair.includes(ev.id));
            return (
              <li
                key={ev.id}
                ref={(el) => {
                  if (el) rowRefs.current.set(ev.id, el);
                  else rowRefs.current.delete(ev.id);
                }}
                className="r0-rec"
                data-locked={!unlocked ? "true" : undefined}
                data-selected={selected.includes(ev.id) ? "true" : undefined}
                data-linked={linked ? "true" : undefined}
              >
                <button
                  type="button"
                  className="r0-rec__hit"
                  onClick={() => toggle(ev.id, unlocked)}
                  aria-pressed={selected.includes(ev.id)}
                  aria-label={unlocked ? `${ev.label} ${ev.code}` : "미확인 기록"}
                >
                  <span className="r0-rec__idx">{String(i + 1).padStart(2, "0")}</span>
                  <span className="r0-rec__main">
                    <span className="r0-rec__label">{unlocked ? ev.label : "———————"}</span>
                    <span className="r0-rec__code">{unlocked ? ev.code : "NOT ON RECORD"}</span>
                    <span className="r0-rec__source">{unlocked ? ev.source : "SEALED"}</span>
                    {unlocked && <span className="r0-rec__note">{ev.note}</span>}
                  </span>
                  <span className="r0-rec__pick" aria-hidden>
                    {selected.includes(ev.id) ? "◼" : unlocked ? "◻" : "▨"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="r0-file__test">
        <p className="r0-file__testHint">
          {selected.length === 0
            ? "기록 두 건을 골라 관계를 시험한다."
            : selected.length === 1
              ? "한 건 더 고른다."
              : "두 건이 선택됐다."}
        </p>
        <button type="button" className="r0-file__testBtn" disabled={selected.length !== 2} onClick={test}>
          TEST CONNECTION
        </button>
      </div>

      {confirmed.length > 0 && (
        <div className="r0-file__links">
          <h3 className="r0-file__linksHead">ESTABLISHED — {confirmed.length}/{def.relationIds.length}</h3>
          {confirmed.map((r) => (
            <p key={r.id} className="r0-file__link">
              <span className="r0-file__linkPair">
                {evidenceById(r.pair[0])?.code} ↔ {evidenceById(r.pair[1])?.code}
              </span>
              {r.deduction}
            </p>
          ))}
        </div>
      )}

      {closed && (
        <p className="r0-file__seal">CASE {def.index} CLOSED — FILE FORWARDED TO NIGHT MANAGER</p>
      )}
    </section>
  );
}

export function NotebookScene() {
  const { game } = useGame();
  const case00Closed = game.casesClosed.includes("case00");
  const nextCase = caseById("case01");
  const hasExt = game.evidenceCollected.includes("ext-3317");

  return (
    <div className="r0-scene r0-scene--note">
      <div className="r0-note">
        <div className="r0-note__head">
          <span>INVESTIGATION RECORD</span>
          <span>{game.evidenceCollected.length} / {EVIDENCE.length} FILED</span>
        </div>

        <CaseFile caseId="case00" />

        {(case00Closed || hasExt) && (
          <section className="r0-file r0-file--next">
            <header className="r0-file__head">
              <span className="r0-file__no">CASE {nextCase.index}</span>
              <h2 className="r0-file__title">{nextCase.title}</h2>
              <p className="r0-file__q">{nextCase.question}</p>
              <span className="r0-file__status">{case00Closed ? "OPEN" : "PENDING"}</span>
            </header>
            <p className="r0-file__teaser">{nextCase.teaser}</p>
            {hasExt && (
              <p className="r0-file__teaser r0-file__teaser--rec">
                EXTENSION 3317 — STAMPED UNDER THE TELEPHONE DIAL IN 504.
              </p>
            )}
            <p className="r0-file__teaser r0-file__teaser--dim">
              이 사건은 다음 조사에서 열린다.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
