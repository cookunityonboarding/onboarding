import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  // we don't set a cookie here because supabase client handles it on the browser
  return NextResponse.json({ user: data.user, session: data.session });
}