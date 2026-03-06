import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function applyMigration() {
  try {
    console.log('📋 Checking if criteria_list column exists...\n');

    // Try to query with criteria_list
    const { error: checkError } = await supabase
      .from('modules')
      .select('criteria_list')
      .limit(1);

    if (checkError && checkError.message.includes('criteria_list')) {
      console.log('⚠️  Column criteria_list not found. Attempting to add it...\n');

      // Using raw SQL via Supabase - this is a workaround
      // Since we can't directly execute SQL, we'll need to do it via Supabase dashboard
      console.log('❌ Cannot add column directly via API.');
      console.log('✅ Please apply this SQL in your Supabase dashboard (SQL Editor):');
      console.log('\n   ALTER TABLE modules ADD COLUMN IF NOT EXISTS criteria_list jsonb;');
      console.log('\nThen run the updateModulesContent.mjs script again.\n');
      process.exit(1);
    } else if (checkError) {
      console.error('Unexpected error:', checkError);
      process.exit(1);
    } else {
      console.log('✅ Column criteria_list already exists!');
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

applyMigration();
