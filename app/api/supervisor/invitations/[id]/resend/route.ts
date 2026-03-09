import { NextResponse } from "next/server";
import { requireApiUser } from "../../../../../../lib/apiAuth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiUser(req, [
    "supervisor",
    "manager",
    "assistant_manager",
  ]);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id: invitationId } = await params;

  // Get invitation
  const { data: invitation, error: fetchError } = await auth.supabaseAdmin
    .from("invitations")
    .select("id, email, name, accepted, expires_at")
    .eq("id", invitationId)
    .single();

  if (fetchError || !invitation) {
    return NextResponse.json(
      { error: "Invitación no encontrada" },
      { status: 404 }
    );
  }

  if (invitation.accepted) {
    return NextResponse.json(
      { error: "Esta invitación ya fue aceptada" },
      { status: 400 }
    );
  }

  try {
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/complete-invite`;

    // Resend invitation via Supabase Auth
    const { error: inviteError } =
      await auth.supabaseAdmin.auth.admin.inviteUserByEmail(invitation.email, {
        redirectTo,
        data: {
          name: invitation.name,
          role: "trainee",
        },
      });

    if (inviteError) {
      console.error("Supabase invite error:", inviteError);
      return NextResponse.json(
        { error: `Error al reenviar invitación: ${inviteError.message}` },
        { status: 500 }
      );
    }

    // Update invitation record
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { data: updatedInvitation, error: updateError } =
      await auth.supabaseAdmin
        .from("invitations")
        .update({
          resent_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .eq("id", invitationId)
        .select()
        .single();

    if (updateError) {
      console.error("Error updating invitation:", updateError);
      return NextResponse.json(
        { error: "Error al actualizar invitación" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      invitation: updatedInvitation,
      message: `Invitación reenviada a ${invitation.email}`,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Error inesperado al reenviar invitación" },
      { status: 500 }
    );
  }
}
