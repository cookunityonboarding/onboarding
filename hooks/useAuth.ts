"use client";
import { useState, useEffect } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

interface Profile {
  id: string;
  email: string;
  role: string;
  name?: string;
  active: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function handleDisabledAccount() {
      setUser(null);
      setLoading(false);
      try {
        await supabase.auth.signOut();
      } catch {
        // no-op
      }

      if (typeof window !== "undefined") {
        window.location.replace("/?disabled=1");
      }
    }

    async function fetchProfile(): Promise<Profile | null> {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const payload = await res.json();

      if (res.ok && payload.user) {
        return payload.user;
      }

      return null;
    }

    async function syncProfileFromSession(session: Session) {
      await fetch("/api/auth/sync-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || "User",
          role: session.user.user_metadata?.role || "trainee",
        }),
      });
    }

    async function loadProfile(session: Session) {
      try {
        const profile = await fetchProfile();
        if (profile) {
          if (!profile.active) {
            await handleDisabledAccount();
            return;
          }

          setUser(profile);
          return;
        }

        // First-login invite flow can have session before profile row exists.
        await syncProfileFromSession(session);
        const syncedProfile = await fetchProfile();
        if (syncedProfile) {
          if (!syncedProfile.active) {
            await handleDisabledAccount();
            return;
          }

          setUser(syncedProfile);
        }
      } catch (e) {
        console.error("Failed to load user profile:", e);
      }
    }

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        await loadProfile(session);
      }
      setLoading(false);
    }
    load();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          await loadProfile(session);
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