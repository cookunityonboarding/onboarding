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
        error: `El usuario ${normalizedEmail} ya existe en el sistema. No se puede invitar de nuevo.`,
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
          error: `Ya existe una invitación pendiente para ${normalizedEmail}. Usa la función de reenviar si deseas enviar el email nuevamente.`,
        },
        { status: 400 }
      );
    }
  }

  try {
    // Generate unique token for tracking
    const token = crypto.randomUUID();
    
    // Build redirect URL dynamically from request headers
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const redirectTo = `${protocol}://${host}/auth/complete-invite`;

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
        { error: `Error al enviar invitación: ${inviteError.message}` },
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
          { error: "Error al guardar invitación" },
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
          { error: "Error al guardar invitación" },
          { status: 500 }
        );
      }

      invitationRecord = data;
    }

    return NextResponse.json({
      success: true,
      invitation: invitationRecord,
      message: `Invitación enviada a ${normalizedEmail}`,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Error inesperado al crear invitación" },
      { status: 500 }
    );
  }
}
