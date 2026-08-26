import { TOTAL_QUESTIONS } from './constants'
import { QUESTION_BY_ID } from './data'
import { buildDynamicChoices } from './matching'
import {
  applyOption,
  applyRiasec,
  clampAiLevel,
  emptyScore,
  hashAnswers,
  sortedRiasec,
} from './scoring'
import type { Answer, OptionKey, Question, UserScore } from './types'

/** §4 유저 플로우: 5(공통) + 7(분기) + 2(RIASEC 심화) + 3(공통) + 3(최종 보정) */
function nextQuestionId(ids: string[], score: UserScore): string | null {
  const n = ids.length
  const branch = score.branch ?? 'A'

  if (n < 5) return `Q${n + 1}` // Q1~Q5
  if (n < 12) return `Q${n + 1}-${branch}` // Q6-X ~ Q12-X
  if (n === 12) return `Q13-${sortedRiasec(score)[0]}`
  if (n === 13) {
    // Q14는 Q13에서 정해진 코스를 그대로 이어간다.
    const code = ids[12].split('-')[1]
    return `Q14-${code}`
  }
  if (n === 14) return 'Q15'
  if (n === 15) return 'Q16'
  if (n === 16) return 'Q17'
  if (n === 17) {
    const lv = clampAiLevel(score.aiLevel)
    if (lv >= 4) return 'Q18-α'
    if (lv >= 2) return 'Q18-β'
    return 'Q18-γ'
  }
  if (n === 18) return 'Q19'
  if (n === 19) return 'Q20'
  return null
}

/** Q19는 누적 RIASEC으로 선지를 만들어야 해서 여기서 조립한다. */
export function resolveQuestion(id: string, score: UserScore): Question | null {
  const base = QUESTION_BY_ID[id]
  if (!base) return null
  if (id !== 'Q19') return base

  const careers = buildDynamicChoices(score)
  const keys: OptionKey[] = ['A', 'B', 'C', 'D']
  return {
    ...base,
    // 시트 원문의 "（累積RIASECに基づき4択を動的生成）" 같은 운영 메모는 화면에서 뺀다.
    questionKr: base.questionKr.replace(/\s*[（(].*?[)）]\s*$/, ''),
    questionJp: base.questionJp.replace(/\s*[（(].*?[)）]\s*$/, ''),
    options: careers.map((c, i) => ({
      key: keys[i],
      textKr: c.nameKr,
      textJp: c.nameJp,
      riasec: null,
      aptitude: null,
      ai: null,
      etc: null,
      careerNumber: c.number,
      careerRiasec: c.riasec,
    })),
  }
}

function applyAnswer(score: UserScore, question: Question, answer: Answer): void {
  const option = question.options.find((o) => o.key === answer.optionKey)
  if (!option) return
  // Q19에서 고른 직업은 그 직업의 RIASEC 두 코드를 한 점씩 밀어준다.
  // (applyOption보다 먼저 읽어 두 번 반영되지 않게 한다)
  const code = option.careerRiasec
  applyOption(score, option)
  if (code && code.length >= 2) {
    applyRiasec(score, `${code[0]}+1,${code[1]}+1`)
  }
}

export interface QuizPlan {
  /** 지금까지 확정된 문항 ID + 현재 문항 ID */
  ids: string[]
  /** 현재 보여줄 문항 (동적 선지까지 해석 완료). 끝났으면 null */
  current: Question | null
  /** 현재 문항의 0-based 인덱스 */
  index: number
  total: number
  score: UserScore
  done: boolean
}

/**
 * 답변 배열만으로 전체 진행 상태를 다시 계산한다.
 * 순수 함수라 뒤로가기·새로고침 후에도 같은 경로가 나온다.
 */
export function planQuiz(answers: Answer[]): QuizPlan {
  const score = emptyScore()
  const ids: string[] = []

  for (let step = 0; step < TOTAL_QUESTIONS; step += 1) {
    const id = nextQuestionId(ids, score)
    if (!id) break

    const question = resolveQuestion(id, score)
    if (!question) break
    ids.push(id)

    if (step >= answers.length) {
      return { ids, current: question, index: step, total: TOTAL_QUESTIONS, score, done: false }
    }

    // 저장된 답이 현재 문항과 어긋나면(시트 수정 등) 거기서부터 다시 받는다.
    const answer = answers[step]
    if (answer.questionId !== id) {
      return { ids, current: question, index: step, total: TOTAL_QUESTIONS, score, done: false }
    }
    applyAnswer(score, question, answer)
    score.seed = hashAnswers(answers.slice(0, step + 1))
  }

  return {
    ids,
    current: null,
    index: TOTAL_QUESTIONS,
    total: TOTAL_QUESTIONS,
    score,
    done: true,
  }
}
