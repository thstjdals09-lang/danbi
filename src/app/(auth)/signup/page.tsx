import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { signupAction } from "../actions";
import { AuthForm } from "../AuthForm";

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <div className="stack">
      <h1>가입하기</h1>
      <p className="muted">가입 후 30초짜리 Poker Persona Test로 나의 첫 캐릭터를 만납니다.</p>
      <AuthForm action={signupAction} submitLabel="가입하고 시작하기" />
      <p className="muted">
        이미 계정이 있나요? <Link href="/login">로그인</Link>
      </p>
    </div>
  );
}
