'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import CharacterImage from '@/components/CharacterImage'
import { planQuiz } from '@/lib/flow'
import { LANDING_URL, REGISTER_URL } from '@/lib/links'
import { matchCareer } from '@/lib/matching'
import { clearSession, loadSession } from '@/lib/session'
import { buildShareUrl, resultFromCareerNumber, SHARE_PARAM } from '@/lib/share'
import type { Career, MatchResult } from '@/lib/types'
import ResultDetail from './ResultDetail'

/**
 * 결과 화면. 시안의 카드 4종을 이 한 페이지로 처리한다.
 *
 *            상세      카드 밑 링크        플로팅 CTA
 *   본인·비회원  블러   テストをもう一度    登録する + 結果をシェア
 *   본인·가입    공개   カードを保存する    結果をシェア
 *   공유·비회원  블러   ―                  未来の仕事をチェック
 *   공유·가입    공개   ―                  未来の仕事をチェック
 *
 * 공유 페이지의 블러 여부는 "받는 사람"이 아니라 "보낸 사람"이 가입자였는지로 갈린다.
 * 가입자가 보낸 링크는 상세가 다 보여서, 받은 사람이 "나도 해볼까"가 되는 구조다.
 */

type Viewer = 'owner' | 'shared'

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
  const [viewer, setViewer] = useState<Viewer>('owner')
  /** 앱 웹뷰가 ?m=1 로 알려 주는 가입 여부 */
  const [isMember, setIsMember] = useState(false)
  /** 상세를 펼쳤는지. 비회원이면 블러로 잠가 둔다. */
  const [detailOpen, setDetailOpen] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    // useSearchParams 를 쓰면 Suspense 경계가 강제돼 정적 프리렌더가 깨진다.
    // 어차피 클라이언트에서만 필요한 값이라 location 에서 직접 읽는다.
    const query = new URLSearchParams(window.location.search)
    const shared = Number(query.get(SHARE_PARAM.career))

    if (shared) {
      const restored = resultFromCareerNumber(shared)
      if (!restored) {
        router.replace('/')
        return
      }
      // view=own 이면 테스트를 풀지 않아도 '본인' 화면을 그린다.
      // 시안 4종을 URL 만으로 확인하려고 열어 둔 통로다 (결과 카드 외에는 아무것도 노출하지 않는다).
      const asOwner = query.get(SHARE_PARAM.view) === 'own'
      const member = query.get(SHARE_PARAM.member) === '1'
      setViewer(asOwner ? 'owner' : 'shared')
      setIsMember(asOwner && member)
      setName(query.get(SHARE_PARAM.name) ?? '')
      setDetailOpen(asOwner ? member : query.get(SHARE_PARAM.detail) === '1')
      setResult(restored)
      return
    }

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
    const member = query.get(SHARE_PARAM.member) === '1'
    setViewer('owner')
    setName(stored.name)
    setIsMember(member)
    setDetailOpen(member)
    setResult(matchCareer(plan.score))
  }, [router])

  const openDetail = useCallback(() => {
    setDetailOpen(true)
    // rAF 는 백그라운드 탭에서 멈추므로 타이머로 돌린다.
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
  }, [])

  const goRegister = () => {
    // TODO: 유저 플로우상 여기서 설문 결과를 서버로 먼저 보낸다.
    if (!REGISTER_URL) {
      // 링크가 아직 없으면(프리뷰) 이동 대신 그 자리에서 상세를 펼쳐 화면을 확인한다.
      openDetail()
      return
    }
    window.location.href = REGISTER_URL
  }

  const shareLink = async () => {
    if (!result) return
    const url = buildShareUrl(
      window.location.origin,
      result.main.number,
      name,
      detailOpen,
    )
    const title = `${name}の未来の職業は「${result.main.nameJp}」です`
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

  const retake = () => {
    clearSession()
    router.push('/')
  }

  if (!result) {
    return (
      <main className="result-bg grid min-h-dvh place-items-center px-6">
        <p className="font-plex text-[12px] text-[#555]">結果を準備しています…</p>
      </main>
    )
  }

  const showTwoButtons = viewer === 'owner' && !detailOpen

  return (
    <main className="flex min-h-dvh flex-col bg-white font-plex">
      <div
        className="animate-fade-up flex flex-1 flex-col"
        style={{ paddingBottom: showTwoButtons ? 176 : 132 }}
      >
        {/* 히어로 구간. 그라디언트를 <main> 전체가 아니라 이 블록에만 건다.
            (전체에 걸면 페이지 길이에 따라 퍼져서 거의 단색으로 보인다) */}
        <section className={detailOpen ? 'hero-pink' : 'hero-blue'}>
          <Header />
          {/* 시안: 65px SemiBold #464A65 / 줄간격 1.25 / 자간 -1.95 */}
          <h1 className="mt-[44px] text-center text-[26px] font-semibold leading-[1.25] tracking-[-0.78px] text-[#464A65]">
          {name && `${name}の`}
          <br />
          未来の職業はこれ！
          </h1>

          <HeroCard cardRef={cardRef} career={result.main} />

          {viewer === 'owner' && (
            <CardLink
              kind={detailOpen ? 'save' : 'retake'}
              saving={saving}
              onClick={detailOpen ? saveCard : retake}
            />
          )}
          {toast && <p className="mt-2 px-6 text-center text-[10.5px] text-[#5D617C]">{toast}</p>}
          <div className="h-[26px]" />
        </section>

        <div ref={detailRef}>
          {detailOpen ? <ResultDetail result={result} /> : <LockedDetail result={result} />}
        </div>

        {/* 시안 4종 중 '본인·가입완료'(29409:3891)에만 푸터가 없다 */}
        {!(viewer === 'owner' && detailOpen) && <Footer />}
      </div>

      <FloatingCta
        viewer={viewer}
        detailOpen={detailOpen}
        onRegister={goRegister}
        onShare={shareLink}
        onStart={() => router.push('/')}
      />
    </main>
  )
}

/* ── 상단 바 ─────────────────────────────────────────────── */

function Header() {
  return (
    // 시안: h 154 / 하단 보더 3px #E3E4EB / 로고 좌 27, 높이 48
    <header className="flex h-[61px] items-center border-b border-[#E3E4EB] bg-white px-[27px]">
      <a href={LANDING_URL} aria-label="SOCRA Tutor ホーム">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/logo.svg" alt="SOCRA Tutor" className="h-[19px] w-auto" />
      </a>
    </header>
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
    <div className="mt-[28px] flex justify-center">
      {/* 카드 794x1043 → 316x415 / rounded 63 → 25 / shadow 0 0 76px rgba(185,186,210,.6) */}
      <div
        ref={cardRef}
        className="relative w-[316px] rounded-[25px] bg-white px-[16px] pb-[19px] pt-[17px] shadow-[0_0_30px_0_rgba(185,186,210,0.6)]"
      >
        {/* 캐릭터 패널 714x727 → 284x289 / rounded 39 → 15.5 / 그라디언트 #4FA2F8 → #7775FD */}
        <div className="relative h-[289px] w-full overflow-hidden rounded-[15.5px] bg-gradient-to-b from-[#4FA2F8] to-[#7775FD]">
          {/* 후광. 시안 Ellipse12: 지름 609 → 242, 중심은 패널 중앙에서 x+16.5 y-59 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/halo.svg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute left-[calc(50%+6.7px)] top-[121px] w-[242px] -translate-x-1/2 -translate-y-1/2 opacity-80"
          />

          {/* 캐릭터. 시안 508 → 202, 패널 상단에서 101 → 40, 가로 중앙.
              PNG 에 알파가 있어 블렌드 모드 없이 100% 불투명하게 얹힌다. */}
          <CharacterImage
            number={career.number}
            riasec={career.riasec}
            alt={career.nameJp}
            className="absolute left-1/2 top-[40px] size-[202px] -translate-x-1/2 object-contain"
          />

          {/* 희소성 문구 23px → 9.2 / 흰색 / 좌상단 */}
          <p className="absolute left-[12px] top-[8px] text-[9.2px] font-semibold tracking-[-0.37px] text-white">
            {career.probJp}
          </p>

          {/* 직업명 50px → 20 / 흰색 Bold / 패널 하단에서 17 */}
          <p className="absolute inset-x-0 bottom-[17px] text-center text-[20px] font-bold tracking-[-0.8px] text-white">
            {career.nameJp}
          </p>
        </div>

        {/* 별점 pill — 패널 위쪽으로 걸쳐 나온다 (card top 22, 패널 top 43).
            별 개수는 careers.json 의 희소성_star(★ 개수)를 그대로 따른다. */}
        <div
          className="absolute right-[14px] top-[9px] flex h-[28px] items-center justify-center gap-[2px] rounded-full border-[2.4px] border-[#B7A3FF] bg-white px-[10px]"
          role="img"
          aria-label={`希少度 ${career.rarityStars} / 5`}
        >
          {Array.from({ length: 5 }, (_, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={i < career.rarityStars ? '/assets/star-filled.svg' : '/assets/star-empty.svg'}
              alt=""
              aria-hidden
              className="h-[17px] w-[18px]"
            />
          ))}
        </div>

        {/* 직업설명 36px → 14.3 / #5D617C / 줄간격 1.41 — 데이터에 줄 나눔이 들어 있다 */}
        <p className="mt-[15px] whitespace-pre-line text-center text-[14.3px] font-semibold leading-[1.41] tracking-[-0.57px] text-[#5D617C]">
          {career.descJp}
        </p>

        {/* 카드 하단 로고 224x27 → 89x11 */}
        <div className="mt-[18px] flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo.svg"
            alt="SOCRA Tutor"
            className="h-[11px] w-auto opacity-30"
          />
        </div>
      </div>
    </div>
  )
}

/* ── 카드 바로 밑 보조 링크 ─────────────────────────────── */

function CardLink({
  kind,
  saving,
  onClick,
}: {
  kind: 'retake' | 'save'
  saving: boolean
  onClick: () => void
}) {
  return (
    <div className="mt-[18px] flex justify-center">
      <button
        type="button"
        onClick={onClick}
        disabled={kind === 'save' && saving}
        className="flex items-center gap-[6px] text-[#777B96] active:opacity-60 disabled:opacity-60"
      >
        {kind === 'save' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/assets/icon-download.svg" alt="" aria-hidden className="h-[17px] w-[17px]" />
        ) : (
          <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" aria-hidden>
            <path
              d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        <span className="text-[12.8px] tracking-[-1px] underline underline-offset-[5px]">
          {kind === 'save' ? (saving ? '保存中…' : 'カードを保存する') : 'テストをもう一度'}
        </span>
      </button>
    </div>
  )
}

/* ── 잠긴 상세 (블러) ────────────────────────────────────── */

function LockedDetail({ result }: { result: MatchResult }) {
  return (
    <div className="relative">
      {/* 시안: 상세를 blur(10px) 로 흐리게 깔아 "더 있다"를 보여준다 */}
      {/* 시안은 상세를 잘라내지 않고 끝까지 블러로 보여 준다 */}
      <div aria-hidden className="pointer-events-none select-none blur-[6px]">
        <ResultDetail result={result} />
      </div>
    </div>
  )
}

/* ── 하단 고정 CTA ──────────────────────────────────────── */

function FloatingCta({
  viewer,
  detailOpen,
  onRegister,
  onShare,
  onStart,
}: {
  viewer: Viewer
  detailOpen: boolean
  onRegister: () => void
  onShare: () => void
  onStart: () => void
}) {
  const shared = viewer === 'shared'
  const tooltip = shared
    ? '5分で完了！'
    : detailOpen
      ? 'Xでシェアすると1000円イベントに参加できる！'
      : '登録して詳細を見る'

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[430px] px-[18px] pb-[22px] pt-3">
      <div className="flex justify-center">
        <div className="relative rounded-[11px] bg-[#021439] px-[11px] py-[6px] text-[12.5px] font-semibold leading-[15px] text-white">
          {tooltip}
          {/* 에셋의 삼각형은 위를 향하고 있어 아래를 가리키도록 뒤집는다 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/tooltip-arrow.svg"
            alt=""
            aria-hidden
            className="absolute left-1/2 top-full h-[7px] w-[15px] -translate-x-1/2 rotate-180"
          />
        </div>
      </div>

      {shared ? (
        <PrimaryButton onClick={onStart}>未来の仕事をチェック</PrimaryButton>
      ) : detailOpen ? (
        <PrimaryButton onClick={onShare}>結果をシェア</PrimaryButton>
      ) : (
        <>
          <PrimaryButton onClick={onRegister}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo-footer.svg" alt="SOCRA Tutor" className="h-[14px] w-auto" />
            <span>に登録する</span>
          </PrimaryButton>
          <button
            type="button"
            onClick={onShare}
            className="mt-[9px] flex h-[54px] w-full items-center justify-center rounded-[13.5px] border border-[#8EC2FF] bg-white text-[15.5px] font-semibold text-[#4C9EF3] transition active:scale-[0.99]"
          >
            結果をシェア
          </button>
        </>
      )}
    </div>
  )
}

function PrimaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="signup-cta mt-[13px] flex h-[62px] w-full items-center justify-center gap-[7px] rounded-[13.5px] text-[16.5px] font-semibold text-white shadow-[0_10px_24px_rgba(78,159,243,0.35)] transition active:scale-[0.99]"
    >
      {children}
    </button>
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
