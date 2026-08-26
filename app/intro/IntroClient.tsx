'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import CrystalBall from '@/components/CrystalBall'
import { loadSession } from '@/lib/session'

const DWELL = 2600

/** 시안(loading.png). 이름 입력 다음에 잠깐 보여주고 자동으로 퀴즈로 넘긴다. */
export default function IntroClient() {
  const router = useRouter()

  useEffect(() => {
    if (!loadSession().name) {
      router.replace('/')
      return
    }
    // 다음 화면을 미리 받아 두면 전환이 끊기지 않는다.
    router.prefetch('/quiz')
    const timer = setTimeout(() => router.replace('/quiz'), DWELL)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <main className="flex min-h-dvh flex-col bg-intro-bg px-5 pb-8 pt-[102px]">
      <div className="animate-fade-up flex flex-1 flex-col">
        <h1 className="text-center text-[28.5px] font-black leading-[41px] tracking-[-0.01em] text-intro-ink">
          これから君のことを
          <br />
          聞いていくよ、
          <br />
          正直に答えてね！…🔍
        </h1>

        <div className="mt-[60px] flex justify-center">
          <CrystalBall className="w-[138px] animate-float" priority />
        </div>

        <p className="mt-[46px] text-center text-[19px] font-medium text-intro-say">
          正直に答えてくださいね！
        </p>

        <div className="flex-1" />
      </div>
    </main>
  )
}
