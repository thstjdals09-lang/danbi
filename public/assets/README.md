# Production asset slots

모든 이미지는 외부에서 제작해 이 폴더에 넣습니다. 코드는 캐릭터를 CSS/SVG로 그리지 않습니다.
파일이 없으면 화면에는 자리만 있는 슬롯이 표시되고, 개발자 모드(잠금 해제)에서는 필요한 파일 경로가 함께 보입니다.

확장자는 `.webp` → `.png` → `.jpg` 순서로 찾습니다.

## 이미지 넣는 방법

1. 완성 파일을 아래 경로 규칙 그대로 이 폴더(`public/assets/…`)에 넣습니다. 폴더는 이미 만들어져 있습니다.
2. 검사: `npm run assets:check` — 파일명(대소문자 포함)·해상도·비율·투명 채널·파일 크기와 목록에 없는 파일(오타)을 확인합니다.
3. 남은 파일 보기: `npm run assets:check -- --todo`
4. 화면에 연결된 슬롯은 서버를 다시 시작하지 않아도 바로 반영됩니다.

- 기준 목록(105 파일)은 `scripts/asset-manifest.mjs`에 있습니다. 규격이 바뀌면 이 파일을 먼저 고칩니다.
- 검사 결과에 `(화면 연결 전 — 수집만)`으로 표시되는 파일은 아직 코드 슬롯이 없는 제안 항목입니다(hero, og, brand, share, ui, backgrounds, persona-test/silhouette). 파일은 먼저 모아두고 화면 연결은 이후 작업입니다.
- 웹용 최종본만 넣습니다. PSD·고해상도 마스터는 이 폴더에 넣지 마세요(공개 저장소 · 저장소 용량).
- 이 폴더의 이미지는 GitHub(공개 저장소)에 커밋됩니다.

## Personas — `personas/{family}/`

| family | 이름 | accent |
| --- | --- | --- |
| `architect` | THE ARCHITECT | Cobalt |
| `shark` | THE SHARK | Burgundy |
| `strategist` | THE STRATEGIST | Moss |
| `hunter` | THE HUNTER | Acid Yellow |

각 폴더에 4종:

| 파일 | 용도 | 권장 비율 |
| --- | --- | --- |
| `full.webp` | 전신. Home / Public Profile / Result | 세로 3:4 이상, 투명 배경 권장 |
| `bust.webp` | 상반신. 이름 설정 / Collection / Community | 3:4 |
| `pfp.webp` | 정사각 프로필 사진. 헤더 / PFP Preview / 저장 | 1:1 |
| `reveal.webp` | Persona Reveal 연출. Persona Test 배경에도 사용 | 세로 3:4 이상 |

16개 Persona는 `{game}-{play}-{mind}-{table}` id를 가지며, `play × mind`가 family를 결정합니다.

- solid + study → `architect`
- aggressive + instinct → `shark`
- aggressive + study → `strategist`
- solid + instinct → `hunter`

## Gear — `gear/{gearId}/`

| 파일 | 용도 |
| --- | --- |
| `icon.webp` | Collection / Showcase / Result 오브젝트 이미지 (1:1, 투명) |
| `overlay-{family}.webp` | 해당 계열 `full.webp`와 **같은 캔버스(1600×2000)** 의 투명 레이어. 장착 시 캐릭터 위에 겹쳐집니다 |
| `overlay.webp` | 계열별 파일이 없을 때 쓰는 공용 레이어 (시그니처 기어·배경 기어용) |

- 계열마다 체형/포즈가 달라 공용 기어(tag, pin, patch, headphones, protector)는 `overlay-architect|shark|strategist|hunter` 4장이 필요합니다.
- 배경 기어(`academy-hall`, `final-table-light`)는 `overlay.webp`가 캐릭터 **뒤**에 깔립니다 (불투명 1600×2000).
- 레이어는 `full.webp` 위에서만 겹쳐집니다. 캐릭터와 레이어는 모두 **상단 중앙 기준**으로 잘립니다.

gearId: `academy-player-tag`, `academy-hall`, `rulebook-pin`, `40bb-tournament-patch`, `grinder-headphones`,
`graphite-card-protector`, `final-table-light`, `architect-halo`, `shark-visor`, `strategist-goggles`, `hunter-hood`

## Certifications — `certifications/{examId}/{grade}.webp`

메달 완성 이미지. 등급 글자가 그림에 포함되므로 등급별 파일이 필요합니다: `S`, `A`, `B`, `C`, `locked`(미획득).
육각형(가로:세로 = 1:1.12)으로 잘려 표시됩니다. 없으면 CSS 재질(샴페인 포일 / 코발트·버건디 에나멜 / 퓨터)로 표시됩니다.

examId: `basic-terms`, `preflop-40bb`

## Trophies — `trophies/{key}.webp`

key: `first-certification`, `perfect-exam`

## Persona Test fragments — `persona-test/{axis}-{value}.webp`

선택지마다 보이는 Visual Fragment (16:9).

`mind-study`, `mind-instinct`, `play-solid`, `play-aggressive`, `game-cash`, `game-tournament`, `table-calm`, `table-expressive`
