import type { Grade } from "@/lib/exams/grading";
import type { AssetRef } from "@/lib/assets";

type Props = {
  grade: Grade | null | undefined;
  code: string;
  size?: "sm" | "md" | "lg";
  image?: AssetRef;
};

/**
 * 인증을 UI 배지가 아니라 수집 가능한 오브젝트(에나멜/금속 메달)로 표현한다.
 * 실제 에셋(/assets/certifications/{examId}.webp)이 있으면 그 이미지를 쓴다.
 * 재질: S 샴페인 포일 · A 코발트 에나멜 · B 버건디 에나멜 · C 퓨터 · 미획득은 엠보싱 종이.
 */
export function Medal({ grade, code, size = "md", image }: Props) {
  const tone = grade && grade !== "F" ? grade : "locked";
  return (
    <div className={`medal medal--${size} medal--${tone}`} aria-label={`${code} ${grade ?? "locked"}`}>
      <div className="medal__face">
        <span className="medal__grade">{grade && grade !== "F" ? grade : "—"}</span>
        <span className="medal__code">{code}</span>
      </div>
      {image?.src && grade && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image.src} alt="" aria-hidden />
      )}
    </div>
  );
}

export function GradeGlyph({ grade, size = 48 }: { grade: Grade | null | undefined; size?: number }) {
  return (
    <span className="grade-glyph" style={{ fontSize: size, color: grade ? "var(--ink)" : "var(--faint)" }}>
      {grade ?? "—"}
    </span>
  );
}

export function Stars({ value }: { value: number }) {
  return (
    <span aria-label={`difficulty ${value} of 5`} style={{ letterSpacing: "0.12em" }}>
      {"★".repeat(value)}
      <span style={{ color: "var(--line-2)" }}>{"★".repeat(5 - value)}</span>
    </span>
  );
}
