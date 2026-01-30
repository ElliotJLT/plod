'use client'

import { format, parseISO } from 'date-fns'
import { AlertCircle, ArrowRight, Check, X } from 'lucide-react'
import type { CascadePreview, RiskLevel } from '@/lib/types/schedule'
import { cn } from '@/lib/utils'

interface CascadePreviewSheetProps {
  preview: CascadePreview | null
  onConfirm: () => void
  onCancel: () => void
}

const RISK_STYLES: Record<RiskLevel, { bg: string; text: string; label: string }> = {
  low: {
    bg: 'bg-accent/10',
    text: 'text-accent',
    label: 'Low impact',
  },
  moderate: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    label: 'Moderate impact',
  },
  high: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    label: 'Higher impact',
  },
}

export function CascadePreviewSheet({
  preview,
  onConfirm,
  onCancel,
}: CascadePreviewSheetProps) {
  if (!preview) return null

  const { targetRun, action, newDate, effect, affectedRuns, aiSuggestion } = preview
  const riskStyle = RISK_STYLES[effect.riskLevel]

  const actionLabel =
    action === 'skip'
      ? 'Skipping'
      : `Moving to ${format(parseISO(newDate!), 'EEEE')}`

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Sheet */}
      <div className="relative bg-card border-t border-border rounded-t-xl p-4 pb-8 max-h-[70vh] overflow-y-auto">
        {/* Handle */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-muted rounded-full" />

        {/* Header */}
        <div className="mt-4 mb-4">
          <p className="text-sm text-muted-foreground">{actionLabel}</p>
          <p className="text-lg font-medium text-foreground">
            {targetRun.distanceKm}km {targetRun.type} run
          </p>
        </div>

        {/* Risk indicator */}
        <div
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4',
            riskStyle.bg
          )}
        >
          <AlertCircle className={cn('h-4 w-4', riskStyle.text)} />
          <span className={cn('text-sm', riskStyle.text)}>{riskStyle.label}</span>
        </div>

        {/* Changes summary */}
        <div className="space-y-2 mb-4">
          {effect.summary.map((item, i) => (
            <p key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-accent">·</span>
              {item}
            </p>
          ))}
        </div>

        {/* Affected runs */}
        {affectedRuns.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Other runs adjust:</p>
            <div className="space-y-2">
              {affectedRuns.map((affected) => (
                <div
                  key={affected.run.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <span className="text-muted-foreground">
                    {affected.run.distanceKm}km {affected.run.type}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  {affected.change === 'moved' && affected.newDate && (
                    <span className="text-foreground">
                      {format(parseISO(affected.newDate), 'EEE')}
                    </span>
                  )}
                  {affected.change === 'type_changed' && affected.newType && (
                    <span className="text-foreground">{affected.newType} run</span>
                  )}
                  {affected.change === 'removed' && (
                    <span className="text-muted-foreground">removed</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI suggestion */}
        <div className="bg-muted/30 rounded-lg p-3 mb-6">
          <p className="text-sm text-foreground">{aiSuggestion}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
          >
            <Check className="h-4 w-4" />
            {action === 'skip' ? 'Skip run' : 'Move run'}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Inline cascade summary for smaller contexts
 */
interface CascadeSummaryProps {
  effect: CascadePreview['effect']
}

export function CascadeSummary({ effect }: CascadeSummaryProps) {
  const riskStyle = RISK_STYLES[effect.riskLevel]

  return (
    <div className="space-y-2">
      <div className={cn('inline-flex items-center gap-1 text-xs', riskStyle.text)}>
        <AlertCircle className="h-3 w-3" />
        {riskStyle.label}
      </div>

      {effect.runsAffected > 0 && (
        <p className="text-xs text-muted-foreground">
          {effect.runsAffected} run{effect.runsAffected > 1 ? 's' : ''} affected
        </p>
      )}

      {effect.recoveryDaysLost > 0 && (
        <p className="text-xs text-muted-foreground">
          {effect.recoveryDaysLost} rest day{effect.recoveryDaysLost > 1 ? 's' : ''}{' '}
          reduced
        </p>
      )}
    </div>
  )
}
