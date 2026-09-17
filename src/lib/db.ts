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
  identity_id         TEXT,
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
  rewards     TEXT NOT NULL DEFAULT '{}',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 수집물: 인증서, 트로피, 기어 등. (user, kind, key) 당 하나.
CREATE TABLE IF NOT EXISTS collectibles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL,
  key         TEXT NOT NULL,
  grade       TEXT,
  score       INTEGER,
  source      TEXT,
  equipped    INTEGER NOT NULL DEFAULT 0,
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

/** 이미 만들어진 DB 에 나중에 추가된 컬럼을 붙인다. */
const COLUMN_MIGRATIONS: { table: string; column: string; definition: string }[] = [
  { table: "exam_attempts", column: "rewards", definition: "TEXT NOT NULL DEFAULT '{}'" },
  { table: "users", column: "identity_id", definition: "TEXT" },
  { table: "collectibles", column: "source", definition: "TEXT" },
  { table: "collectibles", column: "equipped", definition: "INTEGER NOT NULL DEFAULT 0" },
];

function migrate(conn: DatabaseSync): void {
  for (const { table, column, definition } of COLUMN_MIGRATIONS) {
    const columns = conn.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    if (!columns.some((c) => c.name === column)) {
      conn.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
  }
}

const globalForDb = globalThis as unknown as { danbiDb?: DatabaseSync };

export function db(): DatabaseSync {
  if (!globalForDb.danbiDb) {
    mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const conn = new DatabaseSync(DB_PATH);
    conn.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
    conn.exec(SCHEMA);
    migrate(conn);
    globalForDb.danbiDb = conn;
  }
  return globalForDb.danbiDb;
}
