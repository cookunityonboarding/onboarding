import { NextResponse } from "next/server";
import { requireApiUser } from "../../../lib/apiAuth";

type ModuleRow = {
  id: number;
  title: string;
  objective: string;
  icon: string | null;
  week: number;
  sort_order: number;
  criteria_list: string[] | null;
};

type CompletionRow = {
  module_id: number;
  criteria_checked: number[] | null;
  marked_complete: boolean | null;
};

export async function GET(req: Request) {
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

  const searchParams = new URL(req.url).searchParams;
  const rawWeek = searchParams.get("week");
  const parsedWeek = rawWeek ? Number(rawWeek) : 1;
  const selectedWeek = Number.isInteger(parsedWeek) && parsedWeek > 0 ? parsedWeek : 1;

  const { data, error } = await auth.supabaseAdmin
    .from("modules")
    .select("id, title, objective, icon, week, sort_order, criteria_list")
    .eq("week", selectedWeek)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const modules = (data ?? []) as ModuleRow[];
  const moduleIds = modules.map((module) => module.id);

  const { data: completionRows, error: completionError } = await auth.supabaseAdmin
    .from("module_completions")
    .select("module_id, criteria_checked, marked_complete")
    .eq("user_id", auth.user.id)
    .in("module_id", moduleIds);

  if (completionError) {
    return NextResponse.json({ error: completionError.message }, { status: 500 });
  }

  const completionByModule = ((completionRows ?? []) as CompletionRow[]).reduce((acc, row) => {
    acc[row.module_id] = {
      criteriaChecked: Array.isArray(row.criteria_checked) ? row.criteria_checked : [],
      markedComplete: Boolean(row.marked_complete),
    };
    return acc;
  }, {} as Record<number, { criteriaChecked: number[]; markedComplete: boolean }>);

  const modulesWithCompletion = modules.map((module) => ({
    ...module,
    completion: completionByModule[module.id] ?? {
      criteriaChecked: [],
      markedComplete: false,
    },
  }));

  return NextResponse.json({ modules: modulesWithCompletion });
}
