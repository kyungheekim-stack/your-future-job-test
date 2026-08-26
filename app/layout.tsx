import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { IBM_Plex_Sans_JP, Inter, Noto_Sans_JP } from 'next/font/google'
import './globals.css'

/**
 * 폰트를 셀프 호스팅한다.
 * fonts.googleapis.com 을 <link> 로 불러오면 결과 카드를 PNG 로 캡처할 때
 * 크로스오리진 스타일시트의 cssRules 를 읽지 못해 캡처가 실패한다.
 * CJK 는 subsets 지정이 불가능해 preload 를 끄고 unicode-range 로 나눠 받는다.
 */
const notoSansJP = Noto_Sans_JP({
  weight: ['400', '500', '700', '900'],
  preload: false,
  display: 'swap',
  variable: '--font-noto-sans-jp',
  fallback: ['Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Meiryo', 'system-ui', 'sans-serif'],
})

/** 결과 페이지 시안 폰트 (figma_result_reference.md) */
const plexJP = IBM_Plex_Sans_JP({
  weight: ['400', '500', '600', '700'],
  preload: false,
  display: 'swap',
  variable: '--font-plex-jp',
  fallback: ['Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Meiryo', 'system-ui', 'sans-serif'],
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'AI時代の未来職業テスト | SOCRA Tutor',
  description:
    '20問であなたに合うAI時代の職業を占います。105職業から1つをマッチングして結果カードを作ります。',
  openGraph: {
    title: 'AI時代の未来職業テスト',
    description: '20問であなたに合うAI時代の職業を占います。',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#F0F4F8',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${plexJP.variable} ${inter.variable}`}
    >
      <body className="font-sans">
        <div className="shell">{children}</div>
      </body>
    </html>
  )
}
