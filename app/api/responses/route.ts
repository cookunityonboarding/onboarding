import { NextResponse } from "next/server";
import { requireApiUser } from "../../../lib/apiAuth";

export async function POST(req: Request) {
  const auth = await requireApiUser(req, ["trainee"]);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json().catch(() => null);
  const exerciseId = Number(body?.exerciseId);
  const answer = typeof body?.answer === "string" ? body.answer.trim() : "";

  if (!Number.isInteger(exerciseId) || exerciseId <= 0) {
    return NextResponse.json({ error: "Invalid exerciseId" }, { status: 400 });
  }

  if (!answer) {
    return NextResponse.json({ error: "Answer is required" }, { status: 400 });
  }

  const { data: exercise, error: exerciseError } = await auth.supabaseAdmin
    .from("exercises")
    .select("id,module_id,type,data,correct_answer")
    .eq("id", exerciseId)
    .single();

  if (exerciseError || !exercise) {
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  }

  const exerciseType = typeof exercise.type === "string" ? exercise.type : "short_answer";

  let isCorrect: boolean | null = null;
  let gradedAt: string | null = null;
  let score: number | null = null;
  let mcqReview: { selectedOptionIndex: number; correctOptionIndex: number } | null = null;

  if (exerciseType === "multiple_choice") {
    const selectedOptionIndex = Number(answer);
    if (!Number.isInteger(selectedOptionIndex)) {
      return NextResponse.json(
        { error: "Invalid multiple choice answer" },
        { status: 400 }
      );
    }

    const { data: existingResponse, error: existingResponseError } = await auth.supabaseAdmin
      .from("responses")
      .select("id")
      .eq("user_id", auth.user.id)
      .eq("exercise_id", exerciseId)
      .limit(1)
      .maybeSingle();

    if (existingResponseError) {
      return NextResponse.json({ error: existingResponseError.message }, { status: 500 });
    }

    if (existingResponse) {
      return NextResponse.json(
        { error: "This multiple choice question has already been submitted" },
        { status: 409 }
      );
    }

    const options =
      exercise && typeof exercise.data === "object" && exercise.data !== null && Array.isArray((exercise.data as { options?: unknown[] }).options)
        ? ((exercise.data as { options: string[] }).options ?? [])
        : [];

    if (selectedOptionIndex < 0 || selectedOptionIndex >= options.length) {
      return NextResponse.json(
        { error: "Selected option is out of range" },
        { status: 400 }
      );
    }

    const correctOptionIndexRaw =
      exercise && typeof exercise.correct_answer === "object" && exercise.correct_answer !== null
        ? (exercise.correct_answer as { correctOptionIndex?: unknown }).correctOptionIndex
        : null;
    const correctOptionIndex = Number(correctOptionIndexRaw);

    if (!Number.isInteger(correctOptionIndex)) {
      return NextResponse.json(
        { error: "Exercise is missing a valid correct answer" },
        { status: 500 }
      );
    }

    isCorrect = selectedOptionIndex === correctOptionIndex;
    gradedAt = new Date().toISOString();
    score = isCorrect ? 1 : 0;
    mcqReview = {
      selectedOptionIndex,
      correctOptionIndex,
    };
  }

  const { data, error } = await auth.supabaseAdmin
    .from("responses")
    .insert({
      user_id: auth.user.id,
      exercise_id: exerciseId,
      answer,
      correct: isCorrect,
      graded_by: null,
      graded_at: gradedAt,
      score,
    })
    .select("id,user_id,exercise_id,answer,correct,graded_at,created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      response: data,
      review: mcqReview,
      exerciseType,
    },
    { status: 201 }
  );
}
