"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import { supabase } from "../../../lib/supabaseClient";

type ExerciseResponse = {
  answer: string | null;
  correct: boolean | null;
  graded_at: string | null;
};

type Exercise = {
  id: number;
  module_id: number;
  question: string;
  type: string;
  grading: string;
  options?: string[];
  review?: {
    selectedOptionIndex: number | null;
    correctOptionIndex: number | null;
  } | null;
  response: ExerciseResponse | null;
};

type ModuleDetail = {
  id: number;
  title: string;
  objective: string | null;
  icon: string | null;
  week: number;
  sort_order: number;
  description: string | null;
  content: string | null;
  criteria_list: string[] | null;
};

export default function ModuleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();

  const [moduleData, setModuleData] = useState<ModuleDetail | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [draftAnswers, setDraftAnswers] = useState<Record<number, string>>({});
  const [savingByExercise, setSavingByExercise] = useState<Record<number, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [returnWeek, setReturnWeek] = useState(1);

  const canSubmitChallenges = user?.role === "trainee";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const weekFromUrl = Number(params.get("week") || "1");
    if (Number.isInteger(weekFromUrl) && weekFromUrl > 0) {
      setReturnWeek(weekFromUrl);
    }
  }, []);

  useEffect(() => {
    const fetchModuleDetail = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error("No active session");
        }

        const res = await fetch(`/api/modules/${id}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const payload = await res.json();
        if (!res.ok) {
          throw new Error(payload.error || "Could not load module detail");
        }

        setModuleData(payload.module || null);
        const fetchedExercises = payload.exercises || [];
        setExercises(fetchedExercises);
        setDraftAnswers(
          fetchedExercises.reduce((acc: Record<number, string>, exercise: Exercise) => {
            acc[exercise.id] = exercise.response?.answer || "";
            return acc;
          }, {})
        );
      } catch (error) {
        console.error("Error fetching module detail:", error);
        setFetchError("Could not load module detail. Please refresh the page.");
      }

      setFetchLoading(false);
    };

    if (user && id) {
      fetchModuleDetail();
    }
  }, [id, user]);

  const handleSubmitChallenge = async (exerciseId: number) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    const answer = (draftAnswers[exerciseId] || "").trim();
    if (!answer) {
      setSubmitError("Please write your response before submitting.");
      return;
    }

    try {
      setSavingByExercise((prev) => ({ ...prev, [exerciseId]: true }));

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No active session");
      }

      const res = await fetch("/api/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          exerciseId,
          answer,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || "Could not submit response");
      }

      setExercises((prev) =>
        prev.map((exercise) =>
          exercise.id === exerciseId
            ? {
                ...exercise,
                response: {
                  answer,
                  correct: payload.response?.correct ?? null,
                  graded_at: payload.response?.graded_at ?? null,
                },
                review: payload.review ?? exercise.review ?? null,
              }
            : exercise
        )
      );
      setSubmitSuccess("Challenge response submitted successfully.");
    } catch (error) {
      console.error("Error submitting challenge response:", error);
      setSubmitError("Could not submit your response. Please try again.");
    } finally {
      setSavingByExercise((prev) => ({ ...prev, [exerciseId]: false }));
    }
  };

  if (loading || fetchLoading) {
    return <p className="p-8">Loading module...</p>;
  }

  if (!user) {
    return (
      <div className="p-8">
        <p>No user detected. Please log in.</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-8">
        <p className="text-red-600 mb-4">{fetchError}</p>
        <Link href="/modules" className="text-[#2C282B] underline">
          Back to modules
        </Link>
      </div>
    );
  }

  if (!moduleData) {
    return (
      <div className="p-8">
        <p>Module not found.</p>
        <Link href="/modules" className="text-[#2C282B] underline">
          Back to modules
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <Link href={`/modules?week=${returnWeek}`} className="text-sm text-[#2C282B] underline">
        Back to all modules
      </Link>

      <div className="mt-4 mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start gap-3 mb-4">
          {moduleData.icon ? <span className="text-2xl">{moduleData.icon}</span> : null}
          <div>
            <h1 className="text-2xl font-bold text-[#2C282B]">
              Module {moduleData.sort_order}. {moduleData.title}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Week {moduleData.week}</p>
          </div>
        </div>

        {moduleData.objective ? (
          <p className="text-gray-700 mb-4">
            <span className="font-semibold text-[#2C282B]">Objective: </span>
            {moduleData.objective}
          </p>
        ) : null}

        {moduleData.content ? (
          <article className="whitespace-pre-wrap leading-7 text-gray-800 text-sm md:text-base">
            {moduleData.content}
          </article>
        ) : (
          <p className="text-gray-500">No content available for this module.</p>
        )}
      </div>

      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-[#2C282B] mb-4">Completion Criteria</h2>
        {moduleData.criteria_list && moduleData.criteria_list.length > 0 ? (
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            {moduleData.criteria_list.map((criterion, index) => (
              <li key={`${moduleData.id}-criterion-${index}`}>{criterion}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No completion criteria available.</p>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-[#2C282B] mb-4">Challenges</h2>
        {submitError ? <p className="mb-3 text-sm text-red-600">{submitError}</p> : null}
        {submitSuccess ? <p className="mb-3 text-sm text-green-700">{submitSuccess}</p> : null}
        {exercises.length > 0 ? (
          <div className="space-y-4">
            {exercises.map((exercise) => (
              <div key={exercise.id} className="rounded-md border border-gray-200 p-4">
                <p className="font-medium text-[#2C282B] mb-2 whitespace-pre-wrap">{exercise.question}</p>
                <p className="text-xs text-gray-500 mb-3">Type: {exercise.type}</p>

                {canSubmitChallenges ? (
                  <div className="mb-4">
                    {exercise.type === "multiple_choice" ? (
                      <div>
                        <p className="block text-sm font-medium text-gray-700 mb-2">Choose one option</p>
                        <div className="space-y-2">
                          {(exercise.options ?? []).map((option, optionIndex) => {
                            const hasSubmitted = Boolean(exercise.response);
                            const selectedOptionIndex = exercise.review?.selectedOptionIndex;
                            const correctOptionIndex = exercise.review?.correctOptionIndex;

                            const isSelected = selectedOptionIndex === optionIndex;
                            const isCorrectOption = correctOptionIndex === optionIndex;

                            let resultClass = "border-gray-300 bg-white";
                            if (hasSubmitted && isCorrectOption) {
                              resultClass = "border-green-300 bg-green-50";
                            } else if (hasSubmitted && isSelected && !isCorrectOption) {
                              resultClass = "border-red-300 bg-red-50";
                            }

                            return (
                              <label
                                key={`${exercise.id}-option-${optionIndex}`}
                                className={`flex items-start gap-2 rounded-md border p-3 text-sm text-gray-800 ${resultClass}`}
                              >
                                <input
                                  type="radio"
                                  name={`exercise-answer-${exercise.id}`}
                                  value={String(optionIndex)}
                                  checked={(draftAnswers[exercise.id] || "") === String(optionIndex)}
                                  disabled={hasSubmitted}
                                  onChange={(event) =>
                                    setDraftAnswers((prev) => ({
                                      ...prev,
                                      [exercise.id]: event.target.value,
                                    }))
                                  }
                                  className="mt-1"
                                />
                                <span>{option}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <>
                        <label
                          htmlFor={`exercise-answer-${exercise.id}`}
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Your answer
                        </label>
                        <textarea
                          id={`exercise-answer-${exercise.id}`}
                          value={draftAnswers[exercise.id] || ""}
                          onChange={(event) =>
                            setDraftAnswers((prev) => ({
                              ...prev,
                              [exercise.id]: event.target.value,
                            }))
                          }
                          rows={5}
                          className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-[#ffc84e] focus:outline-none focus:ring-2 focus:ring-[#ffc84e]"
                          placeholder="Write your challenge response here..."
                        />
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => handleSubmitChallenge(exercise.id)}
                      disabled={
                        Boolean(savingByExercise[exercise.id]) ||
                        (exercise.type === "multiple_choice" && Boolean(exercise.response))
                      }
                      className="mt-3 rounded-full bg-[#ffc84e] px-4 py-2 text-sm font-medium text-black hover:bg-[#ffb81c] disabled:opacity-50"
                    >
                      {savingByExercise[exercise.id]
                        ? "Submitting..."
                        : exercise.type === "multiple_choice" && exercise.response
                        ? "Already Submitted"
                        : "Submit Response"}
                    </button>
                  </div>
                ) : null}

                {exercise.response ? (
                  <div className="rounded bg-gray-50 p-3 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Your latest response:</p>
                    <p className="text-gray-800 text-sm whitespace-pre-wrap">{exercise.response.answer || "(empty)"}</p>
                    <p className="text-xs mt-2 text-gray-500">
                      Status:{" "}
                      {exercise.response.correct === true
                        ? "Approved"
                        : exercise.response.correct === false
                        ? "Not approved"
                        : "Pending supervisor review"}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No response submitted yet.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No challenges available for this module.</p>
        )}
      </div>
    </div>
  );
}
