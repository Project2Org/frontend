import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/login";
import Signup from "./pages/signup";
import { CalendarApp } from "./components/calendar-app";

import "./index.css";
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* your calendar page */}
      <Route path="/calendar" element={<CalendarApp />} />

      <Route path="*" element={<div style={{ padding: 24 }}>Not found</div>} />
    </Routes>
  );
}