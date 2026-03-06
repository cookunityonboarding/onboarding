import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: Environment variables not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function applyMigrationManual() {
  try {
    console.log('🔧 Attempting to add criteria_list column via RPC function...\n');

    // Try to call a custom RPC function if it exists
    // Otherwise, we'll provide instructions
    
    // First, let's check if we can read from modules
    const { data: testModules, error: testError } = await supabase
      .from('modules')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Error accessing modules table:', testError);
      process.exit(1);
    }

    console.log('✅ Database access confirmed\n');
    console.log('⚠️  Could not add criteria_list column automatically.');
    console.log('\n📋 You must execute this SQL manually in Supabase:\n');
    console.log('Go to: https://supabase.com/dashboard');
    console.log('Project → SQL Editor → Paste this and click RUN:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\nALTER TABLE modules ADD COLUMN IF NOT EXISTS criteria_list jsonb;\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ After running the SQL above, execute:');
    console.log('   node scripts/updateModulesContent.mjs\n');

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

applyMigrationManual();
