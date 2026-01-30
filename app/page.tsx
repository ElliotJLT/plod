import { ConditionsWidget } from "@/components/features/conditions-widget"
import { NextRunWidget } from "@/components/features/next-run-widget"
import { LastRunWidget } from "@/components/features/last-run-widget"
import { WeekWidget } from "@/components/features/week-widget"

export default function Home() {
  return (
    <div className="min-h-screen pb-24">
      <header className="px-4 pt-8 pb-6">
        <h1 className="text-lg font-medium text-foreground">Today</h1>
      </header>

      <main className="px-4 space-y-3 stagger-children">
        <ConditionsWidget />

        <div className="grid grid-cols-2 gap-3">
          <NextRunWidget />
          <LastRunWidget />
        </div>

        <WeekWidget />
      </main>
    </div>
  )
}
