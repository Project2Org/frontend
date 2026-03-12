import { useState } from "react"
import { Plus, X, AlertCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { TodoItem } from "@/lib/calendar-store"

interface TodoPanelProps {
  todos: TodoItem[]
  loading?: boolean
  onAddTodo: (text: string, onError?: () => void) => void
  onToggleTodo: (id: string) => void
  onDeleteTodo: (id: string, onError?: () => void) => void
}

// Inline toast — simple, no extra dependency needed
function ErrorToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="mx-4 mt-2 flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-[11px] text-destructive">
      <AlertCircle className="size-3 shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} aria-label="Dismiss" className="shrink-0 opacity-60 hover:opacity-100">
        <X className="size-3" />
      </button>
    </div>
  )
}

// Skeleton row shown while loading
function SkeletonRow() {
  return (
    <div className="flex items-center gap-2.5 px-1 py-1.5">
      <div className="size-3.5 shrink-0 rounded-sm bg-muted animate-pulse" />
      <div className="h-2.5 flex-1 rounded bg-muted animate-pulse" style={{ width: `${55 + Math.random() * 30}%` }} />
    </div>
  )
}

export function TodoPanel({
  todos,
  loading = false,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
}: TodoPanelProps) {
  const [newTodo, setNewTodo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const showError = (msg: string) => {
    setErrorMessage(msg)
    setTimeout(() => setErrorMessage(null), 4000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = newTodo.trim()
    if (!text || isSubmitting) return

    setIsSubmitting(true)
    setNewTodo("")

    onAddTodo(text, () => {
      showError("Couldn't save task — please try again.")
      setNewTodo(text) // Restore the input so the user doesn't lose their work
    })

    // Re-enable after a short delay (the async work happens in the hook)
    setTimeout(() => setIsSubmitting(false), 500)
  }

  const handleDelete = (id: string) => {
    onDeleteTodo(id, () => {
      showError("Couldn't delete task — please try again.")
    })
  }

  const pendingTodos = todos.filter((t) => !t.completed)
  const completedTodos = todos.filter((t) => t.completed)

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-foreground">To-do</p>
          <p className="text-[11px] text-muted-foreground">
            {loading ? "Loading…" : `${pendingTodos.length} pending`}
          </p>
        </div>
      </div>

      {/* Error banner */}
      {errorMessage && (
        <ErrorToast message={errorMessage} onDismiss={() => setErrorMessage(null)} />
      )}

      {/* Add form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5 border-b border-border px-4 py-2">
        <Input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a task..."
          className="h-7 border-border bg-background text-xs"
          disabled={loading}
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          disabled={!newTodo.trim() || isSubmitting || loading}
        >
          <Plus className="size-3.5" />
          <span className="sr-only">Add task</span>
        </Button>
      </form>

      {/* Todo list */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {/* Loading skeleton */}
        {loading && (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        )}

        {/* Empty state */}
        {!loading && pendingTodos.length === 0 && completedTodos.length === 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">
            No tasks yet
          </p>
        )}

        {/* Pending todos */}
        {!loading && pendingTodos.map((todo) => (
          <div
            key={todo.id}
            className="group flex items-center gap-2.5 rounded-md px-1 py-1.5 transition-colors hover:bg-accent"
          >
            <Checkbox
              checked={false}
              onCheckedChange={() => onToggleTodo(todo.id)}
              className="size-3.5 border-muted-foreground/40 data-[state=checked]:border-brand data-[state=checked]:bg-brand"
            />
            <span className="flex-1 text-xs text-foreground">{todo.text}</span>
            <button
              onClick={() => handleDelete(todo.id)}
              className="opacity-0 transition-opacity group-hover:opacity-100"
              aria-label={`Delete ${todo.text}`}
            >
              <X className="size-3 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        ))}

        {/* Completed todos */}
        {!loading && completedTodos.length > 0 && (
          <div className="mt-3">
            <p className="mb-1 text-[11px] text-muted-foreground">
              Done ({completedTodos.length})
            </p>
            {completedTodos.map((todo) => (
              <div
                key={todo.id}
                className="group flex items-center gap-2.5 rounded-md px-1 py-1.5 transition-colors hover:bg-accent"
              >
                <Checkbox
                  checked={true}
                  onCheckedChange={() => onToggleTodo(todo.id)}
                  className="size-3.5 data-[state=checked]:border-brand data-[state=checked]:bg-brand"
                />
                <span className="flex-1 text-xs text-muted-foreground line-through">
                  {todo.text}
                </span>
                <button
                  onClick={() => handleDelete(todo.id)}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={`Delete ${todo.text}`}
                >
                  <X className="size-3 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}