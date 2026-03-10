"use client";
import { useAuth } from "../../hooks/useAuth";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

interface Module {
  id: number;
  title: string;
  objective: string;
  icon?: string;
  week: number;
  sort_order: number;
  criteria_list?: string[] | null;
  completion?: {
    criteriaChecked: number[];
    markedComplete: boolean;
  };
}

export default function ModulesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const supervisorRoles = ["supervisor", "manager", "assistant_manager"];

    if (user && supervisorRoles.includes(user.role)) {
      setFetchLoading(false);
      router.replace("/supervisor/trainees");
      return;
    }

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
  }, [user, router]);

  if (loading || fetchLoading) return <p className="p-8">Loading...</p>;

  if (!user) {
    return (
      <div className="p-8">
        <p>No user detected. Please log in.</p>
      </div>
    );
  }

  const supervisorRoles = ["supervisor", "manager", "assistant_manager"];
  if (supervisorRoles.includes(user.role)) {
    return <p className="p-8">Redirecting to supervisor panel...</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-[#2C282B]">Training Modules - Week 1</h1>
      <p className="mb-8 text-gray-600">Welcome, {user.name || user.email}! Here are your training modules.</p>

      {fetchError && <p className="mb-6 text-sm text-red-600">{fetchError}</p>}

      {modules.length > 0 && (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 py-3 mb-6">
          <p className="text-xs text-gray-500 mb-2">Quick navigation:</p>
          <div className="flex flex-wrap gap-2">
            {modules.map((module, index) => (
              <a
                key={`nav-${module.id}`}
                href={`#module-${module.id}`}
                className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-colors ${
                  module.completion?.markedComplete
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                title={module.title}
              >
                {index + 1}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-5">
        {modules.map((module, index) => (
          <Link key={module.id} href={`/modules/${module.id}`}>
            <div
              id={`module-${module.id}`}
              className="w-full bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer scroll-mt-24"
            >
              <div className="flex items-center mb-3">
                {module.icon && <span className="text-2xl mr-3">{module.icon}</span>}
                <h2 className="text-lg font-semibold text-[#2C282B]">
                  Module {index + 1}. {module.title}
                </h2>
              </div>
              <p className="text-gray-700 mb-4">{module.objective}</p>

              {Array.isArray(module.criteria_list) && module.criteria_list.length > 0 ? (
                <div className="mb-5 rounded-md border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-[#2C282B] mb-3">Completion Criteria</p>
                  <div className="space-y-2">
                    {module.criteria_list.map((criterion, index) => {
                      const isChecked = module.completion?.criteriaChecked.includes(index) ?? false;

                      return (
                        <div
                          key={`${module.id}-${index}`}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            tabIndex={-1}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 pointer-events-none"
                          />
                          <span>{criterion}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <p className="text-xs text-gray-600 mb-2">
                {(module.completion?.criteriaChecked.length ?? 0)}/
                {Array.isArray(module.criteria_list) ? module.criteria_list.length : 0} criteria checked
              </p>

              <div className="flex justify-between items-center">
                <span className="text-sm text-[#ffc84e] font-medium">Week {module.week}</span>
                <span
                  className={`text-sm font-semibold ${
                    module.completion?.markedComplete ? "text-green-700" : "text-gray-500"
                  }`}
                >
                  {module.completion?.markedComplete ? "Completed" : "Not Completed"}
                </span>
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