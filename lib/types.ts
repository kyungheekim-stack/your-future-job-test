export type RiasecCode = 'R' | 'I' | 'A' | 'S' | 'E' | 'C'
export type AptitudeKey = '논리분석' | '언어소통' | '공간감각' | '체계관리'
export type OptionKey = 'A' | 'B' | 'C' | 'D'
export type Branch = 'A' | 'B' | 'C'

export type AiTypeKr =
  | 'AI 공생형'
  | 'AI 강화형'
  | 'AI 대체위험형'
  | 'AI 무관형'
  | '미래신생형'

export interface Career {
  number: number
  nameKr: string
  nameJp: string
  descKr: string
  descJp: string
  rarity: string
  rarityStars: number
  probKr: string
  probJp: string
  aiTypeKr: AiTypeKr
  aiTypeJp: string
  riasec: string
  salary: number
  replaceRate: number
  skillsKr: string[]
  skillsJp: string[]
  todosKr: string[]
  todosJp: string[]
  tutorKr: string
  tutorJp: string
  subsKr: string[]
  subsJp: string[]
}

export interface QuizOption {
  key: OptionKey
  textKr: string
  textJp: string
  riasec: string | null
  aptitude: string | null
  ai: string | null
  etc: string | null
  /** Q19 동적 선지에서만 채워진다. */
  careerNumber?: number
  /** Q19 동적 선지의 직업 RIASEC 코드 (예: "IR") */
  careerRiasec?: string
}

export interface Question {
  id: string
  phase: string
  cond: string
  questionKr: string
  questionJp: string
  options: QuizOption[]
}

export interface Flags {
  /** Branch A 진행 중 B 신호 → A/I 가중 */
  branchBCorrection: boolean
  /** Branch B 진행 중 C 신호 → E 가중 */
  branchCCorrection: boolean
  /** Branch C 진행 중 안정 신호 → C/S 가중 */
  stabilityCorrection: boolean
  mugwanBonus: boolean
  freelancerBonus: boolean
  futureBonus: boolean
  symbioticBonus: boolean
  augmentedBonus: boolean
  professionalBonus: boolean
  financeBonus: boolean
  /** 대체위험 직업을 추천할 때 전환 방향을 병기 */
  riskFlag: boolean
  /** 대체위험 직업을 회피 */
  riskAvoid: boolean
  /** Q13/Q14 세부 직업군 힌트 */
  hints: string[]
}

export interface UserScore {
  riasec: Record<RiasecCode, number>
  aptitude: Record<AptitudeKey, number>
  aiLevel: number
  flags: Flags
  branch: Branch | null
  /** Q19에서 직접 고른 직업에 주는 가산점 */
  pickedCareer: number | null
  /** 동점 직업을 답변 조합에 따라 갈라주는 결정적 시드 */
  seed: number
}

export interface Answer {
  questionId: string
  optionKey: OptionKey
  careerNumber?: number
}

export interface MatchedCareer extends Career {
  matchScore: number
}

export interface MatchResult {
  main: MatchedCareer
  subs: Career[]
  riasecCode: string
  topAptitude: AptitudeKey
  aiLevel: number
}

export interface QuizSession {
  name: string
  answers: Answer[]
  completedAt: number
}
