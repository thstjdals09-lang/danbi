import "server-only";
import { stageFor } from "@/content/growth";
import type { Grade } from "@/lib/exams/grading";
import { isBetterGrade, isPassing } from "@/lib/exams/grading";
import type { Rewards } from "@/lib/repo/attempts";
import {
  countCertifications,
  getCollectible,
  insertCollectible,
  upgradeCollectible,
} from "@/lib/repo/collection";

/**
 * 시험 결과를 커리어에 반영한다: 인증 획득/등급 갱신, 트로피, 성장 단계 변화.
 * 반환값은 결과 화면에 그대로 보여줄 보상 목록이다.
 */
export function applyExamResult(userId: number, examId: string, score: number, grade: Grade): Rewards {
  const rewards: Rewards = { trophies: [] };
  if (!isPassing(grade)) return rewards;

  const stageBefore = stageFor(countCertifications(userId));

  const existing = getCollectible(userId, "certification", examId);
  if (!existing) {
    insertCollectible(userId, "certification", examId, grade, score);
    rewards.certification = { status: "new", grade };
  } else if (isBetterGrade(grade, existing.grade)) {
    upgradeCollectible(existing.id, grade, score);
    rewards.certification = { status: "upgraded", grade, previousGrade: existing.grade };
  } else {
    rewards.certification = { status: "kept", grade: existing.grade ?? grade };
  }

  const grant = (key: string) => {
    if (!getCollectible(userId, "trophy", key)) {
      insertCollectible(userId, "trophy", key);
      rewards.trophies.push(key);
    }
  };
  grant("first-certification");
  if (score === 100) grant("perfect-exam");

  const stageAfter = stageFor(countCertifications(userId));
  if (stageAfter.id !== stageBefore.id) rewards.stage = { from: stageBefore.id, to: stageAfter.id };

  return rewards;
}
