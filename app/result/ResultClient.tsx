'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type RefObject } from 'react'
import CharacterImage from '@/components/CharacterImage'
import { planQuiz } from '@/lib/flow'
import { matchCareer } from '@/lib/matching'
import { loadSession } from '@/lib/session'
import type { Career, MatchResult } from '@/lib/types'
import ResultDetail from './ResultDetail'

/** 캡처가 끝나지 않는 환경에서도 버튼이 「保存中…」로 굳지 않게 한다. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms)
    promise.then(
      (v) => {
        clearTimeout(timer)
        resolve(v)
      },
      (e) => {
        clearTimeout(timer)
        reject(e)
      },
    )
  })
}

export default function ResultClient() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [result, setResult] = useState<MatchResult | null>(null)
  /** 가입 전에는 상세를 blur 로 잠가 둔다 */
  const [unlocked, setUnlocked] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const stored = loadSession()
    if (!stored.name) {
      router.replace('/')
      return
    }
    const plan = planQuiz(stored.answers)
    if (!plan.done) {
      router.replace('/quiz')
      return
    }
    setName(stored.name)
    setResult(matchCareer(plan.score))
  }, [router])

  const unlock = () => {
    setUnlocked(true)
    // rAF 는 백그라운드 탭에서 멈추므로 타이머로 돌린다.
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
  }

  const shareLink = async () => {
    const url = window.location.href
    const title = result ? `${name}の未来の職業は「${result.main.nameJp}」です` : document.title
    try {
      if (navigator.share) {
        await navigator.share({ title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setToast('リンクをコピーしました')
    } catch {
      // 사용자가 공유 시트를 닫은 경우까지 오류로 알리지 않는다.
    }
  }

  const saveCard = async () => {
    if (!cardRef.current || saving) return
    setSaving(true)
    setToast(null)
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await withTimeout(
        toPng(cardRef.current, {
          pixelRatio: 2,
          cacheBust: true,
          backgroundColor: '#FFFFFF',
          // 일본어 웹폰트를 통째로 base64 인라인하면 캡처가 멈춘다(30MB).
          skipFonts: true,
        }),
        15000,
      )
      const link = document.createElement('a')
      link.download = `socra-career-${result?.main.number ?? 'card'}.png`
      link.href = dataUrl
      link.click()
    } catch {
      setToast('保存できませんでした。カードを長押しして保存してください。')
    } finally {
      setSaving(false)
    }
  }

  if (!result) {
    return (
      <main className="result-bg grid min-h-dvh place-items-center px-6">
        <p className="font-plex text-[12px] text-[#555]">結果を準備しています…</p>
      </main>
    )
  }

  return (
    <main className="result-bg flex min-h-dvh flex-col font-plex">
      <div className="px-4 pt-[18px]">
        <button
          type="button"
          onClick={() => router.push('/')}
          aria-label="戻る"
          className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full transition active:opacity-60"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/icon-back.svg" alt="" aria-hidden className="h-[26px] w-[26px]" />
        </button>
      </div>

      <div className="animate-fade-up flex flex-1 flex-col">
        <h1 className="mt-[10px] text-center text-[26px] font-semibold leading-[34px] text-[#464A65]">
          {name}の
          <br />
          未来の職業はこれです！
        </h1>

        <HeroCard cardRef={cardRef} career={result.main} />

        <ActionRow onShare={shareLink} onSave={saveCard} saving={saving} />
        {toast && <p className="mt-2 px-6 text-center text-[10.5px] text-[#5D617C]">{toast}</p>}

        <div ref={detailRef} className="mt-[22px] px-4">
          {unlocked ? (
            <ResultDetail result={result} />
          ) : (
            <LockedPreview result={result} onUnlock={unlock} />
          )}
        </div>

        <Footer />
      </div>
    </main>
  )
}

/* ── 히어로 카드 (캡처 대상) ─────────────────────────────── */

function HeroCard({
  cardRef,
  career,
}: {
  cardRef: RefObject<HTMLDivElement>
  career: Career
}) {
  return (
    <div className="mt-[26px] px-[41px]">
      {/* 시안: 라운드 40(→16px), 흰 테두리 18(→7px), 하단 패딩 48(→19px) */}
      <div ref={cardRef} className="rounded-[16px] bg-white p-[7px] pb-[19px]">
        <div className="flex items-center justify-between px-[2px] pb-[7px] pt-[3px]">
          <span className="rounded-[16px] bg-[#3A82DB] px-[13px] py-[6px] font-inter text-[13.5px] font-semibold leading-none text-white">
            {career.probJp}
          </span>
          <span
            className="pr-[3px] font-inter text-[20px] leading-none tracking-[0.06em] text-[#F5B041]"
            aria-label={career.rarity}
          >
            {'★'.repeat(career.rarityStars)}
            <span className="text-[#E2E5EA]">{'★'.repeat(5 - career.rarityStars)}</span>
          </span>
        </div>

        {/* 캐릭터: 후광(원+광선) 위에 얹는다. 높이 720 → 287px */}
        <div className="relative h-[287px] w-full overflow-hidden rounded-[10px] bg-gradient-to-br from-[#DADAE2] to-[#B3E0FF]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/halo.svg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 w-[125%] -translate-x-1/2 -translate-y-1/2 opacity-70"
          />
          <CharacterImage
            number={career.number}
            riasec={career.riasec}
            alt={career.nameJp}
            className="relative h-full w-full object-contain"
          />
        </div>

        <div className="mt-[13px] flex justify-center px-[8px]">
          <span className="w-full rounded-[6px] bg-gradient-to-r from-[#2766C4] to-[#0E2759] px-3 py-[9px] text-center font-inter text-[18px] font-semibold leading-tight text-white">
            {career.nameJp}
          </span>
        </div>

        <p className="mt-[11px] px-3 text-center text-[16px] font-semibold leading-[22px] text-[#555]">
          {career.descJp}
        </p>

        <div className="mt-[14px] flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo.svg" alt="SOCRA Tutor" className="h-[11px] w-auto" />
        </div>
      </div>
    </div>
  )
}

/* ── 공유 / 저장 ─────────────────────────────────────────── */

function ActionRow({
  onShare,
  onSave,
  saving,
}: {
  onShare: () => void
  onSave: () => void
  saving: boolean
}) {
  return (
    <div className="mt-[22px] flex items-center justify-center gap-9 text-[#777B96]">
      <button type="button" onClick={onShare} className="flex items-center gap-2 active:opacity-60">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/icon-share.png" alt="" aria-hidden className="h-[18px] w-[18px]" />
        <span className="text-[12.8px] tracking-[-2px] underline underline-offset-[5px]">リンク共有</span>
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-1.5 active:opacity-60 disabled:opacity-60"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/icon-download.svg" alt="" aria-hidden className="h-[21px] w-[21px]" />
        <span className="text-[12.8px] tracking-[-2px] underline underline-offset-[5px]">
          {saving ? '保存中…' : 'カードを保存する'}
        </span>
      </button>
    </div>
  )
}

/* ── 가입 전 잠금 미리보기 ───────────────────────────────── */

function LockedPreview({ result, onUnlock }: { result: MatchResult; onUnlock: () => void }) {
  return (
    <div className="relative">
      {/* 시안: 상세를 blur(10px) 로 흐리게 깔아 "더 있다"를 보여준다 */}
      <div
        aria-hidden
        className="pointer-events-none max-h-[230px] select-none overflow-hidden blur-[10px]"
      >
        <ResultDetail result={result} />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#EAF3FE]" />

      <div className="absolute inset-x-0 top-[26px] flex flex-col items-center">
        <div className="relative rounded-[11px] bg-[#021439] px-[11px] py-[6px] text-[13px] font-semibold leading-[15px] text-white">
          登録して詳細を見ましょう
          {/* 에셋의 삼각형은 위를 향하고 있어 아래를 가리키도록 뒤집는다 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/tooltip-arrow.svg"
            alt=""
            aria-hidden
            className="absolute left-1/2 top-full h-[7px] w-[15px] -translate-x-1/2 rotate-180"
          />
        </div>

        <button
          type="button"
          onClick={onUnlock}
          className="signup-cta mt-[13px] flex h-[68px] w-[calc(100%-36px)] items-center justify-center gap-[7px] rounded-[13.5px] text-white shadow-[0_10px_24px_rgba(78,159,243,0.35)] transition active:scale-[0.99]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-footer.svg" alt="SOCRA Tutor" className="h-[14px] w-auto" />
          <span className="text-[17px] font-semibold">に登録する</span>
        </button>
      </div>
    </div>
  )
}

/* ── 푸터 ────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="mt-9 bg-[#060E20] px-[38px] pb-14 pt-[38px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/logo-footer.svg" alt="SOCRA Tutor" className="h-[12px] w-auto" />
      <p className="mt-[22px] text-[11px] leading-[22px] tracking-[-0.41px] text-[#B5B7C6]">
        会社名：株式会社Socra AI | 代表取締役：Park Suyeong | Webサイト：corp.socra.ai |
        お問い合わせ：contact@socra.ai | 所在地：〒104-0061 東京都中央区銀座6丁目10-1 GINZA SIX
        13F WeWork
      </p>
    </footer>
  )
}
