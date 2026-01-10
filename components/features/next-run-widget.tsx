import { mockNextRun } from "@/lib/mock-data"

export function NextRunWidget() {
  const { day, distance, type, duration } = mockNextRun

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground mb-2">Next run</p>
      <p className="text-sm text-foreground">
        {day} · {distance} {type} · {duration}
      </p>
    </div>
  )
}
