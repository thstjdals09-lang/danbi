# 이미지 에셋 규칙

모든 이미지는 외부에서 제작해 이 폴더에 넣습니다. 코드에서는 이미지를 생성하지 않습니다.
파일이 없으면 화면에 빈 슬롯이 표시되고, 개발자 모드에서는 필요한 파일 경로가 함께 보입니다.

확장자는 `.webp`, `.png`, `.jpg` 순서로 찾습니다.

## 캐릭터 (전신)

`images/characters/{personaId}/{stageId}.png`

## PFP (프로필 사진, 정사각형)

`images/pfp/{personaId}/{stageId}.png`

## 수집물 아이콘

`images/collectibles/{kind}/{key}.png`

- 인증서: `images/collectibles/certification/{examId}.png`
- 트로피: `images/collectibles/trophy/{trophyKey}.png`

## personaId (16종)

`{game}-{play}-{mind}-{table}`

| 축 | 값 |
| --- | --- |
| game | `cash`, `tournament` |
| play | `solid`, `aggressive` |
| mind | `study`, `instinct` |
| table | `calm`, `expressive` |

예: `tournament-aggressive-instinct-calm`

## stageId (성장 단계)

`beginner`, `academy-student`, `grinder`, `regular`, `semi-pro`, `pro`, `elite`
