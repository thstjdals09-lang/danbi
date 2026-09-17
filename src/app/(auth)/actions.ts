"use server";

import { redirect } from "next/navigation";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { normalizeEmail, validateCredentials } from "@/lib/auth/credentials";
import { createSession, destroySession } from "@/lib/auth/session";
import { claimPendingPersona } from "@/lib/onboarding";
import { createUser, getPasswordHashByEmail, getUserById } from "@/lib/repo/users";

export type AuthFormState = { error?: string };

export async function signupAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  const error = validateCredentials(email, password);
  if (error) return { error };
  if (getPasswordHashByEmail(email)) return { error: "이미 가입된 이메일입니다." };

  const userId = createUser(email, hashPassword(password));
  await createSession(userId);
  // 가입 전에 Persona Test 를 마쳤다면 그 결과로 바로 이어간다.
  const claimed = await claimPendingPersona(getUserById(userId)!);
  redirect(claimed ? "/onboarding/handle" : "/onboarding/persona");
}

export async function loginAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  const record = getPasswordHashByEmail(email);
  if (!record || !verifyPassword(password, record.passwordHash)) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  await createSession(record.id);
  await claimPendingPersona(getUserById(record.id)!);
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
