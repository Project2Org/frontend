import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function finish() {
      const url = window.location.href;
      const hasCode = url.includes("code=");

      if (hasCode) {
        const { error } = await supabase.auth.exchangeCodeForSession(url);
        if (error) {
          console.error("exchangeCodeForSession error:", error.message);
          if (isMounted) navigate("/login", { replace: true });
          return;
        }
      }

      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("getSession error:", error.message);
        if (isMounted) navigate("/login", { replace: true });
        return;
      }

      if (data.session) {
        if (isMounted) navigate("/calendar", { replace: true });
      } else {
        if (isMounted) navigate("/login", { replace: true });
      }
    }

    finish();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return <div style={{ padding: 24 }}>Finishing login...</div>;
}