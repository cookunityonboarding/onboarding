"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // if there's already a session, send to modules
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.push("/modules");
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/modules");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
      {/* simple centered card with title and login form */}
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6 text-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center">
            <img src="/cu-logo-small-light.png" alt="CookUnity logo" className="h-12 w-12" />
          </div>
          <span className="text-sm font-medium text-sidebar-foreground/70 uppercase tracking-wider">
            CookUnity CX
          </span>
        </div>
        <h1 className="mb-6 text-center text-2xl font-bold text-orange-700">
          CX Lead Onboarding Program
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#ffc84e] py-2 text-black hover:bg-[#ffb81c] disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
