interface Props {
  className?: string
  priority?: boolean
  /** 안쪽 은하가 천천히 도는 모션 (홈·인트로에서 사용) */
  spin?: boolean
}

/**
 * 시안의 수정구슬. 2차 시안(CrystalBall_new.png)의 로우폴리 버전이다.
 *
 * spin 을 켜면 구슬 안쪽 은하만 돌아간다. 원본이 한 장짜리 PNG 라
 * 통째로 돌리면 받침대까지 같이 돌아가서, 구(球) 영역의 안쪽 72% 만
 * 원형으로 오려낸 레이어(crystal-ball-core.webp)를 겹쳐 그 레이어만 회전시킨다.
 * 유리 하이라이트와 테두리는 원본 쪽에 남아 있어 고정된다.
 */
export default function CrystalBall({ className, priority, spin }: Props) {
  return (
    <div className={`relative ${spin ? 'animate-float' : ''} ${className ?? ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/crystal-ball.webp"
        alt=""
        aria-hidden="true"
        className="block w-full"
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
      {spin && (
        // 위치·크기는 원본 PNG 에서 구의 중심과 반지름을 재서 뽑은 값이다.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/images/crystal-ball-core.webp"
          alt=""
          aria-hidden="true"
          className="animate-spin-slow absolute left-[14.11%] top-[10.18%] w-[71.78%]"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
    </div>
  )
}
