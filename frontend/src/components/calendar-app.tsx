import { useState, useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { CalendarDays, ListTodo, Clock, PanelRightOpen, PanelRightClose, Settings } from "lucide-react"
import { format } from "date-fns"
import { CalendarPanel } from "@/components/calendar-panel"
import { TodoPanel } from "@/components/todo-panel"
import { EventsPanel } from "@/components/events-panel"
import { useCalendarData } from "@/hooks/use-calendar-data"
import { formatDateKey } from "@/lib/calendar-store"
import { Button } from "@/components/ui/button"

type SidebarTab = "events" | "todos"  

export function CalendarApp() {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date())
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("events")
  const [weekStart, setWeekStart] = useState<"monday" | "sunday">(
    (localStorage.getItem("weekStart") as "monday" | "sunday") || "sunday"
  )

  const {
    events,
    todos,
    addEvent,
    deleteEvent,
    addTodo,
    toggleTodo,
    deleteTodo,
  } = useCalendarData()

  // Listen for week start changes from admin page
  useEffect(() => {
    const handleWeekStartChange = (e: Event) => {
      const event = e as CustomEvent<"monday" | "sunday">
      setWeekStart(event.detail)
    }

    window.addEventListener("weekStartChanged", handleWeekStartChange)
    return () => window.removeEventListener("weekStartChanged", handleWeekStartChange)
  }, [])

  const dateKey = formatDateKey(selectedDate)
  const dayEvents = events.filter((e) => e.date === dateKey)
  const dayTodos = todos.filter((t) => t.date === dateKey)

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date)
  }, [])

  const handleAddTodo = useCallback(
    (text: string) => addTodo(text, dateKey),
    [addTodo, dateKey],
  )

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2">
        {/* Left: brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center rounded-md bg-brand p-1">
            <CalendarDays className="size-3.5 text-brand-foreground" />
          </div>
          <h1 className="text-sm font-semibold tracking-tight text-foreground">Project 2 Calender App</h1>
        </div>

        {/* Center: selected date info */}
        <p className="text-xs text-muted-foreground">
          {format(selectedDate, "EEEE, MMMM d, yyyy")}
        </p>

        {/* Right: sidebar tabs + toggle */}
        <div className="flex items-center gap-1">
          {/* Sidebar tab toggles */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSidebarTab("events")
              if (!sidebarOpen) setSidebarOpen(true)
            }}
            className={`h-7 gap-1.5 px-2.5 text-[11px] ${
              sidebarOpen && sidebarTab === "events"
                ? "bg-brand text-brand-foreground hover:bg-brand/90 hover:text-brand-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="size-3" />
            <span className="hidden sm:inline">Events</span>
            {dayEvents.length > 0 && (
              <span className={`text-[10px] ${sidebarOpen && sidebarTab === "events" ? "text-brand-foreground/70" : "text-muted-foreground"}`}>
                {dayEvents.length}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSidebarTab("todos")
              if (!sidebarOpen) setSidebarOpen(true)
            }}
            className={`h-7 gap-1.5 px-2.5 text-[11px] ${
              sidebarOpen && sidebarTab === "todos"
                ? "bg-brand text-brand-foreground hover:bg-brand/90 hover:text-brand-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ListTodo className="size-3" />
            <span className="hidden sm:inline">Todos</span>
            {dayTodos.filter((t) => !t.completed).length > 0 && (
              <span className={`text-[10px] ${sidebarOpen && sidebarTab === "todos" ? "text-brand-foreground/70" : "text-muted-foreground"}`}>
                {dayTodos.filter((t) => !t.completed).length}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="size-7 bg-brand/10 text-brand hover:bg-brand/20"
            onClick={() => navigate("/admin")}
            aria-label="Admin settings"
          >
            <Settings className="size-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? (
              <PanelRightClose className="size-3.5" />
            ) : (
              <PanelRightOpen className="size-3.5" />
            )}
          </Button>
        </div>
      </header>

      {/* Body: Calendar grid + optional sidebar */}
      <div className="flex min-h-0 flex-1">
        {/* Main calendar grid */}
        <main className="min-h-0 min-w-0 flex-1">
          <CalendarPanel
            selectedDate={selectedDate}
            displayMonth={displayMonth}
            onSelectDate={handleSelectDate}
            onMonthChange={setDisplayMonth}
            events={events}
            weekStart={weekStart}
          />
        </main>

        {/* Right sidebar */}
        <aside
          className={`shrink-0 border-l border-border transition-all duration-300 ease-in-out overflow-hidden ${
            sidebarOpen ? "w-80" : "w-0 border-l-0"
          }`}
        >
          <div className="flex h-full w-80 flex-col">
            {sidebarTab === "events" ? (
              <EventsPanel
                selectedDate={selectedDate}
                events={dayEvents}
                onAddEvent={addEvent}
                onDeleteEvent={deleteEvent}
              />
            ) : (
              <TodoPanel
                todos={dayTodos}
                onAddTodo={handleAddTodo}
                onToggleTodo={toggleTodo}
                onDeleteTodo={deleteTodo}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
