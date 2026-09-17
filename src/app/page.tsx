import Link from "next/link";
import { TAGLINE } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth/session";

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

  return (
    <div className="stack">
      <h1>환영합니다</h1>
      <p className="muted">{user.email}</p>
    </div>
  );
}
