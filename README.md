# AI時代の未来職業テスト (AI 시대 미래 직업 테스트)

일본 10~20대 대상 적응형 심리 테스트. 20문항 → 105개 직업 중 1개 매칭 → 결과 카드.
`AI_career_test_dev_brief.md` §4(유저 플로우) · §5(점수 산출) · §6(화면 구성) · §7(디자인 스펙) 기준으로 구현.

## 실행

```bash
npm install
npm run dev
```

`http://localhost:3000` → 랜딩 → `/quiz` → `/loading` → `/result`

## 폴더 구조

```
data/            careers.json (105직업) · quiz_logic.json (46문항 + 분기/매칭/역색인)
lib/
  data.ts        JSON → 타입 객체 정규화 (JP 값이 비면 KR로 폴백)
  scoring.ts     선택지 점수 파싱(RIASEC/적성/AI/기타 플래그) + 분기 보정
  flow.ts        §4 적응형 20문항 경로 계산 (순수 함수)
  matching.ts    §5-3 매칭 알고리즘 + Q19 동적 선지 생성
  constants.ts   §7 컬러, AI궁합표, 직업군 힌트 매핑
  session.ts     sessionStorage 입출력
app/             랜딩 · /quiz · /loading · /result
components/      CharacterImage · ProgressBar
public/characters/  캐릭터 PNG + placeholder.svg
```

## 유저 플로우 (§4)

항상 20문항. `lib/flow.ts`의 `planQuiz(answers)`가 답변 배열만 받아 전체 경로를 다시 계산하는
순수 함수라, 뒤로가기·새로고침 후에도 같은 문항이 나온다.

| 구간 | 문항 | 분기 기준 |
|------|------|-----------|
| 공통 선별 | Q1~Q5 | 전원 |
| 분기 심화 | Q6~Q12 (7) | Q5 선택 → Branch A / B / C |
| RIASEC 심화 | Q13~Q14 (2) | 누적 RIASEC 최고 코드 |
| 공통 | Q15~Q17 (3) | 전원 |
| 최종 보정 | Q18~Q20 (3) | AI Lv.4~5 → α / Lv.2~3 → β / Lv.1 → γ |

Q19는 문항은행에 선지가 플레이스홀더로만 있어서, 누적 RIASEC 상위 후보 중
**AI 유형이 겹치지 않는 직업 4개**를 런타임에 생성한다 (`buildDynamicChoices`).
고른 직업은 해당 RIASEC 두 코드에 +1, 매칭 시 +6.

## 점수 산출 (§5)

문항은행의 `*_RIASEC` / `*_적성` / `*_AI` / `*_기타` 열을 파싱한다.

- `R+2`, `I+1,E+1` → RIASEC 가산
- `논리분석+2` → 적성 가산
- `Lv.3` → AI 레벨 지정 / `Lv.+1`, `Lv.-1` → 가감 (최종 1~5 클램프)
- `기타` 열은 자유 서술형이라 키워드 포함 여부로 플래그 판정
  (`무관형 가산`·`무관형 적합`·`무관형 확정` → 모두 무관형 가산으로 처리)

**분기 보정**: 매칭알고리즘 시트의 "가중치 30% 반영"은 해당 분기의 대표 코드에 **×1.3 배수**로 적용.

| 보정 신호 | 대상 코드 |
|-----------|-----------|
| Branch B 보정 | A, I |
| Branch C 보정 | E |
| 안정형 보정 | C, S |

**매칭 점수** (`lib/matching.ts`)

| 항목 | 점수 |
|------|------|
| RIASEC 2코드 일치 / 1코드 일치 | +10 / +5 |
| 주코드 순서까지 일치 | +3 |
| AI 궁합 1순위 / 2순위 / 회피 | +8 / +4 / −5 |
| 유형 가산 플래그 (무관·미래신생·공생·강화) | 각 +3 |
| 프리랜서 가산 (프리랜서형 직업) | +2 |
| 대체위험 회피 | −6 |
| Q13/Q14 직업군 힌트 일치 | +3 |
| 적성 친화 코드 포함 | +2 |
| Q19에서 직접 고른 직업 | +6 |

### 동점 처리에 대한 메모

같은 (RIASEC, AI유형) 클러스터 안의 직업들(셰프/초밥 장인/목수 …)은 문항 데이터만으로는
가릴 신호가 없어 점수가 완전히 같아진다. 그대로 두면 항상 번호가 가장 낮은 직업만 나와
105개 중 70개 정도만 결과로 등장했다. 그래서 두 가지를 얹었다.

1. **답변 조합 시드 지터** (0 ~ 0.9): 답변 전체를 해시해 동점만 흩뜨린다.
   정수 점수의 대소는 절대 뒤집지 않고, 같은 답변이면 항상 같은 결과가 나온다.
2. **대표 직업 가산** (+0.35): 클러스터 최저 번호 직업에 소폭 가산.

시뮬레이션(랜덤 플레이 2,500회) 결과:

| 설정 | 설계문서 §5 예시 일치 | 도달 가능 직업 | 최다 직업 점유율 |
|------|----------------------|----------------|------------------|
| 번호 오름차순만 | 4/9 | 70 | — |
| 지터만 | 1/9 | 104 | 5.0% |
| **지터 + 대표 가산 0.35 (채택)** | **4/9** | **101** | **5.1%** |

설계 문서 §5의 예시 9개 중 4개가 정확 일치, 8개가 상위 5위 안에 들어온다.
나머지는 같은 클러스터 내 인접 직업(예: 기대 `초밥 장인` → 실제 `목수`)이라
데이터를 더 넣지 않는 한 이 이상 좁히기 어렵다. 클러스터 내 우선순위를 확정하려면
`careers.json`에 대표도 열을 추가하는 게 정공법이다.

## 캐릭터 이미지

`/public/characters/{번호}-{RIASEC}.png` (예: `1-IR.png`, `53-AR.png`).
파일이 없으면 `placeholder.svg`로 자동 대체된다 (`components/CharacterImage.tsx`의 `onError`).

```bash
node scripts/list-characters.mjs --missing   # 아직 없는 파일 목록
```

이미지를 폴더에 넣고 push 하면 Vercel에 그대로 반영된다 (정적 파일이라 재빌드 로직 불필요).

## 디자인 토큰 (§7)

`tailwind.config.ts`에 정의. `page #F0F4F8` / `hero #E0ECFA` / `accent #3B7DD8` / `fortune #FFF9C4`.
AI 유형별 배경색과 대체확률 3단계 색상은 `lib/constants.ts`.

### 폰트

Noto Sans JP를 `next/font/google`로 **셀프 호스팅**한다 (`app/layout.tsx`).
`fonts.googleapis.com`을 `<link>`로 부르면 결과 카드를 PNG로 캡처할 때
크로스오리진 스타일시트의 `cssRules`를 읽지 못해 `SecurityError`로 캡처가 실패한다.
CJK는 `subsets` 지정이 불가능해 `preload: false`로 두고 unicode-range 분할 로딩에 맡긴다.

### 카드 저장

`html-to-image`의 `toPng`로 히어로 카드 DOM을 2배 해상도 PNG로 내보낸다.
- `skipFonts: true` — 일본어 웹폰트를 통째로 base64 인라인하면 느리고 파일이 커진다.
  건너뛰면 단말의 일본어 시스템 폰트로 렌더돼 육안 차이가 거의 없다.
- 15초 타임아웃 가드 — 캡처가 끝나지 않는 환경에서도 버튼이 「保存中…」로 굳지 않는다.
  (`html-to-image`는 `requestAnimationFrame` 안에서 resolve하므로 탭이 백그라운드면 멈춘다)

## 검증 내역

- `npm run build` 통과, `npx tsc --noEmit` 통과 (7개 라우트 전부 static prerender)
- 브라우저 실주행: 랜딩 → 20문항 → 로딩 → 결과 전 구간 확인
  (Q5=B → Branch B, Q13-I 심화, Q18-α, Q19 동적 선지에 실제 직업명 표시)
- 뒤로가기: 마지막 답변 삭제 → 이전 문항 복귀 → 재선택 시 답변 교체 확인
- 카드 저장: 654×1016 PNG 생성 확인 (카드 DOM 327×508의 정확히 2배)
- 로직 시뮬레이션(랜덤 플레이 20,000회): 모든 경로가 정확히 20문항,
  Q13 6종·Q18 3종 분기 전부 도달, 서브추천 항상 3개, 104/105 직업 도달

## 배포

Vercel에서 프레임워크 자동 감지(Next.js). 이 폴더를 루트로 지정하면 된다.

| 환경변수 | 설명 |
|----------|------|
| `NEXT_PUBLIC_PARTICIPANT_COUNT` | 로딩 화면 누적 참가자 수. 비우면 미표시 |

## 아직 안 된 것

- **Google Sheets 연동 (브리프 §9)**: 현재는 `data/*.json`을 번들에 포함해 읽는다.
  실시간 CMS가 필요하면 `lib/data.ts`의 `CAREERS` / `QUESTIONS`를
  `googleapis` 기반 fetch(ISR revalidate 60)로 교체하고, JSON은 폴백으로 남기면 된다.
  파싱 함수(`parseCareerRow` / `parseQuestionRow`)는 열 순서가 아니라 열 이름 기준이라
  시트 행을 객체로 바꿔주기만 하면 그대로 재사용된다.
- 캐릭터 PNG 105종 (현재 0종, 전부 placeholder로 표시됨)
- **Next.js 보안 권고**: `npm audit`이 next 14/15 전 버전에 high 권고를 띄운다
  (해소 버전은 next@16, major 업그레이드). 대부분 self-host·미들웨어·rewrites·
  Server Actions·Image Optimizer 관련인데 이 앱은 전 라우트 static, 미들웨어·
  Server Action·next/image 미사용이라 실질 노출면은 거의 없다. 그래도 올릴지는 판단 필요.
