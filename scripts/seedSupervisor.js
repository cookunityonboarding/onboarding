require('dotenv').config({ path: '.env.local' });
const { supabaseAdmin } = require("../lib/supabaseAdmin");

async function main() {
  const email = process.argv[2] || "super@example.com";
  const password = process.argv[3] || "password123";

  // First, try to find existing auth user
  let userId;
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = existingUsers.users.find(u => u.email === email);
  if (existingUser) {
    userId = existingUser.id;
    console.log("Found existing auth user:", email);
  } else {
    // Create new auth user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) {
      console.error("failed to create auth user", error);
      process.exit(1);
    }
    userId = data.user.id;
    console.log("Created new auth user:", email);
  }

  // Upsert profile in users table
  const { error: uErr } = await supabaseAdmin
    .from("users")
    .upsert({ id: userId, email, role: "supervisor", name: "Supervisor" });
  if (uErr) {
    console.error("failed to upsert profile", uErr);
    process.exit(1);
  }
  console.log("Supervisor profile ready:", email);
}

main();
