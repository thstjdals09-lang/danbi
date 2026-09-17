import type { FamilyId } from "./personas";
import type { Grade } from "@/lib/exams/grading";

/**
 * 실력으로만 얻는 Earned Gear. 캐릭터 위에 레이어로 쌓여 커리어의 흔적이 된다.
 * 유료 코스메틱(헤어, 일반 의상 등)은 AvatarState.cosmetics 로 분리되어 여기에 들어가지 않는다.
 * ⚠️ 이름/조건/등급은 초안이다.
 */

export type GearSlot =
  | "headgear"
  | "eyewear"
  | "headphones"
  | "jacket"
  | "pin"
  | "patch"
  | "protector"
  | "bag"
  | "tag"
  | "background";

export type RarityTier = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

export type GearDef = {
  id: string;
  name: string;
  slot: GearSlot;
  /** 디자인상의 희귀 등급. 실제 보유율(%)은 별도로 계산한다. */
  tier: RarityTier;
  /** 획득 난이도 ★1~5 */
  difficulty: 1 | 2 | 3 | 4 | 5;
  description: string;
  unlock: { examId: string; minGrade: Exclude<Grade, "F"> };
  /** 특정 계열 전용 시그니처 기어 */
  family?: FamilyId;
};

export const SLOT_LABEL: Record<GearSlot, string> = {
  headgear: "Headgear",
  eyewear: "Eyewear",
  headphones: "Headphones",
  jacket: "Jacket Detail",
  pin: "Pin",
  patch: "Patch",
  protector: "Card Protector",
  bag: "Bag",
  tag: "Player Tag",
  background: "Background",
};

export const GEAR: GearDef[] = [
  {
    id: "academy-player-tag",
    name: "Academy Player Tag",
    slot: "tag",
    tier: "Common",
    difficulty: 1,
    description: "첫 증명을 마친 플레이어에게 주어지는 금속 태그.",
    unlock: { examId: "basic-terms", minGrade: "C" },
  },
  {
    id: "academy-hall",
    name: "Academy Hall",
    slot: "background",
    tier: "Common",
    difficulty: 2,
    description: "기초를 제대로 다진 플레이어의 배경.",
    unlock: { examId: "basic-terms", minGrade: "B" },
  },
  {
    id: "rulebook-pin",
    name: "Rulebook Enamel Pin",
    slot: "pin",
    tier: "Uncommon",
    difficulty: 2,
    description: "기초 용어 시험 S 등급의 증표.",
    unlock: { examId: "basic-terms", minGrade: "S" },
  },
  {
    id: "40bb-tournament-patch",
    name: "40BB Tournament Patch",
    slot: "patch",
    tier: "Uncommon",
    difficulty: 3,
    description: "40BB 프리플랍 시험을 통과한 토너먼트 플레이어의 패치.",
    unlock: { examId: "preflop-40bb", minGrade: "C" },
  },
  {
    id: "grinder-headphones",
    name: "Grinder Headphones",
    slot: "headphones",
    tier: "Uncommon",
    difficulty: 3,
    description: "긴 세션을 버텨낸 플레이어의 헤드폰.",
    unlock: { examId: "preflop-40bb", minGrade: "B" },
  },
  {
    id: "graphite-card-protector",
    name: "Graphite Card Protector",
    slot: "protector",
    tier: "Rare",
    difficulty: 4,
    description: "40BB 프리플랍 A 등급 이상에게만 허락된 카드 프로텍터.",
    unlock: { examId: "preflop-40bb", minGrade: "A" },
  },
  {
    id: "final-table-light",
    name: "Final Table Light",
    slot: "background",
    tier: "Epic",
    difficulty: 5,
    description: "40BB 프리플랍 S 등급. 마지막 테이블의 조명.",
    unlock: { examId: "preflop-40bb", minGrade: "S" },
  },
  {
    id: "architect-halo",
    name: "Architect Halo",
    slot: "headgear",
    tier: "Rare",
    difficulty: 5,
    description: "THE ARCHITECT 전용. 40BB 프리플랍 S 등급의 시그니처.",
    unlock: { examId: "preflop-40bb", minGrade: "S" },
    family: "architect",
  },
  {
    id: "shark-visor",
    name: "Shark Visor",
    slot: "headgear",
    tier: "Rare",
    difficulty: 5,
    description: "THE SHARK 전용. 40BB 프리플랍 S 등급의 시그니처.",
    unlock: { examId: "preflop-40bb", minGrade: "S" },
    family: "shark",
  },
  {
    id: "strategist-goggles",
    name: "Strategist Goggles",
    slot: "eyewear",
    tier: "Rare",
    difficulty: 5,
    description: "THE STRATEGIST 전용. 40BB 프리플랍 S 등급의 시그니처.",
    unlock: { examId: "preflop-40bb", minGrade: "S" },
    family: "strategist",
  },
  {
    id: "hunter-hood",
    name: "Hunter Hood",
    slot: "headgear",
    tier: "Rare",
    difficulty: 5,
    description: "THE HUNTER 전용. 40BB 프리플랍 S 등급의 시그니처.",
    unlock: { examId: "preflop-40bb", minGrade: "S" },
    family: "hunter",
  },
];

export function getGear(id: string): GearDef | null {
  return GEAR.find((g) => g.id === id) ?? null;
}

/** 이 계열의 플레이어가 볼 수 있는 기어 (다른 계열 시그니처 제외) */
export function gearForFamily(family: FamilyId): GearDef[] {
  return GEAR.filter((g) => !g.family || g.family === family);
}
