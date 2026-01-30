import { MapPin } from 'lucide-react'

export default function RoutesPage() {
  return (
    <div className="min-h-screen pb-24">
      <header className="px-4 pt-8 pb-6">
        <h1 className="text-lg font-medium text-foreground">Routes</h1>
      </header>

      <main className="px-4">
        {/* Coming soon state */}
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
          <div className="mx-auto w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <MapPin className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-foreground mb-1">Coming soon</p>
          <p className="text-xs text-muted-foreground">
            Save routes with elevation and lighting info
          </p>
        </div>
      </main>
    </div>
  )
}
