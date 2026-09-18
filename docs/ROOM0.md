# ROOM 0 — NULL HOTEL

모바일 웹 미스터리 퍼즐 게임. 이 저장소 안에서 포커 제품과 **완전히 분리된 두 번째 게임**으로 돌아간다.

- 진입: `/room0`
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
     → NOTEBOOK 에서 두 기록을 연결 → CASE 00 종결 → CASE 01 예고
```

퍼즐을 풀면 `CORRECT` 가 뜨는 대신 **세계가 바뀐다**: 층 기록이 덮어써지고, 도면에 방이 생기고,
도면 개정 번호와 유닛 수가 변하고, 노트에 기록과 연결선이 남는다.

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

**최종 아트 교체 지점.** 각 장면은 하나의 SVG 레이어 + 그 위의 터치 영역으로 되어 있다.
도면 좌표는 `data/locations.ts`, 504호 오브젝트 좌표는 `Room504Scene.tsx` 상단 `HOTSPOTS` 에 모여 있다.
SVG 레이어만 최종 아트로 바꾸면 인터랙션은 그대로 살아 있다.

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
