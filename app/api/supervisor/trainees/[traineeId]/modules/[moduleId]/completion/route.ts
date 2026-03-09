import { NextResponse } from "next/server";
import { requireApiUser } from "../../../../../../../../lib/apiAuth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ traineeId: string; moduleId: string }> }
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
  const moduleId = Number(resolvedParams.moduleId);

  if (!traineeId || !Number.isInteger(moduleId) || moduleId <= 0) {
    return NextResponse.json({ error: "Invalid trainee/module id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const incomingChecked = body?.criteriaChecked;
  const requestedMarkedComplete = body?.markedComplete;

  if (
    !Array.isArray(incomingChecked) ||
    incomingChecked.some(
      (value: unknown) =>
        typeof value !== "number" || !Number.isInteger(value) || value < 0
    )
  ) {
    return NextResponse.json(
      { error: "criteriaChecked must be an array of non-negative integers" },
      { status: 400 }
    );
  }

  if (typeof requestedMarkedComplete !== "boolean") {
    return NextResponse.json({ error: "markedComplete must be boolean" }, { status: 400 });
  }

  const uniqueChecked = Array.from(new Set(incomingChecked as number[])).sort((a, b) => a - b);

  const { data: moduleData, error: moduleError } = await auth.supabaseAdmin
    .from("modules")
    .select("id,criteria_list")
    .eq("id", moduleId)
    .single();

  if (moduleError || !moduleData) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  const criteriaList = Array.isArray(moduleData.criteria_list) ? moduleData.criteria_list : [];

  const hasOutOfRangeIndex = uniqueChecked.some((index) => index >= criteriaList.length);
  if (hasOutOfRangeIndex) {
    return NextResponse.json({ error: "criteriaChecked contains invalid index" }, { status: 400 });
  }

  const criteriaMet = criteriaList.length > 0 && uniqueChecked.length === criteriaList.length;
  const markedComplete = requestedMarkedComplete ? criteriaMet : false;

  const payload = {
    user_id: traineeId,
    module_id: moduleId,
    criteria_checked: uniqueChecked,
    criteria_met: criteriaMet,
    marked_complete: markedComplete,
    marked_by: auth.user.id,
    marked_at: new Date().toISOString(),
    completed_at: markedComplete ? new Date().toISOString() : null,
  };

  const { data, error } = await auth.supabaseAdmin
    .from("module_completions")
    .upsert(payload, { onConflict: "user_id,module_id" })
    .select("module_id,criteria_checked,criteria_met,marked_complete,marked_at,completed_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ completion: data });
}
