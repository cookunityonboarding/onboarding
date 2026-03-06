import { NextResponse } from "next/server";
import { requireApiUser } from "../../../../../lib/apiAuth";

type ModuleRow = {
  id: number;
  title: string;
  week: number;
  sort_order: number;
};

type ExerciseRow = {
  id: number;
  module_id: number;
  question: string;
  type: string;
};

type ResponseRow = {
  id: number;
  exercise_id: number;
  answer: string | null;
  correct: boolean | null;
  graded_at: string | null;
  created_at: string;
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
    .select("id,title,week,sort_order")
    .order("week", { ascending: true })
    .order("sort_order", { ascending: true });

  if (modulesError) {
    return NextResponse.json({ error: modulesError.message }, { status: 500 });
  }

  const modules = (modulesData ?? []) as ModuleRow[];
  const moduleIds = modules.map((m) => m.id);

  const { data: exercisesData, error: exercisesError } = await auth.supabaseAdmin
    .from("exercises")
    .select("id,module_id,question,type")
    .in("module_id", moduleIds)
    .order("id", { ascending: true });

  if (exercisesError) {
    return NextResponse.json({ error: exercisesError.message }, { status: 500 });
  }

  const exercises = (exercisesData ?? []) as ExerciseRow[];
  const exerciseIds = exercises.map((exercise) => exercise.id);

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
        ...exercise,
        response: latestResponseByExercise[exercise.id] ?? null,
      }));

    const answeredCount = moduleExercises.filter((exercise) => Boolean(exercise.response)).length;
    const approvedCount = moduleExercises.filter(
      (exercise) => exercise.response?.correct === true
    ).length;

    return {
      ...moduleRow,
      exercises: moduleExercises,
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
