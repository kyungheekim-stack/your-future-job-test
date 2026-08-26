interface Props {
  /** muted = 카드 안(연회색), white = 어두운 배경 위 */
  tone?: 'muted' | 'white'
  className?: string
}

/**
 * socratutor_logo.png 워드마크.
 * 원본이 흰색 실루엣이라 카드용 연회색 버전을 따로 만들어 두고 골라 쓴다.
 * (CSS mask 대신 실제 <img> 를 쓰는 이유: 카드 PNG 캡처에서 mask 는 누락된다)
 */
export default function SocraLogo({ tone = 'muted', className }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/images/socratutor-logo-${tone}.png`}
      alt="SOCRA Tutor"
      className={className}
      loading="eager"
      decoding="async"
    />
  )
}
