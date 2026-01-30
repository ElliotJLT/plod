import { mockNextRun } from "@/lib/mock-data"

export function NextRunWidget() {
  const { day, distance, type } = mockNextRun

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col">
      <p className="text-xs text-muted-foreground">Next</p>
      <p className="text-2xl font-light text-foreground mt-1">{distance}</p>
      <p className="text-xs text-muted-foreground mt-auto pt-2">
        {day} · {type}
      </p>
    </div>
  )
}
