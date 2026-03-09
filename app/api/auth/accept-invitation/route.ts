import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function POST(req: Request) {
  const { email, userId } = await req.json();

  if (!email || !userId) {
    return NextResponse.json(
      { error: "Email and userId are required" },
      { status: 400 }
    );
  }

  try {
    // Find and update invitation
    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from("invitations")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .eq("accepted", false)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching invitation:", fetchError);
      return NextResponse.json(
        { error: "Error al buscar invitación" },
        { status: 500 }
      );
    }

    if (invitation) {
      const { error: updateError } = await supabaseAdmin
        .from("invitations")
        .update({
          accepted: true,
          user_id: userId,
        })
        .eq("id", invitation.id);

      if (updateError) {
        console.error("Error updating invitation:", updateError);
        return NextResponse.json(
          { error: "Error al actualizar invitación" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Invitation accepted",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Error inesperado" },
      { status: 500 }
    );
  }
}
