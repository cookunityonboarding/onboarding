import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";

export async function GET(req: Request) {
  const { data: { session }, error: sessErr } = await supabase.auth.getSession();
  if (sessErr) return NextResponse.json({ error: sessErr.message }, { status: 400 });
  if (!session) return NextResponse.json({ user: null });

  const { data: user, error } = await supabase
    .from("users")
    .select("id,email,role,name")
    .eq("id", session.user.id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ user });
}