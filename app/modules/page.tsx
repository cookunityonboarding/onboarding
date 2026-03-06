"use client";
import { useAuth } from "../../hooks/useAuth";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

interface Module {
  id: number;
  title: string;
  objective: string;
  icon?: string;
  week: number;
  sort_order: number;
}

export default function ModulesPage() {
  const { user, loading } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error("No active session");
        }

        const res = await fetch("/api/modules", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        const payload = await res.json();

        if (!res.ok) {
          throw new Error(payload.error || "Could not load modules");
        }

        setModules(payload.modules || []);
      } catch (error) {
        console.error("Error fetching modules:", error);
        setFetchError("Could not load modules. Please refresh the page.");
      }
      setFetchLoading(false);
    };

    if (user) {
      fetchModules();
    }
  }, [user]);

  if (loading || fetchLoading) return <p className="p-8">Loading...</p>;

  if (!user) {
    return (
      <div className="p-8">
        <p>No user detected. Please log in.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-[#2C282B]">Training Modules - Week 1</h1>
      <p className="mb-8 text-gray-600">Welcome, {user.name || user.email}! Here are your training modules.</p>

      {fetchError && <p className="mb-6 text-sm text-red-600">{fetchError}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Link key={module.id} href={`/modules/${module.id}`}>
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center mb-4">
                {module.icon && <span className="text-2xl mr-3">{module.icon}</span>}
                <h2 className="text-lg font-semibold text-[#2C282B]">{module.title}</h2>
              </div>
              <p className="text-gray-700 mb-4">{module.objective}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#ffc84e] font-medium">Week {module.week}</span>
                <span className="text-sm text-gray-500">Not started</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {modules.length === 0 && (
        <p className="text-gray-500 mt-8">No modules available yet.</p>
      )}
    </div>
  );
}