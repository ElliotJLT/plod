/**
 * Route Types
 *
 * Types for run routes with elevation, lighting, and conditions.
 * Routes can be LLM-generated or manually created.
 */

export type LightingScore = 'well_lit' | 'partial' | 'unlit' | 'unknown'

export type SurfaceType = 'paved' | 'mixed' | 'trail' | 'unknown'

export type RouteType = 'loop' | 'out_and_back' | 'point_to_point'

/**
 * Geographic coordinates
 */
export interface Coordinates {
  lat: number
  lng: number
}

/**
 * A saved run route
 */
export interface RunRoute {
  id: string
  userId: string

  /** User-given name for the route */
  name: string

  /** Optional description */
  description?: string

  /** Total distance in kilometers */
  distanceKm: number

  /** Total elevation gain in meters */
  elevationGain: number

  /** Total elevation loss in meters */
  elevationLoss: number

  /** Elevation samples along the route (meters) */
  elevationProfile: number[]

  /** Route geometry as GeoJSON LineString coordinates */
  geometry: Array<[number, number]> // [lng, lat] pairs

  /** Start point */
  startPoint: Coordinates

  /** End point */
  endPoint: Coordinates

  /** Type of route */
  routeType: RouteType

  /** Overall lighting assessment */
  lightingScore: LightingScore

  /** Primary surface type */
  surface: SurfaceType

  /** Is this a favorite? */
  isFavorite: boolean

  /** Number of times this route has been used */
  timesUsed: number

  /** When the route was last used */
  lastUsedAt?: string

  /** How the route was created */
  source: 'manual' | 'generated' | 'imported'

  createdAt: string
  updatedAt: string
}

/**
 * Weather and conditions for a route at a specific time
 */
export interface RouteConditions {
  routeId: string
  queriedAt: string

  /** Temperature in Celsius */
  temperature: number

  /** Feels-like temperature */
  feelsLike: number

  /** Weather description */
  conditions: string

  /** Weather icon code */
  icon: string

  /** Air Quality Index */
  aqi: number

  /** AQI label (Good, Moderate, etc.) */
  aqiLabel: string

  /** Sunrise time (ISO) */
  sunriseTime: string

  /** Sunset time (ISO) */
  sunsetTime: string

  /** Is it currently daylight? */
  isDaylight: boolean

  /** Wind speed in km/h */
  windSpeed: number

  /** Wind direction */
  windDirection: string

  /** Precipitation probability (0-100) */
  precipProbability: number
}

/**
 * Parameters for generating a route via LLM
 */
export interface RouteGenerationRequest {
  /** Natural language request from user */
  userRequest: string

  /** Starting location */
  startPoint: Coordinates

  /** Should route return to start? */
  returnToStart: boolean
}

/**
 * Parsed route parameters from LLM
 */
export interface ParsedRouteParams {
  /** Target distance in km */
  targetDistanceKm: number

  /** Maximum acceptable elevation gain */
  maxElevationGain?: number

  /** Lighting preference */
  lightingPreference: LightingScore | 'any'

  /** Route type preference */
  routeTypePreference: RouteType | 'any'

  /** Surface preference */
  surfacePreference: SurfaceType | 'any'

  /** Specific landmarks or areas to include */
  landmarks?: string[]

  /** Areas to avoid */
  avoid?: string[]
}

/**
 * A route suggestion from the generator
 */
export interface RouteSuggestion {
  /** Temporary ID for this suggestion */
  tempId: string

  /** Generated route data */
  route: Omit<RunRoute, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'timesUsed' | 'lastUsedAt' | 'isFavorite'>

  /** Why this route was suggested */
  reasoning: string

  /** Current conditions for this route */
  conditions?: RouteConditions

  /** Google Maps shareable link */
  googleMapsUrl: string
}

/**
 * Input for creating a route manually
 */
export interface CreateRouteInput {
  name: string
  description?: string

  /** Array of [lng, lat] coordinates */
  geometry: Array<[number, number]>

  /** Or provide waypoints and let the API fill in */
  waypoints?: Coordinates[]

  surface?: SurfaceType
  lightingScore?: LightingScore
}

/**
 * Route list filters
 */
export interface RouteFilters {
  /** Filter by minimum distance */
  minDistanceKm?: number

  /** Filter by maximum distance */
  maxDistanceKm?: number

  /** Filter by lighting */
  lighting?: LightingScore

  /** Filter by surface */
  surface?: SurfaceType

  /** Only show favorites */
  favoritesOnly?: boolean

  /** Sort by */
  sortBy?: 'name' | 'distance' | 'lastUsed' | 'timesUsed' | 'created'

  /** Sort direction */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Elevation point along a route
 */
export interface ElevationPoint {
  /** Distance from start in km */
  distanceKm: number

  /** Elevation in meters */
  elevation: number

  /** Coordinates at this point */
  coordinates: Coordinates
}

/**
 * Detailed elevation analysis
 */
export interface ElevationAnalysis {
  /** Minimum elevation on route */
  minElevation: number

  /** Maximum elevation on route */
  maxElevation: number

  /** Total climb */
  totalGain: number

  /** Total descent */
  totalLoss: number

  /** Elevation points for charting */
  profile: ElevationPoint[]

  /** Text description of the elevation */
  description: string // e.g., "Mostly flat with one gentle hill"
}

/**
 * Lighting segment on a route
 */
export interface LightingSegment {
  /** Start distance in km */
  startKm: number

  /** End distance in km */
  endKm: number

  /** Lighting level for this segment */
  lighting: LightingScore

  /** Street/path name if available */
  streetName?: string
}

/**
 * Detailed lighting analysis
 */
export interface LightingAnalysis {
  /** Overall score */
  overallScore: LightingScore

  /** Percentage of route that's well lit */
  wellLitPercent: number

  /** Individual segments */
  segments: LightingSegment[]

  /** Recommendation for night running */
  nightRecommendation: string
}
