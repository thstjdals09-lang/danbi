import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth/session";
import { getExamSource } from "@/lib/exams/registry";
import { gradeFor } from "@/lib/exams/grading";
import { bestScores } from "@/lib/repo/attempts";
import { GradeBadge } from "@/components/GradeBadge";

export default async function AcademyPage() {
  const user = await requireOnboardedUser();
  const exams = await getExamSource().listExams();
  const best = bestScores(user.id);

  return (
    <div className="stack">
      <div>
        <p className="eyebrow">Poker Academy</p>
        <h1>다음 증명을 선택하세요</h1>
        <p className="muted">시험 중에는 정답을 알려주지 않습니다. 모든 문제를 푼 뒤 결과가 공개됩니다.</p>
      </div>

      <div className="grid">
        {exams.map((exam) => {
          const score = best[exam.id];
          return (
            <div key={exam.id} className="card stack">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="pill">{exam.domain} · {exam.skill}</span>
                {score !== undefined && <GradeBadge grade={gradeFor(score)} size={24} />}
              </div>
              <h3>{exam.title}</h3>
              <p className="muted" style={{ margin: 0 }}>{exam.description}</p>
              <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                {exam.questionCount}문항 · 난이도 {"★".repeat(exam.difficulty)}
                {score !== undefined && ` · 최고 ${score}점`}
              </p>
              {exam.studyResources && exam.studyResources.length > 0 && (
                <div style={{ fontSize: 13 }}>
                  <span className="muted">추천 학습자료: </span>
                  {exam.studyResources.map((r) => (
                    <a key={r.url} href={r.url} target="_blank" rel="noreferrer" style={{ marginRight: 8 }}>
                      {r.title}
                    </a>
                  ))}
                </div>
              )}
              <Link href={`/exams/${exam.id}`} className="btn btn-primary">
                {score === undefined ? "응시하기" : "다시 응시"}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
