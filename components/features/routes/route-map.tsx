'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface RoutePoint {
  lat: number
  lng: number
}

interface RouteData {
  points: RoutePoint[]
  distanceKm: number
  elevationGainM: number
  estimatedDurationMin: number
}

interface RouteMapProps {
  points?: RoutePoint[]
  onRouteChange?: (data: RouteData) => void
  readOnly?: boolean
}

// Calculate distance between two points using Haversine formula
function calculateDistance(p1: RoutePoint, p2: RoutePoint): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180
  const dLon = ((p2.lng - p1.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Calculate total route distance
function calculateTotalDistance(points: RoutePoint[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += calculateDistance(points[i - 1], points[i])
  }
  return total
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
  const [localPoints, setLocalPoints] = useState<RoutePoint[]>(points)

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Default to a reasonable location (can be updated with geolocation)
    const defaultCenter: [number, number] = [51.5074, -0.1278] // London

    const map = L.map(mapRef.current, {
      center: defaultCenter,
      zoom: 14,
      zoomControl: false,
    })

    // Add zoom control to top-right
    L.control.zoom({ position: 'topright' }).addTo(map)

    // Use CartoDB Positron for a minimal, clean look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map

    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.setView([position.coords.latitude, position.coords.longitude], 15)
        },
        () => {
          // Geolocation failed, keep default
        }
      )
    }

    // Click handler to add points
    if (!readOnly) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const newPoint = { lat: e.latlng.lat, lng: e.latlng.lng }
        setLocalPoints((prev) => {
          const updated = [...prev, newPoint]
          return updated
        })
      })
    }

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [readOnly])

  // Update markers and polyline when points change
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

    // Add markers for each point
    localPoints.forEach((point, index) => {
      const isStart = index === 0
      const isEnd = index === localPoints.length - 1 && localPoints.length > 1

      const marker = L.circleMarker([point.lat, point.lng], {
        radius: isStart || isEnd ? 8 : 5,
        fillColor: isStart ? '#3b82f6' : isEnd ? '#22c55e' : '#4ade80',
        color: '#fff',
        weight: 2,
        fillOpacity: 1,
      }).addTo(map)

      // Click to remove point (if not read-only)
      if (!readOnly) {
        marker.on('click', (e: L.LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(e)
          setLocalPoints((prev) => prev.filter((_, i) => i !== index))
        })
      }

      markersRef.current.push(marker)
    })

    // Draw polyline connecting points
    if (localPoints.length >= 2) {
      const latLngs = localPoints.map((p) => [p.lat, p.lng] as [number, number])
      polylineRef.current = L.polyline(latLngs, {
        color: '#4ade80',
        weight: 3,
        opacity: 0.8,
      }).addTo(map)

      // Fit bounds to show entire route
      map.fitBounds(polylineRef.current.getBounds(), { padding: [50, 50] })
    }

    // Calculate and emit route data
    const distanceKm = calculateTotalDistance(localPoints)
    const estimatedDurationMin = estimateDuration(distanceKm)

    // Simple elevation estimate (placeholder - would need elevation API for real data)
    const elevationGainM = Math.round(distanceKm * 8) // ~8m per km average

    if (onRouteChange) {
      onRouteChange({
        points: localPoints,
        distanceKm,
        elevationGainM,
        estimatedDurationMin,
      })
    }
  }, [localPoints, onRouteChange, readOnly])

  // Sync external points prop
  useEffect(() => {
    if (points.length !== localPoints.length) {
      setLocalPoints(points)
    }
  }, [points])

  return (
    <div
      ref={mapRef}
      className="w-full h-64 bg-muted"
      style={{ minHeight: '256px' }}
    />
  )
}
