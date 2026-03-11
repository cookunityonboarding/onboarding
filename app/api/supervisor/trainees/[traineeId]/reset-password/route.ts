import { NextResponse } from "next/server";
import { requireApiUser } from "../../../../../../lib/apiAuth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ traineeId: string }> }
) {
  const auth = await requireApiUser(req, [
    "supervisor",
    "manager",
    "assistant_manager",
  ]);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { traineeId } = await params;

  if (!traineeId) {
    return NextResponse.json({ error: "Invalid trainee id" }, { status: 400 });
  }

  const { data: trainee, error: traineeError } = await auth.supabaseAdmin
    .from("users")
    .select("id,email,role")
    .eq("id", traineeId)
    .eq("role", "trainee")
    .single();

  if (traineeError || !trainee) {
    return NextResponse.json({ error: "Trainee not found" }, { status: 404 });
  }

  try {
    const forwardedProto = req.headers.get("x-forwarded-proto") || "https";
    const forwardedHost = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const runtimeBaseUrl = forwardedHost ? `${forwardedProto}://${forwardedHost}` : null;
    const configuredBaseUrl =
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
    const baseUrl = configuredBaseUrl || runtimeBaseUrl || "http://localhost:3000";
    const redirectTo = new URL("/auth/reset-password", baseUrl).toString();

    const { error: resetError } = await auth.supabaseAdmin.auth.resetPasswordForEmail(
      trainee.email,
      { redirectTo }
    );

    if (resetError) {
      return NextResponse.json(
        { error: `Could not send reset email: ${resetError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Password reset email sent to ${trainee.email}`,
    });
  } catch (error) {
    console.error("Unexpected error sending reset email:", error);
    return NextResponse.json(
      { error: "Unexpected error sending password reset email" },
      { status: 500 }
    );
  }
}
