import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixUserProfiles() {
  console.log('🔍 Checking auth users vs public.users...\n');

  // Get all auth users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('❌ Error fetching auth users:', authError);
    return;
  }

  console.log(`Found ${authUsers.users.length} auth users\n`);

  // Check each auth user
  for (const authUser of authUsers.users) {
    console.log(`Checking: ${authUser.email} (${authUser.id})`);

    // Check if user exists in public.users
    const { data: publicUser, error: publicError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (publicError && publicError.code !== 'PGRST116') { // PGRST116 = not found
      console.error(`  ❌ Error checking public.users:`, publicError);
      continue;
    }

    if (!publicUser) {
      console.log(`  ⚠️  User NOT found in public.users - Creating...`);
      
      // Determine default role based on email
      let role = 'trainee_lead';
      if (authUser.email?.includes('super')) {
        role = 'supervisor';
      }

      // Create user in public.users
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          email: authUser.email,
          name: authUser.email?.split('@')[0] || 'User',
          role: role,
          active: true
        });

      if (insertError) {
        console.error(`  ❌ Error creating user:`, insertError);
      } else {
        console.log(`  ✅ Created in public.users with role: ${role}`);
      }
    } else {
      console.log(`  ✅ Found in public.users - Role: ${publicUser.role}, Name: ${publicUser.name}`);
    }
  }

  console.log('\n✅ Done!');
}

fixUserProfiles().catch(console.error);
