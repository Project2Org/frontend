import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function getHashParams() {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;

  return Object.fromEntries(new URLSearchParams(hash));
}

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const params = getHashParams();
      const access_token = params["access_token"];
      const refresh_token = params["refresh_token"];

      // If we came back with tokens in the hash, store them as a session
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (error) {
          console.error("setSession error:", error);
          navigate("/login", { replace: true });
          return;
        }
      }

      const { data, error } = await supabase.auth.getSession();
      console.log("SESSION AFTER CALLBACK:", { error, session: data.session });

      if (data.session) navigate("/calendar", { replace: true });
      else navigate("/login", { replace: true });
    };

    run();
  }, [navigate]);

  return <div style={{ padding: 24 }}>Signing you in…</div>;
}