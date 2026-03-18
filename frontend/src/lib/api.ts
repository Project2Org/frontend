import type { CalendarEvent, TodoItem } from "@/lib/calendar-store"
import { supabase } from "@/lib/supabaseClient"

// ─── Spring Boot API base URL ───────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api"

// ─── Backend shapes ─────────────────────────────────────────────

interface BackendTodo {
  id: number
  text: string
  completed: boolean
  date: string
}

interface BackendEvent {
  id: number
  title: string
  date: string
  time?: string
  endTime?: string
  description?: string
  location?: string
}

// ─── Generic request helper ─────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
    ...options,
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`API ${res.status}: ${body || res.statusText}`)
  }

  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

// ─── Normalisers ─────────────────────────────────────────────────

function normaliseTodo(t: BackendTodo): TodoItem {
  return {
    id: String(t.id),
    text: t.text,
    completed: t.completed,
    date: t.date,
  }
}

function normaliseEvent(e: BackendEvent): CalendarEvent {
  return {
    id: String(e.id),
    title: e.title,
    date: e.date,
    time: e.time,
    endTime: e.endTime,
    description: e.description,
    location: e.location,
  }
}

// ─── Todos API ───────────────────────────────────────────────────

export const todosApi = {
  async getAll(): Promise<TodoItem[]> {
    const raw = await request<BackendTodo[]>("/todos")
    return raw.map(normaliseTodo)
  },

  async getByDate(date: string): Promise<TodoItem[]> {
    const raw = await request<BackendTodo[]>(`/todos?date=${encodeURIComponent(date)}`)
    return raw.map(normaliseTodo)
  },

  async create(todo: Omit<TodoItem, "id">): Promise<TodoItem> {
    const raw = await request<BackendTodo>("/todos", {
      method: "POST",
      body: JSON.stringify(todo),
    })
    return normaliseTodo(raw)
  },

  async update(id: string, data: Partial<Pick<TodoItem, "completed" | "text">>): Promise<TodoItem> {
    const raw = await request<BackendTodo>(`/todos/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
    return normaliseTodo(raw)
  },

  delete(id: string): Promise<void> {
    return request<void>(`/todos/${encodeURIComponent(id)}`, { method: "DELETE" })
  },
}

// ─── Events API ──────────────────────────────────────────────────

export const eventsApi = {
  async getAll(): Promise<CalendarEvent[]> {
    const raw = await request<BackendEvent[]>("/events")
    return raw.map(normaliseEvent)
  },

  async getByDate(date: string): Promise<CalendarEvent[]> {
    const raw = await request<BackendEvent[]>(`/events?date=${encodeURIComponent(date)}`)
    return raw.map(normaliseEvent)
  },

  async create(event: Omit<CalendarEvent, "id">): Promise<CalendarEvent> {
    const raw = await request<BackendEvent>("/events", {
      method: "POST",
      body: JSON.stringify({
        title: event.title,
        date: event.date,
        time: event.time ?? null,
        endTime: event.endTime ?? null,
        description: event.description ?? null,
        location: event.location ?? null,
      }),
    })
    return normaliseEvent(raw)
  },

  delete(id: string): Promise<void> {
    return request<void>(`/events/${encodeURIComponent(id)}`, { method: "DELETE" })
  },
}