import type { Metadata } from "next";
import Link from "next/link";
import { Cormorant_Garamond, Inter, Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import { APP_NAME, TAGLINE, isDevModeEnabled } from "@/lib/config";
import { isDevUnlocked } from "@/lib/dev";
import { getCurrentUser } from "@/lib/auth/session";
import { buildAvatarState } from "@/lib/player";
import { listCollectibles } from "@/lib/repo/collection";
import { logoutAction } from "@/app/(auth)/actions";
import { lockDevAction } from "@/app/dev/actions";
import { SiteNav } from "@/components/SiteNav";
import { SiteChrome } from "@/components/SiteChrome";
import { Pfp } from "@/components/Pfp";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const notoSansKr = Noto_Sans_KR({ subsets: ["latin"], variable: "--font-noto-sans-kr", display: "swap", preload: false });
const notoSerifKr = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-noto-serif-kr",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: `${APP_NAME} — ${TAGLINE}`,
  description: "실력으로 증명하고, 캐릭터와 커리어로 성장하는 포커 플레이어 아이덴티티 게임.",
  // 파비콘 이미지는 외부 제작 전까지 두지 않는다 (브라우저의 /favicon.ico 404 요청 방지)
  icons: { icon: "data:," },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const devEnabled = isDevModeEnabled();
  const devUnlocked = await isDevUnlocked();
  const avatar = user?.handle ? buildAvatarState(user, listCollectibles(user.id)) : null;

  return (
    <html lang="ko" className={`${cormorant.variable} ${inter.variable} ${notoSansKr.variable} ${notoSerifKr.variable}`}>
      <body>
        <SiteChrome>
        <header className="site-header">
          <div className="shell site-header__inner">
            <Link href="/" className="brand" aria-label={APP_NAME}>
              <span className="brand__mark" aria-hidden />
              {APP_NAME}
            </Link>
            <SiteNav signedIn={Boolean(user)} />
            <div className="site-actions">
              {user ? (
                <>
                  {user.handle && avatar ? (
                    <Link href={`/${user.handle}`} className="me-chip">
                      <Pfp avatar={avatar} size={28} name={user.nickname ?? user.handle} />
                      <span className="me-chip__handle">{user.nickname ?? user.handle}</span>
                    </Link>
                  ) : (
                    <Link href="/onboarding/persona" className="link">Continue</Link>
                  )}
                  <form action={logoutAction}>
                    <button className="link link--mute" type="submit">Sign out</button>
                  </form>
                </>
              ) : (
                <Link href="/login" className="btn btn--sm">Sign in</Link>
              )}
            </div>
          </div>
        </header>
        </SiteChrome>

        <main>{children}</main>

        <SiteChrome>
        <footer className="site-footer">
          <div className="shell site-footer__inner">
            <span className="eyebrow eyebrow--ink">{APP_NAME}</span>
            <span className="eyebrow">A stylish digital identity for poker players</span>
            <span className="eyebrow">{TAGLINE}</span>
          </div>
        </footer>
        </SiteChrome>

        <SiteChrome>
        {devEnabled && !devUnlocked && (
          <Link href="/dev/unlock" className="dev-fab">Developer mode</Link>
        )}
        {devUnlocked && (
          <div className="devbar">
            <strong>DEV MODE</strong>
            <span>{user ? `#${user.id} ${user.email}` : "not signed in"}</span>
            <Link href="/dev">개발자 패널</Link>
            <form action={lockDevAction}>
              <button type="submit">Lock</button>
            </form>
          </div>
        )}
        </SiteChrome>
      </body>
    </html>
  );
}
