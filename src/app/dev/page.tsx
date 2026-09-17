import Link from "next/link";
import { assertDevMode } from "@/lib/dev";
import { getCurrentUser } from "@/lib/auth/session";
import { listUsers } from "@/lib/repo/users";
import { getExamSource, listExamSourceIds } from "@/lib/exams/registry";
import { PERSONAS } from "@/content/personas";
import {
  devCreateTestUserAction,
  devGrantCertificationAction,
  devLoginAsAction,
  devResetOnboardingAction,
  devResetProgressAction,
  devSetPersonaAction,
  devSkipOnboardingAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function DevPanelPage() {
  assertDevMode();
  const me = await getCurrentUser();
  const users = listUsers();
  const source = getExamSource();
  const exams = await source.listExams();

  return (
    <div className="stack">
      <div>
        <p className="eyebrow" style={{ color: "var(--dev)" }}>Developer Mode</p>
        <h1>개발자 패널</h1>
        <p className="muted">
          DANBI_DEV_MODE=true 일 때만 존재하는 페이지입니다. 문제 소스: <code>{source.id}</code>{" "}
          (사용 가능: {listExamSourceIds().join(", ")})
        </p>
      </div>

      {me && (
        <section className="card stack">
          <h2>현재 계정 #{me.id}</h2>
          <p className="muted" style={{ margin: 0 }}>
            {me.email} · persona: {me.personaId ?? "-"} · origin: {me.originPersonaId ?? "-"} · handle: {me.handle ?? "-"}
          </p>

          <div className="row">
            <form action={devSkipOnboardingAction}>
              <button className="btn btn-dev" type="submit">온보딩 건너뛰기</button>
            </form>
            <form action={devResetOnboardingAction}>
              <button className="btn btn-dev" type="submit">온보딩 초기화</button>
            </form>
            <form action={devResetProgressAction}>
              <button className="btn btn-dev" type="submit">시험/수집물/쇼케이스 초기화</button>
            </form>
            {me.handle && <Link href={`/${me.handle}`} className="btn btn-dev">공개 프로필</Link>}
          </div>

          {me.personaId && (
            <form action={devSetPersonaAction} className="row">
              <label style={{ flex: 1 }}>
                현재 Persona 변경 (Origin 유지)
                <select name="personaId" defaultValue={me.personaId}>
                  {PERSONAS.map((p) => (
                    <option key={p.id} value={p.id}>{p.title} — {p.id}</option>
                  ))}
                </select>
              </label>
              <button className="btn btn-dev" type="submit">변경</button>
            </form>
          )}

          {me.handle && (
            <form action={devGrantCertificationAction} className="row">
              <label>
                시험
                <select name="examId">
                  {exams.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
              </label>
              <label>
                등급
                <select name="grade" defaultValue="S">
                  {["S", "A", "B", "C"].map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </label>
              <button className="btn btn-dev" type="submit">응시 없이 결과 지급</button>
            </form>
          )}
        </section>
      )}

      <section className="card stack">
        <h2>계정</h2>
        <form action={devCreateTestUserAction}>
          <button className="btn btn-dev" type="submit">테스트 계정 생성 + 로그인</button>
        </form>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr><th>ID</th><th>이메일</th><th>핸들</th><th>Persona</th><th></th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.email}</td>
                  <td>{u.handle ?? "-"}</td>
                  <td>{u.personaId ?? "-"}</td>
                  <td>
                    {me?.id === u.id ? (
                      <span className="pill">현재</span>
                    ) : (
                      <form action={devLoginAsAction}>
                        <input type="hidden" name="userId" value={u.id} />
                        <button className="btn btn-dev" type="submit">이 계정으로 로그인</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
