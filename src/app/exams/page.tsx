import type { CSSProperties } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOnboardedUser } from "@/lib/auth/session";
import { getPlayerSnapshot } from "@/lib/player";
import { bestScores } from "@/lib/repo/attempts";
import { getExamSource } from "@/lib/exams/registry";
import { Medal, Stars } from "@/components/Medal";

export const metadata = { title: "Exam — POKER PLAYER GROW" };

/**
 * Academy: 학습 플랫폼이 아니라 "다음 증명"을 고르는 곳.
 * 시험 범위, 현재 실력, 외부 학습자료, 응시만 제공한다.
 */
export default async function ExamsPage() {
  const user = await requireOnboardedUser();
  const player = await getPlayerSnapshot(user);
  if (!player) redirect("/onboarding/handle");

  const exams = await getExamSource().listExams();
  const best = bestScores(user.id);
  const family = player.avatar.originPersona.family;

  return (
    <div className="shell" style={{ "--accent": family.accent } as CSSProperties}>
      <header className="page-head">
        <div>
          <p className="eyebrow">The Academy · Proof exams</p>
          <h1 className="display page-head__title">Prove it.</h1>
        </div>
        <p className="muted" style={{ maxWidth: 360, fontSize: 13.5, lineHeight: 1.8 }}>
          시험 중에는 정답을 알려주지 않습니다. 실제 테이블처럼 끝까지 판단하고, 마지막에 결과가 공개됩니다.
        </p>
      </header>

      <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {exams.map((exam, index) => {
          const cert = player.certifications.find((c) => c.examId === exam.id);
          const isPursuit = player.pursuit?.examId === exam.id;
          const score = best[exam.id];
          return (
            <li
              key={exam.id}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) auto",
                gap: 32,
                alignItems: "center",
                padding: "44px 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", gap: 18, alignItems: "baseline", flexWrap: "wrap" }}>
                  <span className="serif muted" style={{ fontSize: 18 }}>0{index + 1}</span>
                  <span className="exam__scope meta">
                    {exam.scope.map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </span>
                  {isPursuit && (
                    <span className="eyebrow" style={{ color: "var(--accent)" }}>Current pursuit</span>
                  )}
                </div>
                <h2 className="display" style={{ fontSize: "clamp(40px, 4.6vw, 72px)" }}>{exam.title}</h2>
                <p className="muted" style={{ maxWidth: 560, fontSize: 14, lineHeight: 1.8 }}>{exam.description}</p>
                <div className="meta" style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
                  <span>{exam.questionCount} decisions</span>
                  <span>
                    Difficulty <Stars value={exam.difficulty} />
                  </span>
                  <span>Best {score !== undefined ? `${score}pt` : "—"}</span>
                  <span>Earns · {exam.certification.name}</span>
                </div>
                <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap", marginTop: 8 }}>
                  <Link href={`/exams/${exam.id}`} className="btn">
                    {score === undefined ? "Start exam" : "Retake"} <span className="arrow">→</span>
                  </Link>
                  {exam.studyResources?.map((r) => (
                    <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="link link--mute">
                      Study · {r.title} ↗
                    </a>
                  ))}
                </div>
              </div>
              <div className="credential">
                <Medal grade={cert?.isOwned ? cert.grade : null} code={exam.certification.code} size="lg" image={cert?.image} />
                <span className="eyebrow">{cert?.isOwned ? `Certified · ${cert.grade}` : "Not certified"}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
