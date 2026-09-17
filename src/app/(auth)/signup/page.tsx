import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { signupAction } from "../actions";
import { AuthForm } from "../AuthForm";
import { AuthShell } from "../AuthShell";

export const metadata = { title: "Create account — POKER PLAYER GROW" };

/** 계정 먼저 만들기 경로. 기본 흐름은 Persona Test → 이름 설정 단계에서 가입이다. */
export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <AuthShell eyebrow="Create account" title="Become a player.">
      <p className="muted" style={{ fontSize: 14, lineHeight: 1.8 }}>
        가입 후 30초짜리 Poker Persona Test로 나의 첫 플레이어를 만납니다.
      </p>
      <AuthForm action={signupAction} submitLabel="Create account" newPassword />
      <p className="muted" style={{ fontSize: 13 }}>
        이미 플레이어가 있나요?{" "}
        <Link href="/login" className="link">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
