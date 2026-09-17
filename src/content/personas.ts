/**
 * Poker Persona 정의.
 *
 * 4개 이진 성향축 → 16 Starting Persona.
 * 그중 play × mind 두 축이 캐릭터 계열(Family, 에셋 단위)을 결정한다.
 *   solid + study      → THE ARCHITECT
 *   aggressive + instinct → THE SHARK
 *   aggressive + study → THE STRATEGIST
 *   solid + instinct   → THE HUNTER
 * 나머지 game × table 두 축은 같은 계열 안의 변형(variant)과 키워드를 만든다.
 *
 * ⚠️ 문구는 초안이다. persona id / family id 는 DB 와 에셋 경로에 쓰이므로 바꾸지 않는다.
 */

export type AxisKey = "game" | "play" | "mind" | "table";
export type FamilyId = "architect" | "shark" | "strategist" | "hunter";

export type PersonaOption = {
  value: string;
  letter: "A" | "B";
  title: string;
  line: string;
};

export type Axis = {
  key: AxisKey;
  question: string;
  options: [PersonaOption, PersonaOption];
};

/** 질문 순서. 앞의 두 질문(mind, play)으로 계열이 정해져 배경 캐릭터가 드러나기 시작한다. */
export const PERSONA_AXES: Axis[] = [
  {
    key: "mind",
    question: "어떤 상황에서\n가장 편안함을 느끼나요?",
    options: [
      { value: "study", letter: "A", title: "계획한 대로 흘러갈 때", line: "데이터와 구조가 있는 플레이가 좋다." },
      { value: "instinct", letter: "B", title: "예측할 수 없는 상황", line: "압박 속에서 더 강해진다." },
    ],
  },
  {
    key: "play",
    question: "좋은 기회가 보인다.\n당신은?",
    options: [
      { value: "solid", letter: "A", title: "확신이 설 때까지 기다린다", line: "싸움은 고르는 것이다." },
      { value: "aggressive", letter: "B", title: "먼저 압박한다", line: "주도권은 가져오는 것이다." },
    ],
  },
  {
    key: "game",
    question: "어떤 무대에\n더 끌리나요?",
    options: [
      { value: "cash", letter: "A", title: "한 판 한 판이 깊은 테이블", line: "매 핸드가 독립된 승부. 캐시 게임." },
      { value: "tournament", letter: "B", title: "끝까지 살아남는 무대", line: "마지막 테이블을 향해. 토너먼트." },
    ],
  },
  {
    key: "table",
    question: "테이블 위의\n당신은?",
    options: [
      { value: "calm", letter: "A", title: "아무도 읽을 수 없는 사람", line: "표정도, 타이밍도 일정하다." },
      { value: "expressive", letter: "B", title: "공기를 바꾸는 사람", line: "존재감으로 상대를 흔든다." },
    ],
  },
];

export type PersonaFamily = {
  id: FamilyId;
  name: string;
  /** 제한적으로만 쓰는 계열 색. UI 전체 테마로 쓰지 않는다. */
  accent: string;
  accentName: string;
  keywords: [string, string, string];
  line: string;
  description: string;
};

export const FAMILIES: Record<FamilyId, PersonaFamily> = {
  architect: {
    id: "architect",
    name: "THE ARCHITECT",
    accent: "#2E4B8F",
    accentName: "Cobalt",
    keywords: ["ORDER", "STRUCTURE", "CALM"],
    line: "STRUCTURE WINS THE LONG GAME.",
    description: "흔들리지 않는 구조 위에서, 한 핸드씩 우위를 쌓아 올리는 플레이어.",
  },
  shark: {
    id: "shark",
    name: "THE SHARK",
    accent: "#7B1E2C",
    accentName: "Burgundy",
    keywords: ["RISK", "FLEXIBILITY", "OPPORTUNITY"],
    line: "RISK FINDS OPPORTUNITY.",
    description: "리스크를 두려워하지 않는, 기회를 포착하는 플레이어.",
  },
  strategist: {
    id: "strategist",
    name: "THE STRATEGIST",
    accent: "#5F6A3B",
    accentName: "Moss",
    keywords: ["PREPARATION", "LAYER", "CONTROL"],
    line: "EVERY LINE HAS A LAYER.",
    description: "준비된 압박으로 테이블 전체의 흐름을 설계하는 플레이어.",
  },
  hunter: {
    id: "hunter",
    name: "THE HUNTER",
    accent: "#B5A611",
    accentName: "Acid Yellow",
    keywords: ["PURSUIT", "IMPACT", "DIRECTION"],
    line: "WAIT. READ. STRIKE.",
    description: "조용히 기다리다, 결정적인 순간에 흐름을 바꾸는 플레이어.",
  },
};

export const FAMILY_ORDER: FamilyId[] = ["architect", "shark", "strategist", "hunter"];

export type PersonaAnswers = Record<AxisKey, string>;

export type Persona = {
  /** `{game}-{play}-{mind}-{table}` 예: "tournament-aggressive-instinct-expressive" */
  id: string;
  answers: PersonaAnswers;
  family: PersonaFamily;
  /** 계열 이름. 예: THE SHARK */
  title: string;
  /** 같은 계열 안의 변형. 예: TOURNAMENT · EXPRESSIVE */
  variant: string;
  /** 4개 축에서 나온 플레이 스타일 키워드 */
  keywords: string[];
};

const AXIS_KEYWORDS: Record<AxisKey, Record<string, string>> = {
  play: { solid: "PATIENT", aggressive: "BOLD" },
  mind: { study: "PREPARED", instinct: "FLEXIBLE" },
  game: { cash: "DEEP STACK", tournament: "SURVIVOR" },
  table: { calm: "UNREADABLE", expressive: "GAME CHANGER" },
};

export function familyOf(play: string, mind: string): FamilyId {
  if (play === "solid") return mind === "study" ? "architect" : "hunter";
  return mind === "study" ? "strategist" : "shark";
}

export function personaIdOf(answers: PersonaAnswers): string {
  return [answers.game, answers.play, answers.mind, answers.table].join("-");
}

function buildPersona(answers: PersonaAnswers): Persona {
  const family = FAMILIES[familyOf(answers.play, answers.mind)];
  return {
    id: personaIdOf(answers),
    answers,
    family,
    title: family.name,
    variant: `${answers.game.toUpperCase()} · ${answers.table.toUpperCase()}`,
    keywords: (["play", "mind", "game", "table"] as AxisKey[]).map((k) => AXIS_KEYWORDS[k][answers[k]]),
  };
}

export const PERSONAS: Persona[] = (() => {
  const values = (key: AxisKey) => PERSONA_AXES.find((a) => a.key === key)!.options.map((o) => o.value);
  const list: Persona[] = [];
  for (const game of values("game"))
    for (const play of values("play"))
      for (const mind of values("mind"))
        for (const table of values("table")) list.push(buildPersona({ game, play, mind, table }));
  return list;
})();

export function getPersona(id: string | null | undefined): Persona | null {
  return PERSONAS.find((p) => p.id === id) ?? null;
}

export function isValidAnswers(input: Partial<Record<string, string>>): input is PersonaAnswers {
  return PERSONA_AXES.every((axis) => axis.options.some((o) => o.value === input[axis.key]));
}
