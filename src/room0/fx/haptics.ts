/* 기획서 §17. 지원되지 않는 기기에서도 진행에 영향이 없어야 하므로 전부 best-effort. */

export type HapticKind = "touch" | "clue" | "anomaly" | "recover" | "deny";

const PATTERNS: Record<HapticKind, number | number[]> = {
  touch: 18,
  clue: 40,
  anomaly: [40, 30, 60],
  recover: [90, 40, 90],
  deny: [12, 40, 12],
};

export function haptic(kind: HapticKind): void {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(PATTERNS[kind]);
  } catch {
    /* noop */
  }
}
