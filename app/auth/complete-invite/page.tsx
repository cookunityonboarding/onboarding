"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

export default function CompleteInvitePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "password" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [settingPassword, setSettingPassword] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  const getLandingRoute = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const payload = await res.json();
      const role = payload?.user?.role;
      const supervisorRoles = ["supervisor", "manager", "assistant_manager"];

      if (supervisorRoles.includes(role)) {
        return "/supervisor/trainees";
      }
    } catch (e) {
      console.error("Could not resolve landing route:", e);
    }

    return "/modules";
  }, []);

  const completeSetup = useCallback(async (session: Session) => {
    try {
      const userId = session.user.id;
      const email = session.user.email;
      const metadata = session.user.user_metadata;

      // Sync profile with our users table
      const syncRes = await fetch("/api/auth/sync-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          email,
          name: metadata?.name || "Trainee",
          role: metadata?.role || "trainee",
        }),
      });

      if (!syncRes.ok) {
        const payload = await syncRes.json();
        throw new Error(payload.error || "Error syncing profile");
      }

      // Mark invitation as accepted
      const markRes = await fetch("/api/auth/accept-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email,
          userId,
        }),
      });

      if (!markRes.ok) {
        console.error("Could not mark invitation as accepted, but user was created");
      }

      setStatus("success");
      const destination = await getLandingRoute();

      // Redirect to role landing page after 2 seconds.
      setTimeout(() => {
        router.push(destination);
      }, 2000);
    } catch (error) {
      console.error("Error completing setup:", error);
      setStatus("error");
      setError(
        error instanceof Error
          ? error.message
          : "Unexpected error completing setup"
      );
    }
  }, [getLandingRoute, router]);

  useEffect(() => {
    const checkInvitation = async () => {
      try {
        // Check if we have the token hash from the email link
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        if (type === "invite" && accessToken) {
          // Set the session with the invite tokens
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });

          if (sessionError) {
            console.error("Error setting session:", sessionError);
            setStatus("error");
            setError("Error processing invitation token.");
            return;
          }

          if (sessionData.session?.user) {
            const metadata = sessionData.session.user.user_metadata;
            setUserName(metadata?.name || null);
            setStatus("password");
          } else {
            setStatus("error");
            setError("Invalid or expired invitation token.");
          }
        } else {
          // Check if already logged in (password already set)
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            await completeSetup(session);
          } else {
            setStatus("error");
            setError("Invalid invitation link. Please check the link in your email.");
          }
        }
      } catch (error) {
        console.error("Error checking invitation:", error);
        setStatus("error");
        setError("Error processing invitation.");
      }
    };

    checkInvitation();
  }, [completeSetup]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSettingPassword(true);
    setError(null);

    try {
      // Make sure we have a valid session
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!currentSession) {
        throw new Error("Session not found. Please try again with the email link.");
      }

      // Update user password
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      if (data.user) {
        // Refresh session after password update
        const {
          data: { session: newSession },
          error: refreshError,
        } = await supabase.auth.refreshSession();

        if (refreshError || !newSession) {
          // Try getting session again
          const {
            data: { session: fallbackSession },
          } = await supabase.auth.getSession();

          if (fallbackSession) {
            await completeSetup(fallbackSession);
          } else {
            throw new Error("Could not create session after setting password");
          }
        } else {
          await completeSetup(newSession);
        }
      }
    } catch (error) {
      console.error("Error setting password:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Error setting password"
      );
      setSettingPassword(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6 text-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center">
            <img
              src="/cu-logo-small-light.png"
              alt="CookUnity logo"
              className="h-12 w-12"
            />
          </div>
          <span className="text-sm font-medium text-sidebar-foreground/70 uppercase tracking-wider">
            CookUnity CX
          </span>
        </div>

        {status === "loading" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Verifying invitation...
            </h1>
            <p className="text-gray-600">Please wait.</p>
          </div>
        )}

        {status === "password" && (
          <div>
            <h1 className="text-2xl font-bold text-orange-700 mb-2 text-center">
              Welcome{userName ? `, ${userName}` : ""}!
            </h1>
            <p className="text-gray-600 mb-6 text-center">
              Set your password to access the training program
            </p>

            <form onSubmit={handleSetPassword} className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  required
                  minLength={6}
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={settingPassword}
                className="w-full rounded-full bg-[#ffc84e] py-2 text-black hover:bg-[#ffb81c] disabled:opacity-50 font-semibold"
              >
                {settingPassword ? "Setting up..." : "Create Password"}
              </button>
            </form>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="rounded-full bg-green-100 p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome to the training program!
            </h1>
            <p className="text-gray-600 mb-4">
              Your account has been activated successfully.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to your training dashboard...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="rounded-full bg-red-100 p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Error processing invitation
            </h1>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="rounded-full bg-[#ffc84e] px-6 py-2 text-black hover:bg-[#ffb81c]"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
