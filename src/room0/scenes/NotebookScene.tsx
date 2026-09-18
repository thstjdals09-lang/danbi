"use client";

import { useMemo, useState } from "react";
import { useGame } from "@/room0/state/GameProvider";
import { EVIDENCE, evidenceById } from "@/room0/data/evidence";
import { caseById } from "@/room0/data/cases";
import { RELATIONS, findRelation } from "@/room0/data/relations";
import {
  hypothesesForCase,
  hypothesisAvailable,
  hypothesisSatisfied,
  slotKey,
} from "@/room0/data/hypotheses";
import { EvidenceMark } from "@/room0/components/EvidenceMark";
import type { CaseId, EvidenceDef, EvidenceId, EvidenceStatus } from "@/room0/state/types";

/* NOTEBOOK — 증거 짝맞추기가 아니라 조사자의 작업 공간.
   플레이어는 사건의 질문에 답하는 가설을 세우고, "왜 그렇게 생각하는가" 를 기록으로 채운다.
   연결선은 목표가 아니라, 가설이 검증되면 시스템이 자동으로 정리해 주는 결과다. */

function statusOf(def: EvidenceDef, game: ReturnType<typeof useGame>["game"], usedIds: Set<EvidenceId>): EvidenceStatus {
  if (!game.evidenceCollected.includes(def.id)) return "locked";
  if (usedIds.has(def.id)) return "used";
  if (def.unresolved) return "unresolved";
  if (game.evidenceReviewed.includes(def.id)) return "reviewed";
  return "unreviewed";
}

const STATUS_LABEL: Record<EvidenceStatus, string> = {
  locked: "NOT ON RECORD",
  unreviewed: "UNREVIEWED",
  reviewed: "REVIEWED",
  unresolved: "UNRESOLVED",
  used: "USED IN HYPOTHESIS",
};

function CaseBlock({ caseId }: { caseId: CaseId }) {
  const { game, dispatch, fx } = useGame();
  const activeCase = caseById(caseId);
  const hypotheses = hypothesesForCase(caseId);
  const hyp = hypotheses[0];

  const [openId, setOpenId] = useState<EvidenceId | null>(null);
  const [assigning, setAssigning] = useState<EvidenceId | null>(null);
  const [review, setReview] = useState(false);
  const [crossRef, setCrossRef] = useState<EvidenceId | null>(null);

  const confirmed = game.hypothesesConfirmed.includes(hyp.id);
  const ready = hypothesisSatisfied(hyp, game.hypothesisSlots);
  const available = hypothesisAvailable(hyp, game.evidenceCollected);

  const usedIds = useMemo(() => {
    const set = new Set<EvidenceId>();
    for (const s of hyp.slots) {
      const id = game.hypothesisSlots[slotKey(hyp.id, s.id)];
      if (id) set.add(id);
    }
    return set;
  }, [game.hypothesisSlots, hyp]);

  const rows = activeCase.evidenceIds
    .map((id) => evidenceById(id))
    .filter((e): e is EvidenceDef => Boolean(e));

  const openEvidence = (def: EvidenceDef, unlocked: boolean) => {
    if (!unlocked) {
      fx("deny", "deny");
      dispatch({ type: "room/inspect", id: `note-${def.id}`, log: "NOT ON RECORD YET." });
      return;
    }
    fx("tap", "touch");
    setOpenId(openId === def.id ? null : def.id);
    setCrossRef(null);
    dispatch({ type: "note/review", id: def.id });
  };

  const assignTo = (slotId: string) => {
    if (!assigning) return;
    const evidenceId = assigning;
    const slot = hyp.slots.find((s) => s.id === slotId);
    const ok = slot ? slot.accepts.includes(evidenceId) : false;
    fx(ok ? "record" : "deny", ok ? "clue" : "deny");
    dispatch({ type: "note/assign", hypothesisId: hyp.id, slotId, evidenceId });
    setAssigning(null);
    setOpenId(null);
  };

  const testPair = (a: EvidenceId, b: EvidenceId) => {
    const rel = findRelation(a, b);
    fx(rel && !game.relationsConfirmed.includes(rel.id) ? "record" : "deny", rel ? "clue" : "deny");
    dispatch({ type: "note/test", a, b });
    setCrossRef(null);
  };

  const establishedRelations = RELATIONS.filter((r) => r.caseId === caseId && game.relationsConfirmed.includes(r.id));

  /* 이 사건의 기록철. 메타 표시는 하지 않는다 — 플레이어가 스스로 기억하게 둔다. */
  const extra = EVIDENCE.filter(
    (e) =>
      !activeCase.evidenceIds.includes(e.id) &&
      e.caseId === caseId &&
      game.evidenceCollected.includes(e.id),
  );

  return (
    <>
        {/* ── 사건과 지금 묻고 있는 것 ───────────────────────────── */}
        <section className="r0-case">
          <span className="r0-case__no">CASE {activeCase.index}</span>
          <h2 className="r0-case__title">{activeCase.title}</h2>
          <span className="r0-case__status" data-confirmed={confirmed ? "true" : undefined}>
            {confirmed ? "HYPOTHESIS SUPPORTED" : "OPEN"}
          </span>

          <p className="r0-case__ask">ACTIVE QUESTION</p>
          <p className="r0-case__question">{hyp.question}</p>
          <p className="r0-case__questionKo">{hyp.questionKo}</p>
        </section>

        {/* ── 가설 작업 공간 ──────────────────────────────────── */}
        <section className="r0-hyp" data-confirmed={confirmed ? "true" : undefined}>
          <header className="r0-hyp__head">
            <span>HYPOTHESIS</span>
            <span className="r0-hyp__count">
              {hyp.slots.filter((s) => game.hypothesisSlots[slotKey(hyp.id, s.id)]).length}/{hyp.slots.length}
            </span>
          </header>

          {!available ? (
            <p className="r0-hyp__empty">기록이 더 필요하다. 아직 세울 수 있는 가설이 없다.</p>
          ) : (
            <ol className="r0-hyp__slots">
              {hyp.slots.map((slot) => {
                const placedId = game.hypothesisSlots[slotKey(hyp.id, slot.id)];
                const placed = placedId ? evidenceById(placedId) : undefined;
                const targeting = Boolean(assigning);
                return (
                  <li key={slot.id} className="r0-slot" data-filled={placed ? "true" : undefined} data-target={targeting ? "true" : undefined}>
                    <button
                      type="button"
                      className="r0-slot__hit"
                      disabled={confirmed && !placed}
                      onClick={() => {
                        if (assigning) {
                          assignTo(slot.id);
                          return;
                        }
                        if (placed && !confirmed) {
                          fx("tap", "touch");
                          dispatch({ type: "note/unassign", hypothesisId: hyp.id, slotId: slot.id });
                        }
                      }}
                    >
                      <span className="r0-slot__label">{slot.label}</span>
                      {placed ? (
                        <span className="r0-slot__entry">
                          <EvidenceMark def={placed} />
                          <span className="r0-slot__entryText">
                            <span className="r0-slot__code">{placed.code}</span>
                            <span className="r0-slot__src">{placed.label}</span>
                          </span>
                        </span>
                      ) : (
                        <span className="r0-slot__ask">
                          {targeting ? (
                            "여기에 넣기"
                          ) : (
                            <>
                              {hyp.guidance !== "open" && <span className="r0-slot__askEn">{slot.ask}</span>}
                              {hyp.guidance === "guided" && <span className="r0-slot__askKo">{slot.askKo}</span>}
                            </>
                          )}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          )}

          {assigning && (
            <p className="r0-hyp__prompt">
              {evidenceById(assigning)?.code} — 어느 칸의 근거인가?
              <button type="button" className="r0-hyp__cancel" onClick={() => { fx("tap", "touch"); setAssigning(null); }}>
                취소
              </button>
            </p>
          )}

          {!confirmed && available && (
            <button
              type="button"
              className="r0-hyp__review"
              disabled={!ready}
              onClick={() => {
                fx("tap", "touch");
                setReview(true);
              }}
            >
              REVIEW HYPOTHESIS
            </button>
          )}

          {confirmed && (
            <div className="r0-hyp__result">
              <p className="r0-hyp__statement">{hyp.statement}</p>
              <p className="r0-hyp__statementKo">{hyp.statementKo}</p>
            </div>
          )}
        </section>

        {/* ── 검증된 사건 파일 ─────────────────────────────────── */}
        {confirmed && (
          <section className="r0-summary">
            <header className="r0-summary__head">
              CASE {activeCase.index} — {activeCase.title}
            </header>
            <p className="r0-summary__label">FINDING</p>
            {hyp.finding.map((line) => (
              <p key={line} className="r0-summary__line">
                {line}
              </p>
            ))}
            <p className="r0-summary__label">STATUS</p>
            <p className="r0-summary__status">{hyp.status}</p>

            {establishedRelations.length > 0 && (
              <>
                <p className="r0-summary__label">SUPPORTING RELATIONS</p>
                {establishedRelations.map((r) => (
                  <p key={r.id} className="r0-summary__rel">
                    <span>
                      {evidenceById(r.pair[0])?.code} ↔ {evidenceById(r.pair[1])?.code}
                    </span>
                    {r.deduction}
                  </p>
                ))}
              </>
            )}
          </section>
        )}

        {/* ── 기록철 ──────────────────────────────────────────── */}
        <section className="r0-file">
          <header className="r0-file__head">
            <span className="r0-file__no">EVIDENCE</span>
            <span className="r0-file__hint">기록을 눌러 펼친다</span>
          </header>

          <ul className="r0-file__list">
            {[...rows, ...extra].map((ev, i) => {
              const status = statusOf(ev, game, usedIds);
              const unlocked = status !== "locked";
              const open = openId === ev.id;
              return (
                <li key={ev.id} className="r0-rec" data-status={status} data-open={open ? "true" : undefined}>
                  <button
                    type="button"
                    className="r0-rec__hit"
                    aria-expanded={open}
                    aria-label={unlocked ? `${ev.label} ${ev.code}` : "미확인 기록"}
                    onClick={() => openEvidence(ev, unlocked)}
                  >
                    <span className="r0-rec__idx">{String(i + 1).padStart(2, "0")}</span>
                    <EvidenceMark def={ev} locked={!unlocked} />
                    <span className="r0-rec__main">
                      <span className="r0-rec__label">{unlocked ? ev.label : "———————"}</span>
                      <span className="r0-rec__code">{unlocked ? ev.code : "SEALED"}</span>
                      <span className="r0-rec__src">{unlocked ? ev.source : ""}</span>
                    </span>
                    <span className="r0-rec__status">{STATUS_LABEL[status]}</span>
                  </button>

                  {open && unlocked && (
                    <div className="r0-rec__body">
                      <p className="r0-rec__note">{ev.note}</p>
                      <div className="r0-rec__acts">
                        {!confirmed && (
                          <button
                            type="button"
                            className="r0-rec__act"
                            onClick={() => {
                              fx("tap", "touch");
                              setAssigning(ev.id);
                              setOpenId(null);
                            }}
                          >
                            ADD TO HYPOTHESIS
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        className="r0-rec__tool"
                        aria-expanded={crossRef === ev.id}
                        onClick={() => {
                          fx("tap", "touch");
                          setCrossRef(crossRef === ev.id ? null : ev.id);
                        }}
                      >
                        cross-reference
                      </button>

                      {crossRef === ev.id && (
                        <div className="r0-xref">
                          <p className="r0-xref__ask">어느 기록과 대조하는가</p>
                          <div className="r0-xref__list">
                            {rows
                              .filter((o) => o.id !== ev.id && game.evidenceCollected.includes(o.id))
                              .map((o) => (
                                <button key={o.id} type="button" className="r0-xref__item" onClick={() => testPair(ev.id, o.id)}>
                                  {o.code}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

        </section>

        {/* ── 남은 질문 ───────────────────────────────────────── */}
        {confirmed && (
          <section className="r0-open">
            <p className="r0-open__label">UNRESOLVED QUESTION</p>
            <p className="r0-open__q">{hyp.followupQuestion}</p>
            <p className="r0-open__qKo">{hyp.followupQuestionKo}</p>
          </section>
        )}

      {/* ── 가설 최종 확인 ─────────────────────────────────────── */}
      {review && (
        <div className="r0-detail" role="dialog" aria-modal="true" aria-label="가설 검토">
          <div className="r0-detail__scrim" onClick={() => setReview(false)} />
          <div className="r0-detail__stage r0-detail__stage--wide">
            <div className="r0-verify">
              <p className="r0-verify__label">HYPOTHESIS</p>
              <p className="r0-verify__statement">{hyp.statement}</p>
              <p className="r0-verify__statementKo">{hyp.statementKo}</p>

              <p className="r0-verify__label">SUPPORTED BY</p>
              <ul className="r0-verify__list">
                {hyp.slots.map((s) => {
                  const id = game.hypothesisSlots[slotKey(hyp.id, s.id)];
                  const def = id ? evidenceById(id) : undefined;
                  return (
                    <li key={s.id}>
                      <span className="r0-verify__slot">{s.label}</span>
                      <span className="r0-verify__code">{def?.code ?? "—"}</span>
                    </li>
                  );
                })}
              </ul>

              <div className="r0-verify__acts">
                <button
                  type="button"
                  className="r0-verify__confirm"
                  onClick={() => {
                    fx("recover", "recover");
                    dispatch({ type: "note/confirm", hypothesisId: hyp.id });
                    setReview(false);
                  }}
                >
                  CONFIRM
                </button>
                <button type="button" className="r0-verify__back" onClick={() => { fx("tap", "touch"); setReview(false); }}>
                  RETURN TO EVIDENCE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function NotebookScene() {
  const { game } = useGame();
  /* 도달한 사건만 기록철에 나타난다 */
  const cases: CaseId[] = ["case00"];
  if (game.frontDeskUnlocked || game.casesClosed.includes("case00")) cases.push("case01");

  return (
    <div className="r0-scene r0-scene--note">
      <div className="r0-note">
        <div className="r0-note__head">
          <span>INVESTIGATION RECORD</span>
          <span>
            {game.evidenceCollected.length} / {EVIDENCE.length} FILED
          </span>
        </div>

        {cases.map((id) => (
          <CaseBlock key={id} caseId={id} />
        ))}
      </div>

    </div>
  );
}
