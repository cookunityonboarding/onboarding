import { NextResponse } from "next/server";
import { requireApiUser } from "../../../../lib/apiAuth";

export async function GET(req: Request) {
  const auth = await requireApiUser(req, [
    "supervisor",
    "manager",
    "assistant_manager",
  ]);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data, error } = await auth.supabaseAdmin
    .from("users")
    .select("id,email,name,role,active,created_at")
    .eq("role", "trainee")
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ trainees: data ?? [] });
}
