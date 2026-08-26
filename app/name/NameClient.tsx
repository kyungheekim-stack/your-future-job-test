'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { loadSession, saveSession } from '@/lib/session'

const MAX_NAME = 8

/**
 * 시안(enter(name).png) 그대로: 뒤로가기 → 헤드라인 → 밑줄 입력 + 카운터 → NEXT.
 * 크기·간격은 시안(1080px 기준)을 shell 폭 430px 으로 환산해 맞췄다.
 */
export default function NameClient() {
  const router = useRouter()
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // 뒤로 돌아왔을 때 입력했던 이름을 유지한다.
  useEffect(() => {
    setName(loadSession().name)
  }, [])

  const next = () => {
    const trimmed = name.trim()
    // 시안의 NEXT 는 비활성 상태가 없다. 비어 있으면 입력칸으로 되돌린다.
    if (!trimmed) {
      inputRef.current?.focus()
      return
    }
    // 이름이 바뀌면 이전 답변은 버리고 새로 시작한다.
    saveSession({ name: trimmed, answers: [] })
    router.push('/intro')
  }

  return (
    <main className="flex min-h-dvh flex-col bg-intro-bg px-5 pb-8 pt-3">
      <button
        type="button"
        onClick={() => router.push('/')}
        aria-label="戻る"
        className="-ml-[14px] flex h-11 w-11 items-center justify-center rounded-full text-intro-ink transition active:opacity-60"
      >
        <svg viewBox="0 0 24 24" className="h-[30px] w-[30px]" fill="none" aria-hidden="true">
          <path
            d="M16 3 6 12l10 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="animate-fade-up flex flex-1 flex-col">
        <h1 className="mt-[45px] text-center text-[28.5px] font-black leading-[41px] tracking-[-0.01em] text-intro-ink">
          めっちゃ楽しいよ！
          <br />
          まず名前を入れてね。
        </h1>

        <p className="mt-[21px] text-center text-[14.5px] font-medium text-intro-sub">
          *ニックネームでもOKです
        </p>

        {/* 시안의 밑줄은 좌 42px / 우 32px 안쪽에 있다 (main px-5 + 여기서 추가) */}
        <div className="ml-[22px] mr-3 mt-[103px]">
          <input
            ref={inputRef}
            type="text"
            value={name}
            maxLength={MAX_NAME}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') next()
            }}
            placeholder="お名前を入力してください"
            aria-label="お名前"
            className="w-full border-0 border-b border-intro-line bg-transparent pb-3 text-[19px] text-intro-ink outline-none ring-0 placeholder:text-intro-hint focus:border-intro-cta"
          />
          <p className="mt-2 text-right text-[12px] font-medium text-intro-hint">
            {name.length}/{MAX_NAME}
          </p>
        </div>

        <div className="mt-auto">
          <button
            type="button"
            onClick={next}
            aria-disabled={!name.trim()}
            className="h-[72px] w-full rounded-[20px] bg-intro-cta text-[19px] font-bold tracking-[0.04em] text-white transition active:scale-[0.99]"
          >
            NEXT
          </button>
        </div>
      </div>
    </main>
  )
}
