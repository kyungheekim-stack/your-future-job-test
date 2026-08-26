interface Props {
  current: number
  total: number
}

export default function ProgressBar({ current, total }: Props) {
  const pct = Math.min(100, Math.round((current / total) * 100))
  return (
    <div className="w-full">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-bold text-accent">
          {current}
          <span className="text-muted"> / {total}</span>
        </span>
        <span className="text-xs font-medium text-muted">{pct}%</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-white"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
