'use client'

import { MapPin, Plus } from 'lucide-react'

export default function RoutesPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Routes</h1>
            <p className="text-sm text-muted-foreground">
              Plan and save your running routes
            </p>
          </div>
          <button className="p-2 rounded-lg bg-accent text-accent-foreground">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Empty state */}
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <MapPin className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-medium text-foreground mb-2">
            No routes yet
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first route to see elevation, lighting, and conditions.
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm">
            <Plus className="h-4 w-4" />
            Create route
          </button>
        </div>

        {/* Coming soon features */}
        <div className="rounded-lg bg-muted/30 p-4 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Coming soon
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-accent" />
              Elevation profiles
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-accent" />
              Street lighting info for night runs
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-accent" />
              Weather conditions per route
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-accent" />
              Share to Google Maps
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
