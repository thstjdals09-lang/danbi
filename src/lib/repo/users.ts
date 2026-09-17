import "server-only";
import { db } from "@/lib/db";

export type User = {
  id: number;
  email: string;
  nickname: string | null;
  handle: string | null;
  personaId: string | null;
  originPersonaId: string | null;
  createdAt: string;
};

type UserRow = {
  id: number;
  email: string;
  nickname: string | null;
  handle: string | null;
  persona_id: string | null;
  origin_persona_id: string | null;
  created_at: string;
};

const COLUMNS = "id, email, nickname, handle, persona_id, origin_persona_id, created_at";

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    nickname: row.nickname,
    handle: row.handle,
    personaId: row.persona_id,
    originPersonaId: row.origin_persona_id,
    createdAt: row.created_at,
  };
}

export function getUserById(id: number): User | null {
  const row = db().prepare(`SELECT ${COLUMNS} FROM users WHERE id = ?`).get(id) as UserRow | undefined;
  return row ? toUser(row) : null;
}

export function getUserByHandle(handle: string): User | null {
  const row = db()
    .prepare(`SELECT ${COLUMNS} FROM users WHERE handle = ?`)
    .get(handle.toLowerCase()) as UserRow | undefined;
  return row ? toUser(row) : null;
}

export function getPasswordHashByEmail(email: string): { id: number; passwordHash: string } | null {
  const row = db()
    .prepare("SELECT id, password_hash FROM users WHERE email = ?")
    .get(email.toLowerCase()) as { id: number; password_hash: string } | undefined;
  return row ? { id: row.id, passwordHash: row.password_hash } : null;
}

export function createUser(email: string, passwordHash: string): number {
  const result = db()
    .prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)")
    .run(email.toLowerCase(), passwordHash);
  return Number(result.lastInsertRowid);
}

export function listUsers(): User[] {
  const rows = db().prepare(`SELECT ${COLUMNS} FROM users ORDER BY id`).all() as UserRow[];
  return rows.map(toUser);
}

/** 첫 성향 테스트 결과는 Origin 으로 남기고, 이후 변화는 persona_id 만 갱신한다. */
export function setPersona(userId: number, personaId: string): void {
  db()
    .prepare("UPDATE users SET persona_id = ?, origin_persona_id = COALESCE(origin_persona_id, ?) WHERE id = ?")
    .run(personaId, personaId, userId);
}

export function clearOnboarding(userId: number): void {
  db()
    .prepare("UPDATE users SET persona_id = NULL, origin_persona_id = NULL, nickname = NULL, handle = NULL WHERE id = ?")
    .run(userId);
}

export function setProfileIdentity(userId: number, nickname: string, handle: string): void {
  db().prepare("UPDATE users SET nickname = ?, handle = ? WHERE id = ?").run(nickname, handle.toLowerCase(), userId);
}

export function isHandleTaken(handle: string, exceptUserId?: number): boolean {
  const row = db()
    .prepare("SELECT id FROM users WHERE handle = ? AND id != ?")
    .get(handle.toLowerCase(), exceptUserId ?? -1);
  return Boolean(row);
}
