# AI 시대 미래 직업 테스트 — 개발 브리프

> Claude Code용 개발 지시서
> 최종 업데이트: 2026.08.25

---

## 1. 프로젝트 개요

일본 10대~20대 대상 "AI 시대에 나에게 맞는 미래 직업" 심리 테스트.
20문항 적응형 퀴즈 → 105개 직업 중 1개 매칭 → 결과 카드 생성.

- **서비스명**: AI 시대 미래 직업 테스트 (AI時代の未来職業テスト)
- **운영 주체**: 소크라 AI (Socra AI) → 소크라 튜터 (SOCRA Tutor)로 연결
- **배포**: Vercel
- **언어**: 일본어 (JP) 기본, 한국어 원본 데이터 병기

---

## 2. 기술 스택

| 항목 | 선택 |
|------|------|
| 프레임워크 | Next.js (App Router) |
| 배포 | Vercel |
| 데이터 | JSON 파일 (프로젝트 내 포함) |
| 스타일링 | Tailwind CSS |
| 상태 관리 | React state (클라이언트 사이드 점수 계산) |
| 이미지 호스팅 | `/public/characters/` 폴더 (정적) |

---

## 3. 데이터 소스

### 3-1. Google Sheets (2개 시트 파일)

로컬 엑셀 → 구글 드라이브 업로드 → Google Sheets API로 읽기.
원본 파일 위치: `/Users/socraai/Desktop/소크라 AI/★ 소크라튜터/3. 이벤트/260900_1차 모객 이벤트/2. 2차 프론트엔드`

#### 파일 A: 직업풀 상세 결과
- 파일명: `AI시대_미래직업테스트_v3_KR_JP.xlsx`
- 105행 × 32열
- 주요 열:

| 열 | 내용 |
|-----|------|
| A | # (직업 번호) |
| B | 직업명(KR) |
| C | 직업명(JP) |
| D | 직업설명(KR) |
| E | 직업설명(JP) |
| F | 희소성(★) — ★☆☆☆☆ ~ ★★★★★ |
| G | 만날 확률(KR) |
| H | 만날 확률(JP) |
| I | AI관계유형(KR) |
| J | AI관계유형(JP) |
| K | RIASEC 코드 |
| L | 예상연봉(만엔/년) |
| M | AI대체확률(%) |
| N~S | 필요스킬 ①②③ (KR/JP 쌍) |
| T~Y | To-do ①②③ (KR/JP 쌍) |
| Z | 튜터한마디(KR) |
| AA | 튜터한마디(JP) |
| AB~AG | 서브추천 ①②③ (KR/JP 쌍) |

#### 파일 B: 문항/로직
- 파일명: `AI시대_미래직업테스트_CMS_문항로직.xlsx`
- 4개 시트:

| 시트 | 내용 | 용도 |
|------|------|------|
| 문항은행 | 46문항 × 30열 (KR+JP+점수) | 프론트엔드가 문항·선택지 표시 |
| 분기로직 | 16개 분기 규칙 | 다음 문항 결정 |
| 매칭알고리즘 | 궁합표 + 보정 7종 | 결과 산출 |
| RIASEC역색인 | 105개 직업 코드별 정렬 | 매칭 시 검색 |

### 3-2. 캐릭터 이미지

- 위치: `/public/characters/`
- 파일명 규칙: `{직업번호}-{RIASEC코드}.png`
- 예시: `1-IR.png`, `50-AE.png`, `91-IR.png`, `105-AE.png`
- 코드에서 참조: 직업풀 A열(번호) + K열(RIASEC) → 파일명 조합

```javascript
// 이미지 경로 생성
const getCharacterImage = (jobNumber, riasecCode) => {
  return `/characters/${jobNumber}-${riasecCode}.png`
}
```

- 이미지가 아직 없는 직업은 기본 placeholder 표시
- 새 이미지를 폴더에 추가하고 push → Vercel 자동 반영

---

## 4. 유저 플로우

```
[랜딩 페이지]
    │
    ▼
[퀴즈 시작] ← 이름 입력 (결과 카드에 "{이름}の未来の職業はこれ！"로 표시)
    │
    ▼
[Q1~Q5] 공통 선별 (전원 응답)
    │
    ├─ Q5=A → [Q6A~Q12A] 안정·체계 코스 (7문항)
    ├─ Q5=B → [Q6B~Q12B] 도전·창의 코스 (7문항)
    └─ Q5=C → [Q6C~Q12C] 성취·리더 코스 (7문항)
    │
    ├─ R 우세 → [Q13R~Q14R]
    ├─ I 우세 → [Q13I~Q14I]
    ├─ A 우세 → [Q13A~Q14A]
    ├─ S 우세 → [Q13S~Q14S]
    ├─ E 우세 → [Q13E~Q14E]
    └─ C 우세 → [Q13C~Q14C]
    │
    ▼
[Q15~Q17] 공통 (전원 응답)
    │
    ├─ AI Lv.4~5 → [Q18α~Q20α]
    ├─ AI Lv.2~3 → [Q18β~Q20β]
    └─ AI Lv.1 → [Q18γ~Q20γ]
    │
    ▼
[로딩 화면] ← 점수 계산 + 직업 매칭
    │
    ▼
[결과 페이지] ← 스크롤 가능한 1페이지
```

사용자 경험: **항상 20문항** (5 + 7 + 2 + 3 + 3)

---

## 5. 점수 산출 로직

### 5-1. 데이터 구조 (클라이언트 사이드)

```javascript
const userScore = {
  // RIASEC 점수 (각 0점에서 시작, 문항별 가산)
  riasec: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 },
  
  // 적성 점수
  aptitude: { 논리분석: 0, 언어소통: 0, 공간감각: 0, 체계관리: 0 },
  
  // AI 레벨 (Q4에서 초기값 설정, 이후 가감)
  aiLevel: 0,
  
  // 보정 플래그
  flags: {
    branchBCorrection: false,  // Branch A에서 B 보정 신호 발생
    branchCCorrection: false,  // Branch B에서 C 보정 신호 발생
    stabilityCorrection: false, // Branch C에서 안정형 보정
    mugwanBonus: false,         // 무관형 가산
    freelancerBonus: false,     // 프리랜서 가산
    futureBonus: false,         // 미래신생형 가산
    riskFlag: false,            // 대체위험 플래그
  }
}
```

### 5-2. 문항별 점수 적용

CMS 문항은행 시트의 각 선택지에 점수가 기입되어 있음:
- `A_RIASEC` 열: "R+2", "I+1,E+1" 등 → 파싱해서 riasec 객체에 가산
- `A_적성` 열: "논리분석+2" 등 → aptitude 객체에 가산
- `A_AI` 열: "Lv.+1", "Lv.-1", "Lv.3" 등 → aiLevel 가감 또는 설정
- `A_기타` 열: "무관형 가산", "Branch B 보정" 등 → flags 설정

### 5-3. 매칭 알고리즘

```javascript
function matchCareer(score, careers) {
  // 1. RIASEC 상위 2코드 추출
  const sorted = Object.entries(score.riasec).sort((a,b) => b[1]-a[1])
  const top2 = [sorted[0][0], sorted[1][0]]
  const riasecCode = top2.join('') // 예: "RI"
  
  // 2. 적성 상위 1개 추출
  const topApt = Object.entries(score.aptitude).sort((a,b) => b[1]-a[1])[0][0]
  
  // 3. AI 레벨 확정 (1~5 클램프)
  const aiLv = Math.max(1, Math.min(5, score.aiLevel))
  
  // 4. AI 궁합 매칭
  const typeCompat = {
    5: { prefer: ["AI 공생형", "미래신생형"], ok: ["AI 강화형"], avoid: ["AI 대체위험형"] },
    4: { prefer: ["AI 강화형", "AI 공생형"], ok: ["미래신생형"], avoid: [] },
    3: { prefer: ["AI 강화형"], ok: ["AI 무관형"], avoid: [] },
    2: { prefer: ["AI 무관형"], ok: ["AI 강화형"], avoid: ["AI 공생형"] },
    1: { prefer: ["AI 무관형"], ok: [], avoid: ["AI 공생형", "미래신생형"] },
  }
  
  // 5. 필터 + 정렬
  const compat = typeCompat[aiLv]
  const candidates = careers
    .filter(c => {
      // RIASEC 1코드 이상 일치
      const code = c.riasec
      return top2.includes(code[0]) || top2.includes(code[1])
    })
    .map(c => {
      let score = 0
      // RIASEC 일치도 (2코드 모두 일치 = +10, 1코드 = +5)
      const code = c.riasec
      if (top2.includes(code[0]) && top2.includes(code[1])) score += 10
      else score += 5
      // AI 궁합
      if (compat.prefer.includes(c.aiType)) score += 8
      else if (compat.ok.includes(c.aiType)) score += 4
      else if (compat.avoid.includes(c.aiType)) score -= 5
      // 보정 플래그 반영
      if (flags.mugwanBonus && c.aiType === "AI 무관형") score += 3
      if (flags.futureBonus && c.aiType === "미래신생형") score += 3
      if (flags.freelancerBonus) score += 1 // 프리랜서형 직업 약간 가산
      return { ...c, matchScore: score }
    })
    .sort((a,b) => b.matchScore - a.matchScore)
  
  return {
    main: candidates[0],        // 메인 추천 1개
    subs: candidates.slice(1,4), // 서브 추천 3개
  }
}
```

---

## 6. 화면 구성

### 6-1. 랜딩 페이지 (`/`)
- 테스트 소개
- 이름 입력 필드
- "テストを始める" 버튼

### 6-2. 퀴즈 페이지 (`/quiz`)
- 프로그레스바 (현재 문항 / 20)
- 문항 번호 + 질문 텍스트 (JP)
- 선택지 A~D (JP) — 탭/클릭으로 선택
- "Next" 버튼
- 뒤로가기 (이전 문항)

### 6-3. 로딩 페이지 (`/loading`)
- 원형 프로그레스 애니메이션
- "全部わかったよ！" 텍스트
- "もうすぐ未来を見せるね…！" 텍스트
- 참가자 수 표시

### 6-4. 결과 페이지 (`/result`)

피그마 디자인 기준. 2 파트 구성:

#### Part 1: 컬렉터블 카드 (히어로)
- 만날 확률 뱃지 (만날확률 JP 텍스트, 파란 배경)
- "{이름}の未来の職業はこれ！"
- 카드 (흰색, 라운드 40, 그림자):
  - 캐릭터 이미지 (`/characters/{#}-{RIASEC}.png`)
  - 별점 (★ 오버레이)
  - 직업명 뱃지 (JP)
  - 직업 설명 (JP)
  - SOCRA Tutor 로고
- 카드 저장 버튼 (이미지 다운로드)

#### Part 2: 상세 결과 (흰색 라운드 패널)
- AI 관계 타입 뱃지 + 예상 연봉 (2열 병렬)
- AI 대체 확률 (%) + 프로그레스 바
- 필요 스킬 (pill 칩 3개)
- 쌓아야 할 스펙 (To-do 리스트 3개)
- 튜터의 한마디 (노란 카드, 포춘쿠키)
- 부업 추천 (서브 직업 3개 + AI 유형 뱃지)

---

## 7. 디자인 소스

### 피그마 파일
- URL: https://www.figma.com/design/LTwWqLUm2Gnjk61PjSEfPZ
- 페이지: `(v3) AI 직업 테스트 이벤트 페이지`
- 주요 섹션:
  - `Home-loading`: 랜딩 + 로딩 화면
  - `Test`: 퀴즈 화면
  - `결과카드`: 결과 페이지

### 컬러 시스템
- 배경: `#F0F4F8` (페이지), `#E0ECFA` (히어로)
- 카드: `#FFFFFF` (흰색)
- 주요 액센트: `#3B7DD8` (파란색 — 뱃지, 직업명, 번호)
- 포춘쿠키: `#FFF9C4` (노란색)
- AI 유형별 색상:
  - AI 공생형: `#E8F5E9`
  - AI 강화형: `#E3F2FD`
  - AI 대체위험형: `#FFF3E0`
  - AI 무관형: `#F3E5F5`
  - 미래신생형: `#FFF9C4`
- 대체확률 색상: 
  - 낮음(~30%): `#0F6E56`
  - 중간(31~60%): `#BA7517`
  - 높음(61%~): `#993C1D`

---

## 8. 캐릭터 이미지 시스템

### 폴더 구조
```
/public/characters/
├── 1-IR.png      # AI 엔지니어
├── 2-IC.png      # 빅데이터 분석가
├── ...
├── 91-RI.png     # 우주쓰레기 수거 오퍼레이터
├── ...
├── 105-AE.png    # 개그맨
└── placeholder.png  # 아직 이미지 없는 직업용
```

### 이미지 사양
- 포맷: PNG (투명 배경)
- 권장 크기: 1024×1024px 이상
- 캐릭터: 소크라 튜터 돌고래 마스코트가 해당 직업 컨셉으로 변장한 모습

### 코드 처리
```javascript
const characterSrc = (num, riasec) => {
  const path = `/characters/${num}-${riasec}.png`
  // 이미지 존재 여부는 빌드 시 체크하거나 onError fallback
  return path
}

// fallback
<Image 
  src={characterSrc(job.number, job.riasec)}
  onError={(e) => { e.target.src = '/characters/placeholder.png' }}
/>
```

### 업데이트 프로세스
1. 새 캐릭터 이미지 생성 (ChatGPT, Midjourney 등)
2. `{번호}-{RIASEC}.png`로 파일명 지정
3. `/public/characters/` 폴더에 저장
4. `git add → commit → push` → Vercel 자동 배포
5. 사이트에서 즉시 반영 (재빌드 필요 없음, 정적 파일)

---

## 9. 데이터 연동 (JSON)

### 구조
- JSON 파일을 프로젝트 내 `/data/` 폴더에 포함
- import해서 직접 사용 (API 호출 불필요)
- 데이터 수정 시: JSON 파일 수정 → git push → Vercel 자동 배포

### 데이터 파일
```
/data/
├── careers.json      # 105개 직업 상세 결과
└── quiz_logic.json   # 문항은행 + 분기로직 + 매칭알고리즘 + RIASEC역색인
```

### 코드 패턴
```javascript
// lib/data.js
import careersData from '@/data/careers.json'
import quizData from '@/data/quiz_logic.json'

export function getCareers() {
  return careersData  // 105개 직업 배열
}

export function getQuestions() {
  return quizData.문항은행  // 46개 문항 배열
}

export function getBranchingLogic() {
  return quizData.분기로직  // 16개 분기 규칙
}

export function getMatchingAlgorithm() {
  return quizData.매칭알고리즘  // 궁합표
}

export function getRiasecIndex() {
  return quizData.RIASEC역색인  // 105개 역색인
}
```

### 환경 변수 (Vercel)
```
없음 — JSON 파일이 프로젝트에 포함되어 있으므로 별도 인증 불필요
```

### 향후 업그레이드 (선택)
회사 IT팀에서 구글 서비스 계정 승인 받으면, 
JSON 방식 → Google Sheets API 실시간 연동으로 전환 가능.
그때까지는 JSON 방식으로 충분.

---

## 10. 배포

### Vercel 설정
- 프레임워크: Next.js (자동 감지)
- 빌드 커맨드: `next build`
- 출력: `.next`
- 환경 변수: 위 Google Sheets 인증 정보

### GitHub 연동
1. GitHub repo 생성
2. Vercel에 연결
3. main 브랜치 push → 자동 배포

### 실시간 수정 프로세스
| 수정 대상 | 방법 | 반영 속도 |
|----------|------|----------|
| 문항 텍스트/점수 | quiz_logic.json 수정 → git push | 배포 시간 (~1분) |
| 직업 데이터/포춘쿠키 | careers.json 수정 → git push | 배포 시간 (~1분) |
| 캐릭터 이미지 | 파일 추가 → git push | 배포 시간 (~1분) |
| UI/레이아웃 | 코드 수정 → git push | 배포 시간 (~1분) |

---

## 11. 참고 자료

- **설계 문서 v3**: 프레임워크 + 직업풀 + 문항 구조 + 분기 로직 + 알고리즘 + RIASEC 역색인
- **v1 문항 상세**: 48문항 전체 선택지 + 점수 로직 (Phase 1~4)
- **피그마**: 결과카드 + 퀴즈 화면 + 로딩 화면
- **PR 가이드**: 소크라 튜터 브랜드 표기 규칙 (소크라 AI / Socra AI / SOCRA Tutor)
- **직업풀 근거**: WEF Future of Jobs 2025, OECD AI & Employment, Holland RIASEC/O*NET
