import "server-only";
import type { ExamSource } from "./types";
import { localExamSource } from "./sources/local";

const SOURCES: Record<string, ExamSource> = {
  [localExamSource.id]: localExamSource,
};

/** DANBI_EXAM_SOURCE 로 문제 소스를 고른다. (기본값: local) */
export function getExamSource(): ExamSource {
  const id = process.env.DANBI_EXAM_SOURCE ?? "local";
  const source = SOURCES[id];
  if (!source) throw new Error(`Unknown exam source: ${id}`);
  return source;
}

export function listExamSourceIds(): string[] {
  return Object.keys(SOURCES);
}
