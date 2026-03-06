import { supabaseAdmin } from "../lib/supabaseAdmin";

async function main() {
  const email = process.argv[2] || "supervisor@example.com";
  const password = process.argv[3] || "password123";

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    console.error("failed to create auth user", error);
    process.exit(1);
  }

  if (data.user?.id) {
    const { error: uErr } = await supabaseAdmin
      .from("users")
      .upsert({ id: data.user.id, email, role: "supervisor" });
    if (uErr) {
      console.error("failed to upsert profile", uErr);
      process.exit(1);
    }
    console.log("created supervisor", email);
  }
}

main();
