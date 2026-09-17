import type { Grade } from "@/lib/exams/grading";

export function GradeBadge({ grade, size = 32 }: { grade: Grade | null; size?: number }) {
  if (!grade) return <span className="muted">—</span>;
  return (
    <span className={`grade grade-${grade}`} style={{ fontSize: size }}>
      {grade}
    </span>
  );
}
