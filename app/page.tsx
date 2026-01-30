'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, parseISO, isToday, formatDistanceToNow } from 'date-fns'
import { Check, Cloud, Thermometer } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TodayData {
  hasActivePlan: boolean
  targetDate?: string
  goalRace?: string
  todayRun?: {
    id: string
    date: string
    distanceKm: number
    type: string
    status: string
  }
  nextRun?: {
    id: string
    date: string
    distanceKm: number
    type: string
  }
  lastRun?: {
    id: string
    date: string
    distanceKm: number
    type: string
    effortRating?: string
  }
  weekProgress?: {
    planned: number
    completed: number
    plannedKm: number
    completedKm: number
  }
}

const TYPE_LABELS: Record<string, string> = {
  easy: 'Easy',
  long: 'Long',
  recovery: 'Recovery',
  moderate: 'Moderate',
}

const EFFORT_OPTIONS = [
  { value: 'easy', label: 'Easy', description: 'Could have gone longer' },
  { value: 'good', label: 'Good', description: 'Just right' },
  { value: 'hard', label: 'Hard', description: 'Pushed myself' },
  { value: 'struggle', label: 'Tough', description: 'Really difficult' },
]

export default function Home() {
  const router = useRouter()
  const [data, setData] = useState<TodayData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEffortPicker, setShowEffortPicker] = useState(false)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const res = await fetch('/api/today')
      const json = await res.json()
      setData(json)

      // Redirect to onboarding if no active plan
      if (!json.hasActivePlan) {
        router.push('/onboarding')
      }
    } catch (error) {
      console.error('Failed to fetch today data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleComplete(effortRating: string) {
    if (!data?.todayRun) return

    setCompleting(true)
    try {
      const res = await fetch(`/api/runs/${data.todayRun.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ effortRating }),
      })

      if (res.ok) {
        setShowEffortPicker(false)
        fetchData() // Refresh data
      }
    } catch (error) {
      console.error('Failed to complete run:', error)
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pb-24 max-w-lg mx-auto">
        <header className="px-4 pt-8 pb-6">
          <h1 className="text-lg font-medium text-foreground">Today</h1>
        </header>
        <main className="px-4 space-y-3">
          <div className="rounded-xl border border-border bg-card p-4 h-24 animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-4 h-28 animate-pulse" />
            <div className="rounded-xl border border-border bg-card p-4 h-28 animate-pulse" />
          </div>
          <div className="rounded-xl border border-border bg-card p-4 h-16 animate-pulse" />
        </main>
      </div>
    )
  }

  if (!data?.hasActivePlan) {
    return null // Will redirect to onboarding
  }

  const displayRun = data.todayRun || data.nextRun
  const runIsToday = displayRun && isToday(parseISO(displayRun.date))

  return (
    <div className="min-h-screen pb-24 max-w-lg mx-auto">
      <header className="px-4 pt-8 pb-6">
        <h1 className="text-lg font-medium text-foreground">Today</h1>
      </header>

      <main className="px-4 space-y-3 stagger-children">
        {/* Conditions widget - placeholder */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Thermometer className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
              <div>
                <p className="text-2xl font-light text-foreground">12°</p>
                <p className="text-xs text-muted-foreground">Good for running</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-xs text-muted-foreground">Cloudy</span>
            </div>
          </div>
        </div>

        {/* Today's/Next run */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-card p-4 flex flex-col">
            <p className="text-xs text-muted-foreground">
              {runIsToday ? 'Today' : 'Next'}
            </p>
            {displayRun ? (
              <>
                <p className="text-2xl font-light text-foreground mt-1">
                  {displayRun.distanceKm}km
                </p>
                <p className="text-xs text-muted-foreground mt-auto pt-2">
                  {!runIsToday && format(parseISO(displayRun.date), 'EEE')} ·{' '}
                  {TYPE_LABELS[displayRun.type]}
                </p>
                {runIsToday && data.todayRun?.status === 'scheduled' && (
                  <button
                    onClick={() => setShowEffortPicker(true)}
                    className="mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium transition-colors hover:bg-accent/90"
                  >
                    <Check className="h-4 w-4" strokeWidth={1.5} />
                    Done
                  </button>
                )}
                {data.todayRun?.status === 'completed' && (
                  <p className="mt-2 text-xs text-accent flex items-center gap-1">
                    <Check className="h-3 w-3" strokeWidth={1.5} />
                    Completed
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">Rest day</p>
            )}
          </div>

          {/* Last run */}
          <div className="rounded-xl border border-border bg-card p-4 flex flex-col">
            <p className="text-xs text-muted-foreground">Last</p>
            {data.lastRun ? (
              <>
                <p className="text-2xl font-light text-foreground mt-1">
                  {data.lastRun.distanceKm}km
                </p>
                <p className="text-xs text-muted-foreground mt-auto pt-2">
                  {formatDistanceToNow(parseISO(data.lastRun.date), {
                    addSuffix: true,
                  })}
                  {data.lastRun.effortRating && ` · ${data.lastRun.effortRating}`}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">No runs yet</p>
            )}
          </div>
        </div>

        {/* Week progress */}
        {data.weekProgress && (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-baseline justify-between mb-3">
              <p className="text-xs text-muted-foreground">This week</p>
              <p className="text-xs text-muted-foreground">
                {data.weekProgress.completed}/{data.weekProgress.planned} runs
              </p>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-300"
                style={{
                  width: `${
                    data.weekProgress.planned > 0
                      ? (data.weekProgress.completed / data.weekProgress.planned) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        )}
      </main>

      {/* Effort picker sheet */}
      {showEffortPicker && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowEffortPicker(false)}
          />
          <div className="fixed inset-x-0 bottom-0 bg-card border-t border-border rounded-t-xl p-4 pb-8 animate-slide-up">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-muted rounded-full" />
            <div className="mt-4 mb-4">
              <p className="text-lg font-medium text-foreground">How did it feel?</p>
              <p className="text-sm text-muted-foreground">
                {data.todayRun?.distanceKm}km {TYPE_LABELS[data.todayRun?.type || '']}
              </p>
            </div>
            <div className="space-y-2">
              {EFFORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleComplete(option.value)}
                  disabled={completing}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-card hover:border-accent/50 transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {option.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
