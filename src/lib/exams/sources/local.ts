import type { Exam, ExamSource, ExamSummary } from "../types";
import { basicTermsExam } from "@/content/exams/basic-terms";
import { preflop40bbExam } from "@/content/exams/preflop-40bb";

/** 코드에 포함된 샘플 시험. 실제 문제 소스가 정해지면 교체한다. 배열 순서 = 추천 응시 순서 */
const EXAMS: Exam[] = [basicTermsExam, preflop40bbExam];

export const localExamSource: ExamSource = {
  id: "local",

  async listExams(): Promise<ExamSummary[]> {
    return EXAMS.map(({ questions, ...rest }) => ({ ...rest, questionCount: questions.length }));
  },

  async getExam(examId: string): Promise<Exam | null> {
    return EXAMS.find((e) => e.id === examId) ?? null;
  },
};
