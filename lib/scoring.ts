import { APTITUDE_KEYS, RIASEC_CODES, TIE_JITTER_RANGE } from './constants'
import type {
  AptitudeKey,
  Branch,
  Flags,
  QuizOption,
  RiasecCode,
  UserScore,
} from './types'

export function emptyFlags(): Flags {
  return {
    branchBCorrection: false,
    branchCCorrection: false,
    stabilityCorrection: false,
    mugwanBonus: false,
    freelancerBonus: false,
    futureBonus: false,
    symbioticBonus: false,
    augmentedBonus: false,
    professionalBonus: false,
    financeBonus: false,
    riskFlag: false,
    riskAvoid: false,
    hints: [],
  }
}

export function emptyScore(): UserScore {
  return {
    riasec: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 },
    aptitude: { 논리분석: 0, 언어소통: 0, 공간감각: 0, 체계관리: 0 },
    aiLevel: 0,
    flags: emptyFlags(),
    branch: null,
    pickedCareer: null,
    seed: 0,
  }
}

/** 답변 조합에서 결정적 시드를 만든다 (FNV-1a). */
export function hashAnswers(answers: { questionId: string; optionKey: string }[]): number {
  let h = 2166136261
  for (const a of answers) {
    const token = `${a.questionId}:${a.optionKey}`
    for (let i = 0; i < token.length; i += 1) {
      h ^= token.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
  }
  return h >>> 0
}

/**
 * 같은 점수를 받은 직업들 사이의 순서를 답변 조합에 따라 흩뜨린다.
 * 동점 처리 구간 안에서도 가장 낮은 우선순위라 Q19 선택을 밀어내지 않는다.
 */
export function tieBreaker(seed: number, careerNumber: number): number {
  let x = (seed ^ Math.imul(careerNumber + 1, 2654435761)) >>> 0
  x ^= x >>> 15
  x = Math.imul(x, 2246822519)
  x ^= x >>> 13
  x = Math.imul(x, 3266489917)
  x ^= x >>> 16
  return ((x >>> 0) / 4294967296) * TIE_JITTER_RANGE
}

/**
 * "R+2", "I+1,E+1" → riasec 가산.
 * weight 로 영향력을 줄일 수 있다 (Q19 는 0.2 로 들어온다).
 */
export function applyRiasec(score: UserScore, raw: string | null, weight = 1): void {
  if (!raw) return
  for (const token of raw.split(',')) {
    const m = token.trim().match(/^([RIASEC])\s*([+-]\d+)$/i)
    if (!m) continue
    const code = m[1].toUpperCase() as RiasecCode
    score.riasec[code] += Number(m[2]) * weight
  }
}

/** "논리분석+2" → aptitude 가산 */
export function applyAptitude(score: UserScore, raw: string | null): void {
  if (!raw) return
  for (const token of raw.split(',')) {
    const m = token.trim().match(/^(논리분석|언어소통|공간감각|체계관리)\s*([+-]\d+)$/)
    if (!m) continue
    score.aptitude[m[1] as AptitudeKey] += Number(m[2])
  }
}

/** "Lv.3" → 설정, "Lv.+1" / "Lv.-1" → 가감 */
export function applyAiLevel(score: UserScore, raw: string | null): void {
  if (!raw) return
  const token = raw.trim()
  const delta = token.match(/^Lv\.\s*([+-]\d+)$/i)
  if (delta) {
    score.aiLevel += Number(delta[1])
    return
  }
  const absolute = token.match(/^Lv\.\s*(\d+)$/i)
  if (absolute) score.aiLevel = Number(absolute[1])
}

/** Q5의 "→Branch A" 게이트 */
export function readBranchGate(raw: string | null): Branch | null {
  if (!raw) return null
  const m = raw.match(/Branch\s*([ABC])\s*$/)
  return m ? (m[1] as Branch) : null
}

/**
 * 기타 열의 보정 신호를 플래그로 옮긴다.
 * 시트 문자열이 자유 서술형이라 키워드 포함 여부로 판정한다.
 */
export function applyEtc(score: UserScore, raw: string | null): void {
  if (!raw) return
  const etc = raw.trim()
  const f = score.flags

  // 분기 게이트(Q5)는 별도로 처리하므로 여기서는 건너뛴다.
  if (/→\s*Branch/.test(etc)) return

  if (etc.includes('Branch B 보정')) f.branchBCorrection = true
  if (etc.includes('Branch C 보정')) f.branchCCorrection = true
  if (etc.includes('안정형 보정') || etc.includes('안정 강화') || etc.includes('안정 지향 보정')) {
    f.stabilityCorrection = true
  }

  if (etc.includes('무관형')) f.mugwanBonus = true
  if (etc.includes('미래신생형')) f.futureBonus = true
  if (etc.includes('공생형')) f.symbioticBonus = true
  if (etc.includes('강화형')) f.augmentedBonus = true
  if (etc.includes('프리랜서')) f.freelancerBonus = true
  if (etc.includes('전문직')) f.professionalBonus = true
  if (etc.includes('금융∙경영') || etc.includes('금융·경영')) f.financeBonus = true

  if (etc.includes('대체위험')) {
    if (etc.includes('회피')) f.riskAvoid = true
    else f.riskFlag = true
  }

  // "예술형∙프리랜서 가산"은 예술 성향도 함께 밀어준다.
  if (etc.includes('예술형')) score.riasec.A += 1

  // Q13/Q14 세부 직업군 힌트: "→개발자∙엔지니어" 또는 "1차 산업" 형태
  const arrow = etc.match(/^→\s*(.+)$/)
  if (arrow) {
    f.hints.push(arrow[1].trim())
  } else if (/^(1차 산업|2차 산업|서비스 기술직|범용)$/.test(etc)) {
    f.hints.push(etc)
  } else if (etc.includes('금융∙경영 가산')) {
    f.hints.push('금융∙경영')
  } else if (etc.includes('전문직 가산')) {
    f.hints.push('전문직')
  }
}

export function applyOption(score: UserScore, option: QuizOption): void {
  applyRiasec(score, option.riasec)
  applyAptitude(score, option.aptitude)
  applyAiLevel(score, option.ai)

  const gate = readBranchGate(option.etc)
  if (gate) score.branch = gate
  applyEtc(score, option.etc)

  if (option.careerNumber) score.pickedCareer = option.careerNumber
}

/**
 * 매칭알고리즘 시트의 "가중치 30% 반영"을 해당 분기 대표 코드에 배수로 적용한다.
 *  - Branch A(안정·체계) 대표 코드: C, S
 *  - Branch B(도전·창의) 대표 코드: A, I
 *  - Branch C(성취·리더) 대표 코드: E
 */
export function applyBranchCorrections(score: UserScore): UserScore {
  const out: UserScore = {
    ...score,
    riasec: { ...score.riasec },
    aptitude: { ...score.aptitude },
    flags: { ...score.flags, hints: [...score.flags.hints] },
  }
  const boost = (codes: RiasecCode[]) => {
    for (const code of codes) out.riasec[code] = out.riasec[code] * 1.3
  }
  if (out.flags.branchBCorrection) boost(['A', 'I'])
  if (out.flags.branchCCorrection) boost(['E'])
  if (out.flags.stabilityCorrection) boost(['C', 'S'])
  return out
}

/** 동점일 때 순서가 흔들리지 않도록 RIASEC 고정 순서를 tie-breaker로 쓴다. */
export function sortedRiasec(score: UserScore): RiasecCode[] {
  return [...RIASEC_CODES].sort((a, b) => {
    const diff = score.riasec[b] - score.riasec[a]
    if (diff !== 0) return diff
    return RIASEC_CODES.indexOf(a) - RIASEC_CODES.indexOf(b)
  })
}

export function topAptitude(score: UserScore): AptitudeKey {
  return [...APTITUDE_KEYS].sort((a, b) => {
    const diff = score.aptitude[b] - score.aptitude[a]
    if (diff !== 0) return diff
    return APTITUDE_KEYS.indexOf(a) - APTITUDE_KEYS.indexOf(b)
  })[0]
}

export function clampAiLevel(raw: number): number {
  return Math.max(1, Math.min(5, Math.round(raw)))
}
