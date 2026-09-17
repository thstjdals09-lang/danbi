import type { Exam, PublicExam, Question } from "./types";

export type Grade = "S" | "A" | "B" | "C" | "F";

export const PASS_SCORE = 70;

export function gradeFor(score: number): Grade {
  if (score >= 95) return "S";
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= PASS_SCORE) return "C";
  return "F";
}

const RANK: Record<Grade, number> = { F: 0, C: 1, B: 2, A: 3, S: 4 };

export function isBetterGrade(a: Grade, b: Grade | null | undefined): boolean {
  return RANK[a] > (b ? RANK[b as Grade] ?? -1 : -1);
}

/** actual 이 minimum 이상인가 (actual 이 없으면 false) */
export function meetsGrade(actual: Grade | null | undefined, minimum: Grade): boolean {
  return actual ? RANK[actual] >= RANK[minimum] : false;
}

export function isPassing(grade: Grade): boolean {
  return grade !== "F";
}

/** 문제 하나의 점수(0~1). 스팟 문제는 선택한 액션 빈도 / 최고 빈도로 부분 점수를 준다. (임시 규칙) */
export function scoreQuestion(question: Question, choiceId: string | undefined): number {
  if (!choiceId) return 0;
  if (question.kind === "term") return question.answer === choiceId ? 1 : 0;
  const best = Math.max(...Object.values(question.strategy));
  return best > 0 ? (question.strategy[choiceId] ?? 0) / best : 0;
}

export function correctChoiceOf(question: Question): string {
  if (question.kind === "term") return question.answer;
  return Object.entries(question.strategy).sort((a, b) => b[1] - a[1])[0][0];
}

export type QuestionResult = { questionId: string; choiceId: string | null; points: number };

export function gradeExam(exam: Exam, answers: Record<string, string>) {
  const results: QuestionResult[] = exam.questions.map((q) => ({
    questionId: q.id,
    choiceId: answers[q.id] ?? null,
    points: scoreQuestion(q, answers[q.id]),
  }));
  const total = results.reduce((sum, r) => sum + r.points, 0);
  const score = Math.round((total / exam.questions.length) * 100);
  return { score, grade: gradeFor(score), results };
}

export function toPublicExam(exam: Exam, includeDevAnswers: boolean): PublicExam {
  return {
    id: exam.id,
    title: exam.title,
    domain: exam.domain,
    skill: exam.skill,
    description: exam.description,
    difficulty: exam.difficulty,
    scope: exam.scope,
    certification: exam.certification,
    studyResources: exam.studyResources,
    questions: exam.questions.map((q) => ({
      id: q.id,
      kind: q.kind,
      category: q.category,
      prompt: q.prompt,
      choices: q.choices,
      ...(q.kind === "spot" ? { spot: q.spot } : {}),
      // 개발자 모드가 아니면 키 자체를 넣지 않는다.
      ...(includeDevAnswers ? { devCorrect: correctChoiceOf(q) } : {}),
    })),
  };
}
