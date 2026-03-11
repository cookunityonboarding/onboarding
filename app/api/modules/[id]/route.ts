import { NextResponse } from "next/server";
import { requireApiUser } from "../../../../lib/apiAuth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiUser(req, [
    "trainee",
    "supervisor",
    "lead",
    "manager",
    "assistant_manager",
  ]);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const resolvedParams = await params;
  const moduleId = Number(resolvedParams.id);

  if (!Number.isInteger(moduleId) || moduleId <= 0) {
    return NextResponse.json({ error: "Invalid module id" }, { status: 400 });
  }

  const { data: moduleData, error: moduleError } = await auth.supabaseAdmin
    .from("modules")
    .select("id,title,objective,icon,week,sort_order,description,content,criteria_list")
    .eq("id", moduleId)
    .single();

  if (moduleError) {
    return NextResponse.json({ error: moduleError.message }, { status: 500 });
  }

  const { data: exercises, error: exercisesError } = await auth.supabaseAdmin
    .from("exercises")
    .select("id,module_id,question,type,grading,data,correct_answer")
    .eq("module_id", moduleId)
    .order("id", { ascending: true });

  if (exercisesError) {
    return NextResponse.json({ error: exercisesError.message }, { status: 500 });
  }

  let responsesByExerciseId: Record<number, { answer: string | null; correct: boolean | null; graded_at: string | null }> = {};
  const exercisesList =
    ((exercises ?? []) as Array<{
      id: number;
      module_id: number;
      question: string;
      type: string;
      grading: string;
      data: { options?: string[] } | null;
      correct_answer: { correctOptionIndex?: number } | null;
    }>) ?? [];

  if (exercisesList.length > 0) {
    const exerciseIds = exercisesList.map((exercise) => exercise.id);
    const { data: responses, error: responsesError } = await auth.supabaseAdmin
      .from("responses")
      .select("exercise_id,answer,correct,graded_at")
      .eq("user_id", auth.user.id)
      .in("exercise_id", exerciseIds)
      .order("created_at", { ascending: false });

    if (responsesError) {
      return NextResponse.json({ error: responsesError.message }, { status: 500 });
    }

    responsesByExerciseId =
      ((responses ?? []) as Array<{
        exercise_id: number;
        answer: string | null;
        correct: boolean | null;
        graded_at: string | null;
      }>).reduce((acc, response) => {
      if (!acc[response.exercise_id]) {
        acc[response.exercise_id] = {
          answer: response.answer,
          correct: response.correct,
          graded_at: response.graded_at,
        };
      }
      return acc;
      }, {} as Record<number, { answer: string | null; correct: boolean | null; graded_at: string | null }>);
  }

  const exercisesWithResponse = exercisesList.map((exercise) => {
    const latestResponse = responsesByExerciseId[exercise.id] ?? null;
    const options = Array.isArray(exercise.data?.options) ? exercise.data?.options : [];
    const selectedOptionIndex = latestResponse ? Number(latestResponse.answer) : null;
    const correctOptionIndex = Number(exercise.correct_answer?.correctOptionIndex);

    return {
      id: exercise.id,
      module_id: exercise.module_id,
      question: exercise.question,
      type: exercise.type,
      grading: exercise.grading,
      options,
      response: latestResponse,
      review:
        exercise.type === "multiple_choice" && latestResponse
          ? {
              selectedOptionIndex: Number.isInteger(selectedOptionIndex)
                ? selectedOptionIndex
                : null,
              correctOptionIndex: Number.isInteger(correctOptionIndex)
                ? correctOptionIndex
                : null,
            }
          : null,
    };
  });

  return NextResponse.json({
    module: moduleData,
    exercises: exercisesWithResponse,
  });
}
