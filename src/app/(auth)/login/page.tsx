import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { loginAction } from "../actions";
import { AuthForm } from "../AuthForm";
import { AuthShell } from "../AuthShell";

export const metadata = { title: "Sign in — POKER PLAYER GROW" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <AuthShell eyebrow="Welcome back" title="Sign in.">
      <AuthForm action={loginAction} submitLabel="Sign in" />
      <p className="muted" style={{ fontSize: 13 }}>
        아직 플레이어가 없나요?{" "}
        <Link href="/onboarding/persona" className="link">
          Start with the persona test
        </Link>
      </p>
    </AuthShell>
  );
}
