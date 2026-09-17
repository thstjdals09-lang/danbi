import "server-only";
import { db } from "@/lib/db";
import type { Grade } from "@/lib/exams/grading";

export type CollectibleKind = "certification" | "trophy" | "gear";

/** DB 에 저장된 보유 수집물 한 건 */
export type Collectible = {
  id: number;
  userId: number;
  kind: CollectibleKind;
  key: string;
  grade: Grade | null;
  score: number | null;
  /** 획득 경로. 예: "exam:preflop-40bb" */
  source: string | null;
  equipped: boolean;
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
  source: string | null;
  equipped: number;
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
    source: r.source,
    equipped: r.equipped === 1,
    earnedAt: r.earned_at,
    updatedAt: r.updated_at,
  };
}

export const SHOWCASE_SLOTS = 6;

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

export function getCollectibleById(userId: number, id: number): Collectible | null {
  const row = db().prepare("SELECT * FROM collectibles WHERE user_id = ? AND id = ?").get(userId, id) as Row | undefined;
  return row ? toCollectible(row) : null;
}

export function countCertifications(userId: number): number {
  const row = db()
    .prepare("SELECT COUNT(*) AS n FROM collectibles WHERE user_id = ? AND kind = 'certification'")
    .get(userId) as { n: number };
  return row.n;
}

export function countAllCollectibles(): number {
  const row = db().prepare("SELECT COUNT(*) AS n FROM collectibles").get() as { n: number };
  return row.n;
}

export function insertCollectible(
  userId: number,
  kind: CollectibleKind,
  key: string,
  options: { grade?: Grade | null; score?: number | null; source?: string | null; equipped?: boolean } = {},
): void {
  db()
    .prepare(
      "INSERT OR IGNORE INTO collectibles (user_id, kind, key, grade, score, source, equipped) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .run(userId, kind, key, options.grade ?? null, options.score ?? null, options.source ?? null, options.equipped ? 1 : 0);
}

export function upgradeCollectible(id: number, grade: Grade, score: number): void {
  db()
    .prepare("UPDATE collectibles SET grade = ?, score = ?, updated_at = datetime('now') WHERE id = ?")
    .run(grade, score, id);
}

export function setEquipped(userId: number, ids: number[], equipped: boolean): void {
  const stmt = db().prepare("UPDATE collectibles SET equipped = ? WHERE user_id = ? AND id = ?");
  for (const id of ids) stmt.run(equipped ? 1 : 0, userId, id);
}

/** 보유율(%): 공개 프로필을 가진 플레이어 중 이 수집물을 가진 비율 */
export function ownedPercent(kind: CollectibleKind, key: string): number {
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

/** slot 순서대로 수집물 id (빈 슬롯은 null) */
export function getShowcaseIds(userId: number): (number | null)[] {
  const rows = db()
    .prepare("SELECT slot, collectible_id FROM showcase_slots WHERE user_id = ? ORDER BY slot")
    .all(userId) as { slot: number; collectible_id: number }[];
  const slots: (number | null)[] = Array(SHOWCASE_SLOTS).fill(null);
  for (const row of rows) if (row.slot >= 0 && row.slot < SHOWCASE_SLOTS) slots[row.slot] = row.collectible_id;
  return slots;
}

/** collectibleIds[slot] = 수집물 id 또는 null. 본인 소유가 아닌 id, 중복 id 는 무시한다. */
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

export type ShowcaseAddResult = "added" | "already" | "full" | "not-owned";

/** 첫 번째 빈 슬롯에 추가한다. */
export function addToShowcase(userId: number, collectibleId: number): ShowcaseAddResult {
  if (!getCollectibleById(userId, collectibleId)) return "not-owned";
  const ids = getShowcaseIds(userId);
  if (ids.includes(collectibleId)) return "already";
  const empty = ids.indexOf(null);
  if (empty === -1) return "full";
  ids[empty] = collectibleId;
  saveShowcase(userId, ids);
  return "added";
}

export function removeFromShowcase(userId: number, collectibleId: number): void {
  saveShowcase(
    userId,
    getShowcaseIds(userId).map((id) => (id === collectibleId ? null : id)),
  );
}

/** 개발자 모드용: 시험 기록, 수집물, 쇼케이스, 현재 정체성을 모두 지운다. */
export function resetProgress(userId: number): void {
  const conn = db();
  conn.prepare("DELETE FROM showcase_slots WHERE user_id = ?").run(userId);
  conn.prepare("DELETE FROM collectibles WHERE user_id = ?").run(userId);
  conn.prepare("DELETE FROM exam_attempts WHERE user_id = ?").run(userId);
  conn.prepare("UPDATE users SET identity_id = NULL WHERE id = ?").run(userId);
}
