"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "password" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkRecoverySession = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        if (type === "recovery" && accessToken) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });

          if (sessionError || !sessionData.session?.user) {
            setStatus("error");
            setError("Invalid or expired recovery link.");
            return;
          }

          setStatus("password");
          return;
        }

        setStatus("error");
        setError("Invalid password reset link.");
      } catch (e) {
        console.error("Error processing reset link:", e);
        setStatus("error");
        setError("Could not process reset link.");
      }
    };

    checkRecoverySession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      setStatus("success");
      setTimeout(() => {
        router.push("/");
      }, 1800);
    } catch (e) {
      console.error("Error updating password:", e);
      setError(e instanceof Error ? e.message : "Could not update password");
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        {status === "loading" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Verifying recovery link...</h1>
            <p className="text-gray-600">Please wait.</p>
          </div>
        )}

        {status === "password" && (
          <div>
            <h1 className="text-2xl font-bold text-orange-700 mb-2 text-center">Reset your password</h1>
            <p className="text-gray-600 mb-6 text-center">Enter your new password to recover access.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  New Password
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
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
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
                disabled={saving}
                className="w-full rounded-full bg-[#ffc84e] py-2 text-black hover:bg-[#ffb81c] disabled:opacity-50 font-semibold"
              >
                {saving ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="rounded-full bg-green-100 p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Password updated</h1>
            <p className="text-gray-600 mb-2">Your password has been changed successfully.</p>
            <p className="text-sm text-gray-500">Redirecting to sign in...</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Could not reset password</h1>
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
