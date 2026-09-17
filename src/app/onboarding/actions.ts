"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { isValidAnswers, personaIdOf } from "@/content/personas";
import { validateHandle, validateNickname } from "@/lib/handles";
import { clearOnboarding, isHandleTaken, setPersona, setProfileIdentity } from "@/lib/repo/users";

export async function savePersonaAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  if (user.personaId) redirect("/onboarding/persona/result");

  const answers = Object.fromEntries(
    ["game", "play", "mind", "table"].map((k) => [k, String(formData.get(k) ?? "")]),
  );
  if (!isValidAnswers(answers)) redirect("/onboarding/persona");

  setPersona(user.id, personaIdOf(answers));
  redirect("/onboarding/persona/result");
}

/** 공개 프로필을 만들기 전까지만 다시 테스트할 수 있다. */
export async function retakePersonaAction(): Promise<void> {
  const user = await requireUser();
  if (!user.handle) clearOnboarding(user.id);
  redirect("/onboarding/persona");
}

export type IdentityFormState = { error?: string };

export async function saveIdentityAction(_prev: IdentityFormState, formData: FormData): Promise<IdentityFormState> {
  const user = await requireUser();
  if (!user.personaId) redirect("/onboarding/persona");
  if (user.handle) redirect("/");

  const nickname = String(formData.get("nickname") ?? "").trim();
  const handle = String(formData.get("handle") ?? "").trim().toLowerCase();

  const error = validateNickname(nickname) ?? validateHandle(handle);
  if (error) return { error };
  if (isHandleTaken(handle, user.id)) return { error: "이미 사용 중인 공개 ID입니다." };

  setProfileIdentity(user.id, nickname, handle);
  redirect("/exams");
}
