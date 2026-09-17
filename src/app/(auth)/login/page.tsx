import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { loginAction } from "../actions";
import { AuthForm } from "../AuthForm";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <div className="stack">
      <h1>로그인</h1>
      <AuthForm action={loginAction} submitLabel="로그인" />
      <p className="muted">
        계정이 없나요? <Link href="/signup">가입하기</Link>
      </p>
    </div>
  );
}
