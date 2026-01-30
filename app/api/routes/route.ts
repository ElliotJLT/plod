import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

// Temporary: hardcoded user ID until auth is implemented
const TEMP_USER_ID = process.env.TEMP_USER_ID || 'demo-user'

export async function GET() {
  try {
    const supabase = await createServerSupabase()

    const { data: routes, error } = await supabase
      .from('routes')
      .select('*')
      .eq('user_id', TEMP_USER_ID)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Routes fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch routes' },
        { status: 500 }
      )
    }

    type RouteRecord = {
      id: string
      name: string
      distance_km: number
      elevation_gain: number | null
      lighting_score: string | null
      created_at: string
    }
    return NextResponse.json({
      routes: (routes as RouteRecord[]).map((route) => ({
        id: route.id,
        name: route.name,
        distanceKm: Number(route.distance_km),
        elevationGainM: Number(route.elevation_gain) || 0,
        lighting: route.lighting_score,
        createdAt: route.created_at,
      })),
    })
  } catch (error) {
    console.error('Routes API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, waypoints, pathPoints, distanceKm, elevationGainM, lighting } = body

    // Use pathPoints (routed path) or waypoints (user clicks)
    const points = pathPoints && pathPoints.length > 0 ? pathPoints : waypoints

    if (!waypoints || waypoints.length < 2) {
      return NextResponse.json(
        { error: 'Route must have at least 2 waypoints' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabase()

    // Check if it's a loop
    const isLoop = waypoints[0].lat === waypoints[waypoints.length - 1].lat &&
                   waypoints[0].lng === waypoints[waypoints.length - 1].lng

    const { data, error } = await supabase
      .from('routes')
      .insert({
        user_id: TEMP_USER_ID,
        name: name || `Route ${new Date().toLocaleDateString()}`,
        description: null,
        distance_km: distanceKm,
        elevation_gain: elevationGainM || 0,
        elevation_loss: 0,
        elevation_profile: [],
        geometry: { type: 'LineString', coordinates: points.map((p: { lat: number; lng: number }) => [p.lng, p.lat]) },
        start_lat: waypoints[0].lat,
        start_lng: waypoints[0].lng,
        end_lat: waypoints[waypoints.length - 1].lat,
        end_lng: waypoints[waypoints.length - 1].lng,
        route_type: isLoop ? 'loop' : 'point_to_point',
        lighting_score: lighting || 'unknown',
        surface: 'unknown',
        source: 'manual',
      })
      .select()
      .single()

    if (error) {
      console.error('Route creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create route', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      route: {
        id: data.id,
        name: data.name,
        distanceKm: Number(data.distance_km),
      },
    })
  } catch (error) {
    console.error('Routes API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
