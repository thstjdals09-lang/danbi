"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { assertDevMode } from "@/lib/dev";
import { hashPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { createUser, getUserById } from "@/lib/repo/users";

export async function devLoginAsAction(formData: FormData): Promise<void> {
  assertDevMode();
  const userId = Number(formData.get("userId"));
  if (!getUserById(userId)) return;
  await destroySession();
  await createSession(userId);
  redirect("/");
}

/** 비밀번호 없이 바로 쓰는 테스트 계정을 만들고 그 계정으로 로그인한다. */
export async function devCreateTestUserAction(): Promise<void> {
  assertDevMode();
  const suffix = randomBytes(3).toString("hex");
  const userId = createUser(`test_${suffix}@dev.local`, hashPassword(randomBytes(16).toString("hex")));
  await destroySession();
  await createSession(userId);
  redirect("/onboarding/persona");
}
