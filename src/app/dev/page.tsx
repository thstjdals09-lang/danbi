import Link from "next/link";
import { assertDevAccess } from "@/lib/dev";
import { getCurrentUser } from "@/lib/auth/session";
import { listUsers } from "@/lib/repo/users";
import { getExamSource, listExamSourceIds } from "@/lib/exams/registry";
import { PERSONAS, getPersona } from "@/content/personas";
import { IDENTITIES } from "@/content/identities";
import {
  devCreateTestUserAction,
  devGrantCertificationAction,
  devLoginAsAction,
  devResetOnboardingAction,
  devResetProgressAction,
  devSetIdentityAction,
  devSetPersonaAction,
  devSkipOnboardingAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function DevPanelPage() {
  await assertDevAccess();
  const me = await getCurrentUser();
  const users = listUsers();
  const source = getExamSource();
  const exams = await source.listExams();

  return (
    <div className="shell dev-panel">
      <div>
        <p className="eyebrow" style={{ color: "var(--dev)" }}>Developer mode</p>
        <h1 className="display" style={{ fontSize: 64, marginTop: 12 }}>Developer panel</h1>
        <p className="dev-note" style={{ marginTop: 14 }}>
          DANBI_DEV_MODE=true 이고 비밀번호로 잠금 해제한 브라우저에서만 열립니다. 문제 소스: {source.id} (사용 가능: {listExamSourceIds().join(", ")})
        </p>
      </div>

      {me && (
        <section>
          <p className="eyebrow">Current account #{me.id}</p>
          <p className="meta" style={{ textTransform: "none", letterSpacing: 0 }}>
            {me.email} · origin {me.originPersonaId ?? "-"} ({getPersona(me.originPersonaId)?.title ?? "-"}) · identity {me.identityId ?? "-"} · @{me.handle ?? "-"}
          </p>

          <div className="dev-row">
            <form action={devSkipOnboardingAction}>
              <button className="btn btn--sm btn--dev" type="submit">온보딩 건너뛰기</button>
            </form>
            <form action={devResetOnboardingAction}>
              <button className="btn btn--sm btn--dev" type="submit">온보딩 초기화</button>
            </form>
            <form action={devResetProgressAction}>
              <button className="btn btn--sm btn--dev" type="submit">시험·수집물·쇼케이스·정체성 초기화</button>
            </form>
            {me.handle && <Link href={`/${me.handle}`} className="btn btn--sm btn--dev">공개 프로필</Link>}
          </div>

          {me.personaId && (
            <form action={devSetPersonaAction} className="dev-row">
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="dev-persona">Origin persona 교체 (개발자 전용 — 계열별 화면 확인용)</label>
                <select id="dev-persona" name="personaId" defaultValue={me.originPersonaId ?? me.personaId}>
                  {PERSONAS.map((p) => (
                    <option key={p.id} value={p.id}>{p.title} — {p.id}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn--sm btn--dev" type="submit">변경</button>
            </form>
          )}

          {me.handle && (
            <>
              <form action={devSetIdentityAction} className="dev-row">
                <div className="field" style={{ flex: 1 }}>
                  <label htmlFor="dev-identity">Current identity 지정 (다음 시험 반영 시 규칙대로 재계산)</label>
                  <select id="dev-identity" name="identityId" defaultValue={me.identityId ?? ""}>
                    <option value="">— Origin 계열 이름 —</option>
                    {IDENTITIES.map((i) => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                </div>
                <button className="btn btn--sm btn--dev" type="submit">지정</button>
              </form>

              <form action={devGrantCertificationAction} className="dev-row">
                <div className="field">
                  <label htmlFor="dev-exam">시험</label>
                  <select id="dev-exam" name="examId">
                    {exams.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
                  </select>
                </div>
                <div className="field" style={{ minWidth: 100 }}>
                  <label htmlFor="dev-grade">등급</label>
                  <select id="dev-grade" name="grade" defaultValue="S">
                    {["S", "A", "B", "C"].map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <button className="btn btn--sm btn--dev" type="submit">응시 없이 결과 지급</button>
              </form>
            </>
          )}
        </section>
      )}

      <section>
        <p className="eyebrow">Accounts</p>
        <form action={devCreateTestUserAction}>
          <button className="btn btn--sm btn--dev" type="submit">테스트 계정 생성 + 로그인</button>
        </form>
        <div style={{ overflowX: "auto" }}>
          <table className="table-list">
            <thead>
              <tr><th>ID</th><th>Email</th><th>Handle</th><th>Origin</th><th /></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.email}</td>
                  <td>{u.handle ?? "-"}</td>
                  <td>{getPersona(u.originPersonaId ?? u.personaId)?.title ?? "-"}</td>
                  <td style={{ textAlign: "right" }}>
                    {me?.id === u.id ? (
                      <span className="eyebrow">Current</span>
                    ) : (
                      <form action={devLoginAsAction}>
                        <input type="hidden" name="userId" value={u.id} />
                        <button className="link" type="submit" style={{ color: "var(--dev)" }}>Log in as</button>
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
