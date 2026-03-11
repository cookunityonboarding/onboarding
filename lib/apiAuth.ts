import { createClient } from "@supabase/supabase-js";

type AppUser = {
  id: string;
  email: string;
  role: string;
  name?: string;
  active: boolean;
};

type AuthResult =
  | {
      ok: true;
      supabaseAdmin: any;
      user: AppUser;
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

export async function requireApiUser(
  req: Request,
  allowedRoles: string[]
): Promise<AuthResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return {
      ok: false,
      status: 500,
      error: "Missing Supabase environment variables",
    };
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "Missing bearer token" };
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return { ok: false, status: 401, error: "Invalid bearer token" };
  }

  const supabaseAnon = createClient(supabaseUrl, anonKey);
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const {
    data: { user: authUser },
    error: authError,
  } = await supabaseAnon.auth.getUser(token);

  if (authError || !authUser) {
    return { ok: false, status: 401, error: "Invalid or expired session" };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("users")
    .select("id,email,role,name,active")
    .eq("id", authUser.id)
    .single();

  if (profileError || !profile) {
    return { ok: false, status: 403, error: "User profile not found" };
  }

  if (!allowedRoles.includes(profile.role)) {
    return { ok: false, status: 403, error: "Insufficient role permissions" };
  }

  if (!profile.active) {
    return { ok: false, status: 403, error: "Account disabled" };
  }

  return { ok: true, supabaseAdmin, user: profile };
}
