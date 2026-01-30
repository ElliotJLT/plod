'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import {
  addDays,
  format,
  isSameDay,
  isToday,
  isPast,
  parseISO,
  startOfWeek,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ScheduledRun, ScheduleWeek, CascadePreview } from '@/lib/types/schedule'
import { RunCard, EmptyDaySlot } from './run-card'
import { CascadePreviewSheet } from './cascade-preview'
import { cn } from '@/lib/utils'

interface WeekCalendarProps {
  runs: ScheduledRun[]
  currentWeekStart: Date
  onWeekChange: (weekStart: Date) => void
  onMoveRun: (runId: string, newDate: string) => void
  onSkipRun: (runId: string) => void
  onCalculateCascade: (runId: string, newDate: string) => CascadePreview | null
  weekInfo: ScheduleWeek
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface DayColumnProps {
  date: Date
  run?: ScheduledRun
  isDragTarget: boolean
  onSkip?: (runId: string) => void
}

function DayColumn({ date, run, isDragTarget, onSkip }: DayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: format(date, 'yyyy-MM-dd'),
  })

  const dateStr = format(date, 'yyyy-MM-dd')
  const dayOfWeek = (date.getDay() + 6) % 7 // Monday = 0
  const isWeekend = dayOfWeek >= 5
  const dateIsPast = isPast(date) && !isToday(date)
  const dateIsToday = isToday(date)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col min-h-[120px] p-2 rounded-lg transition-colors',
        isOver && isDragTarget && 'bg-accent/10 ring-2 ring-accent/30',
        dateIsToday && 'bg-accent/5',
        dateIsPast && 'opacity-60'
      )}
    >
      {/* Day header */}
      <div className="flex items-baseline justify-between mb-2">
        <span
          className={cn(
            'text-xs font-medium',
            dateIsToday ? 'text-accent' : 'text-muted-foreground'
          )}
        >
          {DAY_LABELS[dayOfWeek]}
        </span>
        <span
          className={cn(
            'text-sm',
            dateIsToday
              ? 'text-accent font-medium'
              : isWeekend
              ? 'text-foreground'
              : 'text-muted-foreground'
          )}
        >
          {format(date, 'd')}
        </span>
      </div>

      {/* Run or empty slot */}
      <div className="flex-1">
        {run ? (
          <RunCard
            run={run}
            isCompact
            onSkip={!dateIsPast ? onSkip : undefined}
          />
        ) : (
          <EmptyDaySlot isRestDay={!isWeekend} />
        )}
      </div>
    </div>
  )
}

export function WeekCalendar({
  runs,
  currentWeekStart,
  onWeekChange,
  onMoveRun,
  onSkipRun,
  onCalculateCascade,
  weekInfo,
}: WeekCalendarProps) {
  const [activeRun, setActiveRun] = useState<ScheduledRun | null>(null)
  const [cascadePreview, setCascadePreview] = useState<CascadePreview | null>(null)
  const [pendingMove, setPendingMove] = useState<{
    runId: string
    newDate: string
  } | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    })
  )

  // Build array of 7 days starting from Monday
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(currentWeekStart, i)
  )

  // Map runs to their dates
  const runsByDate = new Map<string, ScheduledRun>()
  for (const run of runs) {
    if (run.status !== 'skipped') {
      runsByDate.set(run.currentDate, run)
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const run = event.active.data.current?.run as ScheduledRun
    setActiveRun(run)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveRun(null)

    const { active, over } = event
    if (!over) return

    const runId = active.id as string
    const newDate = over.id as string

    // Don't do anything if dropped on same date
    const run = runs.find((r) => r.id === runId)
    if (!run || run.currentDate === newDate) return

    // Calculate cascade effect
    const preview = onCalculateCascade(runId, newDate)
    if (preview) {
      setCascadePreview(preview)
      setPendingMove({ runId, newDate })
    }
  }

  function handleConfirmMove() {
    if (pendingMove) {
      onMoveRun(pendingMove.runId, pendingMove.newDate)
      setPendingMove(null)
      setCascadePreview(null)
    }
  }

  function handleCancelMove() {
    setPendingMove(null)
    setCascadePreview(null)
  }

  function handleSkipRun(runId: string) {
    // Could show cascade preview for skipping too
    onSkipRun(runId)
  }

  function goToPreviousWeek() {
    onWeekChange(addDays(currentWeekStart, -7))
  }

  function goToNextWeek() {
    onWeekChange(addDays(currentWeekStart, 7))
  }

  const progressPercent =
    weekInfo.plannedRuns > 0
      ? (weekInfo.completedRuns / weekInfo.plannedRuns) * 100
      : 0

  return (
    <div className="space-y-4">
      {/* Week header with navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goToPreviousWeek}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            Week {weekInfo.weekNumber}
          </p>
          <p className="text-xs text-muted-foreground">
            {format(currentWeekStart, 'MMM d')} –{' '}
            {format(addDays(currentWeekStart, 6), 'MMM d')}
          </p>
        </div>

        <button
          onClick={goToNextWeek}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Week summary */}
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-xs text-muted-foreground">
            {weekInfo.completedRuns} of {weekInfo.plannedRuns} runs
          </p>
          <p className="text-xs text-muted-foreground">
            {weekInfo.completedDistanceKm.toFixed(1)} /{' '}
            {weekInfo.plannedDistanceKm.toFixed(1)} km
          </p>
        </div>
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Calendar grid */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd')
            const run = runsByDate.get(dateStr)

            return (
              <DayColumn
                key={dateStr}
                date={date}
                run={run}
                isDragTarget={!!activeRun && activeRun.currentDate !== dateStr}
                onSkip={handleSkipRun}
              />
            )
          })}
        </div>

        <DragOverlay>
          {activeRun && <RunCard run={activeRun} isDragging isCompact />}
        </DragOverlay>
      </DndContext>

      {/* Cascade preview sheet */}
      <CascadePreviewSheet
        preview={cascadePreview}
        onConfirm={handleConfirmMove}
        onCancel={handleCancelMove}
      />
    </div>
  )
}
