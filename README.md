# Project 2 Calendar App

A full-stack calendar application built with React, TypeScript, Supabase authentication, and a Spring Boot backend API. Users can manage calendar events and daily to-do tasks with a clean, responsive UI.

---

## Features

- **Monthly calendar view** with event previews on each day
- **Events panel** — add, view, and delete events with title, start/end time, location, and description
- **To-do panel** — manage daily tasks with completion tracking and optimistic UI updates
- **Supabase authentication** — email/password signup and Google OAuth login
- **Protected routes** — unauthenticated users are redirected to the login page
- **Admin settings** — toggle dark/light mode, set week start day (Sunday or Monday), and logout
- **Persistent backend** — data is stored via a Spring Boot REST API, with graceful fallback to local state if the API is unavailable

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React + TypeScript (Vite) |
| Styling | Tailwind CSS |
| UI components | Radix UI (Dialog, Checkbox) + custom components |
| Routing | React Router v6 |
| Authentication | Supabase Auth (email/password + Google OAuth) |
| Backend API | Spring Boot (REST) |
| Date utilities | date-fns |
| Icons | Lucide React |

---

## Getting Started
Visit the app and create an account using your email address, or sign in instantly with Google. After signing up with email, check your inbox for a confirmation link before logging in for the first time.

---

## Authentication

Authentication is handled by Supabase. The app supports:

- **Email/password** — sign up with email confirmation, then log in
- **Google OAuth** — one-click login via `signInWithOAuth`

After OAuth login, the user is redirected to `/auth/callback`, which exchanges the code for a session and navigates to `/calendar`.

The `AuthProvider` wraps the entire app and exposes `session`, `loading`, and `signOut` via the `useAuth()` hook. `ProtectedRoute` uses this context to guard `/calendar` and `/admin`.

---

## Backend API

The frontend communicates with a Spring Boot REST API. All requests include a Supabase JWT `Authorization: Bearer <token>` header for authentication.

### Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/todos` | Fetch all todos |
| GET | `/todos?date=YYYY-MM-DD` | Fetch todos by date |
| POST | `/todos` | Create a todo |
| PATCH | `/todos/:id` | Update a todo (completed, text) |
| DELETE | `/todos/:id` | Delete a todo |
| GET | `/events` | Fetch all events |
| GET | `/events?date=YYYY-MM-DD` | Fetch events by date |
| POST | `/events` | Create an event |
| DELETE | `/events/:id` | Delete an event |

---

## Data Model

### CalendarEvent

```typescript
{
  id: string
  title: string
  date: string        // "YYYY-MM-DD"
  time?: string       // "HH:MM" (24h)
  endTime?: string    // "HH:MM" (24h)
  description?: string
  location?: string
  color?: string
}
```

### TodoItem

```typescript
{
  id: string
  text: string
  completed: boolean
  date: string        // "YYYY-MM-DD"
}
```

---

## Admin Settings

The `/admin` page (accessible via the ⚙ icon in the header) provides:

- **Theme toggle** — switches between light and dark mode; persisted in `localStorage`
- **Week start day** — sets the calendar's first day of the week to Sunday or Monday; persisted in `localStorage` and communicated to the calendar via a `weekStartChanged` custom event
- **Logout** — signs the user out and redirects to `/login`
- **Delete account** — currently prompts the user to contact support (requires a server-side admin endpoint to implement fully)
