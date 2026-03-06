"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { supabase } from "../../../lib/supabaseClient";

type Trainee = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  active: boolean;
  created_at: string;
};

export default function SupervisorTraineesPage() {
  const { user, loading } = useAuth();
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrainees = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error("No active session");
        }

        const res = await fetch("/api/supervisor/trainees", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        const payload = await res.json();

        if (!res.ok) {
          throw new Error(payload.error || "Could not load trainees");
        }

        setTrainees(payload.trainees || []);
      } catch (error) {
        console.error("Error loading trainees:", error);
        setFetchError("Could not load trainees. Please refresh the page.");
      } finally {
        setFetchLoading(false);
      }
    };

    if (user) {
      loadTrainees();
    }
  }, [user]);

  if (loading || fetchLoading) {
    return <p className="p-8">Loading trainees...</p>;
  }

  if (!user) {
    return (
      <div className="p-8">
        <p>No user detected. Please log in.</p>
      </div>
    );
  }

  const allowedRoles = ["supervisor", "manager", "assistant_manager"];
  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="p-8">
        <p className="text-red-600">You do not have permission to view supervisor tools.</p>
        <Link href="/modules" className="text-[#2C282B] underline">
          Go to Training
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-[#2C282B] mb-2">Supervisor - Trainees</h1>
      <p className="text-gray-600 mb-6">Select a trainee to review modules, responses, and grading status.</p>

      {fetchError ? <p className="text-red-600 mb-4">{fetchError}</p> : null}

      {trainees.length === 0 ? (
        <p className="text-gray-500">No active trainees found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trainees.map((trainee) => (
            <Link
              key={trainee.id}
              href={`/supervisor/trainees/${trainee.id}`}
              className="block rounded-lg border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-semibold text-[#2C282B]">
                {trainee.name || trainee.email}
              </h2>
              <p className="text-sm text-gray-600 mt-1">{trainee.email}</p>
              <p className="text-xs text-gray-500 mt-3">Role: {trainee.role}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
