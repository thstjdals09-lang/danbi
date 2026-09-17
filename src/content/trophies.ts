/**
 * 트로피 정의. 모두 실력으로만 얻는 Earned 수집물이다.
 * ⚠️ 이름/설명/난이도는 초안이다.
 */
export type TrophyDef = {
  key: string;
  name: string;
  description: string;
  /** 획득 난이도 ★1~5 (보유율 = 희귀도와는 별개) */
  difficulty: 1 | 2 | 3 | 4 | 5;
};

export const TROPHIES: TrophyDef[] = [
  {
    key: "first-certification",
    name: "First Certification",
    description: "첫 번째 인증을 획득했다.",
    difficulty: 1,
  },
  {
    key: "perfect-exam",
    name: "Perfect Exam",
    description: "시험에서 100점을 받았다.",
    difficulty: 3,
  },
];

export function getTrophy(key: string): TrophyDef | null {
  return TROPHIES.find((t) => t.key === key) ?? null;
}
