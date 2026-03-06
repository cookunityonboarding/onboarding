import { NextResponse } from "next/server";
import { requireApiUser } from "../../../lib/apiAuth";

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

  const { data, error } = await auth.supabaseAdmin
    .from("modules")
    .select("id, title, objective, icon, week, sort_order")
    .eq("week", 1)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ modules: data ?? [] });
}
