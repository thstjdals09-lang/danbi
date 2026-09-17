import Link from "next/link";
import { redirect } from "next/navigation";
import { TAGLINE } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth/session";
import { careerStage, currentPursuit } from "@/lib/career";
import { getPersona } from "@/content/personas";
import { characterImage } from "@/lib/images";
import { latestAttempts } from "@/lib/repo/attempts";
import { getExamSource } from "@/lib/exams/registry";
import { ImageSlot } from "@/components/ImageSlot";
import { GradeBadge } from "@/components/GradeBadge";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="stack" style={{ paddingTop: 48 }}>
        <p className="eyebrow">포커플레이어 키우기</p>
        <h1 style={{ fontSize: 44 }}>{TAGLINE}</h1>
        <p className="muted">
          내 포커 플레이어를 만들고, 실력을 시험으로 증명하고, 그 커리어를 전시하세요.
        </p>
        <div className="row">
          <Link href="/signup" className="btn btn-primary">내 플레이어 만들기</Link>
          <Link href="/login" className="btn">로그인</Link>
        </div>
      </div>
    );
  }

  if (!user.personaId) redirect("/onboarding/persona");
  if (!user.handle) redirect("/onboarding/handle");

  const persona = getPersona(user.personaId);
  const { stage, next, certCount } = careerStage(user.id);
  const pursuit = await currentPursuit(user.id);
  const exams = await getExamSource().listExams();
  const recent = latestAttempts(user.id, 5);

  return (
    <div className="stack">
      <section className="card row" style={{ alignItems: "flex-start", gap: 24 }}>
        <ImageSlot image={characterImage(user.personaId, stage.id)} alt={persona?.title ?? ""} width={180} height={240} label="캐릭터" />
        <div className="stack" style={{ flex: 1, minWidth: 220 }}>
          <div>
            <p className="eyebrow">{stage.name}</p>
            <h1>{user.nickname}</h1>
            <p className="muted" style={{ margin: 0 }}>{persona?.title}</p>
          </div>
          {next && (
            <div className="stack" style={{ gap: 6 }}>
              <span className="muted" style={{ fontSize: 13 }}>
                다음 단계 {next.name} · 인증 {certCount} / {next.minCertifications}
              </span>
              <div className="progress">
                <div style={{ width: `${Math.min(100, (certCount / next.minCertifications) * 100)}%` }} />
              </div>
            </div>
          )}
          <Link href={`/${user.handle}`}>공개 프로필 /{user.handle}</Link>
        </div>
      </section>

      {pursuit ? (
        <section className="card stack" style={{ borderColor: "var(--accent)" }}>
          <p className="eyebrow" style={{ color: "var(--accent)" }}>Current Pursuit</p>
          <h2>{pursuit.goal}</h2>
          <span className="muted">
            최고 {pursuit.current}점 / 목표 {pursuit.target}점 · 보상: {pursuit.reward}
          </span>
          <div className="progress">
            <div style={{ width: `${Math.min(100, (pursuit.current / pursuit.target) * 100)}%` }} />
          </div>
          <Link href={`/exams/${pursuit.examId}`} className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
            {pursuit.title} 응시하기
          </Link>
        </section>
      ) : (
        <section className="card">
          <p className="muted">현재 모든 증명을 완료했습니다. 새로운 시험을 기다려 주세요.</p>
        </section>
      )}

      {recent.length > 0 && (
        <section className="card stack">
          <h2>최근 시험</h2>
          <table>
            <tbody>
              {recent.map((a) => (
                <tr key={a.id}>
                  <td>{exams.find((e) => e.id === a.examId)?.title ?? a.examId}</td>
                  <td>{a.score}점</td>
                  <td><GradeBadge grade={a.grade} size={18} /></td>
                  <td style={{ textAlign: "right" }}><Link href={`/exams/result/${a.id}`}>결과</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
