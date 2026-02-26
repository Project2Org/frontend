import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { TodoItem } from "@/lib/calendar-store"

interface TodoPanelProps {
  todos: TodoItem[]
  onAddTodo: (text: string) => void
  onToggleTodo: (id: string) => void
  onDeleteTodo: (id: string) => void
}

export function TodoPanel({
  todos,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
}: TodoPanelProps) {
  const [newTodo, setNewTodo] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTodo.trim()) {
      onAddTodo(newTodo.trim())
      setNewTodo("")
    }
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
            {pendingTodos.length} pending
          </p>
        </div>
      </div>

      {/* Add form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5 border-b border-border px-4 py-2">
        <Input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a task..."
          className="h-7 border-border bg-background text-xs"
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          disabled={!newTodo.trim()}
        >
          <Plus className="size-3.5" />
          <span className="sr-only">Add task</span>
        </Button>
      </form>

      {/* Todo list */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {pendingTodos.length === 0 && completedTodos.length === 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">
            No tasks yet
          </p>
        )}

        {pendingTodos.map((todo) => (
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
              onClick={() => onDeleteTodo(todo.id)}
              className="opacity-0 transition-opacity group-hover:opacity-100"
              aria-label={`Delete ${todo.text}`}
            >
              <X className="size-3 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        ))}

        {completedTodos.length > 0 && (
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
                  onClick={() => onDeleteTodo(todo.id)}
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
