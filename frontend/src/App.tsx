import { Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/signup";
import AuthCallback from "./pages/auth-callback";
import { CalendarApp } from "./components/calendar-app";
import ProtectedRoute from "./auth/ProtectedRoute";
import AuthRedirect from "./auth/AuthRedirect";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthRedirect />} />

      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route path="/calendar" element={<CalendarApp />} />
      </Route>

      <Route path="*" element={<div style={{ padding: 24 }}>Not found</div>} />
    </Routes>
  );
}