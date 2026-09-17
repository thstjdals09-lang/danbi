import "server-only";
import { db } from "@/lib/db";
import type { Grade } from "@/lib/exams/grading";

export type CollectibleKind = "certification" | "trophy";

export type Collectible = {
  id: number;
  userId: number;
  kind: CollectibleKind;
  key: string;
  grade: Grade | null;
  score: number | null;
  earnedAt: string;
  updatedAt: string;
};

type Row = {
  id: number;
  user_id: number;
  kind: CollectibleKind;
  key: string;
  grade: Grade | null;
  score: number | null;
  earned_at: string;
  updated_at: string;
};

function toCollectible(r: Row): Collectible {
  return {
    id: r.id,
    userId: r.user_id,
    kind: r.kind,
    key: r.key,
    grade: r.grade,
    score: r.score,
    earnedAt: r.earned_at,
    updatedAt: r.updated_at,
  };
}

export function listCollectibles(userId: number): Collectible[] {
  const rows = db()
    .prepare("SELECT * FROM collectibles WHERE user_id = ? ORDER BY earned_at DESC, id DESC")
    .all(userId) as Row[];
  return rows.map(toCollectible);
}

export function getCollectible(userId: number, kind: CollectibleKind, key: string): Collectible | null {
  const row = db()
    .prepare("SELECT * FROM collectibles WHERE user_id = ? AND kind = ? AND key = ?")
    .get(userId, kind, key) as Row | undefined;
  return row ? toCollectible(row) : null;
}

export function countCertifications(userId: number): number {
  const row = db()
    .prepare("SELECT COUNT(*) AS n FROM collectibles WHERE user_id = ? AND kind = 'certification'")
    .get(userId) as { n: number };
  return row.n;
}

export function insertCollectible(
  userId: number,
  kind: CollectibleKind,
  key: string,
  grade: Grade | null = null,
  score: number | null = null,
): void {
  db()
    .prepare("INSERT OR IGNORE INTO collectibles (user_id, kind, key, grade, score) VALUES (?, ?, ?, ?, ?)")
    .run(userId, kind, key, grade, score);
}

export function upgradeCollectible(id: number, grade: Grade, score: number): void {
  db()
    .prepare("UPDATE collectibles SET grade = ?, score = ?, updated_at = datetime('now') WHERE id = ?")
    .run(grade, score, id);
}

/** 희귀도: 공개 프로필을 가진 플레이어 중 이 수집물을 보유한 비율(%) */
export function rarityPercent(kind: CollectibleKind, key: string): number {
  const players = db().prepare("SELECT COUNT(*) AS n FROM users WHERE handle IS NOT NULL").get() as { n: number };
  if (players.n === 0) return 0;
  const owners = db()
    .prepare(
      `SELECT COUNT(*) AS n FROM collectibles c JOIN users u ON u.id = c.user_id
       WHERE u.handle IS NOT NULL AND c.kind = ? AND c.key = ?`,
    )
    .get(kind, key) as { n: number };
  return Math.round((owners.n / players.n) * 1000) / 10;
}

export function getShowcase(userId: number): (Collectible | null)[] {
  const rows = db()
    .prepare(
      `SELECT s.slot, c.* FROM showcase_slots s JOIN collectibles c ON c.id = s.collectible_id
       WHERE s.user_id = ? ORDER BY s.slot`,
    )
    .all(userId) as (Row & { slot: number })[];
  const slots: (Collectible | null)[] = Array(SHOWCASE_SLOTS).fill(null);
  for (const row of rows) {
    if (row.slot >= 0 && row.slot < SHOWCASE_SLOTS) slots[row.slot] = toCollectible(row);
  }
  return slots;
}

export const SHOWCASE_SLOTS = 6;

/** collectibleIds[slot] = 수집물 id 또는 null. 본인 소유가 아닌 id 는 무시한다. */
export function saveShowcase(userId: number, collectibleIds: (number | null)[]): void {
  const conn = db();
  const owned = new Set(listCollectibles(userId).map((c) => c.id));
  const used = new Set<number>();
  conn.exec("BEGIN");
  try {
    conn.prepare("DELETE FROM showcase_slots WHERE user_id = ?").run(userId);
    const insert = conn.prepare("INSERT INTO showcase_slots (user_id, slot, collectible_id) VALUES (?, ?, ?)");
    collectibleIds.slice(0, SHOWCASE_SLOTS).forEach((id, slot) => {
      if (id !== null && owned.has(id) && !used.has(id)) {
        used.add(id);
        insert.run(userId, slot, id);
      }
    });
    conn.exec("COMMIT");
  } catch (error) {
    conn.exec("ROLLBACK");
    throw error;
  }
}

/** 개발자 모드용: 시험 기록, 수집물, 쇼케이스를 모두 지운다. */
export function resetProgress(userId: number): void {
  const conn = db();
  conn.prepare("DELETE FROM showcase_slots WHERE user_id = ?").run(userId);
  conn.prepare("DELETE FROM collectibles WHERE user_id = ?").run(userId);
  conn.prepare("DELETE FROM exam_attempts WHERE user_id = ?").run(userId);
}
