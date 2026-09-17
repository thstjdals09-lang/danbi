# danbi

**PLAY. PROVE. BECOME.**

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
- 현재 Persona 변경 (Origin 유지)
- 시험을 보지 않고 등급별 결과 지급
- 시험 중 정답 표시, 정답 자동 채우기, 즉시 제출
- 이미지가 없는 슬롯에 필요한 파일 경로 표시

**출시할 때는 `DANBI_DEV_MODE`를 지우거나 `false`로 두면 됩니다.** 버튼이 사라지고 모든 개발자 페이지와 서버 액션이 404가 됩니다. 모든 개발자 페이지와 액션은 `assertDevAccess()`로 보호되며, 잠금 해제하지 않은 브라우저에는 시험 정답 데이터가 전송되지 않습니다.

## 문제 소스 교체

앱은 `src/lib/exams/types.ts`의 `ExamSource` 인터페이스만 사용합니다.

1. `src/lib/exams/sources/`에 `ExamSource` 구현을 추가합니다.
2. `src/lib/exams/registry.ts`에 등록합니다.
3. `DANBI_EXAM_SOURCE`로 선택합니다.

현재 `local` 소스에는 샘플 시험(기초 용어) 하나가 들어 있습니다: `src/content/exams/basic-terms.ts`

## 이미지

이미지는 외부에서 제작해 `public/images`에 넣습니다. 경로 규칙은 [public/images/README.md](public/images/README.md)를 참고하세요.

## 구조

```
src/
  app/
    (auth)/            로그인 · 가입
    onboarding/        Persona Test → 닉네임/공개 ID
    exams/             Academy · 시험 응시 · 결과
    me/showcase/       쇼케이스 편집
    [handle]/          공개 프로필
    dev/               개발자 패널 (개발자 모드 전용)
  content/             페르소나 · 성장 단계 · 트로피 · 시험 데이터 (초안 문구)
  lib/
    auth/              비밀번호 해시 · 세션
    exams/             시험 타입 · 채점 · 문제 소스
    repo/              DB 접근
    career.ts          영역별 등급 · Current Pursuit · 수집물 표시
    progress.ts        시험 결과 → 인증/트로피/성장 반영
```
