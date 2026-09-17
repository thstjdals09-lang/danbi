"use server";

import { redirect } from "next/navigation";
import { createSession, getCurrentUser } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { normalizeEmail, validateCredentials } from "@/lib/auth/credentials";
import { getPersona, isValidAnswers, personaIdOf } from "@/content/personas";
import { validateHandle, validateNickname } from "@/lib/handles";
import { clearPendingPersona, getPendingPersona, setPendingPersona } from "@/lib/onboarding";
import {
  clearOnboarding,
  createUser,
  getPasswordHashByEmail,
  isHandleTaken,
  setPersona,
  setProfileIdentity,
} from "@/lib/repo/users";

/**
 * Persona Test 결과 저장.
 * 로그인 상태면 계정에, 아니면 가입 전까지 쿠키에 보관한다.
 */
export async function savePersonaAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (user?.handle) redirect("/");

  const answers = Object.fromEntries(
    ["game", "play", "mind", "table"].map((k) => [k, String(formData.get(k) ?? "")]),
  );
  if (!isValidAnswers(answers)) redirect("/onboarding/persona");

  const personaId = personaIdOf(answers);
  if (user) setPersona(user.id, personaId);
  else await setPendingPersona(personaId);
  redirect("/onboarding/persona/result");
}

/** 공개 프로필을 만들기 전까지만 다시 테스트할 수 있다. Origin 은 프로필 완성 시점에 확정된다. */
export async function retakePersonaAction(): Promise<void> {
  const user = await getCurrentUser();
  if (user && !user.handle) clearOnboarding(user.id);
  await clearPendingPersona();
  redirect("/onboarding/persona");
}

export type IdentityFormState = { error?: string; values?: Record<string, string> };

/**
 * 닉네임 + 공개 ID 설정.
 * 비로그인 방문자는 이 단계에서 계정(이메일/비밀번호)을 함께 만든다.
 */
export async function saveIdentityAction(_prev: IdentityFormState, formData: FormData): Promise<IdentityFormState> {
  const user = await getCurrentUser();
  if (user?.handle) redirect("/");

  const persona = user?.personaId ? getPersona(user.personaId) : await getPendingPersona();
  if (!persona) redirect("/onboarding/persona");

  const nickname = String(formData.get("nickname") ?? "").trim();
  const handle = String(formData.get("handle") ?? "").trim().toLowerCase();
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const values = { nickname, handle, email };

  const identityError = validateNickname(nickname) ?? validateHandle(handle);
  if (identityError) return { error: identityError, values };
  if (isHandleTaken(handle, user?.id)) return { error: "이미 사용 중인 공개 ID입니다.", values };

  let userId = user?.id;
  if (!userId) {
    const credentialError = validateCredentials(email, password);
    if (credentialError) return { error: credentialError, values };
    if (getPasswordHashByEmail(email)) {
      return { error: "이미 가입된 이메일입니다. 로그인하면 이 플레이어로 이어서 시작합니다.", values };
    }
    userId = createUser(email, hashPassword(password));
    await createSession(userId);
  }

  if (!user?.personaId) setPersona(userId, persona.id);
  setProfileIdentity(userId, nickname, handle);
  await clearPendingPersona();
  redirect("/");
}
