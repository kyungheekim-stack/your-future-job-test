/**
 * 앱·랜딩으로 나가는 외부 링크.
 * 배포 환경마다 달라질 수 있어 환경변수로 빼고, 없으면 운영 URL 을 쓴다.
 */
export const LANDING_URL =
  process.env.NEXT_PUBLIC_LANDING_URL || 'https://socratutor.ai/landing'

/**
 * 가입 화면. 유저 플로우상 「SOCRA Tutorに登録する」 는 여기로 보낸다.
 * 비워 두면(로컬·프리뷰) 이동하지 않고 그 자리에서 상세를 열어 준다.
 */
export const REGISTER_URL = process.env.NEXT_PUBLIC_REGISTER_URL || ''
