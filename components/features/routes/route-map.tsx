'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface RoutePoint {
  lat: number
  lng: number
}

interface RouteData {
  points: RoutePoint[]
  pathPoints: RoutePoint[] // The actual routed path
  distanceKm: number
  elevationGainM: number
  estimatedDurationMin: number
}

interface RouteMapProps {
  points?: RoutePoint[]
  onRouteChange?: (data: RouteData) => void
  readOnly?: boolean
}

// Fetch route from OSRM (free routing service)
async function fetchRoute(waypoints: RoutePoint[]): Promise<{ path: RoutePoint[], distance: number } | null> {
  if (waypoints.length < 2) return null

  // Build coordinates string for OSRM: lng,lat;lng,lat;...
  const coords = waypoints.map(p => `${p.lng},${p.lat}`).join(';')

  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/foot/${coords}?overview=full&geometries=geojson`
    )
    const data = await res.json()

    if (data.code !== 'Ok' || !data.routes?.[0]) {
      console.warn('OSRM routing failed:', data)
      return null
    }

    const route = data.routes[0]
    const path = route.geometry.coordinates.map((coord: [number, number]) => ({
      lat: coord[1],
      lng: coord[0],
    }))

    return {
      path,
      distance: route.distance / 1000, // Convert meters to km
    }
  } catch (err) {
    console.error('Failed to fetch route:', err)
    return null
  }
}

// Estimate duration based on 6 min/km average (easy running pace)
function estimateDuration(distanceKm: number): number {
  return Math.round(distanceKm * 6)
}

export default function RouteMap({
  points = [],
  onRouteChange,
  readOnly = false,
}: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.CircleMarker[]>([])
  const polylineRef = useRef<L.Polyline | null>(null)

  // Waypoints are what the user clicks
  const [waypoints, setWaypoints] = useState<RoutePoint[]>(points)
  // Path is the actual routed line from OSRM
  const [routedPath, setRoutedPath] = useState<RoutePoint[]>([])
  const [routeDistance, setRouteDistance] = useState(0)
  const [isRouting, setIsRouting] = useState(false)

  // Fetch route when waypoints change
  const updateRoute = useCallback(async (newWaypoints: RoutePoint[]) => {
    if (newWaypoints.length < 2) {
      setRoutedPath([])
      setRouteDistance(0)
      return
    }

    setIsRouting(true)
    const result = await fetchRoute(newWaypoints)
    setIsRouting(false)

    if (result) {
      setRoutedPath(result.path)
      setRouteDistance(result.distance)
    } else {
      // Fallback to straight lines if routing fails
      setRoutedPath(newWaypoints)
      // Calculate straight-line distance
      let dist = 0
      for (let i = 1; i < newWaypoints.length; i++) {
        const p1 = newWaypoints[i - 1]
        const p2 = newWaypoints[i]
        const R = 6371
        const dLat = ((p2.lat - p1.lat) * Math.PI) / 180
        const dLon = ((p2.lng - p1.lng) * Math.PI) / 180
        const a = Math.sin(dLat / 2) ** 2 + Math.cos((p1.lat * Math.PI) / 180) * Math.cos((p2.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
        dist += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      }
      setRouteDistance(dist)
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Default to South East London
    const defaultCenter: [number, number] = [51.4621, -0.0124] // Greenwich area

    const map = L.map(mapRef.current, {
      center: defaultCenter,
      zoom: 15,
      zoomControl: false,
    })

    L.control.zoom({ position: 'topright' }).addTo(map)

    // Dark map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map

    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.setView([position.coords.latitude, position.coords.longitude], 16)
        },
        () => {}
      )
    }

    // Click handler to add waypoints
    if (!readOnly) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const newPoint = { lat: e.latlng.lat, lng: e.latlng.lng }
        setWaypoints((prev) => {
          const updated = [...prev, newPoint]
          updateRoute(updated)
          return updated
        })
      })
    }

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [readOnly, updateRoute])

  // Update markers and polyline when waypoints/path change
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // Clear existing polyline
    if (polylineRef.current) {
      polylineRef.current.remove()
      polylineRef.current = null
    }

    // Add markers for each waypoint
    waypoints.forEach((point, index) => {
      const isStart = index === 0
      const isEnd = index === waypoints.length - 1 && waypoints.length > 1

      const marker = L.circleMarker([point.lat, point.lng], {
        radius: isStart || isEnd ? 8 : 6,
        fillColor: isStart ? '#3b82f6' : isEnd ? '#22c55e' : '#4ade80',
        color: '#fff',
        weight: 2,
        fillOpacity: 1,
      }).addTo(map)

      // Click interactions (if not read-only)
      if (!readOnly) {
        let clickTimeout: NodeJS.Timeout | null = null

        marker.on('click', (e: L.LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(e)

          if (clickTimeout) {
            // Double click - remove the waypoint
            clearTimeout(clickTimeout)
            clickTimeout = null
            setWaypoints((prev) => {
              const updated = prev.filter((_, i) => i !== index)
              updateRoute(updated)
              return updated
            })
          } else {
            clickTimeout = setTimeout(() => {
              clickTimeout = null
              // Single click on final marker completes the loop
              if (isEnd && waypoints.length >= 2) {
                const firstPoint = waypoints[0]
                setWaypoints((prev) => {
                  const updated = [...prev, { lat: firstPoint.lat, lng: firstPoint.lng }]
                  updateRoute(updated)
                  return updated
                })
              }
            }, 250)
          }
        })
      }

      markersRef.current.push(marker)
    })

    // Draw polyline from routed path (or waypoints if no route yet)
    const pathToShow = routedPath.length > 0 ? routedPath : waypoints
    if (pathToShow.length >= 2) {
      const latLngs = pathToShow.map((p) => [p.lat, p.lng] as [number, number])
      polylineRef.current = L.polyline(latLngs, {
        color: '#4ade80',
        weight: 4,
        opacity: 0.9,
      }).addTo(map)

      // Fit bounds to show entire route
      map.fitBounds(polylineRef.current.getBounds(), { padding: [50, 50] })
    }

    // Emit route data
    const elevationGainM = Math.round(routeDistance * 8) // ~8m per km estimate
    const estimatedDurationMin = estimateDuration(routeDistance)

    if (onRouteChange) {
      onRouteChange({
        points: waypoints,
        pathPoints: routedPath,
        distanceKm: routeDistance,
        elevationGainM,
        estimatedDurationMin,
      })
    }
  }, [waypoints, routedPath, routeDistance, onRouteChange, readOnly, updateRoute])

  // Sync external points prop
  useEffect(() => {
    if (points.length !== waypoints.length) {
      setWaypoints(points)
      updateRoute(points)
    }
  }, [points, waypoints.length, updateRoute])

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="w-full h-72 bg-muted"
        style={{ minHeight: '288px' }}
      />
      {isRouting && (
        <div className="absolute top-2 left-2 bg-card/90 text-xs text-muted-foreground px-2 py-1 rounded">
          Finding path...
        </div>
      )}
    </div>
  )
}
