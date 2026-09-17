import "server-only";
import { stageFor } from "@/content/growth";
import { gearForFamily } from "@/content/gear";
import { IDENTITIES } from "@/content/identities";
import { getPersona } from "@/content/personas";
import type { Grade } from "@/lib/exams/grading";
import { isBetterGrade, isPassing, meetsGrade } from "@/lib/exams/grading";
import type { Rewards } from "@/lib/repo/attempts";
import {
  countCertifications,
  getCollectible,
  insertCollectible,
  listCollectibles,
  upgradeCollectible,
} from "@/lib/repo/collection";
import { setIdentity, type User } from "@/lib/repo/users";
import { gearSlotOf, playerLevel } from "@/lib/player-rules";

/**
 * 인증 등급을 기준으로 획득 조건을 만족한 기어와 Current Identity 를 반영한다.
 * 여러 번 호출해도 결과가 같다(idempotent). 새로 생긴 것만 돌려준다.
 */
export function syncEarnedProgress(user: User): { gear: string[]; equipped: string[]; identity?: Rewards["identity"] } {
  const persona = getPersona(user.originPersonaId ?? user.personaId);
  if (!persona) return { gear: [], equipped: [] };

  const owned = listCollectibles(user.id);
  const certGrade = (examId: string) =>
    owned.find((c) => c.kind === "certification" && c.key === examId)?.grade ?? null;

  const gained: string[] = [];
  const equipped: string[] = [];
  const occupiedSlots = new Set(
    owned.filter((c) => c.kind === "gear" && c.equipped).map((c) => gearSlotOf(c.key)),
  );

  for (const gear of gearForFamily(persona.family.id)) {
    if (owned.some((c) => c.kind === "gear" && c.key === gear.id)) continue;
    if (!meetsGrade(certGrade(gear.unlock.examId), gear.unlock.minGrade)) continue;

    // 비어 있는 부위에만 자동 장착. 이미 무언가 장착돼 있다면 컬렉션에서 직접 교체한다.
    const autoEquip = !occupiedSlots.has(gear.slot);
    if (autoEquip) occupiedSlots.add(gear.slot);
    insertCollectible(user.id, "gear", gear.id, { source: `exam:${gear.unlock.examId}`, equipped: autoEquip });
    gained.push(gear.id);
    if (autoEquip) equipped.push(gear.id);
  }

  const nextIdentity =
    IDENTITIES.filter((identity) => identity.requires.every((r) => meetsGrade(certGrade(r.examId), r.minGrade)))
      .sort((a, b) => b.priority - a.priority)[0]?.id ?? null;

  let identity: Rewards["identity"];
  if (nextIdentity !== user.identityId) {
    setIdentity(user.id, nextIdentity);
    identity = { from: user.identityId, to: nextIdentity };
  }

  return { gear: gained, equipped, identity };
}

/**
 * 시험 결과를 커리어에 반영한다: 인증 획득/등급 갱신, 트로피, 기어, 정체성, 레벨, 성장 단계.
 * 반환값은 결과 화면의 연출 순서대로 보여줄 보상 목록이다.
 */
export function applyExamResult(user: User, examId: string, score: number, grade: Grade): Rewards {
  const rewards: Rewards = { trophies: [], gear: [], equipped: [] };
  if (!isPassing(grade)) return rewards;

  const stageBefore = stageFor(countCertifications(user.id));
  const levelBefore = playerLevel(listCollectibles(user.id));

  const existing = getCollectible(user.id, "certification", examId);
  if (!existing) {
    insertCollectible(user.id, "certification", examId, { grade, score, source: `exam:${examId}` });
    rewards.certification = { status: "new", grade };
  } else if (isBetterGrade(grade, existing.grade)) {
    upgradeCollectible(existing.id, grade, score);
    rewards.certification = { status: "upgraded", grade, previousGrade: existing.grade };
  } else {
    rewards.certification = { status: "kept", grade: existing.grade ?? grade };
  }

  const grant = (key: string) => {
    if (!getCollectible(user.id, "trophy", key)) {
      insertCollectible(user.id, "trophy", key, { source: `exam:${examId}` });
      rewards.trophies.push(key);
    }
  };
  grant("first-certification");
  if (score === 100) grant("perfect-exam");

  const synced = syncEarnedProgress(user);
  rewards.gear = synced.gear;
  rewards.equipped = synced.equipped;
  if (synced.identity) rewards.identity = synced.identity;

  const stageAfter = stageFor(countCertifications(user.id));
  if (stageAfter.id !== stageBefore.id) rewards.stage = { from: stageBefore.id, to: stageAfter.id };

  const levelAfter = playerLevel(listCollectibles(user.id));
  if (levelAfter !== levelBefore) rewards.level = { from: levelBefore, to: levelAfter };

  return rewards;
}
