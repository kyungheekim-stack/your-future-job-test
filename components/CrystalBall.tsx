interface Props {
  className?: string
  priority?: boolean
}

/**
 * 시안의 수정구슬. 2차 시안(CrystalBall_new.png)의 로우폴리 버전을
 * 알파 여백을 잘라내고 WebP(482×658, 58KB)로 구워 넣었다.
 * 이전 매끈한 구슬은 public/images/crystal-ball.png 에 남아 있다.
 */
export default function CrystalBall({ className, priority }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/crystal-ball.webp"
      alt=""
      aria-hidden="true"
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  )
}
