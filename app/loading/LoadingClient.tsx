'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ParticipantCount from '@/components/ParticipantCount'
import { planQuiz } from '@/lib/flow'
import { PARTICIPANT_ENABLED } from '@/lib/participants'
import { loadSession } from '@/lib/session'

const DURATION = 2600

/**
 * §6-4 결과 로딩. 2차 시안(result-loading_new.gif) 기준으로 다시 그렸다.
 * 링은 회색 트랙 + 하늘색 진행(#82C0F9), 가운데 퍼센트, 그 아래 2줄 문구,
 * 맨 아래 연한 파란 뱃지에 참가자 수. 문구 톤은 다른 화면(정중체)에 맞춰 뒀다.
 */
export default function LoadingClient() {
  const router = useRouter()
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const stored = loadSession()
    // 답이 모자라면 결과를 만들 수 없으니 되돌린다.
    if (!stored.name) {
      router.replace('/')
      return
    }
    if (!planQuiz(stored.answers).done) {
      router.replace('/quiz')
      return
    }

    const start = performance.now()
    let raf = 0
    let done = false
    const finish = () => {
      if (done) return
      done = true
      setPct(100)
      router.replace('/result')
    }
    const tick = (now: number) => {
      const ratio = Math.min(1, (now - start) / DURATION)
      setPct(Math.round(ratio * 100))
      if (ratio < 1) raf = requestAnimationFrame(tick)
      else finish()
    }
    raf = requestAnimationFrame(tick)
    // 탭이 백그라운드면 rAF 가 멈춰 결과로 못 넘어간다. 타이머로 반드시 넘긴다.
    const fallback = setTimeout(finish, DURATION + 400)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(fallback)
    }
  }, [router])

  const R = 104
  const circumference = 2 * Math.PI * R

  return (
    <main className="loading-bg flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="animate-fade-up flex flex-col items-center">
        <div className="relative h-[240px] w-[240px]">
          <svg viewBox="0 0 240 240" className="h-full w-full -rotate-90">
            <circle cx="120" cy="120" r={R} fill="none" stroke="#DBDCDE" strokeWidth="16" />
            <circle
              cx="120"
              cy="120"
              r={R}
              fill="none"
              stroke="#82C0F9"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - pct / 100)}
              style={{ transition: 'stroke-dashoffset 80ms linear' }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <span className="text-[40px] font-black tracking-[-0.02em] text-[#464A65]">
              {pct}%
            </span>
          </div>
        </div>

        <h1 className="mt-7 text-[26px] font-black tracking-[-0.01em] text-[#30344F]">
          全部わかりました！
        </h1>
        <p className="mt-3 text-[16px] font-medium leading-[26px] text-[#6A6E89]">
          もうすぐ未来を
          <br />
          お見せしますね…！
        </p>

        {PARTICIPANT_ENABLED && (
          <p className="mt-12 rounded-[16px] bg-[#DCEBFF] px-6 py-3 text-[13px] font-medium leading-[21px] text-[#3C5B8C]">
            今このテストに
            <br />
            <ParticipantCount format="comma" />人が参加しています
          </p>
        )}
      </div>
    </main>
  )
}
