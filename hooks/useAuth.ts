"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

// Module-level flag shared by all useAuth instances in the same JS bundle.
// Using a module variable (not sessionStorage) avoids the race condition where
// the first of multiple concurrent SIGNED_OUT listeners consumes the flag
// before the second one can read it.
let _intentionalLogout = false;
export function markIntentionalLogout() {
  _intentionalLogout = true;
}

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
  const pathname = usePathname();

  useEffect(() => {
    function isPublicRoute(path: string | null) {
      if (!path) {
        return false;
      }

      return path === "/" || path.startsWith("/auth/");
    }

    function redirectToSessionExpired() {
      if (typeof window === "undefined") {
        return;
      }

      if (isPublicRoute(pathname)) {
        return;
      }

      window.location.replace("/?sessionExpired=1");
    }

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
      } else {
        setUser(null);
        redirectToSessionExpired();
      }
      setLoading(false);
    }
    load();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          await loadProfile(session);
        } else {
          setUser(null);
          if (event === "SIGNED_OUT") {
            if (_intentionalLogout) {
              // Clear it after this tick so all concurrent listeners see it as true
              setTimeout(() => { _intentionalLogout = false; }, 0);
            } else {
              redirectToSessionExpired();
            }
          }
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [pathname]);

  return { user, loading };
}