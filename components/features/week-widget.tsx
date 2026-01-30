import { mockWeek } from "@/lib/mock-data"

export function WeekWidget() {
  const { planned, completed } = mockWeek
  const progressPercent = planned > 0 ? (completed / planned) * 100 : 0

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-xs text-muted-foreground">This week</p>
        <p className="text-xs text-muted-foreground">
          {completed}/{planned} runs
        </p>
      </div>

      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}
