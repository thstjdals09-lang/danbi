/**
 * Poker Persona Test 정의.
 * 4개의 이진 성향축 × 2 = 16 Starting Persona.
 *
 * ⚠️ 질문 문구, 페르소나 이름, 설명은 모두 초안(placeholder)이다. 기획 확정 시 이 파일만 수정하면 된다.
 * 페르소나 id 는 이미지 파일명에도 쓰이므로 확정 후에는 바꾸지 않는다.
 */

export type AxisKey = "game" | "play" | "mind" | "table";

export type Axis = {
  key: AxisKey;
  question: string;
  options: [PersonaOption, PersonaOption];
};

export type PersonaOption = {
  value: string;
  label: string;
  /** 사용자에게 보여줄 선택지 문장 */
  prompt: string;
};

export const PERSONA_AXES: Axis[] = [
  {
    key: "game",
    question: "어떤 포커가 더 끌려?",
    options: [
      { value: "cash", label: "Cash", prompt: "한 판 한 판 깊게 플레이하는 게 좋아" },
      { value: "tournament", label: "Tournament", prompt: "끝까지 살아남는 대회가 좋아" },
    ],
  },
  {
    key: "play",
    question: "테이블에서 나는…",
    options: [
      { value: "solid", label: "Solid", prompt: "확실한 기회를 기다리는 편" },
      { value: "aggressive", label: "Aggressive", prompt: "기회가 보이면 먼저 압박하는 편" },
    ],
  },
  {
    key: "mind",
    question: "어려운 결정 앞에서는?",
    options: [
      { value: "study", label: "Study", prompt: "미리 공부하고 계산해 둔 대로 간다" },
      { value: "instinct", label: "Instinct", prompt: "그 순간의 감각을 믿는다" },
    ],
  },
  {
    key: "table",
    question: "테이블 위의 내 모습은?",
    options: [
      { value: "calm", label: "Calm", prompt: "표정 하나 안 바뀌는 포커페이스" },
      { value: "expressive", label: "Expressive", prompt: "분위기를 즐기고 존재감을 드러낸다" },
    ],
  },
];

export type PersonaAnswers = Record<AxisKey, string>;

export type Persona = {
  /** 예: "tournament-aggressive-instinct-calm" (이미지 파일명과 동일) */
  id: string;
  answers: PersonaAnswers;
  title: string;
  description: string;
};

const ROLE: Record<string, Record<string, string>> = {
  solid: { study: "STRATEGIST", instinct: "READER" },
  aggressive: { study: "ARCHITECT", instinct: "HUNTER" },
};

const TABLE_EPITHET: Record<string, string> = { calm: "SILENT", expressive: "BOLD" };

const SENTENCES: Record<AxisKey, Record<string, string>> = {
  game: { cash: "한 판 한 판의 깊이를 즐기고", tournament: "큰 승부에서 끝까지 살아남는 것을 즐기고" },
  play: { solid: "확실한 순간을 기다렸다가", aggressive: "기회가 보이면 먼저 움직이며" },
  mind: { study: "준비한 전략으로 결정을 내리는", instinct: "테이블의 흐름을 읽어 결정을 내리는" },
  table: { calm: "조용하지만 위협적인 플레이어.", expressive: "존재감이 테이블을 채우는 플레이어." },
};

export function personaIdOf(answers: PersonaAnswers): string {
  return [answers.game, answers.play, answers.mind, answers.table].join("-");
}

function buildPersona(answers: PersonaAnswers): Persona {
  const game = answers.game === "cash" ? "CASH" : "TOURNAMENT";
  return {
    id: personaIdOf(answers),
    answers,
    title: `THE ${TABLE_EPITHET[answers.table]} ${game} ${ROLE[answers.play][answers.mind]}`,
    description: (["game", "play", "mind", "table"] as AxisKey[]).map((k) => SENTENCES[k][answers[k]]).join(" "),
  };
}

export const PERSONAS: Persona[] = (() => {
  const [game, play, mind, table] = PERSONA_AXES.map((a) => a.options.map((o) => o.value));
  const list: Persona[] = [];
  for (const g of game) for (const p of play) for (const m of mind) for (const t of table) {
    list.push(buildPersona({ game: g, play: p, mind: m, table: t }));
  }
  return list;
})();

export function getPersona(id: string | null | undefined): Persona | null {
  return PERSONAS.find((p) => p.id === id) ?? null;
}

export function isValidAnswers(input: Partial<Record<string, string>>): input is PersonaAnswers {
  return PERSONA_AXES.every((axis) => axis.options.some((o) => o.value === input[axis.key]));
}
