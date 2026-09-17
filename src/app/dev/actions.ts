"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertDevAccess, lockDev, tryUnlockDev } from "@/lib/dev";
import { hashPassword } from "@/lib/auth/password";
import { createSession, destroySession, requireUser } from "@/lib/auth/session";
import {
  clearOnboarding,
  createUser,
  getUserById,
  isHandleTaken,
  setPersona,
  setProfileIdentity,
} from "@/lib/repo/users";
import { resetProgress } from "@/lib/repo/collection";
import { insertAttempt } from "@/lib/repo/attempts";
import { applyExamResult } from "@/lib/progress";
import { getExamSource } from "@/lib/exams/registry";
import type { Grade } from "@/lib/exams/grading";
import { PERSONAS, getPersona } from "@/content/personas";

export async function devLoginAsAction(formData: FormData): Promise<void> {
  await assertDevAccess();
  const userId = Number(formData.get("userId"));
  if (!getUserById(userId)) return;
  await destroySession();
  await createSession(userId);
  redirect("/");
}

/** 테스트 계정을 만들고 그 계정으로 로그인한다. */
export async function devCreateTestUserAction(): Promise<void> {
  await assertDevAccess();
  const suffix = randomBytes(3).toString("hex");
  const userId = createUser(`test_${suffix}@dev.local`, hashPassword(randomBytes(16).toString("hex")));
  await destroySession();
  await createSession(userId);
  redirect("/onboarding/persona");
}

/** Persona Test 와 닉네임/핸들 설정을 무작위 값으로 건너뛴다. */
export async function devSkipOnboardingAction(): Promise<void> {
  await assertDevAccess();
  const user = await requireUser();
  if (!user.personaId) setPersona(user.id, PERSONAS[Math.floor(Math.random() * PERSONAS.length)].id);
  if (!user.handle) {
    let handle = `dev_${user.id}`;
    while (isHandleTaken(handle, user.id)) handle = `dev_${user.id}_${randomBytes(2).toString("hex")}`;
    setProfileIdentity(user.id, `Dev${user.id}`, handle);
  }
  redirect("/");
}

export async function devResetOnboardingAction(): Promise<void> {
  await assertDevAccess();
  const user = await requireUser();
  clearOnboarding(user.id);
  redirect("/onboarding/persona");
}

export async function devResetProgressAction(): Promise<void> {
  await assertDevAccess();
  const user = await requireUser();
  resetProgress(user.id);
  revalidatePath("/", "layout");
  redirect("/dev");
}

/** 현재 Persona 만 바꾼다. (Origin 은 유지되어 성향 변화 표시를 테스트할 수 있다) */
export async function devSetPersonaAction(formData: FormData): Promise<void> {
  await assertDevAccess();
  const user = await requireUser();
  const persona = getPersona(String(formData.get("personaId")));
  if (persona) setPersona(user.id, persona.id);
  redirect("/dev");
}

const GRADE_SCORES: Record<Exclude<Grade, "F">, number> = { S: 100, A: 92, B: 85, C: 75 };

/** 시험을 보지 않고 해당 점수로 응시한 것처럼 처리한다. */
export async function devGrantCertificationAction(formData: FormData): Promise<void> {
  await assertDevAccess();
  const user = await requireUser();
  const exam = await getExamSource().getExam(String(formData.get("examId")));
  const grade = String(formData.get("grade")) as keyof typeof GRADE_SCORES;
  const score = GRADE_SCORES[grade];
  if (!exam || score === undefined) redirect("/dev");

  const rewards = applyExamResult(user.id, exam.id, score, grade);
  const attemptId = insertAttempt(user.id, exam.id, score, grade, [], rewards);
  redirect(`/exams/result/${attemptId}`);
}

export type UnlockFormState = { error?: string };

export async function unlockDevAction(_prev: UnlockFormState, formData: FormData): Promise<UnlockFormState> {
  const result = await tryUnlockDev(String(formData.get("password") ?? ""));
  if (!result.ok) return { error: result.error };
  redirect("/dev");
}

export async function lockDevAction(): Promise<void> {
  await lockDev();
  redirect("/");
}
