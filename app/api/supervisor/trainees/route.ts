import { NextResponse } from "next/server";
import { requireApiUser } from "../../../../lib/apiAuth";

type TraineeRow = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  active: boolean;
  created_at: string;
};

export async function GET(req: Request) {
  const auth = await requireApiUser(req, [
    "supervisor",
    "manager",
    "assistant_manager",
  ]);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data: traineesData, error } = await auth.supabaseAdmin
    .from("users")
    .select("id,email,name,role,active,created_at")
    .eq("role", "trainee")
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const trainees: TraineeRow[] = traineesData ?? [];

  // Get total modules count
  const { count: totalModules } = await auth.supabaseAdmin
    .from("modules")
    .select("id", { count: "exact", head: true });

  // For each trainee, get their completed modules count
  const traineesWithProgress = await Promise.all(
    trainees.map(async (trainee) => {
      const { count: completedModules } = await auth.supabaseAdmin
        .from("module_completions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", trainee.id)
        .eq("marked_complete", true);

      return {
        ...trainee,
        completedModules: completedModules ?? 0,
        totalModules: totalModules ?? 0,
      };
    })
  );

  return NextResponse.json({ trainees: traineesWithProgress });
}
