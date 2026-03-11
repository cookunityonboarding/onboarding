import { NextResponse } from "next/server";
import { requireApiUser } from "../../../../lib/apiAuth";

type TraineeRow = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  active: boolean;
  created_at: string;
};

type InvitationRow = {
  id: string;
  email: string;
  name: string | null;
  sent_at: string | null;
  expires_at: string | null;
  accepted: boolean;
};

export async function GET(req: Request) {
  const auth = await requireApiUser(req, [
    "supervisor",
    "manager",
    "assistant_manager",
  ]);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // Get trainees (active and disabled)
  const { data: traineesData, error } = await auth.supabaseAdmin
    .from("users")
    .select("id,email,name,role,active,created_at")
    .eq("role", "trainee")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const trainees: TraineeRow[] = traineesData ?? [];

  // Get pending invitations
  const { data: invitationsData } = await auth.supabaseAdmin
    .from("invitations")
    .select("id,email,name,sent_at,expires_at,accepted")
    .eq("accepted", false)
    .order("sent_at", { ascending: false });

  const invitations: InvitationRow[] = invitationsData ?? [];

  // Get total modules count
  const { count: totalModules } = await auth.supabaseAdmin
    .from("modules")
    .select("id", { count: "exact", head: true });

  // For each trainee, get their completed modules count
  const traineesWithProgress = await Promise.all(
    trainees.map(async (trainee) => {
      const { count: completedModules } = await auth.supabaseAdmin
        .from("module_completions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", trainee.id)
        .eq("marked_complete", true);

      return {
        id: trainee.id,
        email: trainee.email,
        name: trainee.name,
        role: trainee.role,
        active: trainee.active,
        created_at: trainee.created_at,
        completedModules: completedModules ?? 0,
        totalModules: totalModules ?? 0,
        status: trainee.active ? ("active" as const) : ("disabled" as const),
        invitationId: null,
      };
    })
  );

  // Process invitations to determine status
  const now = new Date();
  const invitationsWithStatus = invitations.map((invitation) => {
    const expiresAt = invitation.expires_at
      ? new Date(invitation.expires_at)
      : null;
    const isExpired = expiresAt ? expiresAt <= now : false;

    return {
      id: invitation.id,
      email: invitation.email,
      name: invitation.name,
      role: "trainee",
      active: false,
      created_at: invitation.sent_at || new Date().toISOString(),
      completedModules: 0,
      totalModules: totalModules ?? 0,
      status: isExpired ? ("expired" as const) : ("pending" as const),
      invitationId: invitation.id,
      expiresAt: invitation.expires_at,
    };
  });

  // Combine trainees and invitations
  const allTrainees = [...traineesWithProgress, ...invitationsWithStatus];

  return NextResponse.json({ trainees: allTrainees });
}
