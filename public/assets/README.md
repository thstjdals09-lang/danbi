# Production asset slots

모든 이미지는 외부에서 제작해 이 폴더에 넣습니다. 코드는 캐릭터를 CSS/SVG로 그리지 않습니다.
파일이 없으면 화면에는 자리만 있는 슬롯이 표시되고, 개발자 모드(잠금 해제)에서는 필요한 파일 경로가 함께 보입니다.

확장자는 `.webp` → `.png` → `.jpg` 순서로 찾습니다.

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
| `icon.webp` | Collection / Showcase 오브젝트 이미지 (1:1) |
| `overlay.webp` | `full.webp`와 **같은 캔버스 크기**의 투명 레이어. 장착 시 캐릭터 위에 겹쳐집니다 |

배경 기어(`academy-hall`, `final-table-light`)는 `icon.webp`가 캐릭터 뒤 배경으로 깔립니다.

gearId: `academy-player-tag`, `academy-hall`, `rulebook-pin`, `40bb-tournament-patch`, `grinder-headphones`,
`graphite-card-protector`, `final-table-light`, `architect-halo`, `shark-visor`, `strategist-goggles`, `hunter-hood`

## Certifications — `certifications/{examId}.webp`

메달 오브젝트를 대체하는 이미지. 없으면 CSS 재질(샴페인 포일 / 코발트·버건디 에나멜 / 퓨터)로 표시됩니다.

examId: `basic-terms`, `preflop-40bb`

## Trophies — `trophies/{key}.webp`

key: `first-certification`, `perfect-exam`

## Persona Test fragments — `persona-test/{axis}-{value}.webp`

선택지마다 보이는 Visual Fragment (16:9).

`mind-study`, `mind-instinct`, `play-solid`, `play-aggressive`, `game-cash`, `game-tournament`, `table-calm`, `table-expressive`
