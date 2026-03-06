import { NextResponse } from "next/server";
import { requireApiUser } from "../../../../../../lib/apiAuth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ responseId: string }> }
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
  const responseId = Number(resolvedParams.responseId);
  const body = await req.json().catch(() => null);
  const approved = body?.approved;

  if (!Number.isInteger(responseId) || responseId <= 0) {
    return NextResponse.json({ error: "Invalid response id" }, { status: 400 });
  }

  if (typeof approved !== "boolean") {
    return NextResponse.json({ error: "approved must be boolean" }, { status: 400 });
  }

  const { data, error } = await auth.supabaseAdmin
    .from("responses")
    .update({
      correct: approved,
      graded_by: auth.user.id,
      graded_at: new Date().toISOString(),
    })
    .eq("id", responseId)
    .select("id,exercise_id,correct,graded_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ response: data });
}
