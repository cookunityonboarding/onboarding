import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function POST(req: Request) {
  const { userId, email, name, role } = await req.json();

  if (!userId || !email) {
    return NextResponse.json(
      { error: "userId and email required" },
      { status: 400 }
    );
  }

  const { data: existingUser, error: existingError } = await supabaseAdmin
    .from("users")
    .select("id,email,name,role")
    .eq("id", userId)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  // Do not overwrite profile fields for existing users.
  if (existingUser) {
    return NextResponse.json({ success: true, data: existingUser });
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({
      id: userId,
      email,
      name: name || "User",
      role: role || "trainee",
    })
    .select("id,email,name,role")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
