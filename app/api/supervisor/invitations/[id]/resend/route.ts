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
      { error: "Invitation not found" },
      { status: 404 }
    );
  }

  if (invitation.accepted) {
    return NextResponse.json(
      { error: "This invitation has already been accepted" },
      { status: 400 }
    );
  }

  try {
    // Build redirect URL with stable fallbacks for local and deployed environments.
    const forwardedProto = req.headers.get("x-forwarded-proto") || "https";
    const forwardedHost = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const runtimeBaseUrl = forwardedHost ? `${forwardedProto}://${forwardedHost}` : null;
    const configuredBaseUrl =
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
    const baseUrl = configuredBaseUrl || runtimeBaseUrl || "http://localhost:3000";
    const redirectTo = new URL("/auth/complete-invite", baseUrl).toString();

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
        { error: `Error resending invitation: ${inviteError.message}` },
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
        { error: "Error updating invitation" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      invitation: updatedInvitation,
      message: `Invitation resent to ${invitation.email}`,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Unexpected error resending invitation" },
      { status: 500 }
    );
  }
}
