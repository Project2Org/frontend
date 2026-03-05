import type { CalendarEvent, TodoItem } from "@/lib/calendar-store"

// ─── Spring Boot API base URL ───────────────────────────────────
// Point this at your running Spring Boot server.
// In production, create a .env file with VITE_API_URL=http://your-server/api
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api"

// ─── Generic helpers ────────────────────────────────────────────

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
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

// ─── Events API ─────────────────────────────────────────────────
// Maps to Spring Boot @RestController:
//   GET    /api/events?date=2026-02-25
//   GET    /api/events
//   POST   /api/events         { title, date, time, endTime }
//   DELETE /api/events/{id}

export const eventsApi = {
  getAll(): Promise<CalendarEvent[]> {
    return request<CalendarEvent[]>("/events")
  },

  getByDate(date: string): Promise<CalendarEvent[]> {
    return request<CalendarEvent[]>(`/events?date=${encodeURIComponent(date)}`)
  },

  create(event: Omit<CalendarEvent, "id">): Promise<CalendarEvent> {
    return request<CalendarEvent>("/events", {
      method: "POST",
      body: JSON.stringify(event),
    })
  },

  delete(id: string): Promise<void> {
    return request<void>(`/events/${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
  },
}

// ─── Todos API ──────────────────────────────────────────────────
// Maps to Spring Boot @RestController:
//   GET    /api/todos?date=2026-02-25
//   GET    /api/todos
//   POST   /api/todos           { text, completed, date }
//   PATCH  /api/todos/{id}      { completed }
//   DELETE /api/todos/{id}

export const todosApi = {
  getAll(): Promise<TodoItem[]> {
    return request<TodoItem[]>("/todos")
  },

  getByDate(date: string): Promise<TodoItem[]> {
    return request<TodoItem[]>(`/todos?date=${encodeURIComponent(date)}`)
  },

  create(todo: Omit<TodoItem, "id">): Promise<TodoItem> {
    return request<TodoItem>("/todos", {
      method: "POST",
      body: JSON.stringify(todo),
    })
  },

  update(id: string, data: Partial<TodoItem>): Promise<TodoItem> {
    return request<TodoItem>(`/todos/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },

  delete(id: string): Promise<void> {
    return request<void>(`/todos/${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
  },
}
