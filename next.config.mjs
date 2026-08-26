/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // 캐릭터 PNG는 /public/characters/ 정적 파일이라 최적화 없이 그대로 서빙한다.
    unoptimized: true,
  },
}

export default nextConfig
