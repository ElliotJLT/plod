import { mockConditions } from "@/lib/mock-data"

export function ConditionsWidget() {
  const { temp, condition, aqi, aqiLabel, location, verdict } = mockConditions

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-baseline justify-between">
        <div className="space-y-1">
          <p className="text-2xl font-light text-foreground">{temp}°C</p>
          <p className="text-sm text-muted-foreground">{condition}</p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-sm text-muted-foreground">AQI {aqi}</p>
          <p className="text-xs text-muted-foreground">{aqiLabel}</p>
        </div>
      </div>
      <div className="pt-2 border-t border-border">
        <p className="text-sm text-muted-foreground">{location}</p>
        <p className="text-sm text-foreground mt-1">{verdict}</p>
      </div>
    </div>
  )
}
