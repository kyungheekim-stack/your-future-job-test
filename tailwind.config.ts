import type { Config } from 'tailwindcss'

// §7 디자인 소스의 컬러 시스템을 그대로 토큰화한다.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        page: '#F0F4F8',
        hero: '#E0ECFA',
        card: '#FFFFFF',
        accent: '#3B7DD8',
        // 참고 시안(home / enter(name) / loading)에서 뽑은 값
        intro: {
          bg: '#F5FAFF', // 이름·인트로 화면 배경
          ink: '#30344F', // 헤드라인 네이비
          badge: '#0E2759', // 상단 뱃지 배경
          cta: '#4C9EF3', // 메인 버튼 파랑
          note: '#777B96', // 홈 각주
          sub: '#5D617C', // 이름 화면 보조문구
          hint: '#B5B7C6', // placeholder·카운터
          line: '#DADAE2', // 입력 밑줄
          say: '#6A6E89', // 인트로 하단 문구
        },
        // 결과 카드 시안(result_card.png)에서 뽑은 값
        res: {
          ink: '#30344F', // 헤드라인
          pill: '#3A82DB', // 만날 확률 뱃지
          star: '#F5B041', // 희소성 별
          job: '#1B478F', // 직업명 뱃지
          desc: '#555555', // 직업 설명
          link: '#777B96', // 공유·저장 링크
          label: '#6A6E89', // 상세 카드 제목
          panel: '#FAFAFA', // 상세 카드 배경
          char: '#D9E6F3', // 캐릭터 패널 배경
          tip: '#021439', // 툴팁 배경
          foot: '#060E20', // 푸터 배경
          footText: '#B5B7C6', // 푸터 본문
        },
        fortune: '#FFF9C4',
        ink: '#1B2733',
        muted: '#6B7A8C',
        line: '#E2E9F1',
        risk: {
          low: '#0F6E56',
          mid: '#BA7517',
          high: '#993C1D',
        },
      },
      borderRadius: {
        card: '40px',
        panel: '28px',
      },
      boxShadow: {
        card: '0 18px 44px rgba(31, 68, 116, 0.16)',
        soft: '0 6px 18px rgba(31, 68, 116, 0.08)',
      },
      fontFamily: {
        sans: [
          'var(--font-noto-sans-jp)',
          '"Hiragino Sans"',
          '"Hiragino Kaku Gothic ProN"',
          'Meiryo',
          '"Apple SD Gothic Neo"',
          'system-ui',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}

export default config
