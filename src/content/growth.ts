/**
 * 캐릭터 성장 단계. 인증(합격한 시험) 개수로 결정한다.
 * ⚠️ 단계별 필요 인증 수는 임시값이다.
 */
export const GROWTH_STAGES = [
  { id: "beginner", name: "Beginner", minCertifications: 0 },
  { id: "academy-student", name: "Academy Student", minCertifications: 1 },
  { id: "grinder", name: "Grinder", minCertifications: 3 },
  { id: "regular", name: "Regular", minCertifications: 6 },
  { id: "semi-pro", name: "Semi-Pro", minCertifications: 10 },
  { id: "pro", name: "Pro", minCertifications: 15 },
  { id: "elite", name: "Elite", minCertifications: 25 },
] as const;

export type GrowthStage = (typeof GROWTH_STAGES)[number];

export function stageFor(certificationCount: number): GrowthStage {
  let current: GrowthStage = GROWTH_STAGES[0];
  for (const stage of GROWTH_STAGES) {
    if (certificationCount >= stage.minCertifications) current = stage;
  }
  return current;
}

export function nextStage(stage: GrowthStage): GrowthStage | null {
  const index = GROWTH_STAGES.findIndex((s) => s.id === stage.id);
  return GROWTH_STAGES[index + 1] ?? null;
}
