'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ChevronLeft, MapPin, Mountain, Sun, ExternalLink, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Dynamic import for Leaflet (no SSR)
const RouteMap = dynamic(() => import('@/components/features/routes/route-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-muted rounded-xl animate-pulse flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading map...</p>
    </div>
  ),
})

interface RoutePoint {
  lat: number
  lng: number
}

interface RouteData {
  points: RoutePoint[]
  pathPoints: RoutePoint[]
  distanceKm: number
  elevationGainM: number
  estimatedDurationMin: number
}

const LIGHTING_OPTIONS = [
  { value: 'well_lit', label: 'Well lit', description: 'Street lights throughout' },
  { value: 'partial', label: 'Partial', description: 'Some dark sections' },
  { value: 'unlit', label: 'Unlit', description: 'No lighting' },
]

export default function CreateRoutePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [routeData, setRouteData] = useState<RouteData>({
    points: [],
    pathPoints: [],
    distanceKm: 0,
    elevationGainM: 0,
    estimatedDurationMin: 0,
  })
  const [lighting, setLighting] = useState<string>('unknown')
  const [isSaving, setIsSaving] = useState(false)

  const handleRouteChange = useCallback((data: RouteData) => {
    setRouteData(data)
  }, [])

  const handleClearRoute = () => {
    setRouteData({
      points: [],
      pathPoints: [],
      distanceKm: 0,
      elevationGainM: 0,
      estimatedDurationMin: 0,
    })
  }

  const handleSave = async () => {
    if (routeData.points.length < 2) return

    setIsSaving(true)
    try {
      const res = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || `Route ${new Date().toLocaleDateString()}`,
          waypoints: routeData.points,
          pathPoints: routeData.pathPoints.length > 0 ? routeData.pathPoints : routeData.points,
          distanceKm: routeData.distanceKm,
          elevationGainM: routeData.elevationGainM,
          lighting,
        }),
      })

      if (res.ok) {
        router.push('/routes')
      }
    } catch (error) {
      console.error('Failed to save route:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const generateGoogleMapsUrl = () => {
    if (routeData.points.length < 2) return null

    const origin = `${routeData.points[0].lat},${routeData.points[0].lng}`
    const destination = `${routeData.points[routeData.points.length - 1].lat},${routeData.points[routeData.points.length - 1].lng}`

    // Middle points as waypoints (Google Maps limits to ~10 waypoints)
    const middlePoints = routeData.points.slice(1, -1).slice(0, 10)
    const waypoints = middlePoints.length > 0
      ? `&waypoints=${middlePoints.map((p) => `${p.lat},${p.lng}`).join('|')}`
      : ''

    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints}&travelmode=walking`
  }

  const googleMapsUrl = generateGoogleMapsUrl()

  return (
    <div className="min-h-screen pb-24 max-w-lg mx-auto">
      <header className="px-4 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <h1 className="text-lg font-medium text-foreground">Create route</h1>
        </div>
      </header>

      <main className="px-4 space-y-4">
        {/* Map */}
        <div className="relative rounded-xl overflow-hidden border border-border">
          <RouteMap onRouteChange={handleRouteChange} points={routeData.points} />
          {/* Lighting overlay indicator */}
          {lighting !== 'unknown' && (
            <div
              className={cn(
                'absolute inset-0 pointer-events-none transition-colors',
                lighting === 'well_lit' && 'bg-yellow-500/5',
                lighting === 'partial' && 'bg-orange-500/10',
                lighting === 'unlit' && 'bg-black/20'
              )}
            />
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Tap to add points. Tap final point to complete loop. Double-tap to remove.
        </p>

        {/* Route stats */}
        {routeData.points.length >= 2 && (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-light text-foreground">
                  {routeData.distanceKm.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">km</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-light text-foreground">
                  {routeData.elevationGainM}
                </p>
                <p className="text-xs text-muted-foreground">m elevation</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-light text-foreground">
                  ~{routeData.estimatedDurationMin}
                </p>
                <p className="text-xs text-muted-foreground">min</p>
              </div>
            </div>

            {routeData.points.length > 0 && (
              <button
                onClick={handleClearRoute}
                className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                Clear route
              </button>
            )}
          </div>
        )}

        {/* Route name */}
        <div>
          <label className="text-sm text-muted-foreground block mb-2">
            Route name (optional)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Evening loop"
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        {/* Lighting */}
        <div>
          <label className="text-sm text-muted-foreground block mb-2">
            <Sun className="h-4 w-4 inline mr-1" strokeWidth={1.5} />
            Lighting conditions
          </label>
          <div className="grid grid-cols-3 gap-2">
            {LIGHTING_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setLighting(option.value)}
                className={cn(
                  'px-3 py-2 rounded-xl border text-sm transition-colors',
                  lighting === option.value
                    ? 'border-accent bg-accent/10 text-foreground'
                    : 'border-border bg-card text-muted-foreground'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Share to Google Maps */}
        {googleMapsUrl && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:border-accent/30 transition-colors"
          >
            <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
            Open in Google Maps
          </a>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={routeData.points.length < 2 || isSaving}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
            routeData.points.length >= 2
              ? 'bg-accent text-accent-foreground hover:bg-accent/90'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          )}
        >
          {isSaving ? 'Saving...' : 'Save route'}
        </button>
      </main>
    </div>
  )
}
