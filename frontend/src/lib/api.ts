import type { CalendarEvent, TodoItem } from "@/lib/calendar-store"
import { supabase } from "@/lib/supabaseClient"

// ─── Spring Boot API base URL ───────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api"

// ─── Backend shapes ─────────────────────────────────────────────
// Spring/JPA returns numeric IDs — we normalise to string to match
// the frontend CalendarEvent / TodoItem types.

interface BackendTodo {
  id: number
  text: string
  completed: boolean
  date: string
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

// ─── Normaliser ──────────────────────────────────────────────────

function normaliseTodo(t: BackendTodo): TodoItem {
  return {
    id: String(t.id),
    text: t.text,
    completed: t.completed,
    date: t.date,
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

// ─── Events API (local-only until EventController is added) ──────
// Intentionally rejects so useCalendarData keeps events in local state.
// When you add an EventController, replace these stubs with request() calls.

export const eventsApi = {
  getAll(): Promise<CalendarEvent[]> {
    return Promise.reject(new Error("Events API not implemented"))
  },
  getByDate(_date: string): Promise<CalendarEvent[]> {
    return Promise.reject(new Error("Events API not implemented"))
  },
  create(_event: Omit<CalendarEvent, "id">): Promise<CalendarEvent> {
    return Promise.reject(new Error("Events API not implemented"))
  },
  delete(_id: string): Promise<void> {
    return Promise.reject(new Error("Events API not implemented"))
  },
}