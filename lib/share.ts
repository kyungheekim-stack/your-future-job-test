import { CAREER_BY_NUMBER, findCareerByName } from './data'
import type { Career, MatchResult } from './types'

/**
 * 공유 링크.
 *
 * 결과는 sessionStorage 에만 있어서, 링크를 그대로 보내면 받은 사람은
 * 아무것도 못 본다(세션이 없으니 홈으로 튕긴다). 그래서 결과를 링크에 실어 보낸다.
 * DB 없이 정적 배포만으로 공유가 되고, 링크 하나로 카드가 그대로 재현된다.
 *
 *   c = 직업 번호   (필수. 이것만으로 카드·상세를 전부 되살릴 수 있다)
 *   n = 이름        (「HEEの未来の職業はこれです！」 헤드라인용)
 *   d = 1 이면 상세 공개
 *
 * d 는 "공유한 사람이 가입자였는지"다. 시안 4종 중 공유 페이지 2종이
 * 각각 블러/선명으로 갈리는 기준이 받는 사람이 아니라 보낸 사람이라서다.
 */
export const SHARE_PARAM = {
  career: 'c',
  name: 'n',
  detail: 'd',
  /** 'own' 이면 테스트를 풀지 않아도 '본인' 화면으로 그린다 (시안 확인용) */
  view: 'view',
  /** 1 이면 가입 완료 상태 */
  member: 'm',
} as const

export function buildShareUrl(
  origin: string,
  careerNumber: number,
  name: string,
  detailUnlocked: boolean,
): string {
  const params = new URLSearchParams({ [SHARE_PARAM.career]: String(careerNumber) })
  if (name) params.set(SHARE_PARAM.name, name)
  if (detailUnlocked) params.set(SHARE_PARAM.detail, '1')
  return `${origin}/result?${params.toString()}`
}

/**
 * 직업 번호만으로 결과를 되살린다.
 * 상세 화면이 쓰는 값은 main 과 subs 뿐이라 점수 계산 없이 복원할 수 있다.
 * 나머지 필드는 타입을 맞추기 위한 자리값이라 화면에 나오지 않는다.
 */
export function resultFromCareerNumber(careerNumber: number): MatchResult | null {
  const main = CAREER_BY_NUMBER[careerNumber]
  if (!main) return null

  const subs = main.subsJp
    .map((n) => findCareerByName(n))
    .filter((c): c is Career => Boolean(c))

  return {
    main: { ...main, matchScore: 0 },
    subs,
    riasecCode: main.riasec,
    topAptitude: '논리분석',
    aiLevel: 3,
  }
}
