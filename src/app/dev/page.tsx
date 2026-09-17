import { assertDevMode } from "@/lib/dev";
import { getCurrentUser } from "@/lib/auth/session";
import { listUsers } from "@/lib/repo/users";
import { devCreateTestUserAction, devLoginAsAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function DevPanelPage() {
  assertDevMode();
  const me = await getCurrentUser();
  const users = listUsers();

  return (
    <div className="stack">
      <div>
        <p className="eyebrow" style={{ color: "var(--dev)" }}>Developer Mode</p>
        <h1>개발자 패널</h1>
        <p className="muted">DANBI_DEV_MODE=true 일 때만 존재하는 페이지입니다.</p>
      </div>

      <section className="card stack">
        <h2>계정</h2>
        <form action={devCreateTestUserAction}>
          <button className="btn btn-dev" type="submit">테스트 계정 생성 + 로그인</button>
        </form>
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
      </section>
    </div>
  );
}
