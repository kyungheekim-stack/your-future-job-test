import CharacterImage from '@/components/CharacterImage'
import { aiTypeBg, aiTypeFg, replaceRateColor } from '@/lib/constants'
import type { Career, MatchResult } from '@/lib/types'

/**
 * 결과 상세(시안 result_card.png 하단).
 * 가입 전에는 이 컴포넌트를 그대로 블러 처리해 잠금 미리보기로 쓴다.
 */
export default function ResultDetail({ result }: { result: MatchResult }) {
  const { main, subs } = result
  const riskColor = replaceRateColor(main.replaceRate)

  return (
    <div className="space-y-3">
      {/* AI 관계 타입 + 예상 연봉 */}
      <div className="grid grid-cols-2 gap-3">
        <Panel>
          <Label icon="🏷️">AI関係タイプ</Label>
          <span
            className="mt-3 inline-block rounded-lg px-3 py-1.5 text-[14px] font-bold"
            style={{ backgroundColor: aiTypeBg(main.aiTypeKr), color: aiTypeFg(main.aiTypeKr) }}
          >
            {main.aiTypeJp}
          </span>
        </Panel>
        <Panel>
          <Label icon="💰">予想年収</Label>
          <p className="mt-2 text-[26px] font-black leading-none text-[#22262E]">
            {main.salary.toLocaleString('ja-JP')}
            <span className="ml-1 text-[13px] font-bold text-res-label">万円/年</span>
          </p>
        </Panel>
      </div>

      {/* AI 대체 확률 */}
      <Panel>
        <Label icon="🤖">AIに代替される確率</Label>
        <div className="mt-4 flex items-end justify-between">
          <span className="text-[14px] text-[#9AA0AC]">代替確率</span>
          <span className="text-[24px] font-black leading-none" style={{ color: riskColor }}>
            {main.replaceRate}%
          </span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#E9EAEC]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, Math.max(2, main.replaceRate))}%`,
              backgroundColor: riskColor,
            }}
          />
        </div>
      </Panel>

      {/* 필요 스킬 */}
      <Panel>
        <Label icon="💡">必要なスキル</Label>
        <div className="mt-3.5 flex flex-wrap gap-2">
          {main.skillsJp.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-[#D3D5DA] px-3.5 py-2 text-[13px] text-[#3A3F4A]"
            >
              {skill}
            </span>
          ))}
        </div>
      </Panel>

      {/* 쌓아야 할 스펙 */}
      <Panel>
        <Label icon="📋">積むべきスペック</Label>
        <ol className="mt-3 space-y-2.5">
          {main.todosJp.map((todo, i) => (
            <li key={todo} className="flex items-start gap-2.5">
              <span className="mt-px grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-res-job text-[11px] font-bold text-white">
                {i + 1}
              </span>
              <span className="text-[14px] leading-[22px] text-[#3A3F4A]">{todo}</span>
            </li>
          ))}
        </ol>
      </Panel>

      {/* 튜터의 한마디 */}
      <div className="rounded-2xl bg-fortune px-5 py-5">
        <Label icon="✨">チューターの一言</Label>
        <p className="mt-2.5 text-[14px] leading-[22px] text-[#3A3F4A]">{main.tutorJp}</p>
      </div>

      {/* 부업 추천 */}
      <Panel>
        <Label icon="🎁">副業におすすめ</Label>
        <ul className="mt-3 space-y-2">
          {subs.map((sub) => (
            <SubRow key={sub.number} career={sub} />
          ))}
        </ul>
      </Panel>
    </div>
  )
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-res-panel px-5 py-5">{children}</div>
}

function Label({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-[15px] font-bold text-res-label">
      <span aria-hidden>{icon}</span>
      {children}
    </p>
  )
}

function SubRow({ career }: { career: Career }) {
  return (
    <li className="flex items-center gap-3 rounded-xl bg-white px-4 py-3.5 shadow-[0_1px_3px_rgba(31,68,116,0.06)]">
      <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-res-char">
        <CharacterImage
          number={career.number}
          riasec={career.riasec}
          alt=""
          className="h-full w-full object-contain"
        />
      </div>
      <p className="min-w-0 flex-1 truncate text-[15px] font-bold text-[#22262E]">
        {career.nameJp}
      </p>
      <span
        className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold"
        style={{ backgroundColor: aiTypeBg(career.aiTypeKr), color: aiTypeFg(career.aiTypeKr) }}
      >
        {career.aiTypeJp}
      </span>
    </li>
  )
}
