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
    .select("id,module_id")
    .eq("id", exerciseId)
    .single();

  if (exerciseError || !exercise) {
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  }

  const { data, error } = await auth.supabaseAdmin
    .from("responses")
    .insert({
      user_id: auth.user.id,
      exercise_id: exerciseId,
      answer,
      correct: null,
      graded_by: null,
      graded_at: null,
      score: null,
    })
    .select("id,user_id,exercise_id,answer,correct,graded_at,created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ response: data }, { status: 201 });
}
