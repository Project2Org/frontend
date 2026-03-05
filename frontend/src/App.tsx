import "./index.css"
import { CalendarApp } from "./components/calendar-app";
function App() {
  return <CalendarApp />
}

export default App
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

import Login from "./pages/login";
import Signup from "./pages/signup";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="*" element={<div style={{ padding: 24 }}>Not found</div>} />
    </Routes>
  );
}
