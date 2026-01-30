import { mockConditions } from "@/lib/mock-data"

export function ConditionsWidget() {
  const { temp, condition, aqi, aqiLabel, location, verdict } = mockConditions

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-4xl font-light tracking-tight text-foreground">
            {temp}°
          </p>
          <p className="text-sm text-muted-foreground mt-1">{condition}</p>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
            <span className="text-xs font-medium text-foreground">AQI {aqi}</span>
            <span className="text-xs text-muted-foreground">· {aqiLabel}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border/50">
        <p className="text-sm text-foreground">{verdict}</p>
        <p className="text-xs text-muted-foreground mt-1">{location}</p>
      </div>
    </div>
  )
}
