'use client'

import { useRouter } from 'next/navigation'
import CrystalBall from '@/components/CrystalBall'

/**
 * §6-1 홈. 시안(home.png) 그대로: 뱃지 → 헤드라인 → 각주 → 크리스탈볼 → CTA.
 * 크기·간격은 시안(1080px 기준)을 shell 폭 430px 으로 환산해 맞췄다.
 */
export default function LandingClient() {
  const router = useRouter()

  return (
    <main className="home-bg flex min-h-dvh flex-col px-5 pb-8 pt-[68px]">
      <div className="animate-fade-up flex flex-1 flex-col">
        <div className="flex justify-center">
          <span className="rounded-full bg-intro-badge px-[23px] py-[10px] text-[14px] font-bold tracking-[0.01em] text-white">
            性格と可能性から、未来を見通す
          </span>
        </div>

        <h1 className="mt-3 text-center text-[33px] font-black leading-[47px] tracking-[-0.01em] text-intro-ink">
          将来の職業、
          <br />
          気にならない？
          <br />
          2分でわかる。
        </h1>

        <p className="mt-[22px] text-center text-[10px] leading-[17px] text-intro-note">
          *このテストはWEF Future of Jobs 2025、OECD AI &amp; Employment、
          <br />
          Holland RIASEC·ONETをもとに設計されています。*
        </p>

        <div className="flex flex-1 items-center justify-center py-4">
          <CrystalBall className="w-[186px]" priority />
        </div>

        <button
          type="button"
          onClick={() => router.push('/name')}
          className="h-[80px] w-full rounded-[20px] bg-intro-cta text-[19px] font-bold text-white transition active:scale-[0.99]"
        >
          今すぐ自分の未来をのぞく
        </button>
      </div>
    </main>
  )
}
