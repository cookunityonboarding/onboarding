import { NextResponse } from "next/server";
import { requireApiUser } from "../../../../lib/apiAuth";

export async function POST(req: Request) {
  const auth = await requireApiUser(req, [
    "supervisor",
    "manager",
    "assistant_manager",
  ]);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { email, name } = await req.json();

  if (!email || !name) {
    return NextResponse.json(
      { error: "Email and name are required" },
      { status: 400 }
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists in users table
  const { data: existingUser } = await auth.supabaseAdmin
    .from("users")
    .select("id, email, role")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existingUser) {
    return NextResponse.json(
      {
        error: `User ${normalizedEmail} already exists in the system. A new invitation cannot be sent.`,
      },
      { status: 400 }
    );
  }

  // Check if there's a pending invitation
  const { data: existingInvitation } = await auth.supabaseAdmin
    .from("invitations")
    .select("id, email, accepted, expires_at")
    .eq("email", normalizedEmail)
    .eq("accepted", false)
    .maybeSingle();

  if (existingInvitation) {
    // Check if invitation is expired
    const now = new Date();
    const expiresAt = existingInvitation.expires_at
      ? new Date(existingInvitation.expires_at)
      : null;

    if (expiresAt && expiresAt > now) {
      return NextResponse.json(
        {
          error: `A pending invitation already exists for ${normalizedEmail}. Use resend invitation if you want to send the email again.`,
        },
        { status: 400 }
      );
    }
  }

  try {
    // Generate unique token for tracking
    const token = crypto.randomUUID();

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

    // Invite user via Supabase Auth (sends email automatically)
    const { error: inviteError } =
      await auth.supabaseAdmin.auth.admin.inviteUserByEmail(normalizedEmail, {
        redirectTo,
        data: {
          name,
          role: "trainee",
        },
      });

    if (inviteError) {
      console.error("Supabase invite error:", inviteError);
      return NextResponse.json(
        { error: `Error sending invitation: ${inviteError.message}` },
        { status: 500 }
      );
    }

    // Calculate expiration (Supabase default is 24 hours for invite links)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Save invitation record in our tracking table
    let invitationRecord;

    if (existingInvitation) {
      // Update existing expired invitation
      const { data, error } = await auth.supabaseAdmin
        .from("invitations")
        .update({
          name,
          token,
          sent_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          invited_by: auth.user.id,
          resent_at: null,
        })
        .eq("id", existingInvitation.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating invitation:", error);
        return NextResponse.json(
          { error: "Error saving invitation" },
          { status: 500 }
        );
      }

      invitationRecord = data;
    } else {
      // Create new invitation
      const { data, error } = await auth.supabaseAdmin
        .from("invitations")
        .insert({
          email: normalizedEmail,
          name,
          role: "trainee",
          token,
          sent_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          invited_by: auth.user.id,
          accepted: false,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating invitation:", error);
        return NextResponse.json(
          { error: "Error saving invitation" },
          { status: 500 }
        );
      }

      invitationRecord = data;
    }

    return NextResponse.json({
      success: true,
      invitation: invitationRecord,
      message: `Invitation sent to ${normalizedEmail}`,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Unexpected error creating invitation" },
      { status: 500 }
    );
  }
}
