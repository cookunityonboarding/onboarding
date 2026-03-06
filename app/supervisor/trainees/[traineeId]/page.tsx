"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "../../../../hooks/useAuth";
import { supabase } from "../../../../lib/supabaseClient";

type Trainee = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  active: boolean;
};

type ResponseData = {
  id: number;
  exercise_id: number;
  answer: string | null;
  correct: boolean | null;
  graded_at: string | null;
  created_at: string;
};

type Exercise = {
  id: number;
  module_id: number;
  question: string;
  type: string;
  response: ResponseData | null;
};

type ModuleCard = {
  id: number;
  title: string;
  week: number;
  sort_order: number;
  exercises: Exercise[];
  stats: {
    totalChallenges: number;
    answeredChallenges: number;
    approvedChallenges: number;
  };
};

export default function SupervisorTraineeDetailPage() {
  const { traineeId } = useParams<{ traineeId: string }>();
  const { user, loading } = useAuth();

  const [trainee, setTrainee] = useState<Trainee | null>(null);
  const [modules, setModules] = useState<ModuleCard[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [gradingState, setGradingState] = useState<Record<number, boolean>>({});
  const [showRegrade, setShowRegrade] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const loadTraineeDetail = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error("No active session");
        }

        const res = await fetch(`/api/supervisor/trainees/${traineeId}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        const payload = await res.json();

        if (!res.ok) {
          throw new Error(payload.error || "Could not load trainee detail");
        }

        setTrainee(payload.trainee || null);
        setModules(payload.modules || []);
      } catch (error) {
        console.error("Error loading trainee detail:", error);
        setFetchError("Could not load trainee detail. Please refresh the page.");
      } finally {
        setFetchLoading(false);
      }
    };

    if (user && traineeId) {
      loadTraineeDetail();
    }
  }, [user, traineeId]);

  const handleGrade = async (responseId: number, approved: boolean) => {
    try {
      setGradingState((prev) => ({ ...prev, [responseId]: true }));

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No active session");
      }

      const res = await fetch(`/api/supervisor/responses/${responseId}/grade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ approved }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || "Could not update grade");
      }

      setModules((prev) =>
        prev.map((moduleCard) => ({
          ...moduleCard,
          exercises: moduleCard.exercises.map((exercise) => {
            if (exercise.response?.id !== responseId) {
              return exercise;
            }
            return {
              ...exercise,
              response: {
                ...exercise.response,
                correct: approved,
                graded_at: payload.response?.graded_at || new Date().toISOString(),
              },
            };
          }),
          stats: {
            totalChallenges: moduleCard.stats.totalChallenges,
            answeredChallenges: moduleCard.exercises.filter((exercise) => Boolean(exercise.response)).length,
            approvedChallenges: moduleCard.exercises.filter((exercise) => {
              if (exercise.response?.id === responseId) {
                return approved;
              }
              return exercise.response?.correct === true;
            }).length,
          },
        }))
      );

      // Hide actions after grading; can be re-opened from status badge.
      setShowRegrade((prev) => ({ ...prev, [responseId]: false }));
    } catch (error) {
      console.error("Error grading response:", error);
      setFetchError("Could not grade response. Please try again.");
    } finally {
      setGradingState((prev) => ({ ...prev, [responseId]: false }));
    }
  };

  if (loading || fetchLoading) {
    return <p className="p-8">Loading trainee detail...</p>;
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
      <Link href="/supervisor/trainees" className="text-sm text-[#2C282B] underline">
        Back to trainees
      </Link>

      <h1 className="text-2xl font-bold text-[#2C282B] mt-4">
        {trainee?.name || trainee?.email || "Trainee"}
      </h1>
      <p className="text-gray-600 mb-6">Review responses and grade each challenge.</p>

      {fetchError ? <p className="text-red-600 mb-4">{fetchError}</p> : null}

      <div className="space-y-5">
        {modules.map((moduleCard) => (
          <section key={moduleCard.id} className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-[#2C282B]">{moduleCard.title}</h2>
              <p className="text-sm text-gray-600 mt-1">
                Week {moduleCard.week} | Answered {moduleCard.stats.answeredChallenges}/
                {moduleCard.stats.totalChallenges} | Approved {moduleCard.stats.approvedChallenges}
              </p>
            </div>

            {moduleCard.exercises.length === 0 ? (
              <p className="text-sm text-gray-500">No challenges for this module.</p>
            ) : (
              <div className="space-y-4">
                {moduleCard.exercises.map((exercise) => (
                  <div key={exercise.id} className="rounded border border-gray-200 p-4">
                    <p className="font-medium text-[#2C282B] mb-2">{exercise.question}</p>
                    {!exercise.response ? (
                      <p className="text-sm text-gray-500">No response submitted yet.</p>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600 mb-1">Trainee response:</p>
                        <p className="text-sm whitespace-pre-wrap bg-gray-50 border border-gray-200 rounded p-3 mb-3">
                          {exercise.response.answer || "(empty)"}
                        </p>

                        {exercise.response.correct === null ? (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800 mb-3">
                            Pending review
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setShowRegrade((prev) => ({
                                ...prev,
                                [exercise.response!.id]: !prev[exercise.response!.id],
                              }))
                            }
                            className={`mb-3 inline-flex items-center rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wide ${
                              exercise.response.correct
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            }`}
                          >
                            {exercise.response.correct ? "[OK] Approved" : "[X] Not approved"} - Click to regrade
                          </button>
                        )}

                        {(exercise.response.correct === null || showRegrade[exercise.response.id]) && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={Boolean(gradingState[exercise.response.id])}
                              onClick={() => handleGrade(exercise.response!.id, true)}
                              className="rounded-full bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={Boolean(gradingState[exercise.response.id])}
                              onClick={() => handleGrade(exercise.response!.id, false)}
                              className="rounded-full bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              Not Approved
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
