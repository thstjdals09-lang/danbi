import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserById, type User } from "@/lib/repo/users";

const COOKIE_NAME = "danbi_session";
const SESSION_DAYS = 30;

export async function createSession(userId: number): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  db()
    .prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)")
    .run(token, userId, expires.toISOString());
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) db().prepare("DELETE FROM sessions WHERE token = ?").run(token);
  jar.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const row = db()
    .prepare("SELECT user_id, expires_at FROM sessions WHERE token = ?")
    .get(token) as { user_id: number; expires_at: string } | undefined;
  if (!row || new Date(row.expires_at) < new Date()) return null;
  return getUserById(row.user_id);
}

/** 로그인만 요구한다. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** 로그인 + 온보딩(Persona, 닉네임/핸들) 완료를 요구한다. */
export async function requireOnboardedUser(): Promise<User> {
  const user = await requireUser();
  if (!user.personaId) redirect("/onboarding/persona");
  if (!user.handle) redirect("/onboarding/handle");
  return user;
}
