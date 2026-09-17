import "server-only";
import { db } from "@/lib/db";
import { certificationAsset, gearAsset, personaAsset, trophyAsset } from "@/lib/assets";
import type {
  AvatarState,
  Certification,
  CollectionItem,
  GearItem,
  Identity,
  PlayerSnapshot,
  ProofRecord,
  PublicProfile,
  Pursuit,
  SkillGrade,
} from "@/lib/domain";
import { getExamSource } from "@/lib/exams/registry";
import type { ExamSummary } from "@/lib/exams/types";
import { GRADE_POINTS, formatDate, playerLevel, seasonOf } from "@/lib/player-rules";
import { SLOT_LABEL, gearForFamily, getGear } from "@/content/gear";
import { stageFor } from "@/content/growth";
import { getIdentity } from "@/content/identities";
import { FAMILIES, FAMILY_ORDER, PERSONAS, getPersona, type Persona } from "@/content/personas";
import { TROPHIES } from "@/content/trophies";
import { latestAttempts } from "@/lib/repo/attempts";
import { getShowcaseIds, listCollectibles, ownedPercent, SHOWCASE_SLOTS, type Collectible } from "@/lib/repo/collection";
import { getUserByHandle, type User } from "@/lib/repo/users";

export { formatDate };

function toGearItem(id: string): GearItem | null {
  const def = getGear(id);
  if (!def) return null;
  return {
    id: def.id,
    name: def.name,
    slot: def.slot,
    slotLabel: SLOT_LABEL[def.slot],
    tier: def.tier,
    icon: gearAsset(def.id, "icon"),
    overlay: gearAsset(def.id, "overlay"),
  };
}

export function originPersonaOf(user: Pick<User, "originPersonaId" | "personaId">): Persona | null {
  return getPersona(user.originPersonaId ?? user.personaId);
}

export function identityOf(user: Pick<User, "identityId">, persona: Persona): Identity {
  const def = getIdentity(user.identityId);
  if (!def) return { id: null, name: persona.title, description: persona.family.description, isOrigin: true };
  return { id: def.id, name: def.name, description: def.description, isOrigin: false };
}

export function buildAvatarState(user: User, owned: Collectible[]): AvatarState | null {
  const persona = originPersonaOf(user);
  if (!persona) return null;
  const gear = owned.filter((c) => c.kind === "gear");
  const certCount = owned.filter((c) => c.kind === "certification").length;
  const family = persona.family.id;
  return {
    originPersona: persona,
    currentIdentity: identityOf(user, persona),
    careerStage: stageFor(certCount),
    equippedGear: gear.filter((g) => g.equipped).map((g) => toGearItem(g.key)).filter((g) => g !== null),
    unlockedGear: gear.map((g) => toGearItem(g.key)).filter((g) => g !== null),
    cosmetics: [],
    assets: {
      full: personaAsset(family, "full"),
      bust: personaAsset(family, "bust"),
      pfp: personaAsset(family, "pfp"),
      reveal: personaAsset(family, "reveal"),
    },
  };
}

/** 회원가입 전(쿠키에만 있는) Persona 의 기본 아바타 */
export function previewAvatarState(persona: Persona): AvatarState {
  const family = persona.family.id;
  return {
    originPersona: persona,
    currentIdentity: { id: null, name: persona.title, description: persona.family.description, isOrigin: true },
    careerStage: stageFor(0),
    equippedGear: [],
    unlockedGear: [],
    cosmetics: [],
    assets: {
      full: personaAsset(family, "full"),
      bust: personaAsset(family, "bust"),
      pfp: personaAsset(family, "pfp"),
      reveal: personaAsset(family, "reveal"),
    },
  };
}

function familyOwnedPercent(familyId: string): number {
  const rows = db()
    .prepare("SELECT COALESCE(origin_persona_id, persona_id) AS pid FROM users WHERE handle IS NOT NULL")
    .all() as { pid: string | null }[];
  if (rows.length === 0) return 0;
  const count = rows.filter((r) => getPersona(r.pid)?.family.id === familyId).length;
  return Math.round((count / rows.length) * 1000) / 10;
}

/**
 * 전체 컬렉션(보유 + 미보유 잠김 항목)을 만든다.
 * 미보유 항목도 목표로 보여주기 위해 포함한다.
 */
export function buildCollection(
  user: User,
  persona: Persona,
  owned: Collectible[],
  showcaseIds: (number | null)[],
  exams: ExamSummary[],
): CollectionItem[] {
  const find = (kind: Collectible["kind"], key: string) => owned.find((c) => c.kind === kind && c.key === key) ?? null;
  const showcased = (id: number | null) => id !== null && showcaseIds.includes(id);
  const examTitle = (examId: string) => exams.find((e) => e.id === examId)?.title ?? examId;
  const items: CollectionItem[] = [];

  for (const familyId of FAMILY_ORDER) {
    const family = FAMILIES[familyId];
    const isOrigin = family.id === persona.family.id;
    items.push({
      id: `avatar:${family.id}`,
      ownedId: null,
      name: family.name,
      type: "avatar",
      source: isOrigin ? "Origin · Poker Persona Test" : "Identity 발전으로 해금 예정",
      rarity: { tier: null, ownedPercent: familyOwnedPercent(family.id) },
      difficulty: 1,
      earnedAt: isOrigin ? user.createdAt : null,
      image: personaAsset(family.id, "bust"),
      isOwned: isOrigin,
      isEquipped: isOrigin,
      isShowcased: false,
      description: family.keywords.join(" · "),
      accent: family.accent,
    });
  }

  for (const cert of buildCertifications(user, owned, showcaseIds, exams)) items.push(cert);

  for (const def of gearForFamily(persona.family.id)) {
    const row = find("gear", def.id);
    items.push({
      id: `gear:${def.id}`,
      ownedId: row?.id ?? null,
      name: def.name,
      type: def.slot === "background" ? "background" : "gear",
      source: `${examTitle(def.unlock.examId)} · ${def.unlock.minGrade} 이상`,
      rarity: { tier: def.tier, ownedPercent: ownedPercent("gear", def.id) },
      difficulty: def.difficulty,
      earnedAt: row?.earnedAt ?? null,
      image: gearAsset(def.id, "icon"),
      isOwned: Boolean(row),
      isEquipped: Boolean(row?.equipped),
      isShowcased: showcased(row?.id ?? null),
      description: def.description,
      slotLabel: SLOT_LABEL[def.slot],
      season: row ? seasonOf(row.earnedAt) : null,
      accent: def.family ? FAMILIES[def.family].accent : undefined,
    });
  }

  for (const def of TROPHIES) {
    const row = find("trophy", def.key);
    items.push({
      id: `trophy:${def.key}`,
      ownedId: row?.id ?? null,
      name: def.name,
      type: "trophy",
      source: "Career",
      rarity: { tier: null, ownedPercent: ownedPercent("trophy", def.key) },
      difficulty: def.difficulty,
      earnedAt: row?.earnedAt ?? null,
      image: trophyAsset(def.key),
      isOwned: Boolean(row),
      isEquipped: false,
      isShowcased: showcased(row?.id ?? null),
      description: def.description,
      season: row ? seasonOf(row.earnedAt) : null,
    });
  }

  return items;
}

export function buildCertifications(
  user: User,
  owned: Collectible[],
  showcaseIds: (number | null)[],
  exams: ExamSummary[],
): Certification[] {
  return exams.map((exam) => {
    const row = owned.find((c) => c.kind === "certification" && c.key === exam.id) ?? null;
    return {
      id: `certification:${exam.id}`,
      ownedId: row?.id ?? null,
      name: exam.certification.name,
      type: "certification",
      source: `${exam.title} Exam`,
      rarity: { tier: null, ownedPercent: ownedPercent("certification", exam.id) },
      difficulty: exam.difficulty,
      earnedAt: row?.updatedAt ?? null,
      image: certificationAsset(exam.id),
      isOwned: Boolean(row),
      isEquipped: false,
      isShowcased: row ? showcaseIds.includes(row.id) : false,
      description: exam.description,
      grade: row?.grade ?? null,
      season: row ? seasonOf(row.updatedAt) : null,
      examId: exam.id,
      code: exam.certification.code,
      score: row?.score ?? null,
      owner: user.handle,
    };
  });
}

function buildSkills(owned: Collectible[], exams: ExamSummary[]): SkillGrade[] {
  return exams.map((exam) => ({
    domain: exam.domain,
    skill: exam.skill,
    examId: exam.id,
    grade: owned.find((c) => c.kind === "certification" && c.key === exam.id)?.grade ?? null,
  }));
}

/**
 * Current Pursuit: 가장 가까운 다음 증명 하나.
 * 등급 사다리(C → B → A → S)를 4단계로 보고, S 가 아닌 첫 번째 시험을 목표로 삼는다.
 */
function buildPursuit(owned: Collectible[], exams: ExamSummary[], bestScores: Record<string, number>): Pursuit | null {
  const target = exams.find((e) => owned.find((c) => c.kind === "certification" && c.key === e.id)?.grade !== "S");
  if (!target) return null;
  const grade = owned.find((c) => c.kind === "certification" && c.key === target.id)?.grade ?? null;
  const step = grade ? GRADE_POINTS[grade] : 0;
  const nextGrade = ["C", "B", "A", "S"][step] ?? "S";
  return {
    examId: target.id,
    title: target.title,
    goal: target.certification.name,
    step,
    steps: 4,
    bestScore: bestScores[target.id] ?? 0,
    targetScore: { C: 70, B: 80, A: 90, S: 95 }[nextGrade] ?? 95,
    reward: `${target.certification.code} — ${nextGrade}`,
  };
}

function bestScoresOf(userId: number): Record<string, number> {
  const rows = db()
    .prepare("SELECT exam_id, MAX(score) AS best FROM exam_attempts WHERE user_id = ? GROUP BY exam_id")
    .all(userId) as { exam_id: string; best: number }[];
  return Object.fromEntries(rows.map((r) => [r.exam_id, r.best]));
}

function proofCountOf(userId: number): number {
  const row = db().prepare("SELECT COUNT(*) AS n FROM exam_attempts WHERE user_id = ?").get(userId) as { n: number };
  return row.n;
}

export async function getPlayerSnapshot(user: User): Promise<PlayerSnapshot | null> {
  if (!user.handle) return null;
  const owned = listCollectibles(user.id);
  const avatar = buildAvatarState(user, owned);
  if (!avatar) return null;

  const exams = await getExamSource().listExams();
  const showcaseIds = getShowcaseIds(user.id);
  const collection = buildCollection(user, avatar.originPersona, owned, showcaseIds, exams);
  const certifications = collection.filter((i): i is Certification => i.type === "certification");
  const byOwnedId = new Map(collection.filter((i) => i.ownedId !== null).map((i) => [i.ownedId as number, i]));

  const latest = latestAttempts(user.id, 1)[0];
  const latestProof: ProofRecord | null = latest
    ? {
        attemptId: latest.id,
        examId: latest.examId,
        examTitle: exams.find((e) => e.id === latest.examId)?.title ?? latest.examId,
        score: latest.score,
        grade: latest.grade,
        createdAt: latest.createdAt,
      }
    : null;

  return {
    userId: user.id,
    nickname: user.nickname ?? user.handle,
    handle: user.handle,
    level: playerLevel(owned),
    avatar,
    skills: buildSkills(owned, exams),
    certifications,
    collection,
    showcase: {
      capacity: SHOWCASE_SLOTS,
      slots: showcaseIds.map((id) => (id === null ? null : byOwnedId.get(id) ?? null)),
    },
    pursuit: buildPursuit(owned, exams, bestScoresOf(user.id)),
    latestProof,
    proofCount: proofCountOf(user.id),
    joinedAt: user.createdAt,
  };
}

export async function getPublicProfile(handle: string): Promise<PublicProfile | null> {
  const user = getUserByHandle(handle);
  if (!user) return null;
  const snapshot = await getPlayerSnapshot(user);
  if (!snapshot) return null;
  const featuredProofs = snapshot.showcase.slots.filter((s) => s !== null);
  return { ...snapshot, featuredProofs, playStyle: snapshot.avatar.originPersona.keywords };
}

export function listProofHistory(userId: number, exams: ExamSummary[], limit = 50): ProofRecord[] {
  return latestAttempts(userId, limit).map((a) => ({
    attemptId: a.id,
    examId: a.examId,
    examTitle: exams.find((e) => e.id === a.examId)?.title ?? a.examId,
    score: a.score,
    grade: a.grade,
    createdAt: a.createdAt,
  }));
}

/** Persona 분포 (랜딩/커뮤니티 표시용) */
export function personaCatalog() {
  return { families: FAMILY_ORDER.map((id) => FAMILIES[id]), personas: PERSONAS };
}
