import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireOnboardedUser } from "@/lib/auth/session";
import { getExamSource } from "@/lib/exams/registry";
import { PASS_SCORE, correctChoiceOf, isPassing, type Grade } from "@/lib/exams/grading";
import { getAttempt } from "@/lib/repo/attempts";
import { getPlayerSnapshot } from "@/lib/player";
import { GROWTH_STAGES } from "@/content/growth";
import { getIdentity } from "@/content/identities";
import { PlayerFigure } from "@/components/PlayerFigure";
import { CollectionObject } from "@/components/CollectionObject";
import { GradeGlyph, Stars } from "@/components/Medal";
import { ShowcaseToggle } from "@/components/ShowcaseToggle";
import { CountUp, ResultSequence, type ResultStep } from "./ResultSequence";

export const metadata = { title: "Exam Result — POKER PLAYER GROW" };

const GRADE_LINE: Record<Grade, string> = {
  S: "완벽한 판단입니다. 당신의 플레이가 증명되었습니다.",
  A: "정확한 판단. S까지 한 걸음 남았습니다.",
  B: "견고한 판단. 다음 목표는 A입니다.",
  C: "합격. 이제 증명이 시작됩니다.",
  F: `아직 증명되지 않았습니다. ${PASS_SCORE}점 이상이면 인증을 받습니다.`,
};

const stageName = (id: string) => GROWTH_STAGES.find((s) => s.id === id)?.name ?? id;

export default async function ExamResultPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const user = await requireOnboardedUser();
  const { attemptId } = await params;
  const attempt = getAttempt(Number(attemptId));
  if (!attempt || attempt.userId !== user.id) notFound();

  const exam = await getExamSource().getExam(attempt.examId);
  if (!exam) notFound();
  const player = await getPlayerSnapshot(user);
  if (!player) redirect("/onboarding/handle");

  const { rewards } = attempt;
  const passed = isPassing(attempt.grade);
  const family = player.avatar.originPersona.family;
  const cert = player.certifications.find((c) => c.examId === exam.id);
  const newGearIds = rewards.gear ?? [];
  const newGear = player.collection.filter(
    (i) => (i.type === "gear" || i.type === "background") && newGearIds.includes(i.id.slice(i.id.indexOf(":") + 1)),
  );
  const newTrophies = player.collection.filter((i) => i.type === "trophy" && rewards.trophies.includes(i.id.slice(7)));
  const certChanged = rewards.certification && rewards.certification.status !== "kept";
  const evolved = newGearIds.length > 0 || rewards.stage || rewards.identity || rewards.level;
  const nextExam = player.pursuit?.examId ?? exam.id;

  const steps: ResultStep[] = ["complete", "grade"];
  if (certChanged) steps.push("certification");
  if (newGear.length || newTrophies.length) steps.push("gear");
  if (evolved) steps.push("evolution");
  steps.push("final");

  const panels: Partial<Record<ResultStep, ReactNode>> = {
    complete: (
      <div>
        <p className="eyebrow">Exam complete · {exam.title}</p>
        <div className="result__score" style={{ marginTop: 20 }}>
          <CountUp to={attempt.score} />
          <span className="muted" style={{ fontSize: "0.3em" }}> / 100</span>
        </div>
        <p className="meta" style={{ marginTop: 18 }}>
          {exam.questions.length} decisions · {exam.scope.join(" · ")}
        </p>
      </div>
    ),

    grade: (
      <div>
        <p className="eyebrow">Exam result</p>
        <div className="result__grade" style={{ marginTop: 12 }}>
          <GradeGlyph grade={passed ? attempt.grade : null} size={180} />
          <span className="result__rank">{passed ? "RANK" : "NOT YET"}</span>
        </div>
        <p className="serif-kr" style={{ fontSize: 22, marginTop: 20, lineHeight: 1.5 }}>{GRADE_LINE[attempt.grade]}</p>
        <p className="meta" style={{ marginTop: 12 }}>{attempt.score} / 100</p>
      </div>
    ),

    certification: cert && rewards.certification && (
      <div style={{ display: "flex", gap: 36, alignItems: "center", flexWrap: "wrap" }}>
        <CollectionObject item={cert} size="lg" />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p className="eyebrow" style={{ color: "var(--accent)" }}>
            {rewards.certification.status === "new" ? "New certification" : `Grade up · ${rewards.certification.previousGrade} → ${rewards.certification.grade}`}
          </p>
          <h2 className="display" style={{ fontSize: "clamp(36px, 3.4vw, 52px)" }}>{cert.name}</h2>
          <dl className="cred-meta">
            <dt>Grade</dt>
            <dd>{cert.grade} Rank · {cert.score}pt</dd>
            <dt>Season</dt>
            <dd>{cert.season}</dd>
            <dt>Difficulty</dt>
            <dd><Stars value={cert.difficulty} /></dd>
            <dt>Rarity</dt>
            <dd>Owned by {cert.rarity.ownedPercent}% of players</dd>
            <dt>Owner</dt>
            <dd>@{cert.owner}</dd>
          </dl>
        </div>
      </div>
    ),

    gear: (
      <div>
        <p className="eyebrow" style={{ color: "var(--accent)" }}>{newGear.length ? "New gear unlocked" : "New trophy"}</p>
        <div className="reveal-grid" style={{ marginTop: 20 }}>
          {[...newGear, ...newTrophies].map((item) => (
            <div key={item.id} className="reveal-item">
              <CollectionObject item={item} size="sm" />
              <div>
                <span className="eyebrow">{item.rarity.tier ?? "Trophy"} {item.slotLabel ?? ""}</span>
                <div className="reveal-item__name">{item.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),

    evolution: (
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <p className="eyebrow" style={{ color: "var(--accent)" }}>Character evolution</p>
        <h2 className="display" style={{ fontSize: "clamp(40px, 4vw, 64px)" }}>
          Your player
          <br />
          has changed.
        </h2>
        <dl className="passport__lineage">
          {rewards.level && (
            <>
              <dt>Level</dt>
              <dd>Lv.{rewards.level.from} → Lv.{rewards.level.to}</dd>
            </>
          )}
          {rewards.stage && (
            <>
              <dt>Career</dt>
              <dd>{stageName(rewards.stage.from)} → {stageName(rewards.stage.to)}</dd>
            </>
          )}
          {rewards.identity && (
            <>
              <dt>Identity</dt>
              <dd>
                {getIdentity(rewards.identity.from)?.name ?? family.name} → {getIdentity(rewards.identity.to)?.name ?? family.name}
              </dd>
            </>
          )}
          {(rewards.equipped ?? []).length > 0 && (
            <>
              <dt>Wearing</dt>
              <dd>{newGear.filter((g) => g.isEquipped).map((g) => g.name).join(" · ")}</dd>
            </>
          )}
        </dl>
      </div>
    ),

    final: (
      <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 22, flexWrap: "wrap" }}>
          <GradeGlyph grade={passed ? attempt.grade : null} size={120} />
          <div style={{ paddingBottom: 10 }}>
            <p className="eyebrow">{exam.title} · {attempt.score}pt</p>
            <p className="serif-kr" style={{ fontSize: 19, marginTop: 8 }}>{GRADE_LINE[attempt.grade]}</p>
          </div>
        </div>

        {passed && cert?.ownedId && (
          <div className="reveal-grid">
            <div className="reveal-item" style={{ alignItems: "flex-start" }}>
              <CollectionObject item={cert} size="sm" />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span className="eyebrow">{certChanged ? "New certification" : "Certification"}</span>
                <div className="reveal-item__name">{cert.name}</div>
                <span className="meta">{cert.grade} Rank</span>
                <ShowcaseToggle collectibleId={cert.ownedId} isShowcased={cert.isShowcased} label="Add to showcase" />
              </div>
            </div>
            {[...newGear, ...newTrophies].slice(0, 3).map((item) =>
              item.ownedId ? (
                <div key={item.id} className="reveal-item" style={{ alignItems: "flex-start" }}>
                  <CollectionObject item={item} size="sm" />
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <span className="eyebrow">{item.type === "trophy" ? "New trophy" : "New gear unlocked"}</span>
                    <div className="reveal-item__name">{item.name}</div>
                    <span className="meta">{item.rarity.tier ?? `${item.rarity.ownedPercent}% own`} {item.slotLabel ?? ""}</span>
                    <ShowcaseToggle collectibleId={item.ownedId} isShowcased={item.isShowcased} />
                  </div>
                </div>
              ) : null,
            )}
          </div>
        )}

        <div className="result__actions">
          {passed ? (
            <Link href={`/${player.handle}`} className="btn btn--ghost">View my profile</Link>
          ) : (
            <Link href={`/exams/${exam.id}`} className="btn btn--ghost">Retake</Link>
          )}
          <Link href={nextExam === exam.id && player.pursuit === null ? "/exams" : `/exams/${nextExam}`} className="btn">
            계속 도전하기 <span className="arrow">→</span>
          </Link>
        </div>
      </div>
    ),
  };

  return (
    <div style={{ "--accent": family.accent } as CSSProperties}>
      <ResultSequence
        steps={steps}
        panels={panels}
        figure={<PlayerFigure avatar={player.avatar} variant="full" highlight={rewards.equipped ?? []} />}
      />

      <section className="shell review">
        <div className="section__head">
          <div>
            <p className="eyebrow">Review</p>
            <h2 className="section__title">Every decision</h2>
          </div>
          <Link href={`/exams/${exam.id}`} className="link">Retake exam</Link>
        </div>
        {exam.questions.map((q, i) => {
          const result = attempt.results.find((r) => r.questionId === q.id);
          const chosen = q.choices.find((c) => c.id === result?.choiceId);
          const best = q.choices.find((c) => c.id === correctChoiceOf(q));
          const points = result?.points ?? 0;
          return (
            <div key={q.id} className="review__item">
              <span className="review__num">{String(i + 1).padStart(2, "0")}</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span className="eyebrow">
                  {q.category}
                  {q.kind === "spot" ? ` · ${q.spot.situation} · ${q.spot.hand}` : ""}
                </span>
                <span style={{ fontWeight: 500 }}>{q.prompt}</span>
                <span className="muted" style={{ fontSize: 13.5 }}>
                  Your decision · {chosen?.text ?? "—"}
                  {points < 1 && best ? `  /  Best · ${best.text}` : ""}
                </span>
                {q.kind === "spot" && (
                  <span className="meta">
                    Strategy ·{" "}
                    {q.choices
                      .filter((c) => q.strategy[c.id])
                      .map((c) => `${c.text} ${Math.round((q.strategy[c.id] ?? 0) * 100)}%`)
                      .join("  ·  ")}
                  </span>
                )}
                {q.explanation && <span style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.75 }}>{q.explanation}</span>}
              </div>
              <span className="review__mark" style={{ color: points >= 1 ? "var(--ink)" : points > 0 ? "var(--mute)" : "var(--burgundy)" }}>
                {points >= 1 ? "Best" : points > 0 ? `Partial ${Math.round(points * 100)}%` : "Miss"}
              </span>
            </div>
          );
        })}
      </section>
    </div>
  );
}
