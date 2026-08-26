interface Props {
  className?: string
  priority?: boolean
}

/**
 * 시안의 수정구슬. loading.png 에서 배경을 걷어내 투명 PNG 로 뽑아 둔 것이라
 * 밝은 배경·파란 배경 어디에 올려도 테두리가 뜨지 않는다.
 */
export default function CrystalBall({ className, priority }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/crystal-ball.png"
      alt=""
      aria-hidden="true"
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  )
}
