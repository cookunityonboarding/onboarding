import { NextResponse } from "next/server";
import { requireApiUser } from "../../../../../lib/apiAuth";

type ModuleRow = {
  id: number;
  title: string;
  week: number;
  sort_order: number;
  criteria_list: string[] | null;
};

type ExerciseRow = {
  id: number;
  module_id: number;
  question: string;
  type: string;
  data: { options?: string[] } | null;
  correct_answer: { correctOptionIndex?: number } | null;
};

type ResponseRow = {
  id: number;
  exercise_id: number;
  answer: string | null;
  correct: boolean | null;
  graded_at: string | null;
  created_at: string;
};

type ModuleCompletionRow = {
  module_id: number;
  criteria_checked: number[] | null;
  criteria_met: boolean | null;
  marked_complete: boolean | null;
  marked_at: string | null;
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ traineeId: string }> }
) {
  const auth = await requireApiUser(req, [
    "supervisor",
    "manager",
    "assistant_manager",
  ]);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const resolvedParams = await params;
  const traineeId = resolvedParams.traineeId;

  if (!traineeId) {
    return NextResponse.json({ error: "Invalid trainee id" }, { status: 400 });
  }

  const { data: trainee, error: traineeError } = await auth.supabaseAdmin
    .from("users")
    .select("id,email,name,role,active")
    .eq("id", traineeId)
    .single();

  if (traineeError || !trainee) {
    return NextResponse.json({ error: "Trainee not found" }, { status: 404 });
  }

  if (trainee.role !== "trainee") {
    return NextResponse.json({ error: "Selected user is not a trainee" }, { status: 400 });
  }

  const { data: modulesData, error: modulesError } = await auth.supabaseAdmin
    .from("modules")
    .select("id,title,week,sort_order,criteria_list")
    .order("week", { ascending: true })
    .order("sort_order", { ascending: true });

  if (modulesError) {
    return NextResponse.json({ error: modulesError.message }, { status: 500 });
  }

  const modules = (modulesData ?? []) as ModuleRow[];
  const moduleIds = modules.map((m) => m.id);

  const { data: exercisesData, error: exercisesError } = await auth.supabaseAdmin
    .from("exercises")
    .select("id,module_id,question,type,data,correct_answer")
    .in("module_id", moduleIds)
    .order("id", { ascending: true });

  if (exercisesError) {
    return NextResponse.json({ error: exercisesError.message }, { status: 500 });
  }

  const exercises = (exercisesData ?? []) as ExerciseRow[];
  const exerciseIds = exercises.map((exercise) => exercise.id);

  const { data: completionData, error: completionError } = await auth.supabaseAdmin
    .from("module_completions")
    .select("module_id,criteria_checked,criteria_met,marked_complete,marked_at")
    .eq("user_id", traineeId)
    .in("module_id", moduleIds);

  if (completionError) {
    return NextResponse.json({ error: completionError.message }, { status: 500 });
  }

  const { data: responsesData, error: responsesError } = await auth.supabaseAdmin
    .from("responses")
    .select("id,exercise_id,answer,correct,graded_at,created_at")
    .eq("user_id", traineeId)
    .in("exercise_id", exerciseIds)
    .order("created_at", { ascending: false });

  if (responsesError) {
    return NextResponse.json({ error: responsesError.message }, { status: 500 });
  }

  const responses = (responsesData ?? []) as ResponseRow[];
  const completions = (completionData ?? []) as ModuleCompletionRow[];

  const completionByModule = completions.reduce((acc, completion) => {
    acc[completion.module_id] = completion;
    return acc;
  }, {} as Record<number, ModuleCompletionRow>);

  const latestResponseByExercise = responses.reduce((acc, response) => {
    if (!acc[response.exercise_id]) {
      acc[response.exercise_id] = response;
    }
    return acc;
  }, {} as Record<number, ResponseRow>);

  const moduleCards = modules.map((moduleRow) => {
    const moduleExercises = exercises
      .filter((exercise) => exercise.module_id === moduleRow.id)
      .map((exercise) => ({
        id: exercise.id,
        module_id: exercise.module_id,
        question: exercise.question,
        type: exercise.type,
        options: Array.isArray(exercise.data?.options) ? exercise.data?.options : [],
        correctOptionIndex: Number.isInteger(Number(exercise.correct_answer?.correctOptionIndex))
          ? Number(exercise.correct_answer?.correctOptionIndex)
          : null,
        response: latestResponseByExercise[exercise.id] ?? null,
      }));

    const answeredCount = moduleExercises.filter((exercise) => Boolean(exercise.response)).length;
    const approvedCount = moduleExercises.filter(
      (exercise) => exercise.response?.correct === true
    ).length;

    const completion = completionByModule[moduleRow.id];

    return {
      ...moduleRow,
      exercises: moduleExercises,
      completion: {
        criteriaChecked: Array.isArray(completion?.criteria_checked)
          ? completion.criteria_checked
          : [],
        criteriaMet: Boolean(completion?.criteria_met),
        markedComplete: Boolean(completion?.marked_complete),
        markedAt: completion?.marked_at ?? null,
      },
      stats: {
        totalChallenges: moduleExercises.length,
        answeredChallenges: answeredCount,
        approvedChallenges: approvedCount,
      },
    };
  });

  return NextResponse.json({
    trainee,
    modules: moduleCards,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ traineeId: string }> }
) {
  const auth = await requireApiUser(req, [
    "supervisor",
    "manager",
    "assistant_manager",
  ]);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { traineeId } = await params;

  if (!traineeId) {
    return NextResponse.json({ error: "Invalid trainee id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const incomingName = body?.name;
  const incomingActive = body?.active;

  if (typeof incomingName !== "string" && typeof incomingActive !== "boolean") {
    return NextResponse.json(
      { error: "Provide at least one editable field: name or active" },
      { status: 400 }
    );
  }

  const updates: { name?: string; active?: boolean } = {};

  if (typeof incomingName === "string") {
    const normalizedName = incomingName.trim();
    if (!normalizedName) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }
    updates.name = normalizedName;
  }

  if (typeof incomingActive === "boolean") {
    updates.active = incomingActive;
  }

  const { data: updatedUser, error: updateError } = await auth.supabaseAdmin
    .from("users")
    .update(updates)
    .eq("id", traineeId)
    .eq("role", "trainee")
    .select("id,email,name,role,active")
    .single();

  if (updateError || !updatedUser) {
    return NextResponse.json({ error: "Trainee not found or update failed" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    trainee: updatedUser,
    message: "Trainee updated successfully",
  });
}
