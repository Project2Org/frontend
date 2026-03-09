import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function AuthRedirect() {
  const { session, loading } = useAuth();

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;

  return session ? (
    <Navigate to="/calendar" replace />
  ) : (
    <Navigate to="/login" replace />
  );
}