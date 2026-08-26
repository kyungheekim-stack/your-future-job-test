import { aiTypeBg, aiTypeFg, replaceRateColor } from '@/lib/constants'
import type { Career, MatchResult } from '@/lib/types'

/**
 * 결과 상세 (figma_result_reference.md 기준, 1080px → shell 430px 로 비례 축소).
 * 가입 전에는 이 컴포넌트를 그대로 blur 처리해 잠금 미리보기로 쓴다.
 * 섹션 순서: AI타입+연봉 → AI대체확률 → 필요스킬 → 쌓아야할스펙 → 튜터한마디 → 부업추천
 */
export default function ResultDetail({ result }: { result: MatchResult }) {
  const { main, subs } = result
  const riskColor = replaceRateColor(main.replaceRate)

  return (
    <div className="space-y-[13px]">
      {/* AI 관계 타입 + 예상 연봉 (2열) */}
      <div className="grid grid-cols-2 gap-[13px]">
        <Box pad="11px">
          <Title icon="🏷️">AI関係タイプ</Title>
          <span
            className="mt-[9px] inline-block rounded-[8px] px-[9px] py-[5px] text-[11px] font-semibold"
            style={{ backgroundColor: aiTypeBg(main.aiTypeKr), color: aiTypeFg(main.aiTypeKr) }}
          >
            {main.aiTypeJp}
          </span>
        </Box>
        <Box pad="11px">
          <Title icon="💰">予想年収</Title>
          <p className="mt-[7px] font-inter text-[19px] font-bold leading-none text-[#333]">
            {main.salary.toLocaleString('ja-JP')}
            <span className="ml-[3px] font-plex text-[11px] font-medium text-[#666]">万円/年</span>
          </p>
        </Box>
      </div>

      {/* AI 대체 확률 */}
      <Box>
        <Title icon="🤖">AIに代替される確率</Title>
        <div className="mt-[14px] flex items-end justify-between">
          <span className="text-[10.5px] tracking-[-0.41px] text-[#999]">代替確率</span>
          <span
            className="font-inter text-[22px] font-bold leading-none"
            style={{ color: riskColor }}
          >
            {main.replaceRate}%
          </span>
        </div>
        <div className="mt-[10px] h-[7px] w-full overflow-hidden rounded-full bg-[#EDEDED]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, Math.max(3, main.replaceRate))}%`,
              backgroundColor: riskColor,
            }}
          />
        </div>
      </Box>

      {/* 필요 스킬 */}
      <Box>
        <Title icon="💡">必要なスキル</Title>
        <div className="mt-[12px] flex flex-wrap gap-[7px]">
          {main.skillsJp.map((skill) => (
            <span
              key={skill}
              className="rounded-[16px] border border-[#E0E0E0] bg-white px-[11px] py-[6px] text-[10.5px] tracking-[-0.41px] text-[#444]"
            >
              {skill}
            </span>
          ))}
        </div>
      </Box>

      {/* 쌓아야 할 스펙 */}
      <Box>
        <Title icon="📋">積むべきスペック</Title>
        <ol className="mt-[11px] space-y-[9px]">
          {main.todosJp.map((todo, i) => (
            <li key={todo} className="flex items-start gap-[8px]">
              <span className="grid h-4 w-4 shrink-0 place-items-center rounded-[8px] bg-[#1B478E] font-inter text-[9px] font-semibold text-white">
                {i + 1}
              </span>
              <span className="pt-px text-[10.5px] leading-[16px] tracking-[-0.41px] text-[#444]">
                {todo}
              </span>
            </li>
          ))}
        </ol>
      </Box>

      {/* 튜터의 한마디 — 시안은 흰 배경 */}
      <div className="rounded-[11px] bg-white px-[13px] py-[13px]">
        <Title icon="✨">チューターの一言</Title>
        <p className="mt-[9px] text-[10.5px] leading-[17px] tracking-[-0.41px] text-[#444]">
          {main.tutorJp}
        </p>
      </div>

      {/* 부업 추천 */}
      <Box>
        <Title icon="🎁">副業におすすめ</Title>
        <ul className="mt-[11px] space-y-[7px]">
          {subs.map((sub) => (
            <SubRow key={sub.number} career={sub} />
          ))}
        </ul>
      </Box>
    </div>
  )
}

function Box({ children, pad = '13px' }: { children: React.ReactNode; pad?: string }) {
  return (
    <div className="rounded-[11px] bg-[#FAFAFA]" style={{ padding: pad }}>
      {children}
    </div>
  )
}

function Title({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-[5px] font-plex text-[12px] font-semibold text-[#333]">
      <span aria-hidden className="text-[11px] leading-none">
        {icon}
      </span>
      {children}
    </p>
  )
}

function SubRow({ career }: { career: Career }) {
  return (
    <li className="flex items-center gap-2 rounded-[10px] bg-white px-[10px] py-[6px]">
      <p className="min-w-0 flex-1 truncate text-[11px] font-semibold text-[#333]">
        {career.nameJp}
      </p>
      <span className="shrink-0 rounded-[8px] bg-[#E6F1FB] px-[7px] py-[3px] font-inter text-[8.5px] font-semibold text-[#1B478E]">
        {career.aiTypeJp}
      </span>
    </li>
  )
}
