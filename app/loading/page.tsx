import LoadingClient from './LoadingClient'

// 참가자 수는 운영에서 바꿀 수 있게 환경변수로 뺀다.
const participants = Number(process.env.NEXT_PUBLIC_PARTICIPANT_COUNT ?? '0')

export default function LoadingPage() {
  return <LoadingClient participants={Number.isFinite(participants) ? participants : 0} />
}
