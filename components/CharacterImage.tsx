'use client'

import { useEffect, useState } from 'react'

const PLACEHOLDER = '/characters/placeholder.svg'

export function characterSrc(number: number, riasec: string): string {
  return `/characters/${number}-${riasec.toUpperCase()}.png`
}

interface Props {
  number: number
  riasec: string
  alt: string
  className?: string
}

/**
 * /public/characters/{번호}-{RIASEC}.png 를 읽고,
 * 파일이 아직 없으면 placeholder 로 대체한다.
 */
export default function CharacterImage({ number, riasec, alt, className }: Props) {
  const primary = characterSrc(number, riasec)
  const [src, setSrc] = useState(primary)

  // 결과가 바뀌면 다시 원본부터 시도한다.
  useEffect(() => {
    setSrc(primary)
  }, [primary])

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading="eager"
      decoding="async"
      onError={() => {
        if (src !== PLACEHOLDER) setSrc(PLACEHOLDER)
      }}
    />
  )
}
