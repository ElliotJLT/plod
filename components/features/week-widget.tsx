import { mockWeek } from "@/lib/mock-data"

export function WeekWidget() {
  const { planned, completed } = mockWeek
  const progressPercent = (completed / planned) * 100

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground mb-3">This week</p>
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-sm text-foreground">
          {completed} of {planned} runs completed
        </p>
      </div>
      <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-accent transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}
