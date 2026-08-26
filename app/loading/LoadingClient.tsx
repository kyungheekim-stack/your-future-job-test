'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { planQuiz } from '@/lib/flow'
import { loadSession } from '@/lib/session'

const DURATION = 2600

export default function LoadingClient({ participants }: { participants: number }) {
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

  const R = 78
  const circumference = 2 * Math.PI * R

  return (
    <main className="loading-bg flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="animate-fade-up flex flex-col items-center">
        <div className="relative h-[196px] w-[196px]">
          <svg viewBox="0 0 196 196" className="h-full w-full -rotate-90">
            <circle cx="98" cy="98" r={R} fill="none" stroke="#FFFFFF" strokeWidth="14" />
            <circle
              cx="98"
              cy="98"
              r={R}
              fill="none"
              stroke="#3B7DD8"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - pct / 100)}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <span className="text-[34px] font-black text-accent">{pct}%</span>
          </div>
        </div>

        <h1 className="mt-9 text-[26px] font-black text-ink">全部わかったよ！</h1>
        <p className="mt-2 text-[15px] font-medium text-muted">
          もうすぐ未来を見せるね…！
        </p>

        {participants > 0 && (
          <p className="mt-10 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-accent shadow-soft">
            これまでに {participants.toLocaleString('ja-JP')} 人が診断しました
          </p>
        )}
      </div>
    </main>
  )
}
