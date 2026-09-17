"use server";

import { redirect } from "next/navigation";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { createUser, getPasswordHashByEmail } from "@/lib/repo/users";

export type AuthFormState = { error?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signupAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!EMAIL_PATTERN.test(email)) return { error: "올바른 이메일을 입력하세요." };
  if (password.length < 8) return { error: "비밀번호는 8자 이상이어야 합니다." };
  if (getPasswordHashByEmail(email)) return { error: "이미 가입된 이메일입니다." };

  const userId = createUser(email, hashPassword(password));
  await createSession(userId);
  redirect("/onboarding/persona");
}

export async function loginAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const record = getPasswordHashByEmail(email);
  if (!record || !verifyPassword(password, record.passwordHash)) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  await createSession(record.id);
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
