import { mockLastRun } from "@/lib/mock-data"

export function LastRunWidget() {
  const { day, distance, effort } = mockLastRun

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground mb-2">Last run</p>
      <p className="text-sm text-foreground">
        {day} · {distance} · Felt: {effort}
      </p>
    </div>
  )
}
