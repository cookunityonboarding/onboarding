"use client";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabaseClient";

type TeamLevel = "director" | "manager" | "assistant_manager" | "supervisor" | "lead";

type TeamMember = {
  id: number;
  full_name: string;
  display_title: string;
  level: TeamLevel;
  bio: string | null;
  photo_url: string | null;
  sort_order: number;
};

type GroupedMembers = {
  level: TeamLevel;
  members: TeamMember[];
};

const FILTERS: Array<{ label: string; value: "all" | TeamLevel }> = [
  { label: "All", value: "all" },
  { label: "Director", value: "director" },
  { label: "Managers", value: "manager" },
  { label: "Assistant Managers", value: "assistant_manager" },
  { label: "Supervisors", value: "supervisor" },
  { label: "Leads", value: "lead" },
];

const SECTION_LABELS: Record<TeamLevel, string> = {
  director: "Director",
  manager: "Managers",
  assistant_manager: "Assistant Managers",
  supervisor: "Supervisors",
  lead: "Leads",
};

const LEVEL_ACCENT: Record<TeamLevel, string> = {
  director: "bg-[#2C282B] text-white border-[#2C282B]",
  manager: "bg-[#334155] text-white border-[#334155]",
  assistant_manager: "bg-[#475569] text-white border-[#475569]",
  supervisor: "bg-[#64748b] text-white border-[#64748b]",
  lead: "bg-[#94a3b8] text-[#111827] border-[#94a3b8]",
};

export default function TeamPage() {
  const { user, loading } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<"all" | TeamLevel>("all");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [groupedMembers, setGroupedMembers] = useState<GroupedMembers[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!user) {
        setFetchLoading(false);
        return;
      }

      try {
        setFetchLoading(true);
        setFetchError(null);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error("No active session");
        }

        const res = await fetch(`/api/team?filter=${selectedFilter}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        const payload = await res.json();

        if (!res.ok) {
          throw new Error(payload.error || "Could not load team members");
        }

        setMembers(payload.members || []);
        setGroupedMembers(payload.grouped || []);
      } catch (error) {
        console.error("Error loading team members:", error);
        setFetchError("Could not load leadership team data. Please refresh the page.");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchTeam();
  }, [user, selectedFilter]);

  const visibleGroups = useMemo(() => {
    return groupedMembers.filter((group) => group.members.length > 0);
  }, [groupedMembers]);

  if (loading || fetchLoading) return <p className="p-8">Loading...</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#2C282B] mb-2">Meet the CX Leadership Team</h1>
      <p className="text-gray-600 mb-6">
        Explore the current leadership structure and get to know the team behind CX operations.
      </p>

      {!user ? <p>No user detected. Please log in.</p> : null}

      {user ? (
        <>
          <div className="mb-8 overflow-x-auto">
            <div className="inline-flex rounded-full border border-gray-300 bg-white p-1 min-w-max">
              {FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    selectedFilter === filter.value
                      ? "bg-[#2C282B] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {fetchError ? <p className="text-red-600 mb-6">{fetchError}</p> : null}

          {selectedFilter === "all" ? (
            <div className="space-y-8">
              {visibleGroups.map((group) => (
                <section key={`group-${group.level}`}>
                  <h2 className="text-xl font-bold text-[#2C282B] mb-3">{SECTION_LABELS[group.level]}</h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {group.members.map((member) => (
                      <article
                        key={member.id}
                        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                      >
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                            LEVEL_ACCENT[member.level]
                          }`}
                        >
                          {SECTION_LABELS[member.level]}
                        </span>
                        <h3 className="mt-3 text-lg font-bold text-[#2C282B]">{member.full_name}</h3>
                        <p className="text-sm font-medium text-gray-700 mt-1">{member.display_title}</p>
                        <p className="text-sm text-gray-600 mt-3 leading-6">
                          {member.bio || "Leadership team member in the CX organization."}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <article
                  key={member.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      LEVEL_ACCENT[member.level]
                    }`}
                  >
                    {SECTION_LABELS[member.level]}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-[#2C282B]">{member.full_name}</h3>
                  <p className="text-sm font-medium text-gray-700 mt-1">{member.display_title}</p>
                  <p className="text-sm text-gray-600 mt-3 leading-6">
                    {member.bio || "Leadership team member in the CX organization."}
                  </p>
                </article>
              ))}
            </div>
          )}

          {!fetchError && members.length === 0 ? (
            <p className="text-gray-500 mt-8">No team members found for this filter.</p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}