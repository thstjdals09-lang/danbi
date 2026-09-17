/**
 * 시험 데이터 구조.
 * 문제 소스(로컬 JSON, 솔버 결과, 외부 API 등)가 바뀌어도 앱은 이 타입만 사용한다.
 */

export type Choice = { id: string; text: string };

type QuestionBase = {
  id: string;
  /** 약점 분석 단위. 예: "Positions", "Actions", "Blind Defense" */
  category: string;
  /** 1(쉬움) ~ 5(어려움) */
  difficulty: 1 | 2 | 3 | 4 | 5;
  prompt: string;
  choices: Choice[];
  /** 시험 종료 후 결과 화면에서만 보여준다 */
  explanation?: string;
};

/** 용어/지식 문제: 정답 하나 */
export type TermQuestion = QuestionBase & {
  kind: "term";
  answer: string;
};

/** 실전 스팟 문제 (추후 사용). 혼합 전략을 빈도로 표현한다. */
export type SpotQuestion = QuestionBase & {
  kind: "spot";
  spot: {
    game: "MTT" | "Cash";
    table: string; // 예: "8-Max"
    stackBb: number;
    heroPosition: string; // 예: "BTN"
    situation: string; // 예: "vs CO RFI"
    hand: string; // 예: "A5s"
    villainSizing?: string; // 예: "2.2BB"
  };
  /** choice id → 전략 빈도(0~1). 합은 1. */
  strategy: Record<string, number>;
};

export type Question = TermQuestion | SpotQuestion;

export type Exam = {
  id: string;
  title: string;
  /** 큰 영역. 예: "Fundamentals", "Preflop" */
  domain: string;
  /** 세부 실력 항목. 프로필의 영역별 등급 단위. 예: "Terminology", "RFI" */
  skill: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  questions: Question[];
  studyResources?: { title: string; url: string }[];
};

export type ExamSummary = Omit<Exam, "questions"> & { questionCount: number };

/** 클라이언트로 보내는 문제: 정답/전략/해설 제거. 개발자 모드에서만 devCorrect 포함. */
export type PublicQuestion = Pick<Question, "id" | "kind" | "category" | "prompt" | "choices"> & {
  spot?: SpotQuestion["spot"];
  devCorrect?: string;
};

export type PublicExam = Omit<ExamSummary, "questionCount"> & { questions: PublicQuestion[] };

/** 문제 소스 인터페이스. 새 소스는 이것을 구현해 registry 에 등록한다. */
export interface ExamSource {
  readonly id: string;
  listExams(): Promise<ExamSummary[]>;
  getExam(examId: string): Promise<Exam | null>;
}
