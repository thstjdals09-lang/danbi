import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

const DB_PATH = process.env.DANBI_DB_PATH ?? path.join(process.cwd(), "data", "danbi.db");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  email               TEXT NOT NULL UNIQUE,
  password_hash       TEXT NOT NULL,
  nickname            TEXT,
  handle              TEXT UNIQUE,
  persona_id          TEXT,
  origin_persona_id   TEXT,
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token       TEXT PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS exam_attempts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_id     TEXT NOT NULL,
  score       INTEGER NOT NULL,
  grade       TEXT NOT NULL,
  answers     TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 수집물: 인증서, 트로피 등. (user, kind, key) 당 하나.
CREATE TABLE IF NOT EXISTS collectibles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL,
  key         TEXT NOT NULL,
  grade       TEXT,
  score       INTEGER,
  earned_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, kind, key)
);

CREATE TABLE IF NOT EXISTS showcase_slots (
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slot            INTEGER NOT NULL,
  collectible_id  INTEGER NOT NULL REFERENCES collectibles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, slot)
);
`;

const globalForDb = globalThis as unknown as { danbiDb?: DatabaseSync };

export function db(): DatabaseSync {
  if (!globalForDb.danbiDb) {
    mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const conn = new DatabaseSync(DB_PATH);
    conn.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
    conn.exec(SCHEMA);
    globalForDb.danbiDb = conn;
  }
  return globalForDb.danbiDb;
}
