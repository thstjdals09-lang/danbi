import "server-only";
import { db } from "@/lib/db";
import type { Grade, QuestionResult } from "@/lib/exams/grading";

export type Rewards = {
  certification?: { status: "new" | "upgraded" | "kept"; grade: Grade; previousGrade?: Grade | null };
  trophies: string[];
  stage?: { from: string; to: string };
};

export type Attempt = {
  id: number;
  userId: number;
  examId: string;
  score: number;
  grade: Grade;
  results: QuestionResult[];
  rewards: Rewards;
  createdAt: string;
};

type Row = {
  id: number;
  user_id: number;
  exam_id: string;
  score: number;
  grade: Grade;
  answers: string;
  rewards: string;
  created_at: string;
};

function toAttempt(r: Row): Attempt {
  return {
    id: r.id,
    userId: r.user_id,
    examId: r.exam_id,
    score: r.score,
    grade: r.grade,
    results: JSON.parse(r.answers),
    rewards: JSON.parse(r.rewards),
    createdAt: r.created_at,
  };
}

export function insertAttempt(
  userId: number,
  examId: string,
  score: number,
  grade: Grade,
  results: QuestionResult[],
  rewards: Rewards,
): number {
  const result = db()
    .prepare("INSERT INTO exam_attempts (user_id, exam_id, score, grade, answers, rewards) VALUES (?, ?, ?, ?, ?, ?)")
    .run(userId, examId, score, grade, JSON.stringify(results), JSON.stringify(rewards));
  return Number(result.lastInsertRowid);
}

export function getAttempt(id: number): Attempt | null {
  const row = db().prepare("SELECT * FROM exam_attempts WHERE id = ?").get(id) as Row | undefined;
  return row ? toAttempt(row) : null;
}

/** examId → 최고 점수 */
export function bestScores(userId: number): Record<string, number> {
  const rows = db()
    .prepare("SELECT exam_id, MAX(score) AS best FROM exam_attempts WHERE user_id = ? GROUP BY exam_id")
    .all(userId) as { exam_id: string; best: number }[];
  return Object.fromEntries(rows.map((r) => [r.exam_id, r.best]));
}

export function latestAttempts(userId: number, limit = 5): Attempt[] {
  const rows = db()
    .prepare("SELECT * FROM exam_attempts WHERE user_id = ? ORDER BY id DESC LIMIT ?")
    .all(userId, limit) as Row[];
  return rows.map(toAttempt);
}
