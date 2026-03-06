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

  const { data, error } = await supabaseAdmin
    .from("users")
    .upsert({
      id: userId,
      email,
      name: name || "User",
      role: role || "trainee",
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
