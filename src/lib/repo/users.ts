import "server-only";
import { db } from "@/lib/db";

export type User = {
  id: number;
  email: string;
  nickname: string | null;
  handle: string | null;
  /** 성향 테스트로 정해진 Starting Persona. 온보딩 완료 후에는 바뀌지 않는다. */
  personaId: string | null;
  /** Origin Persona. 처음 확정된 값이 영구히 남는다. */
  originPersonaId: string | null;
  /** 시험 결과로 발전하는 Current Identity (content/identities.ts). null 이면 Origin 계열 이름 사용 */
  identityId: string | null;
  createdAt: string;
};

type UserRow = {
  id: number;
  email: string;
  nickname: string | null;
  handle: string | null;
  persona_id: string | null;
  origin_persona_id: string | null;
  identity_id: string | null;
  created_at: string;
};

const COLUMNS = "id, email, nickname, handle, persona_id, origin_persona_id, identity_id, created_at";

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    nickname: row.nickname,
    handle: row.handle,
    personaId: row.persona_id,
    originPersonaId: row.origin_persona_id,
    identityId: row.identity_id,
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

/** 공개 프로필이 있는 플레이어 (최근 가입순) */
export function listPublicPlayers(limit = 60): User[] {
  const rows = db()
    .prepare(`SELECT ${COLUMNS} FROM users WHERE handle IS NOT NULL AND persona_id IS NOT NULL ORDER BY id DESC LIMIT ?`)
    .all(limit) as UserRow[];
  return rows.map(toUser);
}

export function countPublicPlayers(): number {
  const row = db().prepare("SELECT COUNT(*) AS n FROM users WHERE handle IS NOT NULL").get() as { n: number };
  return row.n;
}

/** 온보딩 중에만 호출한다. Origin 은 처음 값이 유지된다. */
export function setPersona(userId: number, personaId: string): void {
  db()
    .prepare("UPDATE users SET persona_id = ?, origin_persona_id = COALESCE(origin_persona_id, ?) WHERE id = ?")
    .run(personaId, personaId, userId);
}

/** 개발자 모드 전용: Origin 까지 교체한다. */
export function overridePersonaForDev(userId: number, personaId: string): void {
  db().prepare("UPDATE users SET persona_id = ?, origin_persona_id = ? WHERE id = ?").run(personaId, personaId, userId);
}

export function setIdentity(userId: number, identityId: string | null): void {
  db().prepare("UPDATE users SET identity_id = ? WHERE id = ?").run(identityId, userId);
}

/** 공개 프로필을 만들기 전(또는 개발자 모드)에만 사용: 성향과 이름을 모두 비운다. */
export function clearOnboarding(userId: number): void {
  db()
    .prepare(
      "UPDATE users SET persona_id = NULL, origin_persona_id = NULL, identity_id = NULL, nickname = NULL, handle = NULL WHERE id = ?",
    )
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
