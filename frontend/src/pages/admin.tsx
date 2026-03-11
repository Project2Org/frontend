import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Settings, Sun, Moon, LogOut, Trash2, Calendar } from "lucide-react"
import { useAuth } from "@/auth/AuthProvider"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"

export default function AdminPage() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  )
  const [weekStart, setWeekStart] = useState<"monday" | "sunday">(
    (localStorage.getItem("weekStart") as "monday" | "sunday") || "sunday"
  )
  const [isDeleting, setIsDeleting] = useState(false)

  const handleLogout = async () => {
    await signOut()
    navigate("/login", { replace: true })
  }

  const toggleDarkMode = () => {
    const html = document.documentElement
    if (html.classList.contains("dark")) {
      html.classList.remove("dark")
      localStorage.setItem("theme", "light")
      setIsDarkMode(false)
    } else {
      html.classList.add("dark")
      localStorage.setItem("theme", "dark")
      setIsDarkMode(true)
    }
  }

  const handleWeekStartChange = (value: "monday" | "sunday") => {
    setWeekStart(value)
    localStorage.setItem("weekStart", value)
    // Trigger a custom event to notify the calendar to update
    window.dispatchEvent(new CustomEvent("weekStartChanged", { detail: value }))
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This will permanently delete your account and all data. This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    try {
      // Note: Client-side deletion requires a backend endpoint with admin privileges
      // For now, just sign out - you'll need to implement server-side account deletion
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert("Error: User not found")
        setIsDeleting(false)
        return
      }

      // This will fail with client-side auth, but you can implement a server function
      // Example: const response = await fetch('/api/delete-account', { method: 'DELETE' })
      alert("Please contact support to delete your account.")
      setIsDeleting(false)
    } catch (error) {
      console.error("Delete account error:", error)
      alert("Error deleting account. Please contact support.")
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-md bg-brand p-2">
            <Settings className="size-5 text-brand-foreground" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Admin Settings</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex min-h-0 flex-1 items-center justify-center px-6">
        <div className="w-full max-w-md space-y-6">
          {/* Dark Mode Setting */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isDarkMode ? (
                  <Moon className="size-5 text-brand" />
                ) : (
                  <Sun className="size-5 text-brand" />
                )}
                <div>
                  <h2 className="font-semibold text-foreground">Theme</h2>
                  <p className="text-sm text-muted-foreground">
                    {isDarkMode ? "Dark mode" : "Light mode"}
                  </p>
                </div>
              </div>
              <Button
                onClick={toggleDarkMode}
                className="bg-brand text-brand-foreground hover:bg-brand/90"
              >
                Toggle
              </Button>
            </div>
          </div>

          {/* Week Start Setting */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="size-5 text-brand" />
                <div>
                  <h2 className="font-semibold text-foreground">Week Start Day</h2>
                  <p className="text-sm text-muted-foreground">Choose how your week begins</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleWeekStartChange("sunday")}
                  className={`flex-1 ${
                    weekStart === "sunday"
                      ? "bg-brand text-brand-foreground hover:bg-brand/90"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Sunday
                </Button>
                <Button
                  onClick={() => handleWeekStartChange("monday")}
                  className={`flex-1 ${
                    weekStart === "monday"
                      ? "bg-brand text-brand-foreground hover:bg-brand/90"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Monday
                </Button>
              </div>
            </div>
          </div>

          {/* Logout Setting */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LogOut className="size-5 text-destructive" />
                <div>
                  <h2 className="font-semibold text-foreground">Logout</h2>
                  <p className="text-sm text-muted-foreground">Sign out of your account</p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Logout
              </Button>
            </div>
          </div>

          {/* Delete Account */}
          <div className="rounded-lg border border-destructive/50 bg-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trash2 className="size-5 text-destructive" />
                <div>
                  <h2 className="font-semibold text-foreground">Delete Account</h2>
                  <p className="text-sm text-muted-foreground">Permanently delete your account</p>
                </div>
              </div>
              <Button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>

          {/* Back Button */}
          <Button
            onClick={() => navigate("/calendar")}
            variant="outline"
            className="w-full"
          >
            Back to Calendar
          </Button>
        </div>
      </main>
    </div>
  )
}
