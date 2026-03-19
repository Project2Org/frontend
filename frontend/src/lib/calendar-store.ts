export interface CalendarEvent {
  id: string
  title: string
  date: string // ISO date string YYYY-MM-DD
  time?: string // e.g. "09:00"
  endTime?: string // e.g. "10:00"
  description?: string
  location?: string
  color?: string
}

export interface TodoItem {
  id: string
  text: string
  completed: boolean
  date: string // ISO date string YYYY-MM-DD
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":")
  const h = parseInt(hours, 10)
  const ampm = h >= 12 ? "PM" : "AM"
  const formattedHour = h % 12 || 12
  return `${formattedHour}:${minutes} ${ampm}`
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}