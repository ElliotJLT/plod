'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProfileData {
  heightCm: number | null
  weightKg: number | null
  longestRunKm: number | null
  currentWeeklyKm: number | null
  runsPerWeek: 3 | 4
  targetDate: string
}

const STEPS = [
  { id: 'intro', title: 'Welcome' },
  { id: 'body', title: 'About you' },
  { id: 'running', title: 'Your running' },
  { id: 'plan', title: 'Your goal' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<ProfileData>({
    heightCm: null,
    weightKg: null,
    longestRunKm: null,
    currentWeeklyKm: null,
    runsPerWeek: 3,
    targetDate: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentStep = STEPS[step]
  const isLastStep = step === STEPS.length - 1
  const canProceed = () => {
    switch (currentStep.id) {
      case 'intro':
        return true
      case 'body':
        return data.heightCm && data.weightKg
      case 'running':
        return data.longestRunKm && data.currentWeeklyKm
      case 'plan':
        return data.targetDate
      default:
        return false
    }
  }

  async function handleNext() {
    if (isLastStep) {
      setIsSubmitting(true)
      setError(null)
      try {
        const res = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const json = await res.json()
        if (res.ok) {
          router.push('/')
        } else {
          setError(json.error || 'Failed to create plan')
        }
      } catch (err) {
        console.error('Onboarding failed:', err)
        setError('Network error - please try again')
      } finally {
        setIsSubmitting(false)
      }
    } else {
      setStep((s) => s + 1)
    }
  }

  function handleBack() {
    setStep((s) => Math.max(0, s - 1))
  }

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      {/* Progress */}
      <div className="px-4 pt-8 pb-4">
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                i <= step ? 'bg-accent' : 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        {currentStep.id === 'intro' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-light text-foreground">Welcome to Plod</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A calm companion for your running journey. No pace tracking, no
              performance pressure—just consistent progress toward your goal.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A few questions to build a training plan that fits your
              life. Everything adapts as you go.
            </p>
          </div>
        )}

        {currentStep.id === 'body' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-light text-foreground">About you</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Used for general context, not pace calculations.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={data.heightCm || ''}
                  onChange={(e) =>
                    setData((d) => ({ ...d, heightCm: Number(e.target.value) || null }))
                  }
                  placeholder="175"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={data.weightKg || ''}
                  onChange={(e) =>
                    setData((d) => ({ ...d, weightKg: Number(e.target.value) || null }))
                  }
                  placeholder="70"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep.id === 'running' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-light text-foreground">Your running</h1>
              <p className="text-sm text-muted-foreground mt-1">
                This helps us build a plan that starts where you are.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-2">
                  Furthest run (km)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={data.longestRunKm || ''}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      longestRunKm: Number(e.target.value) || null,
                    }))
                  }
                  placeholder="10"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">
                  Current weekly distance (km)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={data.currentWeeklyKm || ''}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      currentWeeklyKm: Number(e.target.value) || null,
                    }))
                  }
                  placeholder="15"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Approximate total from the past few weeks
                </p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">
                  Preferred runs per week
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setData((d) => ({ ...d, runsPerWeek: 3 }))}
                    className={cn(
                      'px-4 py-3 rounded-xl border text-sm transition-colors',
                      data.runsPerWeek === 3
                        ? 'border-accent bg-accent/10 text-foreground'
                        : 'border-border bg-card text-muted-foreground'
                    )}
                  >
                    3 runs
                    <span className="block text-xs opacity-60 mt-0.5">
                      More recovery time
                    </span>
                  </button>
                  <button
                    onClick={() => setData((d) => ({ ...d, runsPerWeek: 4 }))}
                    className={cn(
                      'px-4 py-3 rounded-xl border text-sm transition-colors',
                      data.runsPerWeek === 4
                        ? 'border-accent bg-accent/10 text-foreground'
                        : 'border-border bg-card text-muted-foreground'
                    )}
                  >
                    4 runs
                    <span className="block text-xs opacity-60 mt-0.5">
                      Standard progression
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep.id === 'plan' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-light text-foreground">Your goal</h1>
              <p className="text-sm text-muted-foreground mt-1">
                When is your half marathon?
              </p>
            </div>

            <div>
              <label className="text-sm text-muted-foreground block mb-2">
                Race date
              </label>
              <input
                type="date"
                value={data.targetDate}
                onChange={(e) =>
                  setData((d) => ({ ...d, targetDate: e.target.value }))
                }
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>

            {data.targetDate && (
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground mb-1">Your plan</p>
                <p className="text-lg font-light text-foreground">
                  {Math.ceil(
                    (new Date(data.targetDate).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24 * 7)
                  )}{' '}
                  weeks
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Starting from {data.longestRunKm}km long run,{' '}
                  {data.currentWeeklyKm}km/week
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 pb-2">
          <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
            {error}
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="px-4 pb-8 flex gap-3">
        {step > 0 && (
          <button
            onClick={handleBack}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!canProceed() || isSubmitting}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
            canProceed()
              ? 'bg-accent text-accent-foreground hover:bg-accent/90'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          )}
        >
          {isSubmitting ? (
            'Creating plan...'
          ) : isLastStep ? (
            'Create my plan'
          ) : (
            <>
              Continue
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
