import { notFound } from "next/navigation";
import { requireOnboardedUser } from "@/lib/auth/session";
import { isDevUnlocked } from "@/lib/dev";
import { getExamSource } from "@/lib/exams/registry";
import { toPublicExam } from "@/lib/exams/grading";
import { ExamRunner } from "./ExamRunner";

export default async function ExamPage({ params }: { params: Promise<{ examId: string }> }) {
  await requireOnboardedUser();
  const { examId } = await params;
  const exam = await getExamSource().getExam(examId);
  if (!exam) notFound();

  const devMode = await isDevUnlocked();
  return <ExamRunner exam={toPublicExam(exam, devMode)} devMode={devMode} />;
}
