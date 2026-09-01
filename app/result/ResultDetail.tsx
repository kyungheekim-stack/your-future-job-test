import type { Career, MatchResult } from '@/lib/types'

/**
 * 결과 상세 — Figma 2차 시안(node 29409:3891 「⬜ 하단 상세결과 배경」) 그대로.
 * 시안은 1080px 기준이라 shell 폭 430px 으로 0.398 배 환산했다.
 * 주석의 괄호 값이 시안 원본 px 다.
 *
 * 섹션 순서: AI타입+연봉 → AI대체확률 → 필요스킬 → 쌓아야할스펙 → 튜터한마디 → 부업추천
 * 흰 박스들은 배경(흰색)과 같은 색이라 테두리 없이 간격만 만드는 컨테이너다.
 */
export default function ResultDetail({ result }: { result: MatchResult }) {
  const { main, subs } = result

  return (
    // 하단 상세 배경: rounded-t 80 / px 60 / py 90 / shadow 0 -3px 62px
    <div className="rounded-t-[32px] bg-white px-[24px] py-[36px] shadow-[0_-1px_25px_0_rgba(203,215,223,0.4)]">
      <div className="flex flex-col gap-[16px]">
        {/* AI관계타입 + 예상연봉 (gap 20) */}
        <div className="flex gap-[8px]">
          <StatBox icon="/assets/icon-ai-type.svg" iconClass="size-[34px]" label="AI関係タイプ">
            {/* 타입 뱃지: bg #F6F1FF / rounded 14 / px 20 py 8 / text 36 #3A1C99 */}
            <span className="inline-block rounded-[6px] bg-[#F6F1FF] px-[8px] py-[3px] text-[14px] font-semibold leading-none text-[#3A1C99]">
              {main.aiTypeJp}
            </span>
          </StatBox>
          <StatBox icon="/assets/icon-salary.svg" iconClass="h-[24px] w-[31px]" label="予想年収">
            <div className="flex items-end gap-[3px]">
              <span className="text-[19px] font-bold leading-none text-[#333]">
                {main.salary.toLocaleString('ja-JP')}
              </span>
              <span className="text-[8.8px] leading-[1.2] tracking-[-0.18px] text-[#5B5B5B]">
                万円/年
              </span>
            </div>
          </StatBox>
        </div>

        {/* AI 대체 확률: border 1.6 #DADAE2 / rounded 40 / px 46 py 54 */}
        <section className="rounded-[16px] border-[0.7px] border-[#DADAE2] bg-white px-[18px] py-[21px]">
          <h2 className="text-[16px] font-semibold tracking-[-0.48px] text-[#30344F]">
            AIに代替される確率
          </h2>
          <div className="mt-[2px] flex items-center justify-between">
            <span className="text-[12px] font-medium tracking-[-0.48px] text-[#999]">
              代替確率
            </span>
            {/* 시안의 숫자는 그라디언트 텍스트다 (#72C6FF → #2A72DE) */}
            <span className="bg-gradient-to-br from-[#72C6FF] to-[#2A72DE] bg-clip-text text-[28px] font-bold leading-none text-transparent">
              {main.replaceRate}
              <span className="text-[15px]">%</span>
            </span>
          </div>
          {/* 프로그레스: h 30 / rounded full / 트랙 #F3F4F6 */}
          <div className="mt-[8px] h-[12px] w-full overflow-hidden rounded-full bg-[#F3F4F6]">
            <div
              className="h-full rounded-full bg-gradient-to-br from-[#72C6FF] to-[#2A72DE]"
              style={{ width: `${Math.min(100, Math.max(4, main.replaceRate))}%` }}
            />
          </div>
        </section>

        {/* 필요 스킬 — 시안은 테두리 없는 흰 박스, py 40 만 있고 좌우 패딩이 없다 */}
        <section className="py-[16px]">
          <SectionTitle>必要なスキル</SectionTitle>
          <div className="mt-[12px] flex flex-wrap gap-[5px]">
            {main.skillsJp.map((skill) => (
              <span
                key={skill}
                className="rounded-full border-[0.6px] border-[#E0E0E0] bg-white px-[9.5px] py-[5px] text-[11px] tracking-[-0.22px] text-[#444]"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* 쌓아야 할 스펙 */}
        <section className="py-[16px]">
          <SectionTitle>積むべきスペック</SectionTitle>
          <ol className="mt-[13.5px] flex flex-col gap-[12px]">
            {main.todosJp.map((todo, i) => (
              <li key={todo} className="flex items-center gap-[8px]">
                <span className="grid size-[16px] shrink-0 place-items-center rounded-full bg-[#30344F] font-inter text-[8px] font-semibold text-white">
                  {i + 1}
                </span>
                <span className="flex-1 text-[12.7px] font-medium leading-[1.35] tracking-[-0.51px] text-[#5D617C]">
                  {todo}
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* 튜터의 한마디: bg #EFF3FE / rounded 44 / px 40 py 36 / gap 34 */}
        <section className="flex items-center gap-[13.5px] rounded-[17.5px] bg-[#EFF3FE] px-[16px] py-[14px]">
          <div className="grid size-[52px] shrink-0 place-items-center overflow-hidden rounded-full bg-white">
            {/* 원본 PNG 는 좌우 여백이 넓고 피사체가 오른쪽으로 치우쳐 있었다.
                피사체 bbox 로 잘라 정사각형 정중앙에 다시 앉힌 에셋을 쓴다. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/tutor-avatar.png"
              alt=""
              aria-hidden
              className="size-[44px] object-contain"
            />
          </div>
          <div className="min-w-0 flex-1 text-[#30344F]">
            <h2 className="text-[16px] font-semibold tracking-[-0.64px]">チューターの一言</h2>
            <p className="mt-[5px] text-[12px] leading-[16px] tracking-[-0.48px]">
              {main.tutorJp}
            </p>
          </div>
        </section>

        {/* 부업 추천 */}
        <section className="py-[16px]">
          <SectionTitle>副業におすすめ</SectionTitle>
          <ul className="mt-[8px]">
            {subs.map((sub) => (
              <SubRow key={sub.number} career={sub} />
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

/** AI관계타입 / 예상연봉 박스. 시안: h 202 / border 1.6 #DADAE2 / rounded 40 / gap 28 */
function StatBox({
  icon,
  iconClass,
  label,
  children,
}: {
  icon: string
  iconClass: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-[11px] rounded-[16px] border-[0.7px] border-[#DADAE2] bg-white px-[5px] py-[11px]">
      {/* 아이콘 컨테이너 130 → 52 (시안 rounded 30) */}
      <span className="grid size-[52px] shrink-0 place-items-center rounded-[12px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icon} alt="" aria-hidden className={iconClass} />
      </span>
      <div className="flex min-w-0 flex-col gap-[5px]">
        <p className="text-[15px] font-semibold tracking-[-0.45px] text-[#30344F]">{label}</p>
        {children}
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[16px] font-semibold tracking-[-0.64px] text-[#30344F]">{children}</h2>
  )
}

function SubRow({ career }: { career: Career }) {
  return (
    <li className="flex items-center justify-between py-[6.4px]">
      <p className="min-w-0 flex-1 truncate pr-2 text-[13.5px] font-medium tracking-[-0.54px] text-[#333]">
        {career.nameJp}
      </p>
      {/* 유형 뱃지: h 60 / w 150 / rounded 50 / bg #F3F4F6 / text 24 #185FA5 */}
      <span className="grid h-[24px] w-[60px] shrink-0 place-items-center rounded-full bg-[#F3F4F6] text-[9.5px] font-semibold tracking-[-0.38px] text-[#185FA5]">
        {career.aiTypeJp}
      </span>
    </li>
  )
}
