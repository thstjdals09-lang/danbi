"use server";

import { redirect } from "next/navigation";
import { requireOnboardedUser } from "@/lib/auth/session";
import { getExamSource } from "@/lib/exams/registry";
import { gradeExam } from "@/lib/exams/grading";
import { insertAttempt } from "@/lib/repo/attempts";
import { applyExamResult } from "@/lib/progress";

/** 시험 종료 시 한 번에 제출한다. 채점은 항상 서버에서 한다. */
export async function submitExamAction(examId: string, answers: Record<string, string>): Promise<void> {
  const user = await requireOnboardedUser();
  const exam = await getExamSource().getExam(examId);
  if (!exam) redirect("/exams");

  const validIds = new Set(exam.questions.map((q) => q.id));
  const cleaned = Object.fromEntries(
    Object.entries(answers).filter(([qid, cid]) => validIds.has(qid) && typeof cid === "string"),
  );

  const { score, grade, results } = gradeExam(exam, cleaned);
  const rewards = applyExamResult(user.id, exam.id, score, grade);
  const attemptId = insertAttempt(user.id, exam.id, score, grade, results, rewards);

  redirect(`/exams/result/${attemptId}`);
}
