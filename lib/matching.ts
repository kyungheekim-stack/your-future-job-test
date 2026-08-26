import { CAREERS, findCareerByName } from './data'
import {
  APTITUDE_AFFINITY,
  CANONICAL_BONUS,
  FREELANCER_CAREERS,
  HINT_CAREERS,
  Q19_PICK_BONUS,
  TYPE_COMPAT,
} from './constants'
import {
  applyBranchCorrections,
  clampAiLevel,
  sortedRiasec,
  tieBreaker,
  topAptitude,
} from './scoring'
import type { Career, MatchResult, MatchedCareer, UserScore } from './types'

/**
 * (RIASEC, AI유형) 클러스터마다 가장 앞 번호의 직업을 "대표"로 둔다.
 * 문항 데이터만으로는 같은 클러스터 안의 직업(셰프/초밥 장인/목수 …)을
 * 가를 신호가 없어서, 대표에 소폭 가산해 설계 문서의 예시 매칭을 따라가게 한다.
 */
const CANONICAL: Set<number> = (() => {
  const best = new Map<string, number>()
  for (const c of CAREERS) {
    const key = `${c.riasec}|${c.aiTypeKr}`
    const cur = best.get(key)
    if (cur === undefined || c.number < cur) best.set(key, c.number)
  }
  return new Set(best.values())
})()

function hintedNumbers(hints: string[]): Set<number> {
  const set = new Set<number>()
  for (const hint of hints) {
    for (const n of HINT_CAREERS[hint] ?? []) set.add(n)
  }
  return set
}

/**
 * §5-3 매칭 알고리즘.
 * 브리프의 기본 공식(RIASEC 일치도 + AI 궁합 + 보정 플래그)에
 * Q13/Q14 직업군 힌트와 적성 친화도를 소폭 가산으로 얹었다.
 */
export function scoreCareers(rawScore: UserScore): MatchedCareer[] {
  const score = applyBranchCorrections(rawScore)
  const ranked = sortedRiasec(score)
  const top2 = new Set<string>([ranked[0], ranked[1]])
  const riasecCode = `${ranked[0]}${ranked[1]}`
  const apt = topAptitude(score)
  const aiLv = clampAiLevel(score.aiLevel)
  const compat = TYPE_COMPAT[aiLv]
  const hinted = hintedNumbers(score.flags.hints)
  const affinity = APTITUDE_AFFINITY[apt]
  const f = score.flags

  const matches = (c: Career) => top2.has(c.riasec[0]) || top2.has(c.riasec[1])

  const pool = CAREERS.filter(matches)
  const base = pool.length > 0 ? pool : CAREERS

  return base
    .map<MatchedCareer>((c) => {
      let s = 0

      // 1. RIASEC 일치도
      const bothMatch = top2.has(c.riasec[0]) && top2.has(c.riasec[1])
      s += bothMatch ? 10 : 5
      // 주코드 순서까지 같으면 한 번 더 가산
      if (c.riasec === riasecCode) s += 3

      // 2. AI 궁합
      if (compat.prefer.includes(c.aiTypeKr)) s += 8
      else if (compat.ok.includes(c.aiTypeKr)) s += 4
      else if (compat.avoid.includes(c.aiTypeKr)) s -= 5

      // 3. 보정 플래그
      if (f.mugwanBonus && c.aiTypeKr === 'AI 무관형') s += 3
      if (f.futureBonus && c.aiTypeKr === '미래신생형') s += 3
      if (f.symbioticBonus && c.aiTypeKr === 'AI 공생형') s += 3
      if (f.augmentedBonus && c.aiTypeKr === 'AI 강화형') s += 3
      if (f.freelancerBonus && FREELANCER_CAREERS.has(c.number)) s += 2
      if (f.riskAvoid && c.aiTypeKr === 'AI 대체위험형') s -= 6

      // 4. Q13/Q14 세부 직업군 힌트
      if (hinted.has(c.number)) s += 3

      // 5. 적성 친화도
      if (affinity.some((code) => c.riasec.includes(code))) s += 2

      // ── 여기까지가 Q1~Q18 이 만드는 정수 점수. 아래는 전부 소수점 이하라
      //    정수 차이를 절대 뒤집지 못하고 동점일 때만 순서를 정한다.
      //    (자세한 배분은 constants.ts 의 Q19_PICK_BONUS 주석 참고)

      // 6. Q19에서 직접 고른 직업 — 동점 시 가장 먼저 이긴다
      if (score.pickedCareer === c.number) s += Q19_PICK_BONUS

      // 7. 같은 클러스터의 대표 직업
      if (CANONICAL.has(c.number)) s += CANONICAL_BONUS

      // 8. 그래도 남는 동점은 답변 조합 해시로 갈라준다 (같은 답변 → 같은 결과)
      s += tieBreaker(score.seed, c.number)

      return { ...c, matchScore: s }
    })
    .sort((a, b) => b.matchScore - a.matchScore || a.number - b.number)
}

/** 직업풀 시트의 서브추천 열을 우선 쓰고, 모자라면 알고리즘 차순위로 채운다. */
function resolveSubs(main: Career, ranked: MatchedCareer[]): Career[] {
  const subs: Career[] = []
  const used = new Set<number>([main.number])

  for (let i = 0; i < main.subsJp.length; i += 1) {
    const found =
      findCareerByName(main.subsJp[i]) ?? findCareerByName(main.subsKr[i] ?? '')
    if (found && !used.has(found.number)) {
      subs.push(found)
      used.add(found.number)
    }
  }

  for (const c of ranked) {
    if (subs.length >= 3) break
    if (used.has(c.number)) continue
    subs.push(c)
    used.add(c.number)
  }

  return subs.slice(0, 3)
}

export function matchCareer(rawScore: UserScore): MatchResult {
  const score = applyBranchCorrections(rawScore)
  const ranked = scoreCareers(rawScore)
  const main = ranked[0]

  return {
    main,
    subs: resolveSubs(main, ranked),
    riasecCode: sortedRiasec(score).slice(0, 2).join(''),
    topAptitude: topAptitude(score),
    aiLevel: clampAiLevel(score.aiLevel),
  }
}

/**
 * Q19 동적 선지: 누적 RIASEC 기준 상위 후보에서 AI 유형이 겹치지 않게 4개를 뽑는다.
 * 유형이 다양해야 마지막 문항이 실제로 결과를 갈라놓는 역할을 한다.
 */
export function buildDynamicChoices(score: UserScore): Career[] {
  const ranked = scoreCareers(score)
  const picked: Career[] = []
  const usedTypes = new Set<string>()

  for (const c of ranked) {
    if (picked.length >= 4) break
    if (usedTypes.has(c.aiTypeKr)) continue
    picked.push(c)
    usedTypes.add(c.aiTypeKr)
  }
  for (const c of ranked) {
    if (picked.length >= 4) break
    if (picked.some((p) => p.number === c.number)) continue
    picked.push(c)
  }
  return picked.slice(0, 4)
}
