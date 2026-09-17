import type { Exam, SpotAction, SpotQuestion, SpotSeat } from "@/lib/exams/types";

/**
 * 40BB 프리플랍 스팟 시험 (MTT · 8-Max · BB ante · ChipEV).
 *
 * ⚠️ 샘플 데이터다. 전략 빈도는 화면/채점 흐름 검증용 근사값이며 솔버로 검증되지 않았다.
 * 실제 문제 소스가 정해지면 ExamSource 를 교체한다.
 */

const POSITIONS = ["UTG", "UTG1", "LJ", "HJ", "CO", "BTN", "SB", "BB"] as const;
type Position = (typeof POSITIONS)[number];

const STACK = 40;
const ANTE = 1; // BB ante

type SpotInput = {
  hero: Position;
  cards: [string, string];
  hand: string;
  actions?: SpotAction[];
  situation: string;
};

/** 액션 목록으로 좌석 상태, 투자 칩, 팟을 계산한다. */
function buildSpot({ hero, cards, hand, actions = [], situation }: SpotInput): SpotQuestion["spot"] {
  const invested: Record<string, number> = { SB: 0.5, BB: 1 };
  for (const a of actions) if (a.toBb !== undefined) invested[a.position] = a.toBb;

  const actors = new Set(actions.map((a) => a.position));
  const heroActed = actors.has(hero);
  const heroIndex = POSITIONS.indexOf(hero);

  const seats: SpotSeat[] = POSITIONS.map((position, index) => {
    const bet = invested[position] ?? 0;
    let status: SpotSeat["status"];
    if (position === hero) status = "hero";
    else if (actions.some((a) => a.position === position && a.action !== "Fold")) status = "active";
    else if (heroActed || index < heroIndex) status = "folded";
    else status = "waiting";
    const ante = position === "BB" ? ANTE : 0;
    return { position, stackBb: Math.round((STACK - bet - ante) * 10) / 10, investedBb: bet, status };
  });

  const potBb = Math.round((Object.values(invested).reduce((s, v) => s + v, 0) + ANTE) * 10) / 10;
  const lastRaise = [...actions].reverse().find((a) => a.action !== "Call" && a.action !== "Fold");

  return {
    game: "MTT",
    table: "8-Max",
    stackBb: STACK,
    model: "ChipEV",
    street: "Preflop",
    anteBb: ANTE,
    heroPosition: hero,
    situation,
    hand,
    heroCards: cards,
    villainSizing: lastRaise?.toBb !== undefined ? `${lastRaise.toBb}BB` : undefined,
    seats,
    actions,
    potBb,
  };
}

export const preflop40bbExam: Exam = {
  id: "preflop-40bb",
  title: "40BB Preflop",
  domain: "Preflop",
  skill: "40BB Preflop",
  description: "8-Max MTT, 40BB 유효 스택의 프리플랍 결정. 오픈, 블라인드 디펜스, 3Bet 대응까지.",
  difficulty: 3,
  scope: ["MTT", "8-Max", "40BB", "ChipEV", "Preflop"],
  certification: { name: "8-Max Preflop Specialist", code: "40BB PREFLOP" },
  studyResources: [{ title: "GTO Wizard", url: "https://gtowizard.com" }],
  questions: [
    {
      id: "pf-01",
      kind: "spot",
      category: "RFI",
      difficulty: 2,
      prompt: "프리플랍에서 가장 먼저 행동합니다. 당신의 선택은?",
      spot: buildSpot({ hero: "UTG", cards: ["Kh", "Td"], hand: "KTo", situation: "UTG RFI" }),
      choices: [
        { id: "a", text: "FOLD" },
        { id: "b", text: "RAISE 2.1BB" },
        { id: "c", text: "ALL-IN 40BB" },
      ],
      strategy: { a: 1 },
      explanation: "UTG 오픈 레인지는 좁습니다. KTo는 뒤에 7명이 남은 자리에서 수익을 내기 어려운 핸드입니다.",
    },
    {
      id: "pf-02",
      kind: "spot",
      category: "RFI",
      difficulty: 2,
      prompt: "CO까지 모두 폴드했습니다. 당신의 선택은?",
      spot: buildSpot({ hero: "CO", cards: ["Ad", "9c"], hand: "A9o", situation: "CO RFI" }),
      choices: [
        { id: "a", text: "FOLD" },
        { id: "b", text: "RAISE 2.1BB" },
        { id: "c", text: "ALL-IN 40BB" },
      ],
      strategy: { b: 0.95, a: 0.05 },
      explanation: "뒤에 남은 플레이어가 적은 CO에서는 A9o가 오픈 레인지에 들어갑니다.",
    },
    {
      id: "pf-03",
      kind: "spot",
      category: "RFI",
      difficulty: 1,
      prompt: "BTN까지 모두 폴드했습니다. 당신의 선택은?",
      spot: buildSpot({ hero: "BTN", cards: ["7h", "6h"], hand: "76s", situation: "BTN RFI" }),
      choices: [
        { id: "a", text: "FOLD" },
        { id: "b", text: "RAISE 2BB" },
        { id: "c", text: "ALL-IN 40BB" },
      ],
      strategy: { b: 1 },
      explanation: "BTN은 넓게 오픈합니다. 포지션과 플레이어빌리티를 가진 76s는 명확한 오픈입니다.",
    },
    {
      id: "pf-04",
      kind: "spot",
      category: "Blind Defense",
      difficulty: 2,
      prompt: "BTN이 2BB로 오픈했습니다. BB에서 당신의 선택은?",
      spot: buildSpot({
        hero: "BB",
        cards: ["Jc", "8c"],
        hand: "J8s",
        situation: "BB vs BTN RFI",
        actions: [
          { position: "BTN", action: "Raise", toBb: 2 },
          { position: "SB", action: "Fold" },
        ],
      }),
      choices: [
        { id: "a", text: "FOLD" },
        { id: "b", text: "CALL 1BB" },
        { id: "c", text: "3BET 9BB" },
        { id: "d", text: "ALL-IN 40BB" },
      ],
      strategy: { b: 0.8, c: 0.2 },
      explanation: "앤티가 있는 팟에서 BB는 좋은 가격을 받습니다. J8s는 대부분 콜로 디펜스하고 일부 3Bet을 섞습니다.",
    },
    {
      id: "pf-05",
      kind: "spot",
      category: "vs RFI",
      difficulty: 3,
      prompt: "HJ가 2.1BB로 오픈했습니다. BTN에서 당신의 선택은?",
      spot: buildSpot({
        hero: "BTN",
        cards: ["Ah", "Qd"],
        hand: "AQo",
        situation: "BTN vs HJ RFI",
        actions: [
          { position: "HJ", action: "Raise", toBb: 2.1 },
          { position: "CO", action: "Fold" },
        ],
      }),
      choices: [
        { id: "a", text: "FOLD" },
        { id: "b", text: "CALL 2.1BB" },
        { id: "c", text: "3BET 6.5BB" },
        { id: "d", text: "ALL-IN 40BB" },
      ],
      strategy: { c: 0.65, b: 0.35 },
      explanation: "AQo는 HJ 오픈 레인지 상대로 강합니다. 주로 3Bet으로 밸류를 얻고, 포지션을 활용한 콜을 섞습니다.",
    },
    {
      id: "pf-06",
      kind: "spot",
      category: "vs RFI",
      difficulty: 3,
      prompt: "UTG가 2.1BB로 오픈했습니다. CO에서 당신의 선택은?",
      spot: buildSpot({
        hero: "CO",
        cards: ["Ks", "Jd"],
        hand: "KJo",
        situation: "CO vs UTG RFI",
        actions: [
          { position: "UTG", action: "Raise", toBb: 2.1 },
          { position: "UTG1", action: "Fold" },
          { position: "LJ", action: "Fold" },
          { position: "HJ", action: "Fold" },
        ],
      }),
      choices: [
        { id: "a", text: "FOLD" },
        { id: "b", text: "CALL 2.1BB" },
        { id: "c", text: "3BET 6.5BB" },
        { id: "d", text: "ALL-IN 40BB" },
      ],
      strategy: { a: 0.9, b: 0.1 },
      explanation: "UTG의 강한 레인지 상대로 KJo는 도미네이트당하기 쉽습니다. 대부분 폴드합니다.",
    },
    {
      id: "pf-07",
      kind: "spot",
      category: "vs 3Bet",
      difficulty: 4,
      prompt: "HJ에서 2.1BB로 오픈했고, CO가 6BB로 3Bet했습니다. 당신의 선택은?",
      spot: buildSpot({
        hero: "HJ",
        cards: ["As", "Ks"],
        hand: "AKs",
        situation: "HJ vs CO 3Bet",
        actions: [
          { position: "UTG", action: "Fold" },
          { position: "UTG1", action: "Fold" },
          { position: "LJ", action: "Fold" },
          { position: "HJ", action: "Raise", toBb: 2.1 },
          { position: "CO", action: "3Bet", toBb: 6 },
          { position: "BTN", action: "Fold" },
          { position: "SB", action: "Fold" },
          { position: "BB", action: "Fold" },
        ],
      }),
      choices: [
        { id: "a", text: "FOLD" },
        { id: "b", text: "CALL 6BB" },
        { id: "c", text: "4BET 14BB" },
        { id: "d", text: "ALL-IN 40BB" },
      ],
      strategy: { d: 0.55, c: 0.3, b: 0.15 },
      explanation: "40BB에서 AKs는 3Bet에 대해 주로 올인 또는 작은 4Bet으로 대응합니다. 폴드는 선택지가 아닙니다.",
    },
    {
      id: "pf-08",
      kind: "spot",
      category: "Blind Defense",
      difficulty: 3,
      prompt: "BTN이 2BB로 오픈했습니다. SB에서 당신의 선택은?",
      spot: buildSpot({
        hero: "SB",
        cards: ["Ad", "3d"],
        hand: "A3s",
        situation: "SB vs BTN RFI",
        actions: [{ position: "BTN", action: "Raise", toBb: 2 }],
      }),
      choices: [
        { id: "a", text: "FOLD" },
        { id: "b", text: "CALL 1.5BB" },
        { id: "c", text: "3BET 8BB" },
        { id: "d", text: "ALL-IN 40BB" },
      ],
      strategy: { c: 0.7, a: 0.2, b: 0.1 },
      explanation: "SB는 뒤에 BB가 남아 있어 콜이 불리합니다. 블로커를 가진 A3s는 3Bet 후보입니다.",
    },
    {
      id: "pf-09",
      kind: "spot",
      category: "vs RFI",
      difficulty: 4,
      prompt: "CO가 2.1BB로 오픈했습니다. BTN에서 당신의 선택은?",
      spot: buildSpot({
        hero: "BTN",
        cards: ["5s", "5h"],
        hand: "55",
        situation: "BTN vs CO RFI",
        actions: [{ position: "CO", action: "Raise", toBb: 2.1 }],
      }),
      choices: [
        { id: "a", text: "FOLD" },
        { id: "b", text: "CALL 2.1BB" },
        { id: "c", text: "3BET 6.5BB" },
        { id: "d", text: "ALL-IN 40BB" },
      ],
      strategy: { b: 0.55, d: 0.3, a: 0.15 },
      explanation: "포지션을 가진 55는 셋 밸류를 노린 콜이 기본이며, 일부 리쉬브를 섞을 수 있습니다.",
    },
    {
      id: "pf-10",
      kind: "spot",
      category: "RFI",
      difficulty: 1,
      prompt: "첫 번째로 행동합니다. 당신의 선택은?",
      spot: buildSpot({ hero: "UTG", cards: ["Qh", "Qc"], hand: "QQ", situation: "UTG RFI" }),
      choices: [
        { id: "a", text: "FOLD" },
        { id: "b", text: "RAISE 2.1BB" },
        { id: "c", text: "ALL-IN 40BB" },
      ],
      strategy: { b: 1 },
      explanation: "QQ는 어느 자리에서든 오픈합니다. 40BB에서 올인 오픈은 약한 핸드만 콜받게 만듭니다.",
    },
  ],
};
