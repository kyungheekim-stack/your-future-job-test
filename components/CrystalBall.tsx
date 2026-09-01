interface Props {
  className?: string
  priority?: boolean
  /** 안쪽 은하가 도는 애니메이션 (홈·인트로에서 사용) */
  spin?: boolean
}

/**
 * 시안의 수정구슬.
 *
 * spin 을 켜면 디자이너가 준 회전 GIF 를 쓴다. 원본 GIF 는 500x720 / 126프레임 /
 * 17MB 라 그대로 못 올린다. 구슬 bbox 로 잘라 320px 로 줄이고, 2프레임마다
 * 하나씩 골라(63프레임 / 80ms / 5.04초 루프) 알파 있는 애니메이션 WebP 로 구웠다.
 * → 619KB. 알파는 정적 PNG 의 알파 채널을 그대로 마스크로 씌워서 뽑았다
 *   (GIF 배경이 검정이라 그냥 키잉하면 테두리에 검은 띠가 남는다).
 *
 * 정적 이미지(58KB)를 배경으로 깔아 두어, 애니메이션이 도착하기 전에도
 * 구슬이 바로 보이고 레이아웃이 흔들리지 않는다.
 * prefers-reduced-motion 이면 <source> 가 정적 이미지로 대체한다.
 */
export default function CrystalBall({ className, priority, spin }: Props) {
  if (!spin) {
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

  return (
    <div
      className={className}
      style={{
        backgroundImage: 'url(/images/crystal-ball.webp)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      <picture>
        <source
          srcSet="/images/crystal-ball.webp"
          media="(prefers-reduced-motion: reduce)"
          type="image/webp"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/crystal-ball-anim.webp"
          alt=""
          aria-hidden="true"
          className="block w-full"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      </picture>
    </div>
  )
}
