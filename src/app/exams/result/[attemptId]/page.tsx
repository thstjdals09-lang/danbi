import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOnboardedUser } from "@/lib/auth/session";
import { getExamSource } from "@/lib/exams/registry";
import { PASS_SCORE, correctChoiceOf, isPassing } from "@/lib/exams/grading";
import { getAttempt } from "@/lib/repo/attempts";
import { GROWTH_STAGES } from "@/content/growth";
import { getTrophy } from "@/content/trophies";
import { characterImage, collectibleImage } from "@/lib/images";
import { ImageSlot } from "@/components/ImageSlot";
import { GradeBadge } from "@/components/GradeBadge";

const stageName = (id: string) => GROWTH_STAGES.find((s) => s.id === id)?.name ?? id;

export default async function ExamResultPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const user = await requireOnboardedUser();
  const { attemptId } = await params;
  const attempt = getAttempt(Number(attemptId));
  if (!attempt || attempt.userId !== user.id) notFound();

  const exam = await getExamSource().getExam(attempt.examId);
  if (!exam) notFound();

  const { rewards } = attempt;
  const passed = isPassing(attempt.grade);

  return (
    <div className="stack">
      <div className="card stack" style={{ alignItems: "center", textAlign: "center" }}>
        <p className="eyebrow">{exam.title}</p>
        <GradeBadge grade={attempt.grade} size={96} />
        <h2>{attempt.score}점</h2>
        <p className="muted" style={{ margin: 0 }}>
          {passed ? "합격 — 실력이 증명되었습니다." : `${PASS_SCORE}점 이상이면 인증을 받을 수 있습니다.`}
        </p>
      </div>

      {(rewards.certification || rewards.trophies.length > 0 || rewards.stage) && (
        <section className="stack">
          <h2>획득</h2>
          <div className="grid">
            {rewards.certification && rewards.certification.status !== "kept" && (
              <div className="card stack" style={{ alignItems: "center", textAlign: "center" }}>
                <ImageSlot image={collectibleImage("certification", exam.id)} alt="인증서" width={96} height={96} />
                <p className="eyebrow">
                  {rewards.certification.status === "new" ? "New Certification" : "Grade Up"}
                </p>
                <strong>{exam.skill} — <GradeBadge grade={rewards.certification.grade} size={18} /></strong>
                {rewards.certification.previousGrade && (
                  <span className="muted">이전 등급 {rewards.certification.previousGrade}</span>
                )}
              </div>
            )}
            {rewards.trophies.map((key) => {
              const trophy = getTrophy(key);
              return (
                <div key={key} className="card stack" style={{ alignItems: "center", textAlign: "center" }}>
                  <ImageSlot image={collectibleImage("trophy", key)} alt={trophy?.name ?? key} width={96} height={96} />
                  <p className="eyebrow">New Trophy</p>
                  <strong>{trophy?.name ?? key}</strong>
                </div>
              );
            })}
          </div>

          {rewards.stage && user.personaId && (
            <div className="card stack" style={{ alignItems: "center", textAlign: "center" }}>
              <p className="eyebrow">Character Evolution</p>
              <div className="row" style={{ justifyContent: "center" }}>
                <ImageSlot image={characterImage(user.personaId, rewards.stage.from)} alt={stageName(rewards.stage.from)} width={140} height={180} />
                <span style={{ fontSize: 28 }}>→</span>
                <ImageSlot image={characterImage(user.personaId, rewards.stage.to)} alt={stageName(rewards.stage.to)} width={140} height={180} />
              </div>
              <strong>{stageName(rewards.stage.from)} → {stageName(rewards.stage.to)}</strong>
            </div>
          )}

          <div className="row">
            <Link href="/me/showcase" className="btn btn-primary">쇼케이스에 전시하기</Link>
            <Link href={`/${user.handle}`} className="btn">내 프로필 보기</Link>
          </div>
        </section>
      )}

      <section className="stack">
        <h2>문제 리뷰</h2>
        {exam.questions.map((q, i) => {
          const result = attempt.results.find((r) => r.questionId === q.id);
          const correctId = correctChoiceOf(q);
          const chosen = q.choices.find((c) => c.id === result?.choiceId);
          const correct = q.choices.find((c) => c.id === correctId);
          const ok = (result?.points ?? 0) >= 1;
          return (
            <div key={q.id} className="card stack" style={{ gap: 8 }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="eyebrow">Q{i + 1} · {q.category}</span>
                <strong style={{ color: ok ? "var(--ok)" : "var(--danger)" }}>{ok ? "정답" : "오답"}</strong>
              </div>
              <strong>{q.prompt}</strong>
              <span className="muted">내 답: {chosen?.text ?? "(미응답)"}</span>
              {!ok && <span>정답: {correct?.text}</span>}
              {q.explanation && <span className="muted" style={{ fontSize: 14 }}>{q.explanation}</span>}
            </div>
          );
        })}
      </section>

      <div className="row">
        <Link href={`/exams/${exam.id}`} className="btn">다시 응시</Link>
        <Link href="/exams" className="btn">Academy로</Link>
      </div>
    </div>
  );
}
