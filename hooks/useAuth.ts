"use client";
import { useState, useEffect } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

interface Profile {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export function useAuth() {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        // Fetch profile via API using service role to avoid RLS issues
        try {
          const res = await fetch("/api/auth/me");
          const payload = await res.json();
          if (res.ok && payload.user) {
            setUser(payload.user);
          }
        } catch (e) {
          console.error("Failed to load user profile:", e);
        }
      }
      setLoading(false);
    }
    load();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          // Fetch profile via API using service role
          try {
            const res = await fetch("/api/auth/me");
            const payload = await res.json();
            if (res.ok && payload.user) {
              setUser(payload.user);
            }
          } catch (e) {
            console.error("Failed to load user profile:", e);
          }
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}