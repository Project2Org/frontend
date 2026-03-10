import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function finishLogin() {
      const { error } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      if (error) {
        console.error("OAuth callback error:", error.message);
        navigate("/login", { replace: true });
        return;
      }

      navigate("/calendar", { replace: true });
    }

    finishLogin();
  }, [navigate]);

  return <div style={{ padding: 24 }}>Finishing login...</div>;
}