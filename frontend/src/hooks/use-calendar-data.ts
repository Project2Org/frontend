import { useState, useCallback, useEffect, useRef } from "react"
import type { CalendarEvent, TodoItem } from "@/lib/calendar-store"
import { generateId } from "@/lib/calendar-store"
import { eventsApi, todosApi } from "@/lib/api"

export function useCalendarData() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [todosLoading, setTodosLoading] = useState(true)

  // Track API availability independently so a missing events endpoint
  // doesn't stop todos from syncing with the backend.
  const [todosApiAvailable, setTodosApiAvailable] = useState<boolean | null>(null)
  const [eventsApiAvailable, setEventsApiAvailable] = useState<boolean | null>(null)

  const initialised = useRef(false)

  useEffect(() => {
    if (initialised.current) return
    initialised.current = true

    console.log("trying todos API...")
    todosApi.getAll()
      .then((apiTodos) => {
        console.log("todos loaded:", apiTodos)
        setTodos(apiTodos)
        setTodosApiAvailable(true)
      })
      .catch((err) => { console.log("todos API failed:", err)
        setTodosApiAvailable(false)})
      .finally(() => setTodosLoading(false))

    eventsApi.getAll()
      .then((apiEvents) => {
        setEvents(apiEvents)
        setEventsApiAvailable(true)
      })
      .catch(() => setEventsApiAvailable(false))
  }, [])

  // ─── Events ────────────────────────────────────────────────────

  const addEvent = useCallback(
    async (event: Omit<CalendarEvent, "id">) => {
      if (eventsApiAvailable) {
        try {
          const created = await eventsApi.create(event)
          setEvents((prev) => [...prev, created])
          return
        } catch { /* fall through to local */ }
      }
      setEvents((prev) => [...prev, { ...event, id: generateId() }])
    },
    [eventsApiAvailable],
  )

  const deleteEvent = useCallback(
    async (id: string) => {
      if (eventsApiAvailable) {
        try { await eventsApi.delete(id) } catch { /* continue */ }
      }
      setEvents((prev) => prev.filter((e) => e.id !== id))
    },
    [eventsApiAvailable],
  )

  // ─── Todos ─────────────────────────────────────────────────────

  const addTodo = useCallback(
    async (text: string, date: string, onError?: () => void) => {
      const todo: Omit<TodoItem, "id"> = { text, completed: false, date }
      if (todosApiAvailable) {
        try {
          const created = await todosApi.create(todo)
          setTodos((prev) => [...prev, created])
          return
        } catch {
          onError?.()
          return
        }
      }
      // Local fallback when API is unavailable
      setTodos((prev) => [...prev, { ...todo, id: generateId() }])
    },
    [todosApiAvailable],
  )

  const toggleTodo = useCallback(
    async (id: string) => {
      // Optimistic update for snappy UI
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
      )
      if (todosApiAvailable) {
        const existing = todos.find((t) => t.id === id)
        if (existing) {
          try {
            await todosApi.update(id, { completed: !existing.completed })
          } catch {
            // Roll back on failure
            setTodos((prev) =>
              prev.map((t) => (t.id === id ? { ...t, completed: existing.completed } : t)),
            )
          }
        }
      }
    },
    [todosApiAvailable, todos],
  )

  const deleteTodo = useCallback(
    async (id: string, onError?: () => void) => {
      if (todosApiAvailable) {
        try {
          await todosApi.delete(id)
        } catch {
          onError?.()
          return // Don't remove locally if the server rejected it
        }
      }
      setTodos((prev) => prev.filter((t) => t.id !== id))
    },
    [todosApiAvailable],
  )

  return {
    events,
    todos,
    todosLoading,
    addEvent,
    deleteEvent,
    addTodo,
    toggleTodo,
    deleteTodo,
  }
}