# POKER PLAYER GROW

**PLAY. PROVE. BECOME.**

실제 포커 실력을 시험으로 증명하며 나만의 포커 플레이어 캐릭터와 커리어를 성장시키고, 그 결과를 수집·전시·공유하는 소셜 육성 웹게임.

Core loop: **PERSONA → EXAM → PROOF → GROWTH → SHOWCASE**

## 핵심 흐름

Landing → Persona Test(가입 전 가능) → Persona Reveal → 이름·공개 ID(+계정 생성) → My Player → Exam → Result
(Grade → Certification → Gear → Character Evolution) → Add to Showcase → Public Profile `/{handle}`

| 경로 | 화면 |
| --- | --- |
| `/` | 비로그인: Landing / 로그인: My Player |
| `/onboarding/persona` · `/result` · `/handle` | Persona Test · Reveal · 이름 설정 |
| `/exams` · `/exams/{id}` · `/exams/result/{attemptId}` | 시험 목록 · 응시 · 결과/진화 연출 |
| `/collection?tab=` | Avatars · Certifications · Gear · Trophies · Background |
| `/me/showcase` · `/me/stats` | My Room(쇼케이스 편집) · 증명 기록 |
| `/community` · `/{handle}` | 플레이어 목록 · 공개 프로필(Player Passport) |

## 실행

Node.js 22.13 이상이 필요합니다. DB는 Node 내장 SQLite(`node:sqlite`)를 사용합니다.

```bash
npm install
cp .env.example .env.local   # 개발자 모드 켜짐
npm run dev                  # http://localhost:3000
```

DB 파일은 `data/danbi.db`에 자동 생성됩니다. 커밋되지 않습니다.

## 환경변수

| 변수 | 기본값 | 설명 |
| --- | --- | --- |
| `DANBI_DEV_MODE` | 꺼짐 | 정확히 `true`일 때만 개발자 모드 버튼이 나타납니다 |
| `DANBI_DEV_PASSWORD` | 없음 | 개발자 모드 잠금 해제 비밀번호. `.env.local`에만 두고 커밋하지 않습니다 |
| `DANBI_DB_PATH` | `./data/danbi.db` | SQLite 파일 경로 |
| `DANBI_EXAM_SOURCE` | `local` | 사용할 문제 소스 id |

## 개발자 모드

`DANBI_DEV_MODE=true`이면 화면 오른쪽 아래에 **개발자 모드** 버튼이 나타납니다.
버튼을 누르고 `DANBI_DEV_PASSWORD`를 입력하면 그 브라우저에서 7일간 개발자 기능이 열립니다.
비밀번호 대입을 막기 위해 IP별 5회, 전체 30회 실패 시 10분간 잠깁니다.

잠금 해제 후 사용할 수 있는 기능:

- 화면 하단 개발자 바 + `/dev` 개발자 패널 (잠그기 버튼)
- 테스트 계정 생성, 다른 계정으로 로그인
- 온보딩 건너뛰기/초기화, 진행 기록 초기화
- Origin Persona 교체(계열별 화면 확인용), Current Identity 지정
- 시험을 보지 않고 등급별 결과 지급 (기어·정체성·성장 반영까지 확인)
- 시험 중 정답 표시, 정답 자동 채우기, 즉시 제출
- 이미지가 없는 슬롯에 필요한 파일 경로 표시

**출시할 때는 `DANBI_DEV_MODE`를 지우거나 `false`로 두면 됩니다.** 버튼이 사라지고 모든 개발자 페이지와 서버 액션이 404가 됩니다. 모든 개발자 페이지와 액션은 `assertDevAccess()`로 보호되며, 잠금 해제하지 않은 브라우저에는 시험 정답 데이터가 전송되지 않습니다.

## 문제 소스 교체

앱은 `src/lib/exams/types.ts`의 `ExamSource` 인터페이스만 사용합니다.

1. `src/lib/exams/sources/`에 `ExamSource` 구현을 추가합니다.
2. `src/lib/exams/registry.ts`에 등록합니다.
3. `DANBI_EXAM_SOURCE`로 선택합니다.

현재 `local` 소스의 샘플 시험:

- `basic-terms` — 기초 용어 (첫 시험)
- `preflop-40bb` — MTT · 8-Max · 40BB · ChipEV · Preflop 스팟. **전략 빈도는 화면/채점 검증용 근사값이며 솔버로 검증되지 않았습니다.**

스팟 문제는 선택한 액션의 전략 빈도 / 최고 빈도로 부분 점수를 줍니다.

## 캐릭터 · 에셋

캐릭터는 CSS/SVG로 그리지 않습니다. `public/assets`에 외부 제작 에셋을 넣으면 슬롯이 채워집니다.
경로 규칙: [public/assets/README.md](public/assets/README.md)

```bash
npm run assets:check            # 제출 현황 + 파일명·해상도·비율·투명 채널 검사
npm run assets:check -- --todo  # 아직 없는 파일 목록
npm run assets:init             # 폴더 구조 다시 만들기
```

실행 중인 프로덕션 서버에도 새로 넣은 이미지가 바로 보입니다(`/assets/[...path]` 라우트가 빌드 이후 추가된 파일을 서빙).

캐릭터는 단일 PNG가 아니라 `AvatarState`로 조립됩니다.

```
AvatarState { originPersona, currentIdentity, careerStage, equippedGear[], unlockedGear[], cosmetics[] }
배경 기어 → persona full → 기어 overlay 레이어 → 장착 기어 callout
```

- Origin Persona는 이름 설정 시 확정되고 바뀌지 않습니다. Current Identity는 인증 등급 조건으로 발전합니다.
- Level = 1 + 인증 등급 포인트 합(C1 · B2 · A3 · S4). 의미 없는 EXP는 없습니다.
- Rarity(디자인 등급 + 실제 보유율)와 Difficulty(★)는 별도 데이터입니다.
- Earned(시험으로 획득)와 Cosmetic(`cosmetics[]`, 현재 비어 있음)은 분리됩니다.

## ROOM 0 (별도 게임)

같은 저장소 안에서 돌아가는 두 번째 게임. 모바일 웹 미스터리 퍼즐 「ROOM 0 — NULL HOTEL」.
포커 제품과 코드·상태·스타일이 분리되어 있으며 서버나 DB를 쓰지 않는다.
진입은 `/room0`, 문서는 [docs/ROOM0.md](docs/ROOM0.md).

## 구조

```
src/
  app/
    page.tsx           Landing / My Player
    (auth)/            로그인 · 가입
    onboarding/        Persona Test → Reveal → 이름·공개 ID
    exams/             시험 목록 · 결정 인터페이스 · 결과/진화 연출
    collection/        컬렉션 탭 · 장착/쇼케이스 액션
    community/         플레이어 목록
    me/                My Room(쇼케이스) · Stats
    [handle]/          공개 프로필 (Player Passport)
    dev/               개발자 패널 (개발자 모드 전용)
  components/          PlayerFigure · AssetSlot · Medal · PokerTable · ShareActions …
  content/             Persona 계열 · 기어 · 정체성 · 성장 단계 · 트로피 · 시험 데이터 (초안 문구)
  lib/
    domain.ts          화면이 쓰는 도메인 타입 (AvatarState, CollectionItem, Certification, Pursuit, PublicProfile …)
    player.ts          DB + 콘텐츠 → 도메인 객체 조립 (저장소 교체 시 이 파일만 수정)
    progress.ts        시험 결과 → 인증 · 트로피 · 기어 · 정체성 · 레벨 · 성장 반영
    assets.ts          에셋 슬롯 경로
    auth/ exams/ repo/ 인증 · 시험(타입/채점/소스) · DB 접근
```
