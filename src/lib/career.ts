import "server-only";
import { getExamSource } from "@/lib/exams/registry";
import { PASS_SCORE, type Grade } from "@/lib/exams/grading";
import { getTrophy } from "@/content/trophies";
import { nextStage, stageFor } from "@/content/growth";
import { bestScores } from "@/lib/repo/attempts";
import { listCollectibles, rarityPercent, type Collectible } from "@/lib/repo/collection";
import { collectibleImage, type ImageRef } from "@/lib/images";

export type CollectibleView = Collectible & {
  name: string;
  subtitle: string;
  /** 획득 난이도 ★ */
  difficulty: number;
  /** 보유율 % (희귀도) */
  rarity: number;
  image: ImageRef;
};

export async function describeCollectibles(items: Collectible[]): Promise<CollectibleView[]> {
  const exams = await getExamSource().listExams();
  return items.map((item) => {
    if (item.kind === "certification") {
      const exam = exams.find((e) => e.id === item.key);
      return {
        ...item,
        name: exam ? `${exam.skill} Certification` : item.key,
        subtitle: exam ? `${exam.title} — ${item.grade}` : `${item.grade}`,
        difficulty: exam?.difficulty ?? 1,
        rarity: rarityPercent(item.kind, item.key),
        image: collectibleImage(item.kind, item.key),
      };
    }
    const trophy = getTrophy(item.key);
    return {
      ...item,
      name: trophy?.name ?? item.key,
      subtitle: trophy?.description ?? "",
      difficulty: trophy?.difficulty ?? 1,
      rarity: rarityPercent(item.kind, item.key),
      image: collectibleImage(item.kind, item.key),
    };
  });
}

export type SkillGrade = { domain: string; skill: string; grade: Grade | null };

/** 영역별 실력: 시험의 skill 단위로 최고 인증 등급을 모은다. */
export async function skillGrades(userId: number): Promise<SkillGrade[]> {
  const exams = await getExamSource().listExams();
  const certs = listCollectibles(userId).filter((c) => c.kind === "certification");
  return exams.map((exam) => ({
    domain: exam.domain,
    skill: exam.skill,
    grade: certs.find((c) => c.key === exam.id)?.grade ?? null,
  }));
}

export type Pursuit = {
  examId: string;
  title: string;
  goal: string;
  current: number;
  target: number;
  reward: string;
};

/**
 * Current Pursuit: 지금 가장 가까운 다음 증명 하나.
 * 아직 인증이 없는 시험 → 합격, 모두 인증했다면 S 가 아닌 시험 → S 달성.
 */
export async function currentPursuit(userId: number): Promise<Pursuit | null> {
  const exams = await getExamSource().listExams();
  const best = bestScores(userId);
  const certs = listCollectibles(userId).filter((c) => c.kind === "certification");

  const uncertified = exams.find((e) => !certs.some((c) => c.key === e.id));
  if (uncertified) {
    return {
      examId: uncertified.id,
      title: uncertified.title,
      goal: `${uncertified.skill} 인증 획득`,
      current: best[uncertified.id] ?? 0,
      target: PASS_SCORE,
      reward: `${uncertified.skill} Certification`,
    };
  }

  const notS = exams.find((e) => certs.find((c) => c.key === e.id)?.grade !== "S");
  if (notS) {
    return {
      examId: notS.id,
      title: notS.title,
      goal: `${notS.skill} S등급 달성`,
      current: best[notS.id] ?? 0,
      target: 95,
      reward: `${notS.skill} — S`,
    };
  }
  return null;
}

export function careerStage(userId: number) {
  const certCount = listCollectibles(userId).filter((c) => c.kind === "certification").length;
  const stage = stageFor(certCount);
  return { stage, next: nextStage(stage), certCount };
}
