"use client";
import { useState, useEffect } from "react";
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
        // fetch additional profile data from users table
        const { data, error } = await supabase
          .from("users")
          .select("id,email,role,name")
          .eq("id", session.user.id)
          .single();
        if (!error && data) {
          setUser(data);
        } else if (error?.code === "PGRST116") {
          // Profile doesn't exist, create it via API
          try {
            const res = await fetch("/api/auth/sync-profile", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || "",
                role: "trainee",
              }),
            });
            if (res.ok) {
              setUser({
                id: session.user.id,
                email: session.user.email || "",
                role: "trainee",
                name: session.user.user_metadata?.name || "",
              });
            }
          } catch (e) {
            // Fallback to session data
            setUser({
              id: session.user.id,
              email: session.user.email || "",
              role: "trainee",
              name: session.user.user_metadata?.name || "",
            });
          }
        }
      }
      setLoading(false);
    }
    load();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const { data, error } = await supabase
            .from("users")
            .select("id,email,role,name")
            .eq("id", session.user.id)
            .single();
          if (!error && data) {
            setUser(data);
          } else if (error?.code === "PGRST116") {
            // Profile doesn't exist, create it
            try {
              const res = await fetch("/api/auth/sync-profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: session.user.id,
                  email: session.user.email,
                  name: session.user.user_metadata?.name || "",
                  role: "trainee",
                }),
              });
              if (res.ok) {
                setUser({
                  id: session.user.id,
                  email: session.user.email || "",
                  role: "trainee",
                  name: session.user.user_metadata?.name || "",
                });
              }
            } catch (e) {
              // Fallback to session data
              setUser({
                id: session.user.id,
                email: session.user.email || "",
                role: "trainee",
                name: session.user.user_metadata?.name || "",
              });
            }
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