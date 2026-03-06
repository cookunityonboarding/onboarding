import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const challenges = [
  { module_id: 1, question: 'How do you prioritize the operation, guide your team clearly, and protect the customer experience at the same time?' },
  { module_id: 1, question: 'Can you explain the core difference ("my ticket" vs. "our operation") and apply Lead judgment to triage, patterns, coaching, and escalation in a busy shift?' },
  { module_id: 2, question: 'How do you make decisions that protect KPIs and reinforce accountability, empathy, and clarity — without sacrificing one for the other?' },
  { module_id: 3, question: 'Rank priorities using customer impact, SLA exposure, and pattern recognition — and explain the trade-offs behind what you delay.' },
  { module_id: 4, question: 'Which policy applies first, what\'s the correct next action, and when should this escalate versus be resolved in-channel?' },
  { module_id: 5, question: 'Can you correctly identify the Contact Reason and Sub-Contact Reason to ensure proper routing, reporting accuracy, and cross-functional visibility?' },
  { module_id: 6, question: 'How do you redistribute coverage and communicate the shift?' },
  { module_id: 6, question: 'Which channel takes priority and how do you prevent escalation?' },
  { module_id: 7, question: 'Can you apply policy, identify root cause, and coach clearly — not emotionally?' },
  { module_id: 8, question: 'Can you evaluate history + sentiment + policy, define risk clearly, and propose a specific next step that protects both the customer and CookUnity?' },
  { module_id: 9, question: 'Can you keep the pipeline clean by rejecting noise, approving real bugs, and ensuring every approved JIRA is complete, traceable, and actionable?' }
];

async function seedChallenges() {
  try {
    console.log('🌱 Seeding challenges/exercises...\n');

    for (const challenge of challenges) {
      const { data: exercise, error: exerciseError } = await supabase
        .from('exercises')
        .insert({
          module_id: challenge.module_id,
          question: challenge.question,
          type: 'short_answer'
        })
        .select()
        .single();

      if (exerciseError) {
        console.error(`❌ Error inserting challenge for module ${challenge.module_id}:`, exerciseError.message);
      } else {
        console.log(`✅ Challenge #${exercise?.id || '?'} added to Module ${challenge.module_id}`);
      }
    }

    console.log('\n🎉 Challenge seeding complete!');
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

seedChallenges();
