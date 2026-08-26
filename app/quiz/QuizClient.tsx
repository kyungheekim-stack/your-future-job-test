'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ProgressBar from '@/components/ProgressBar'
import { planQuiz } from '@/lib/flow'
import { loadSession, saveSession } from '@/lib/session'
import type { Answer, OptionKey } from '@/lib/types'

export default function QuizClient() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [name, setName] = useState('')
  const [answers, setAnswers] = useState<Answer[]>([])
  const [selected, setSelected] = useState<OptionKey | null>(null)

  // sessionStorage 는 클라이언트에서만 읽을 수 있어 마운트 후 복원한다.
  useEffect(() => {
    const stored = loadSession()
    if (!stored.name) {
      router.replace('/')
      return
    }
    setName(stored.name)
    setAnswers(stored.answers)
    setReady(true)
  }, [router])

  const plan = useMemo(() => planQuiz(answers), [answers])

  // 20문항을 다 풀면 로딩 화면으로 넘긴다.
  useEffect(() => {
    if (!ready) return
    if (plan.done) {
      saveSession({ name, answers })
      router.replace('/loading')
    }
  }, [ready, plan.done, name, answers, router])

  const commit = useCallback(
    (next: Answer[]) => {
      setAnswers(next)
      setSelected(null)
      saveSession({ name, answers: next })
    },
    [name],
  )

  const question = plan.current

  const goNext = () => {
    if (!question || !selected) return
    const option = question.options.find((o) => o.key === selected)
    commit([
      ...answers.slice(0, plan.index),
      {
        questionId: question.id,
        optionKey: selected,
        ...(option?.careerNumber ? { careerNumber: option.careerNumber } : {}),
      },
    ])
  }

  const goBack = () => {
    if (answers.length === 0) {
      // Q1 에서 더 뒤로 가면 이름 입력 화면으로 돌아간다.
      router.push('/name')
      return
    }
    commit(answers.slice(0, -1))
  }

  if (!ready || !question) {
    return (
      <main className="grid min-h-dvh place-items-center px-6">
        <p className="text-sm text-muted">読み込んでいます…</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-dvh flex-col px-6 pb-8 pt-6">
      <header className="mb-7">
        <button
          type="button"
          onClick={goBack}
          className="mb-4 -ml-1 flex items-center gap-1 rounded-lg px-1 py-1 text-sm font-medium text-muted transition active:opacity-60"
          aria-label="前の質問に戻る"
        >
          <span aria-hidden>←</span> 戻る
        </button>
        <ProgressBar current={plan.index + 1} total={plan.total} />
      </header>

      <div key={question.id} className="animate-fade-up flex flex-1 flex-col">
        <p className="text-sm font-bold text-accent">Q{plan.index + 1}</p>
        <h2 className="mt-2 text-[22px] font-bold leading-[1.45] text-ink">
          {question.questionJp}
        </h2>

        <div className="mt-7 space-y-3">
          {question.options.map((option) => {
            const active = selected === option.key
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setSelected(option.key)}
                aria-pressed={active}
                className={[
                  'flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left transition active:scale-[0.995]',
                  active
                    ? 'border-accent bg-accent/10 shadow-soft'
                    : 'border-line bg-white',
                ].join(' ')}
              >
                <span
                  className={[
                    'grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold',
                    active ? 'bg-accent text-white' : 'bg-page text-muted',
                  ].join(' ')}
                >
                  {option.key}
                </span>
                <span className="text-[15px] font-medium leading-relaxed text-ink">
                  {option.textJp}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-auto pt-8">
          <button
            type="button"
            onClick={goNext}
            disabled={!selected}
            className="w-full rounded-2xl bg-accent py-4 text-[17px] font-bold text-white shadow-card transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#B9CBE3] disabled:shadow-none"
          >
            {plan.index + 1 === plan.total ? '結果を見る' : 'Next'}
          </button>
        </div>
      </div>
    </main>
  )
}
