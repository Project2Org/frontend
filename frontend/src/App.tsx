import { Routes, Route, Navigate } from "react-router-dom";

import "./index.css";
import "./App.css";

import Login from "./pages/login";
import Signup from "./pages/signup";
import AuthCallback from "./pages/auth-callback";
import { CalendarApp } from "./components/calendar-app";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/calendar" element={<CalendarApp />} />
      <Route path="*" element={<div style={{ padding: 24 }}>Not found</div>} />
    </Routes>
  );
}