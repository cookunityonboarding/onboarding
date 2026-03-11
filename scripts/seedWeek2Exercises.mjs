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

function normalizeQuestion(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

const week2Exercises = [
  {
    module_id: 10,
    type: 'short_answer',
    grading: 'manual',
    question: `WABI - SABI #1
Escalation Reason: Warm Meals
Credit or Refund: Credits
Amount: 78.90
Context: The whole order (12 meals) was delivered warm. No delivery issues, the order was scheduled for Jun 24 and delivered according to the instructions of the CX. The one icepack was melted. The customer retrived the order on time. Ring 2.
Question: Would you approve, deny or correct this wabi? Explain your thought process and write how would you reply to this agent.`,
  },
  {
    module_id: 10,
    type: 'short_answer',
    grading: 'manual',
    question: `WABI - SABI #2
Escalation Reason: CAC
Credit or Refund: Refund
Amount: 78.90
Context: First time customer wants to cancel the order, they were checking the menu and do not want the order.
Question: Would you approve, deny or correct this wabi? Explain your thought process and write how would you reply to this agent.`,
  },
  {
    module_id: 10,
    type: 'short_answer',
    grading: 'manual',
    question: `WABI - SABI #3
Escalation Reason: Food Poisoning
Credit or Refund: Refund
Amount: 78.90
Context: The customer reported that they received their order one day later than expected. After consuming the meal, they experienced vomiting and stomach pain.
Question: Would you approve, deny or correct this wabi? Explain your thought process and write how would you reply to this agent.`,
  },
  {
    module_id: 10,
    type: 'short_answer',
    grading: 'manual',
    question: `WABI - SABI #4
Escalation Reason: CAC FW
Credit or Refund: credits
Amount: 78.90
Context: customer wants to cancel the order and was processed 30 min ago. They say we are scammers and want their money.
Question: Would you approve, deny or correct this wabi? Explain your thought process and write how would you reply to this agent.`,
  },
  {
    module_id: 10,
    type: 'short_answer',
    grading: 'manual',
    question: `WABI - SABI #5
Escalation Reason: Customer do not want the order.
Credit or Refund: refund
Amount: 78.90
Context: The customer does not want the order.
Question: Would you approve, deny or correct this wabi? Explain your thought process and write how would you reply to this agent.`,
  },
  {
    module_id: 11,
    type: 'multiple_choice',
    grading: 'auto',
    question: 'What is a tag in CX tagging, according to the content?',
    options: [
      'A mandatory field that stores customer credit information.',
      'A label or keyword added to a ticket or case to describe its content, context, or category.',
      'A security feature that prevents data leakage.',
      'A template for email responses.',
    ],
    correctOptionIndex: 1,
  },
  {
    module_id: 11,
    type: 'multiple_choice',
    grading: 'auto',
    question: 'Which statement about tagging benefits is true according to the content?',
    options: [
      'Replace CX agents entirely.',
      'Organize chaos and help search, filter, and analyze trends.',
      'Make data harder to search.',
      'Automatically fix product issues.',
    ],
    correctOptionIndex: 1,
  },
  {
    module_id: 11,
    type: 'multiple_choice',
    grading: 'auto',
    question: 'What is a Sub-Contact Reason, as defined in the Zendesk Routing section?',
    options: [
      'The main category describing why the customer reached out (e.g., Delivery, Billing).',
      'The urgency level of the ticket from customer impact perspective.',
      'A more specific description of the issue within a Contact Reason (e.g., Undelivered, Incorrect Order).',
      'The queue to route the case to for resolution.',
    ],
    correctOptionIndex: 2,
  },
  {
    module_id: 11,
    type: 'multiple_choice',
    grading: 'auto',
    question:
      'Subject: Urgent: Unauthorized Charge After Account Was Paused. Customer says they paused account yesterday to avoid being charged and asks immediate refund and cancellation. What is the best tag?',
    options: [
      'Order Management - Change Order (FW)',
      'Order Management - Cancel Order (ACO)',
      'Order Management - Cancel Order (FW)',
      'Account Management - Pause Account',
    ],
    correctOptionIndex: 2,
  },
  {
    module_id: 11,
    type: 'multiple_choice',
    grading: 'auto',
    question: 'I did not like the Unity Pass, so please cancel it ASAP.',
    options: [
      'Billing - Other',
      'Account Management - Other',
      'Billing - Payment Method',
      'Billing - Promo Inquiry',
    ],
    correctOptionIndex: 1,
  },
  {
    module_id: 11,
    type: 'multiple_choice',
    grading: 'auto',
    question:
      'Customer asks if their order had a 50% discount applied correctly because they were charged more than expected. What is the best tag?',
    options: [
      'Billing - Incorrect Charge',
      'Billing - Taxes & Fees',
      'Billing - Missing Refund Credit',
      'Billing - Promo Didnt Apply',
    ],
    correctOptionIndex: 3,
  },
  {
    module_id: 11,
    type: 'multiple_choice',
    grading: 'auto',
    question:
      'Subject: CANCEL MY ACCOUNT NOW! Customer asks all orders canceled, full refund for every order, and mentions finding a piece of glass in a meal. What is the best tag?',
    options: [
      'Order Management - Cancel Order (ACO)',
      'Account Management - Cancel Subscription',
      'Meal Experience - Foreign Object',
      'Meal Experience - Quality Issues',
    ],
    correctOptionIndex: 2,
  },
  {
    module_id: 11,
    type: 'multiple_choice',
    grading: 'auto',
    question:
      'Subject: Inquiry About Bulk Meal Purchase. Customer wants pricing and availability for a bulk order of 1000 meals for a company. What is the best tag?',
    options: [
      'Product & Service - Subscription',
      'Product & Service - B2B',
      'Product & Service - Marketing',
      'Product & Service - Suppliers & Vendor',
    ],
    correctOptionIndex: 1,
  },
  {
    module_id: 11,
    type: 'multiple_choice',
    grading: 'auto',
    question:
      'Marketing spam email promises a 120% increase in website traffic in 60 days. What is the best tag?',
    options: [
      'User Experience - Performance',
      'Other - Spam',
      'User Experience - Sign Up Issues',
      'Meal Experience - Menu Feedback',
    ],
    correctOptionIndex: 1,
  },
  {
    module_id: 11,
    type: 'multiple_choice',
    grading: 'auto',
    question:
      'Customer asks all orders canceled, account deleted, says they do not like food/service, does not want discounts, and states last meal made them sick requiring hospital visit. What is the best tag?',
    options: [
      'Account Management - Cancel Subscription',
      'Order Management - Cancel Order - ACO',
      'Meal Experience - Food Poisoning',
      'Order Experience - Warm Meals',
    ],
    correctOptionIndex: 2,
  },
];

async function upsertExercise(exercise) {
  const { data: existingRows, error: existingError } = await supabase
    .from('exercises')
    .select('id,question')
    .eq('module_id', exercise.module_id)
    .eq('type', exercise.type);

  if (existingError) {
    throw existingError;
  }

  const normalizedTarget = normalizeQuestion(exercise.question);
  const existing = (existingRows || []).find(
    (row) => normalizeQuestion(row.question) === normalizedTarget
  );

  const payload = {
    module_id: exercise.module_id,
    question: exercise.question,
    type: exercise.type,
    grading: exercise.grading,
    data: exercise.type === 'multiple_choice' ? { options: exercise.options } : null,
    correct_answer:
      exercise.type === 'multiple_choice'
        ? { correctOptionIndex: exercise.correctOptionIndex }
        : null,
  };

  if (existing?.id) {
    const { error: updateError } = await supabase
      .from('exercises')
      .update(payload)
      .eq('id', existing.id);

    if (updateError) {
      throw updateError;
    }

    return { action: 'updated', id: existing.id };
  }

  const { data: inserted, error: insertError } = await supabase
    .from('exercises')
    .insert(payload)
    .select('id')
    .single();

  if (insertError) {
    throw insertError;
  }

  return { action: 'inserted', id: inserted?.id };
}

async function seedWeek2Exercises() {
  try {
    console.log('🌱 Seeding Week 2 exercises (Module 10 + 11)...\n');

    // Cleanup legacy one-line WABI questions from previous seed format.
    const { error: cleanupError } = await supabase
      .from('exercises')
      .delete()
      .eq('module_id', 10)
      .eq('type', 'short_answer')
      .like('question', '%| Escalation Reason:%');

    if (cleanupError) {
      throw cleanupError;
    }

    let successCount = 0;

    for (const exercise of week2Exercises) {
      const result = await upsertExercise(exercise);
      successCount += 1;
      console.log(`✅ Exercise ${result.action}: ID ${result.id} | Module ${exercise.module_id}`);
    }

    console.log(`\n🎉 Week 2 exercises ready: ${successCount}/${week2Exercises.length}`);
  } catch (error) {
    console.error('❌ Error seeding Week 2 exercises:', error);
    process.exit(1);
  }
}

seedWeek2Exercises();
