import { useState } from "react"
import { format } from "date-fns"
import { Plus, Clock, Trash2, MapPin, AlignLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { CalendarEvent } from "@/lib/calendar-store"
import { formatTime, formatDateKey } from "@/lib/calendar-store"

interface EventsPanelProps {
  selectedDate: Date
  events: CalendarEvent[]
  onAddEvent: (event: Omit<CalendarEvent, "id">) => void
  onDeleteEvent: (id: string) => void
}

export function EventsPanel({
  selectedDate,
  events,
  onAddEvent,
  onDeleteEvent,
}: EventsPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [time, setTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")

  const handleAddEvent = () => {
    if (!title.trim()) return
    onAddEvent({
      title: title.trim(),
      date: formatDateKey(selectedDate),
      time,
      endTime,
      description: description.trim() || undefined,
      location: location.trim() || undefined,
    })
    setTitle("")
    setTime("09:00")
    setEndTime("10:00")
    setDescription("")
    setLocation("")
    setDialogOpen(false)
  }

  const sortedEvents = [...events].sort((a, b) => {
    if (a.time && b.time) return a.time.localeCompare(b.time)
    if (a.time) return -1
    if (b.time) return 1
    return 0
  })

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {format(selectedDate, "MMM d")}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {sortedEvents.length} event{sortedEvents.length !== 1 && "s"}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-7 gap-1.5 bg-brand text-xs text-brand-foreground hover:bg-brand/90">
              <Plus className="size-3" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Event</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-2">

              {/* Title */}
              <div>
                <label htmlFor="event-title" className="mb-1.5 block text-sm font-medium text-foreground">
                  Title <span className="text-destructive">*</span>
                </label>
                <Input
                  id="event-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Event name"
                  className="bg-background"
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddEvent() }}
                />
              </div>

              {/* Start / End time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="event-start" className="mb-1.5 block text-sm font-medium text-foreground">
                    Start
                  </label>
                  <Input
                    id="event-start"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div>
                  <label htmlFor="event-end" className="mb-1.5 block text-sm font-medium text-foreground">
                    End
                  </label>
                  <Input
                    id="event-end"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="event-location" className="mb-1.5 block text-sm font-medium text-foreground">
                  Location
                </label>
                <Input
                  id="event-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add a location"
                  className="bg-background"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="event-description" className="mb-1.5 block text-sm font-medium text-foreground">
                  Description
                </label>
                <textarea
                  id="event-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description"
                  rows={3}
                  className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

            </div>
            <DialogFooter>
              <Button
                onClick={handleAddEvent}
                disabled={!title.trim()}
                className="bg-brand text-brand-foreground hover:bg-brand/90"
              >
                Add event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {sortedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-2 rounded-full bg-brand-muted p-2.5">
              <Clock className="size-4 text-brand" />
            </div>
            <p className="text-xs font-medium text-foreground">No events</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Add an event to get started
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {sortedEvents.map((event) => (
              <div
                key={event.id}
                className="group flex items-start gap-2.5 rounded-lg border border-border p-2.5 transition-colors hover:bg-accent"
              >
                <div className="mt-0.5 flex h-6 w-1 shrink-0 rounded-full bg-brand" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground">{event.title}</p>
                  {event.time && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {formatTime(event.time)}
                      {event.endTime && ` — ${formatTime(event.endTime)}`}
                    </p>
                  )}
                  {event.location && (
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="size-2.5 shrink-0" />
                      {event.location}
                    </p>
                  )}
                  {event.description && (
                    <p className="mt-0.5 flex items-start gap-1 text-[11px] text-muted-foreground">
                      <AlignLeft className="mt-px size-2.5 shrink-0" />
                      <span className="line-clamp-2">{event.description}</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onDeleteEvent(event.id)}
                  className="mt-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={`Delete ${event.title}`}
                >
                  <Trash2 className="size-3 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}