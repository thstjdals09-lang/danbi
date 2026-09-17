import "server-only";
import { cookies } from "next/headers";
import { getPersona, type Persona } from "@/content/personas";
import { setPersona, type User } from "@/lib/repo/users";

/**
 * 가입 전에 Persona Test 를 끝낸 방문자의 결과를 잠시 보관한다.
 * 가입/로그인하는 순간 계정의 Origin Persona 로 옮겨진다.
 */
const COOKIE_NAME = "ppg_pending_persona";

export async function getPendingPersona(): Promise<Persona | null> {
  return getPersona((await cookies()).get(COOKIE_NAME)?.value);
}

export async function setPendingPersona(personaId: string): Promise<void> {
  (await cookies()).set(COOKIE_NAME, personaId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearPendingPersona(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

/** 아직 공개 프로필이 없는 계정이라면 보관 중인 Persona 를 계정에 저장한다. */
export async function claimPendingPersona(user: User): Promise<boolean> {
  const pending = await getPendingPersona();
  if (!pending || user.handle) return false;
  setPersona(user.id, pending.id);
  await clearPendingPersona();
  return true;
}
