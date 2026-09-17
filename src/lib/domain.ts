/**
 * 화면이 사용하는 도메인 객체.
 * 페이지는 DB 행이나 콘텐츠 정의를 직접 조합하지 않고 lib/player.ts 가 만든 이 객체만 쓴다.
 * 저장소가 바뀌어도(다른 DB, API) player.ts 의 조립 부분만 교체하면 된다.
 */
import type { AssetRef } from "@/lib/assets";
import type { Grade } from "@/lib/exams/grading";
import type { GearSlot, RarityTier } from "@/content/gear";
import type { GrowthStage } from "@/content/growth";
import type { Persona, PersonaFamily } from "@/content/personas";

export type { Persona, PersonaFamily };

export type Identity = {
  id: string | null;
  name: string;
  description: string;
  /** true 면 Origin 계열 이름을 그대로 쓰는 중 (아직 발전 전) */
  isOrigin: boolean;
};

export type GearItem = {
  id: string;
  name: string;
  slot: GearSlot;
  slotLabel: string;
  tier: RarityTier;
  icon: AssetRef;
  /** full 캐릭터와 같은 캔버스의 투명 레이어 */
  overlay: AssetRef;
};

/** 실력 아이템과 분리된 유료/일반 코스메틱 (프로토타입에서는 비어 있음) */
export type CosmeticItem = { id: string; name: string; slot: string; image: AssetRef };

export type AvatarState = {
  originPersona: Persona;
  currentIdentity: Identity;
  careerStage: GrowthStage;
  equippedGear: GearItem[];
  unlockedGear: GearItem[];
  cosmetics: CosmeticItem[];
  assets: { full: AssetRef; bust: AssetRef; pfp: AssetRef; reveal: AssetRef };
};

export type CollectionType = "avatar" | "certification" | "gear" | "trophy" | "background";

export type CollectionItem = {
  /** 안정적인 식별자. 예: "certification:preflop-40bb" */
  id: string;
  /** 보유 중일 때 DB 수집물 id (쇼케이스/장착에 사용) */
  ownedId: number | null;
  name: string;
  type: CollectionType;
  /** 획득 경로 설명. 예: "40BB Preflop Exam" */
  source: string;
  /** 희귀도 = 디자인 등급(tier) + 실제 보유율. 난이도와는 별개. */
  rarity: { tier: RarityTier | null; ownedPercent: number };
  /** 획득 난이도 ★1~5 */
  difficulty: number;
  earnedAt: string | null;
  image: AssetRef;
  isOwned: boolean;
  isEquipped: boolean;
  isShowcased: boolean;
  /** 부가 정보 */
  description: string;
  grade?: Grade | null;
  season?: string | null;
  slotLabel?: string;
  accent?: string;
};

/** Credential Object 로 표현되는 인증 */
export type Certification = CollectionItem & {
  type: "certification";
  examId: string;
  code: string;
  score: number | null;
  owner: string | null;
};

export type Showcase = { slots: (CollectionItem | null)[]; capacity: number };

export type Pursuit = {
  examId: string;
  title: string;
  goal: string;
  /** 예: 2 / 4 처럼 보여줄 단계형 진행 */
  step: number;
  steps: number;
  bestScore: number;
  targetScore: number;
  reward: string;
};

export type SkillGrade = { domain: string; skill: string; grade: Grade | null; examId: string };

export type ProofRecord = {
  attemptId: number;
  examId: string;
  examTitle: string;
  score: number;
  grade: Grade;
  createdAt: string;
};

export type PlayerSnapshot = {
  userId: number;
  nickname: string;
  handle: string;
  level: number;
  avatar: AvatarState;
  skills: SkillGrade[];
  certifications: Certification[];
  collection: CollectionItem[];
  showcase: Showcase;
  pursuit: Pursuit | null;
  latestProof: ProofRecord | null;
  proofCount: number;
  joinedAt: string;
};

export type PublicProfile = PlayerSnapshot & { featuredProofs: CollectionItem[]; playStyle: string[] };
