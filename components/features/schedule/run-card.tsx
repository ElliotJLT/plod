'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { format, parseISO } from 'date-fns'
import { GripVertical, Check, X, MoveRight } from 'lucide-react'
import type { ScheduledRun } from '@/lib/types/schedule'
import { cn } from '@/lib/utils'

interface RunCardProps {
  run: ScheduledRun
  isDragging?: boolean
  isCompact?: boolean
  onSkip?: (runId: string) => void
}

const RUN_TYPE_LABELS: Record<string, string> = {
  easy: 'Easy',
  long: 'Long',
  recovery: 'Recovery',
  moderate: 'Moderate',
}

const STATUS_STYLES: Record<string, string> = {
  scheduled: 'bg-card border-border',
  completed: 'bg-accent/10 border-accent/30',
  skipped: 'bg-muted/50 border-border opacity-50',
  moved: 'bg-card border-accent/50 border-dashed',
}

export function RunCard({ run, isDragging, isCompact, onSkip }: RunCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: run.id,
    data: { run },
    disabled: run.status === 'completed' || run.status === 'skipped',
  })

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 50 : undefined,
      }
    : undefined

  const isInteractive = run.status === 'scheduled' || run.status === 'moved'

  if (isCompact) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'rounded-md border p-2 transition-colors',
          STATUS_STYLES[run.status],
          isDragging && 'shadow-lg ring-2 ring-accent/50'
        )}
      >
        <div className="flex items-center justify-between gap-2">
          {isInteractive && (
            <button
              {...attributes}
              {...listeners}
              className="touch-none text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4" strokeWidth={1.5} />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {run.distanceKm}km
            </p>
            <p className="text-xs text-muted-foreground">
              {RUN_TYPE_LABELS[run.type]}
            </p>
          </div>
          {run.status === 'completed' && (
            <Check className="h-4 w-4 text-accent" strokeWidth={1.5} />
          )}
          {run.status === 'skipped' && (
            <X className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          )}
          {run.movedFrom && (
            <MoveRight className="h-4 w-4 text-accent" strokeWidth={1.5} />
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border p-3 transition-colors',
        STATUS_STYLES[run.status],
        isDragging && 'shadow-lg ring-2 ring-accent/50',
        isInteractive && 'hover:border-accent/50'
      )}
    >
      <div className="flex items-start gap-3">
        {isInteractive && (
          <button
            {...attributes}
            {...listeners}
            className="mt-1 touch-none text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5" strokeWidth={1.5} />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <p className="text-lg font-light text-foreground">
              {run.distanceKm}km
            </p>
            {run.status === 'completed' && (
              <span className="text-xs text-accent flex items-center gap-1">
                <Check className="h-3 w-3" strokeWidth={1.5} />
                Done
              </span>
            )}
            {run.status === 'skipped' && (
              <span className="text-xs text-muted-foreground">Skipped</span>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            {RUN_TYPE_LABELS[run.type]} run
          </p>

          {run.movedFrom && (
            <p className="text-xs text-accent mt-1 flex items-center gap-1">
              <MoveRight className="h-3 w-3" strokeWidth={1.5} />
              Moved from {format(parseISO(run.movedFrom), 'EEE')}
            </p>
          )}

          {run.effortRating && (
            <p className="text-xs text-muted-foreground mt-1">
              Felt: {run.effortRating}
            </p>
          )}
        </div>

        {isInteractive && onSkip && (
          <button
            onClick={() => onSkip(run.id)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Skip this run"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Placeholder for empty day slots
 */
export function EmptyDaySlot({ isRestDay }: { isRestDay?: boolean }) {
  return (
    <div className="rounded-md border border-dashed border-border/30 p-2 h-full min-h-[60px] flex items-center justify-center">
      <p className="text-xs text-muted-foreground/60">
        {isRestDay ? 'Rest' : '—'}
      </p>
    </div>
  )
}
