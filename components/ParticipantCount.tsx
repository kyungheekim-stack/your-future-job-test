'use client'

import { useEffect, useState } from 'react'
import {
  PARTICIPANT_BASE,
  PARTICIPANT_DIGITS,
  formatParticipants,
  formatParticipantsComma,
  liveParticipantCount,
} from '@/lib/participants'

/** 마운트 직후 숫자가 올라가는 연출 길이 */
const ROLL_MS = 1100
const ROLL_STEP_MS = 55

/**
 * 참가자 수 표시.
 *
 * 서버(정적 프리렌더)에서는 자릿수만 맞춘 자리표시자를 그린다.
 * 시간에 따라 값이 달라지므로 서버에서 실제 값을 그리면 하이드레이션이 어긋나고,
 * 어차피 정적 HTML 은 캐시돼서 옛날 숫자가 굳어버린다.
 *
 * format: padded = 01408 (인트로, 시안 형태) / comma = 1,408 (로딩 뱃지)
 */
export default function ParticipantCount({
  format = 'padded',
}: {
  format?: 'padded' | 'comma'
}) {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const target = liveParticipantCount()
    // 살짝 아래에서 target 까지 굴려 올려 "지금 늘고 있다"는 인상을 준다.
    const from = Math.max(PARTICIPANT_BASE, target - 40)
    const started = Date.now()

    // rAF 는 백그라운드 탭에서 멈추므로 타이머로 돌린다.
    const roll = setInterval(() => {
      const p = Math.min(1, (Date.now() - started) / ROLL_MS)
      // ease-out
      const eased = 1 - (1 - p) ** 3
      setCount(Math.round(from + (target - from) * eased))
      if (p >= 1) clearInterval(roll)
    }, ROLL_STEP_MS)

    // 굴러 올라간 뒤에는 실제 시각을 따라간다.
    const tick = setInterval(() => setCount(liveParticipantCount()), 1000)

    return () => {
      clearInterval(roll)
      clearInterval(tick)
    }
  }, [])

  const fmt = format === 'comma' ? formatParticipantsComma : formatParticipants
  // 하이드레이션 전에는 자릿수만 맞춘 자리표시자를 보여준다.
  const placeholder = format === 'comma' ? '0' : '0'.repeat(PARTICIPANT_DIGITS)

  return (
    <span suppressHydrationWarning>{count === null ? placeholder : fmt(count)}</span>
  )
}
