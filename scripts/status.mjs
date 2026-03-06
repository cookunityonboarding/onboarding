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

async function quickStatus() {
  try {
    // Get modules checking for content only (criteria_list may not exist yet)
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('id, title, content')
      .limit(1);

    if (modulesError) {
      console.error('Error reading modules:', modulesError.message);
      return;
    }

    console.log('📊 Database Status:\n');
    
    if (modules && modules.length > 0) {
      const m = modules[0];
      console.log(`✅ Modules table exists`);
      console.log(`   - Sample module ID: ${m.id}`);
      console.log(`   - Title: ${m.title}`);
      console.log(`   - Content field: ${m.content ? '✅ Populated' : '❌ Empty'}`);
    }

    // Get exercises
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('id')
      .limit(1);

    if (!exercisesError && exercises) {
      console.log(`✅ Exercises table exists with ${exercises?.length || 0}+ rows`);
    }

    // Check if criteria_list column exists
    const { data: checkCriteria } = await supabase
      .from('modules')
      .select('id')
      .limit(1);

    let criteriaExists = false;
    try {
      const { data: testCriteria } = await supabase
        .from('modules')
        .select('criteria_list')
        .limit(1);
      criteriaExists = true;
    } catch (e) {
      criteriaExists = false;
    }

    console.log(`   - Criteria_list column: ${criteriaExists ? '✅ Exists' : '❌ Missing (needs migration)'}`);

    console.log('\n📋 Next steps:');
    console.log('1. Run SQL in Supabase Dashboard (SQL Editor):');
    console.log('   ALTER TABLE modules ADD COLUMN IF NOT EXISTS criteria_list jsonb;');
    console.log('2. Then run: node scripts/updateModulesContent.mjs');
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

quickStatus();
