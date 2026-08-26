'use client'

import type { Answer } from './types'

const KEY = 'socra-career-test'

export interface StoredSession {
  name: string
  answers: Answer[]
}

const EMPTY: StoredSession = { name: '', answers: [] }

export function loadSession(): StoredSession {
  if (typeof window === 'undefined') return EMPTY
  try {
    const raw = window.sessionStorage.getItem(KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<StoredSession>
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      answers: Array.isArray(parsed.answers) ? parsed.answers : [],
    }
  } catch {
    return EMPTY
  }
}

export function saveSession(session: StoredSession): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(session))
  } catch {
    // 프라이빗 모드 등에서 저장이 막혀도 테스트 진행 자체는 막지 않는다.
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(KEY)
  } catch {
    // noop
  }
}
