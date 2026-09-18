# ROOM 0 — NULL HOTEL

모바일 웹 미스터리 퍼즐 게임. 이 저장소 안에서 포커 제품과 **완전히 분리된 두 번째 게임**으로 돌아간다.

- 공개 테스트 링크: https://thstjdals09-lang.github.io/danbi/ (gh-pages 브랜치, 정적 빌드)
- 개발 중 진입: `/room0` (npm run dev)
- 서버·DB·로그인 사용 안 함. 전부 클라이언트 + LocalStorage.
- 기준 뷰포트 390×844. 360×740 ~ 430×932 대응.
- 기획서: `ROOM_0_개발_기획서_v0.1` (Source of Truth)

## 지금 플레이할 수 있는 것 — CASE 00: THE MISSING ROOM

```
BOOT → 5F MAP → 503/505 사이 벽 3회 조사 → 04:17
     → CCTV CAM 05-W → 04:17 프레임에만 존재하는 문 504
     → RECORD CONFLICT → HOLD: RECOVER FLOOR RECORD
     → 도면이 실제로 바뀐다 (5 UNITS → 6 UNITS, REV 03 → REV 04)
     → ROOM 504 DISCOVERY → 진입
     → 사진 뒤집기(OCT 17, 1987) · 벽의 시계 자국(02:13)
     → NOTEBOOK 에서 가설을 세운다 → HYPOTHESIS SUPPORTED → 남은 질문
```

퍼즐을 풀면 `CORRECT` 가 뜨는 대신 **세계가 바뀐다**: 층 기록이 덮어써지고, 도면에 방이 생기고,
도면 개정 번호와 유닛 수가 변하고, 사건 파일에 결론이 남는다.

## Notebook — Hypothesis Workspace

Notebook 은 증거를 짝맞추는 곳이 아니라 **결론을 내리는 작업 공간**이다.

```
증거 수집 → 사건의 모순 확인 → 가설의 빈 칸을 근거로 채움 → 검증 → 사건 상태와 세계가 갱신
```

CASE 00 의 가설은 `ROOM 504 IS PHYSICALLY PRESENT, BUT HAS BEEN REMOVED FROM THE CURRENT
PROPERTY RECORD.` 이고, 세 칸을 요구한다.

| 칸 | 묻는 것 | 받는 기록 |
| --- | --- | --- |
| CURRENT STATE | 지금 기록은 이 자리를 무엇이라 말하는가 | FLOOR PLAN 5F-W (5 UNITS) |
| CONFLICTING RECORD | 그 기록과 어긋나는 기록이 있는가 | ARCHIVE FRAME / DOOR 504, CAM 05-W |
| CONFIRMING EVIDENCE | 어느 쪽이 사실인지 확인했는가 | RECOVERED LOCATION / ROOM 504 |

- 기록을 눌러 펼치고 `ADD TO HYPOTHESIS` → 칸을 탭해 배치한다. 드래그를 강요하지 않는다.
- 맞지 않는 기록에는 `WRONG` 대신 시스템이 이유를 말한다 (`NO DIRECT CONFLICT FOUND IN THIS ENTRY.`).
  페널티가 없고, 잘못 넣어 본 것은 저장되지 않는다.
- 세 칸이 차면 `REVIEW HYPOTHESIS` → 가설 문장과 근거 3건을 보여주고 `CONFIRM`.
- 검증하면 `HYPOTHESIS SUPPORTED.` 만 출력한다. 사건 파일에 FINDING 과 `STATUS: UNRESOLVED CAUSE`
  가 남고, 채택된 근거들 사이의 관계는 시스템이 자동으로 정리하며, 남은 질문
  `WHO REMOVED ROOM 504 FROM THE RECORD?` 이 열린다.
- **모든 기록을 소모하지 않는다.** 사진(1987)·시계 자국(02:13)·내선(3317)은 `UNRESOLVED` 로 남아
  장기 미스터리가 된다. 기록마다 UNREVIEWED / REVIEWED / UNRESOLVED / USED IN HYPOTHESIS 상태가 붙는다.
- 기록 ↔ 기록 직접 대조(`CROSS-REFERENCE`)는 남아 있지만 진행에는 관여하지 않는 참고 기능이다.
  관계가 없으면 `NO DIRECT RELATION ESTABLISHED.` 라고만 답한다.

가설은 `src/room0/data/hypotheses.ts` 의 데이터다. CASE 01~09 는 이 배열에 항목을 추가하면
같은 시스템을 그대로 쓴다 (question · slots · accepts · reject · statement · finding · status ·
followupQuestion).

## 구조

```
src/app/room0/          라우트 (layout: viewport/themeColor, page: <Room0App/>)
src/room0/
  Room0App.tsx          Provider + Scene 라우팅 + 문서 스크롤 잠금
  room0.css             비주얼 시스템 (차콜 + 탁한 올리브 + 제한된 브라스, 전부 r0- 접두사)
  state/
    types.ts            Evidence / Relation / Case / PlanSlot / GameState / Stage
    reducer.ts          모든 게임 행동 + 단서 획득 + 파생 상태 머신(deriveStage)
    persist.ts          LocalStorage(room0.save) · schemaVersion · migrate
    GameProvider.tsx    복원 · 자동 저장 · 플레이 시간 · reduced-motion · fx
  data/                 evidence · relations · cases(00~09) · locations(도면 기하) · hints
  scenes/               Boot · FloorMap · CCTV · Discovery · Room504 · Notebook
  components/           SystemFrame(상단 바 · 로그 · 하단 내비) · AssistPanel(3단계 힌트)
  fx/                   audio(WebAudio 로 생성하는 환경음, 오디오 파일 없음) · haptics
```

**데이터와 표현은 분리되어 있다.** CASE 01~09 를 추가할 때 건드리는 곳은 `data/` 와 새 Scene 파일이며,
상태 머신은 `deriveStage()` 에 단계를 추가하는 방식으로 확장한다.

**두 종류의 공간.** SYSTEM SPACE(Boot · Floor Map · Notebook · 시스템 UI)는 터미널 · 도면 · 기록
타이포그래피 기반의 SVG/CSS 로 그린다. PHYSICAL SPACE(CCTV 복도 · 504호 문 · 객실 · 사진 · 시계 자국)는
코드로 그리지 않고 **이미지 한 장이 장면**이며, 코드는 그 위에 조명 · 노이즈 · 터치 영역 · HUD 만 얹는다.

## 씬 에셋 (VISUAL PASS 01)

실제 파일은 `public/assets/room0/` 에 있고, 코드는 `src/room0/assets.ts` 의 id 만 다룬다.

| 파일 | 비율 / 해상도 | 쓰이는 곳 | 비고 |
| --- | --- | --- | --- |
| `cctv/corridor.webp` | 4:3 / 1400×1050 | CCTV CAM 05-W 프레임 | 한 장으로 04:17(문 있음) / 그 외(문 없음) 두 상태를 만든다 |
| `504/door-504.webp` | 3:4 / 1100×1467 | Discovery — 504호 문 | 화면을 꽉 채운다 (좌우만 크롭) |
| `504/room-504-wide.webp` | 3:4 / 1200×1600 | Room 504 내부 메인 장면 | 모든 hotspot 좌표의 기준 |
| `504/photo-front.webp` | 4:3 / 1400×1050 | 액자 확대 — 앞면 | 사진 속에는 지금 없는 벽시계가 있다 |
| `504/photo-back.webp` | 4:3 / 1200×900 | 액자 확대 — 뒷면 | 연필로 OCT 17, 1987 |
| `504/clock-mark.webp` | 1:1 / 1100×1100 | 벽의 자국 확대 | 여기서 02:13 을 읽는다 |

각 에셋의 아트 디렉션 사양은 `SCENE_ASSETS` 의 `brief` 필드에 문장으로 들어 있다. 이것이 재제작 사양이다.
파일을 지우거나 못 불러오면 코드가 플레이스홀더로 대체하고 화면에 `TODO ASSET — <경로>` 를 표시하므로,
최종 아트는 같은 경로에 덮어쓰기만 하면 된다.

**두 상태를 한 장으로 만드는 방법.** 04:17 에만 나타나는 문과, 객실에서 사라진 벽시계는 둘 다
`patchStyle()` 로 *같은 사진의 다른 벽면*을 잘라 덮는 방식이다. 별도 이미지를 쓰지 않으므로 카메라 ·
구도 · 조명 · 카펫이 완전히 동일하고, 플레이어는 "이미지가 바뀌었다" 가 아니라 "원래 저기에 문이
있었나?" 라고 느낀다. 좌표 상수는 각 Scene 파일 맨 위에 모여 있다.

**좌표 잡는 법.** hotspot 과 패치 좌표는 전부 이미지 기준 %다. 장면 박스가 이미지 비율을 그대로 쓰기
때문에 어느 화면 크기에서도 그림과 정확히 일치한다. 새 아트의 좌표를 잴 때는 이미지 위에 % 격자를
얹어 눈으로 읽는 편이 가장 빠르다.

**아직 별도 에셋이 없는 것**: 전화기 클로즈업(현재는 객실 사진 위 hotspot 으로만 조사),
CCTV 복도 예비 플레이스홀더(`CorridorFallback.tsx` — 사진을 못 불러올 때만 그려진다).

## 규칙

- 소리 없이도, 진동 없이도 모든 퍼즐이 풀린다. `prefers-reduced-motion` 도 대응한다.
- 터치 타깃은 모든 지원 화면 크기에서 44px 이상을 유지한다 (SVG 좌표 기준으로는 약 60 단위).
- 힌트는 요청했을 때만, 3단계로만 나온다. 정답 값(숫자·날짜)은 어떤 단계에서도 말하지 않는다.
- 새로고침해도 진행은 유지되고, 단말에 다시 접속(`RECONNECT`)하는 한 번의 입력만 요구한다.
  (모바일 브라우저 오디오 정책상 첫 사용자 입력이 필요하다.)

## 저장 데이터

`localStorage["room0.save"]` 한 건. 현재 장면, 사건 진행, 발견 위치, 획득 기록, 확정된 관계,
힌트 사용, 누적 플레이 시간, 음소거 여부. 스키마가 바뀌면 `persist.ts` 의 `migrate()` 에서 끌어올린다.

진행을 초기화하려면 게임 안에서 `ASSIST → RECORD PURGE` (두 번 눌러 확인).

## 배포

```bash
npm run room0:static      # dist/room0 (index.html + room0.js + room0.css)
```

정적 파일뿐이라 아무 정적 호스팅에나 올라간다. 현재는 `gh-pages` 브랜치 루트에 올려
GitHub Pages 가 https://thstjdals09-lang.github.io/danbi/ 로 서비스한다 (`/danbi/room0/` 로도 열린다).
갱신하려면 다시 빌드해서 그 브랜치에 덮어쓰면 된다.

폰 실기기로 dev 서버를 직접 열 때는 `next.config.ts` 의 `allowedDevOrigins` 에 그 호스트가
들어 있어야 한다. 없으면 Next 16 이 dev 리소스를 차단해서 **빈 화면만 보인다**.
