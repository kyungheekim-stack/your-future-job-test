/**
 * 참가자 수 "연출" 카운터.
 *
 * 실제 집계가 아니다. 이 앱은 DB·API 없이 전부 정적 배포라 진짜 카운터를 둘 수 없어서,
 * 기준 시각(EPOCH)으로부터 흐른 시간에 비례해 증가하는 값을 보여준다.
 *
 * 시계 기반이라 얻는 성질:
 *  - 단조 증가한다 (새로고침해도 숫자가 뒤로 가지 않는다)
 *  - 같은 순간에 접속한 모든 사람이 같은 숫자를 본다
 *  - 서버가 필요 없다
 *
 * 나중에 실제 집계로 바꾸려면 이 파일의 liveParticipantCount() 만
 * API 호출로 교체하면 화면 코드는 그대로 쓸 수 있다.
 */

const num = (v: string | undefined, fallback: number): number => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

/** 기준 시각의 누적 참가자 수 */
export const PARTICIPANT_BASE = Math.max(
  0,
  Math.round(num(process.env.NEXT_PUBLIC_PARTICIPANT_COUNT, 0)),
)

/** 위 숫자가 정확했던 시각 (ISO). 비면 증가하지 않고 BASE 로 고정된다. */
const EPOCH_MS = (() => {
  const raw = process.env.NEXT_PUBLIC_PARTICIPANT_EPOCH
  if (!raw) return null
  const t = Date.parse(raw)
  return Number.isFinite(t) ? t : null
})()

/** 시간당 증가 수 */
const PER_HOUR = Math.max(0, num(process.env.NEXT_PUBLIC_PARTICIPANT_PER_HOUR, 0))

/** 표시 자릿수 (시안이 00000 이라 5자리 제로패딩) */
export const PARTICIPANT_DIGITS = 5

/**
 * 지금 보여줄 참가자 수.
 * 설정이 없으면 BASE 그대로라, 아무것도 안 넣으면 00000 이 나온다.
 */
export function liveParticipantCount(now: number = Date.now()): number {
  if (EPOCH_MS === null || PER_HOUR === 0) return PARTICIPANT_BASE
  const hours = Math.max(0, (now - EPOCH_MS) / 3_600_000)
  return PARTICIPANT_BASE + Math.floor(hours * PER_HOUR)
}

/** 설정이 하나도 없으면 표시 자체를 접기 위한 플래그 */
export const PARTICIPANT_ENABLED =
  PARTICIPANT_BASE > 0 || (EPOCH_MS !== null && PER_HOUR > 0)

/** 00000 (시안의 자리표시 형태) */
export function formatParticipants(n: number): string {
  return String(Math.max(0, Math.round(n))).padStart(PARTICIPANT_DIGITS, '0')
}

/** 1,408 (로딩 화면 뱃지용) */
export function formatParticipantsComma(n: number): string {
  return Math.max(0, Math.round(n)).toLocaleString('ja-JP')
}
