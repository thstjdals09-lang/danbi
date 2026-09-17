import type { Grade } from "@/lib/exams/grading";

/**
 * Current Identity: 시험 결과로 발전하는 현재 정체성.
 * Origin Persona(첫 성향 테스트)는 바뀌지 않고, 이것만 변한다.
 * 조건을 만족하는 것 중 priority 가 가장 높은 것이 현재 정체성이 된다.
 * 아무것도 만족하지 않으면 Origin Persona 의 계열 이름을 그대로 쓴다.
 * ⚠️ 초안이다.
 */
export type IdentityDef = {
  id: string;
  name: string;
  description: string;
  priority: number;
  requires: { examId: string; minGrade: Exclude<Grade, "F"> }[];
};

export const IDENTITIES: IdentityDef[] = [
  {
    id: "academy-graduate",
    name: "ACADEMY GRADUATE",
    description: "포커의 언어를 완벽하게 이해한 플레이어.",
    priority: 10,
    requires: [{ examId: "basic-terms", minGrade: "S" }],
  },
  {
    id: "40bb-preflop-regular",
    name: "40BB PREFLOP REGULAR",
    description: "40BB 토너먼트 프리플랍에서 안정적인 판단을 증명한 플레이어.",
    priority: 20,
    requires: [{ examId: "preflop-40bb", minGrade: "B" }],
  },
  {
    id: "mtt-pressure-specialist",
    name: "MTT PRESSURE SPECIALIST",
    description: "40BB 프리플랍 압박 스팟을 정확하게 읽어내는 토너먼트 스페셜리스트.",
    priority: 30,
    requires: [{ examId: "preflop-40bb", minGrade: "A" }],
  },
];

export function getIdentity(id: string | null | undefined): IdentityDef | null {
  return IDENTITIES.find((i) => i.id === id) ?? null;
}
