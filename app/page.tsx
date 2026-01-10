import { ConditionsWidget } from "@/components/features/conditions-widget"
import { NextRunWidget } from "@/components/features/next-run-widget"
import { LastRunWidget } from "@/components/features/last-run-widget"
import { WeekWidget } from "@/components/features/week-widget"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col px-4 pt-6">
      <h1 className="text-sm font-light tracking-wide text-muted-foreground mb-8">
        Plod
      </h1>
      <div className="space-y-4 pb-8">
        <ConditionsWidget />
        <NextRunWidget />
        <LastRunWidget />
        <WeekWidget />
      </div>
    </div>
  )
}
