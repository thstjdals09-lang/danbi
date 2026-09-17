import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME, TAGLINE, isDevMode } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth/session";
import { logoutAction } from "@/app/(auth)/actions";
import "./globals.css";

export const metadata: Metadata = {
  title: `${APP_NAME} — ${TAGLINE}`,
  description: "실제 포커 실력을 시험으로 증명하며 나만의 포커 플레이어를 성장시키는 웹게임",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const devMode = isDevMode();

  return (
    <html lang="ko">
      <body>
        <header className="topbar">
          <Link href="/" className="brand">{APP_NAME.toUpperCase()}</Link>
          <nav>
            {user ? (
              <>
                <Link href="/exams">Academy</Link>
                <Link href="/me/showcase">Showcase</Link>
                {user.handle && <Link href={`/${user.handle}`}>내 프로필</Link>}
                <form action={logoutAction}>
                  <button className="btn" type="submit">로그아웃</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">로그인</Link>
                <Link href="/signup" className="btn btn-primary">시작하기</Link>
              </>
            )}
          </nav>
        </header>
        <main className="container">{children}</main>
        {devMode && (
          <div className="devbar">
            <strong>DEV MODE</strong>
            <span>{user ? `#${user.id} ${user.email}` : "로그인 안 됨"}</span>
            <Link href="/dev">개발자 패널</Link>
          </div>
        )}
      </body>
    </html>
  );
}
