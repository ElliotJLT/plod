'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapPin, Plus, ExternalLink, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Route {
  id: string
  name: string
  distanceKm: number
  elevationGainM: number
  lighting: string
  createdAt: string
}

const LIGHTING_LABELS: Record<string, string> = {
  well_lit: 'Well lit',
  partial: 'Partial',
  unlit: 'Unlit',
  unknown: 'Unknown',
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoutes()
  }, [])

  async function fetchRoutes() {
    try {
      const res = await fetch('/api/routes')
      const json = await res.json()
      setRoutes(json.routes || [])
    } catch (error) {
      console.error('Failed to fetch routes:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="px-4 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium text-foreground">Routes</h1>
          <Link
            href="/routes/create"
            className="p-2 -mr-2 rounded-lg text-accent hover:bg-accent/10 transition-colors"
          >
            <Plus className="h-5 w-5" strokeWidth={1.5} />
          </Link>
        </div>
      </header>

      <main className="px-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-4 h-20 animate-pulse" />
            <div className="rounded-xl border border-border bg-card p-4 h-20 animate-pulse" />
          </div>
        ) : routes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
            <div className="mx-auto w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <MapPin className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-foreground mb-1">No routes saved</p>
            <p className="text-xs text-muted-foreground">
              Tap + above to create your first route
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {routes.map((route) => (
              <div
                key={route.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {route.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {route.distanceKm.toFixed(1)}km
                      </span>
                      {route.elevationGainM > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ↑{route.elevationGainM}m
                        </span>
                      )}
                      {route.lighting && route.lighting !== 'unknown' && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Sun className="h-3 w-3" strokeWidth={1.5} />
                          {LIGHTING_LABELS[route.lighting]}
                        </span>
                      )}
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                  </a>
                </div>
              </div>
            ))}

            <Link
              href="/routes/create"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-accent/30 transition-colors"
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              Add another route
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
