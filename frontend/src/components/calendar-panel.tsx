import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
  addMonths,
  subMonths,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CalendarEvent } from "@/lib/calendar-store"
import { formatDateKey } from "@/lib/calendar-store"

const WEEKDAYS_DEFAULT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const WEEKDAYS_MONDAY = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

interface CalendarPanelProps {
  selectedDate: Date
  displayMonth: Date
  onSelectDate: (date: Date) => void
  onMonthChange: (date: Date) => void
  events: CalendarEvent[]
  weekStart?: "sunday" | "monday"
}

export function CalendarPanel({
  selectedDate,
  displayMonth,
  onSelectDate,
  onMonthChange,
  events,
  weekStart = "sunday",
}: CalendarPanelProps) {
  const monthStart = startOfMonth(displayMonth)
  const monthEnd = endOfMonth(displayMonth)
  const weekStartsOnMonday = weekStart === "monday"
  const gridStart = startOfWeek(monthStart, { weekStartsOnMonday })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOnMonday })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const numWeeks = Math.ceil(days.length / 7)
  const weekdayLabels = weekStartsOnMonday ? WEEKDAYS_MONDAY : WEEKDAYS_DEFAULT

  const eventDates = new Set(events.map((e) => e.date))

  const eventsOnDay = (day: Date) =>
    events.filter((e) => e.date === formatDateKey(day))

  return (
    <div className="flex h-full flex-col">
      {/* Month nav */}
      <div className="flex shrink-0 items-center justify-between px-4 py-2">
        <h2 className="text-sm font-semibold text-foreground">
          {format(displayMonth, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => onMonthChange(subMonths(displayMonth, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => {
              const today = new Date()
              onMonthChange(today)
              onSelectDate(today)
            }}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => onMonthChange(addMonths(displayMonth, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid shrink-0 grid-cols-7 border-b border-border">
        {weekdayLabels.map((day) => (
          <div
            key={day}
            className="px-1.5 py-1 text-center text-[11px] font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div
        className="grid flex-1 grid-cols-7"
        style={{ gridTemplateRows: `repeat(${numWeeks}, minmax(0, 1fr))` }}
      >
        {days.map((day) => {
          const inMonth = isSameMonth(day, displayMonth)
          const selected = isSameDay(day, selectedDate)
          const today = isToday(day)
          const dateKey = formatDateKey(day)
          const hasEvent = eventDates.has(dateKey)
          const dayEvents = eventsOnDay(day)

          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate(day)}
              className={`relative flex flex-col items-start border-b border-r border-border p-1 text-left transition-colors
                ${selected ? "bg-brand-muted" : "hover:bg-accent"}
                ${!inMonth ? "opacity-40" : ""}
              `}
            >
              <span
                className={`flex size-5 items-center justify-center rounded-full text-[11px] leading-none
                  ${selected || today ? "bg-brand font-semibold text-brand-foreground" : "font-normal text-foreground"}
                `}
              >
                {day.getDate()}
              </span>

              {/* Event previews */}
              <div className="mt-0.5 flex w-full flex-col gap-px overflow-hidden">
                {dayEvents.slice(0, 2).map((evt) => (
                  <span
                    key={evt.id}
                    className="truncate rounded-sm bg-brand/10 px-1 text-[9px] leading-tight text-brand"
                  >
                    {evt.title}
                  </span>
                ))}
                {dayEvents.length > 2 && (
                  <span className="px-1 text-[9px] leading-tight text-muted-foreground">
                    +{dayEvents.length - 2} more
                  </span>
                )}
              </div>

              {/* Dot indicator */}
              {hasEvent && dayEvents.length === 0 && (
                <span className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-brand" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
