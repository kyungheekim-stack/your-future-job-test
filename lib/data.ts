import careersRaw from '@/data/careers.json'
import quizRaw from '@/data/quiz_logic.json'
import { AI_TYPE_JP } from './constants'
import type { AiTypeKr, OptionKey, Question, QuizOption, Career } from './types'

type CareerRow = Record<string, string | number | null>
type QuestionRow = Record<string, string | number | null>

const str = (v: unknown): string => (v == null ? '' : String(v).trim())
const nullable = (v: unknown): string | null => {
  const s = str(v)
  return s === '' ? null : s
}
const num = (v: unknown): number => {
  const n = Number(str(v).replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function parseCareerRow(row: CareerRow): Career {
  const aiTypeKr = str(row['AI관계유형']) as AiTypeKr
  const rarity = str(row['희소성_star'])
  return {
    number: num(row['#']),
    nameKr: str(row['직업명_KR']),
    nameJp: str(row['직업명_JP']) || str(row['직업명_KR']),
    descKr: str(row['직업설명_KR']),
    descJp: str(row['職業説明_JP']) || str(row['직업설명_KR']),
    rarity,
    rarityStars: (rarity.match(/★/g) || []).length,
    probKr: str(row['만날_확률']),
    probJp: str(row['会える確率_JP']) || str(row['만날_확률']),
    aiTypeKr,
    aiTypeJp: str(row['AI관계유형_JP']) || AI_TYPE_JP[aiTypeKr] || aiTypeKr,
    riasec: str(row['RIASEC']).toUpperCase(),
    salary: num(row['예상연봉_万円']),
    replaceRate: num(row['AI대체확률_pct']),
    skillsKr: [1, 2, 3].map((i) => str(row[`필요스킬${i}`])).filter(Boolean),
    skillsJp: [1, 2, 3]
      .map((i) => str(row[`必要スキル${i}`]) || str(row[`필요스킬${i}`]))
      .filter(Boolean),
    todosKr: [1, 2, 3].map((i) => str(row[`To-do${i}`])).filter(Boolean),
    todosJp: [1, 2, 3]
      .map((i) => str(row[`To-do${i}_JP`]) || str(row[`To-do${i}`]))
      .filter(Boolean),
    tutorKr: str(row['튜터한마디']),
    tutorJp: str(row['チューターの一言']) || str(row['튜터한마디']),
    subsKr: [1, 2, 3].map((i) => str(row[`서브추천${i}`])).filter(Boolean),
    subsJp: [1, 2, 3]
      .map((i) => str(row[`サブ推薦${i}`]) || str(row[`서브추천${i}`]))
      .filter(Boolean),
  }
}

function parseQuestionRow(row: QuestionRow): Question {
  const options: QuizOption[] = (['A', 'B', 'C', 'D'] as OptionKey[])
    .map((key) => ({
      key,
      textKr: str(row[`${key}_KR`]),
      textJp: str(row[`${key}_JP`]) || str(row[`${key}_KR`]),
      riasec: nullable(row[`${key}_RIASEC`]),
      aptitude: nullable(row[`${key}_적성`]),
      ai: nullable(row[`${key}_AI`]),
      etc: nullable(row[`${key}_기타`]),
    }))
    // Q5·Q7-A·Q10-A처럼 선지가 3개뿐인 문항이 있어 빈 선지는 버린다.
    .filter((o) => o.textKr !== '' || o.textJp !== '')

  return {
    id: str(row['문항ID']),
    phase: str(row['Phase']),
    cond: str(row['분기조건']),
    questionKr: str(row['질문_KR']),
    questionJp: str(row['질문_JP']) || str(row['질문_KR']),
    options,
  }
}

export const CAREERS: Career[] = (careersRaw as unknown as CareerRow[])
  .filter((r) => str(r['직업명_KR']) !== '')
  .map(parseCareerRow)

export const QUESTIONS: Question[] = (
  (quizRaw as unknown as { 문항은행: QuestionRow[] }).문항은행 ?? []
)
  .filter((r) => str(r['문항ID']) !== '')
  .map(parseQuestionRow)

export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q]),
)

export const CAREER_BY_NUMBER: Record<number, Career> = Object.fromEntries(
  CAREERS.map((c) => [c.number, c]),
)

/** 서브추천 열의 직업명(KR/JP)을 직업풀로 되돌린다. */
const CAREER_BY_NAME: Record<string, Career> = (() => {
  const map: Record<string, Career> = {}
  for (const c of CAREERS) {
    map[c.nameKr] = c
    map[c.nameJp] = c
  }
  return map
})()

export function findCareerByName(name: string): Career | undefined {
  return CAREER_BY_NAME[name.trim()]
}
