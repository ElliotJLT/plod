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
      elevation_gain_m: number | null
      lighting_score: string | null
      created_at: string
    }
    return NextResponse.json({
      routes: (routes as RouteRecord[]).map((route) => ({
        id: route.id,
        name: route.name,
        distanceKm: Number(route.distance_km),
        elevationGainM: Number(route.elevation_gain_m) || 0,
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
    const { name, points, distanceKm, elevationGainM, lighting } = body

    if (!points || points.length < 2) {
      return NextResponse.json(
        { error: 'Route must have at least 2 points' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabase()

    // Generate Google Maps URL
    const waypoints = points.map((p: { lat: number; lng: number }) => `${p.lat},${p.lng}`).join('/')
    const googleMapsUrl = `https://www.google.com/maps/dir/${waypoints}`

    const { data, error } = await supabase
      .from('routes')
      .insert({
        user_id: TEMP_USER_ID,
        name: name || `Route ${new Date().toLocaleDateString()}`,
        distance_km: distanceKm,
        elevation_gain_m: elevationGainM || 0,
        lighting_score: lighting || 'unknown',
        path_coordinates: points,
        start_point: `POINT(${points[0].lng} ${points[0].lat})`,
        end_point: `POINT(${points[points.length - 1].lng} ${points[points.length - 1].lat})`,
        google_maps_url: googleMapsUrl,
        source: 'manual',
        route_type: points[0].lat === points[points.length - 1].lat &&
                    points[0].lng === points[points.length - 1].lng
          ? 'loop'
          : 'point_to_point',
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
