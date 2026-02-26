import { useState, useCallback, useEffect, useRef } from "react"
import type { CalendarEvent, TodoItem } from "@/lib/calendar-store"
import { formatDateKey, generateId } from "@/lib/calendar-store"
import { eventsApi, todosApi } from "@/lib/api"

// ─── Seed data (used when API is unavailable) ───────────────────

function seedEvents(): CalendarEvent[] {
  const today = formatDateKey(new Date())
  return [
    { id: "1", title: "Team standup", date: today, time: "09:00", endTime: "09:30" },
    { id: "2", title: "Design review", date: today, time: "14:00", endTime: "15:00" },
    { id: "3", title: "Lunch with Sarah", date: today, time: "12:00", endTime: "13:00" },
  ]
}

function seedTodos(): TodoItem[] {
  const today = formatDateKey(new Date())
  return [
    { id: "t1", text: "Review pull requests", completed: false, date: today },
    { id: "t2", text: "Update project docs", completed: false, date: today },
    { id: "t3", text: "Send weekly report", completed: true, date: today },
  ]
}

// ─── Hook ───────────────────────────────────────────────────────

export function useCalendarData() {
  const [events, setEvents] = useState<CalendarEvent[]>(seedEvents)
  const [todos, setTodos] = useState<TodoItem[]>(seedTodos)
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null)
  const checkedApi = useRef(false)

  useEffect(() => {
    if (checkedApi.current) return
    checkedApi.current = true

    async function tryApi() {
      try {
        const [apiEvents, apiTodos] = await Promise.all([
          eventsApi.getAll(),
          todosApi.getAll(),
        ])
        setEvents(apiEvents)
        setTodos(apiTodos)
        setApiAvailable(true)
      } catch {
        setApiAvailable(false)
      }
    }
    tryApi()
  }, [])

  const addEvent = useCallback(
    async (event: Omit<CalendarEvent, "id">) => {
      if (apiAvailable) {
        try {
          const created = await eventsApi.create(event)
          setEvents((prev) => [...prev, created])
          return
        } catch { /* fall through to local */ }
      }
      setEvents((prev) => [...prev, { ...event, id: generateId() }])
    },
    [apiAvailable],
  )

  const deleteEvent = useCallback(
    async (id: string) => {
      if (apiAvailable) {
        try { await eventsApi.delete(id) } catch { /* continue locally */ }
      }
      setEvents((prev) => prev.filter((e) => e.id !== id))
    },
    [apiAvailable],
  )

  const addTodo = useCallback(
    async (text: string, date: string) => {
      const todo: Omit<TodoItem, "id"> = { text, completed: false, date }
      if (apiAvailable) {
        try {
          const created = await todosApi.create(todo)
          setTodos((prev) => [...prev, created])
          return
        } catch { /* fall through */ }
      }
      setTodos((prev) => [...prev, { ...todo, id: generateId() }])
    },
    [apiAvailable],
  )

  const toggleTodo = useCallback(
    async (id: string) => {
      const existing = todos.find((t) => t.id === id)
      if (apiAvailable && existing) {
        try { await todosApi.update(id, { completed: !existing.completed }) } catch { /* continue locally */ }
      }
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
      )
    },
    [apiAvailable, todos],
  )

  const deleteTodo = useCallback(
    async (id: string) => {
      if (apiAvailable) {
        try { await todosApi.delete(id) } catch { /* continue locally */ }
      }
      setTodos((prev) => prev.filter((t) => t.id !== id))
    },
    [apiAvailable],
  )

  return {
    events,
    todos,
    apiAvailable,
    addEvent,
    deleteEvent,
    addTodo,
    toggleTodo,
    deleteTodo,
  }
}
