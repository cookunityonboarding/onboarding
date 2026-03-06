require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function verifyModules() {
  try {
    console.log('✅ Verifying modules...\n');

    // Get all modules
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('id, title, week, sort_order')
      .eq('week', 1)
      .order('sort_order', { ascending: true });

    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError);
      return;
    }

    console.log(`📦 Found ${modules.length} modules in Week 1:\n`);
    modules.forEach((m) => {
      console.log(`  ${m.sort_order}. ${m.title} (ID: ${m.id})`);
    });

    // Get all exercises
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('id, module_id, question');

    if (exercisesError) {
      console.error('❌ Error fetching exercises:', exercisesError);
      return;
    }

    console.log(`\n📋 Found ${exercises.length} exercises/challenges total:\n`);
    exercises.forEach((e, idx) => {
      console.log(`  ${idx + 1}. Module ${e.module_id}: "${e.question.substring(0, 60)}..."`);
    });

    console.log('\n🎉 Verification complete!');
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

verifyModules();
