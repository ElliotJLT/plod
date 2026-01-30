'use client'

import { MapPin, Plus, Mountain, Sun, Cloud, ExternalLink } from 'lucide-react'

export default function RoutesPage() {
  return (
    <div className="min-h-screen pb-24">
      <header className="px-4 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium text-foreground">Routes</h1>
          <button className="p-2 -mr-2 rounded-lg text-accent hover:bg-accent/10 transition-colors">
            <Plus className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <main className="px-4 space-y-3 stagger-children">
        {/* Empty state */}
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
          <div className="mx-auto w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <MapPin className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-foreground mb-1">No routes saved</p>
          <p className="text-xs text-muted-foreground mb-4">
            Plan routes with elevation and lighting info
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium transition-colors hover:bg-accent/90">
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Create route
          </button>
        </div>

        {/* Features preview */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-3">Planned features</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                <Mountain className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-foreground">Elevation profiles</p>
                <p className="text-xs text-muted-foreground">See hills and flat sections</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                <Sun className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-foreground">Lighting conditions</p>
                <p className="text-xs text-muted-foreground">Well-lit paths for evening runs</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                <Cloud className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-foreground">Route conditions</p>
                <p className="text-xs text-muted-foreground">Weather and air quality</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                <ExternalLink className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-foreground">Share to Google Maps</p>
                <p className="text-xs text-muted-foreground">Navigate with turn-by-turn</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
