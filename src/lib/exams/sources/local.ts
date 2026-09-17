import type { Exam, ExamSource, ExamSummary } from "../types";
import { basicTermsExam } from "@/content/exams/basic-terms";

/** 코드에 포함된 샘플 시험. 실제 문제 소스가 정해지면 교체한다. */
const EXAMS: Exam[] = [basicTermsExam];

export const localExamSource: ExamSource = {
  id: "local",

  async listExams(): Promise<ExamSummary[]> {
    return EXAMS.map(({ questions, ...rest }) => ({ ...rest, questionCount: questions.length }));
  },

  async getExam(examId: string): Promise<Exam | null> {
    return EXAMS.find((e) => e.id === examId) ?? null;
  },
};
