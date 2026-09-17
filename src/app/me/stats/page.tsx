import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOnboardedUser } from "@/lib/auth/session";
import { formatDate, getPlayerSnapshot, listProofHistory } from "@/lib/player";
import { getExamSource } from "@/lib/exams/registry";
import { GradeGlyph } from "@/components/Medal";

export const metadata = { title: "Stats — POKER PLAYER GROW" };

/** 나 vs 과거의 나: 시험별 Personal Best 와 전체 증명 기록 */
export default async function StatsPage() {
  const user = await requireOnboardedUser();
  const player = await getPlayerSnapshot(user);
  if (!player) redirect("/onboarding/handle");

  const exams = await getExamSource().listExams();
  const history = listProofHistory(user.id, exams, 100);

  const bests = exams.map((exam) => {
    const attempts = history.filter((h) => h.examId === exam.id); // 최신순
    const best = attempts.reduce((m, a) => Math.max(m, a.score), 0);
    const previousBest = attempts.slice(1).reduce((m, a) => Math.max(m, a.score), 0);
    const latest = attempts[0];
    return { exam, attempts: attempts.length, best, latest, personalBest: latest && latest.score === best && attempts.length > 1 && best > previousBest ? best - previousBest : 0 };
  });

  return (
    <div className="shell">
      <header className="page-head">
        <div>
          <p className="eyebrow">Stats · You vs. past you</p>
          <h1 className="display page-head__title">Proof history.</h1>
        </div>
        <span className="meta">{player.proofCount} proofs · Lv.{player.level}</span>
      </header>

      <section className="section">
        <div className="skills">
          {bests.map(({ exam, attempts, best, latest, personalBest }) => (
            <div key={exam.id} className="skill" style={{ alignItems: "flex-end" }}>
              <div>
                <div className="serif" style={{ fontSize: 26, lineHeight: 1.1 }}>{exam.title}</div>
                <p className="meta" style={{ marginTop: 8 }}>
                  {attempts} attempts · Latest {latest ? `${latest.score}pt` : "—"}
                </p>
                {personalBest > 0 && (
                  <p className="eyebrow eyebrow--ink" style={{ marginTop: 6 }}>Personal best +{personalBest}</p>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="stat__value">{attempts ? best : "—"}</div>
                <div className="eyebrow stat__label">Best</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        {history.length === 0 ? (
          <p className="notice">
            아직 기록이 없습니다. <Link href="/exams" className="link">첫 증명 시작하기</Link>
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table-list">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Exam</th>
                  <th>Score</th>
                  <th>Grade</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.attemptId}>
                    <td className="meta">{formatDate(h.createdAt)}</td>
                    <td>{h.examTitle}</td>
                    <td>{h.score}</td>
                    <td><GradeGlyph grade={h.grade === "F" ? null : h.grade} size={26} /></td>
                    <td style={{ textAlign: "right" }}>
                      <Link href={`/exams/result/${h.attemptId}`} className="link link--mute">Result</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
