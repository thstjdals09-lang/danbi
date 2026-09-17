import { getGear, type GearSlot } from "@/content/gear";
import type { Grade } from "@/lib/exams/grading";

/**
 * Player Level: 의미 없는 EXP 가 아니라 "증명의 합"이다.
 * 인증 등급 포인트(C1 · B2 · A3 · S4)의 합 + 1.
 */
export const GRADE_POINTS: Record<Grade, number> = { F: 0, C: 1, B: 2, A: 3, S: 4 };

export function playerLevel(items: { kind: string; grade: Grade | null }[]): number {
  return 1 + items.filter((i) => i.kind === "certification").reduce((sum, i) => sum + (i.grade ? GRADE_POINTS[i.grade] : 0), 0);
}

export function gearSlotOf(gearId: string): GearSlot | null {
  return getGear(gearId)?.slot ?? null;
}

/** 시즌 라벨. 예: 2026 AUTUMN */
export function seasonOf(isoDate: string): string {
  const date = new Date(isoDate.includes("T") ? isoDate : `${isoDate.replace(" ", "T")}Z`);
  const month = date.getUTCMonth() + 1;
  const season = month <= 2 || month === 12 ? "WINTER" : month <= 5 ? "SPRING" : month <= 8 ? "SUMMER" : "AUTUMN";
  const year = month === 12 ? date.getUTCFullYear() + 1 : date.getUTCFullYear();
  return `${year} ${season}`;
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate.includes("T") ? isoDate : `${isoDate.replace(" ", "T")}Z`);
  return `${date.getUTCFullYear()}. ${String(date.getUTCMonth() + 1).padStart(2, "0")}. ${String(date.getUTCDate()).padStart(2, "0")}`;
}
