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

function cleanMarkdownNoise(text) {
  if (typeof text !== 'string' || text.length === 0) {
    return text;
  }

  return text
    .replace(/^\s{0,3}#{1,6}\s*/gm, '')
    .replace(/\*{2,4}([^*]+?)\*{2,4}/g, '$1')
    .replace(/\*{2,4}/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}

const modulesData = [
  {
    id: 1,
    title: 'Welcome & Role Transition: Lesson 1 - Role Overview — Specialist vs. Lead',
    week: 1,
    sort_order: 1,
    icon: '🎯',
    objective: 'Understand the fundamental shift from CX Specialist to CX Lead and adopt the leadership mindset required to protect the operation while elevating team performance.',
    criteria_list: [
      'Clearly articulate the difference between "my ticket" and "our operation."',
      'Demonstrate calm prioritization under pressure.',
      'Identify patterns vs. one-off issues.',
      'Communicate decisions clearly and directionally.',
      'Balance customer care with operational stability.',
      'Understand when to act, escalate, or coach.'
    ],
    content: `Welcome & Role Transition: Lesson 1 - Role Overview — Specialist vs. Lead
Theme: Lead's CORE | Duration: 50–55 minutes

 🎯 Objective
Understand the fundamental shift from CX Specialist to CX Lead and adopt the leadership mindset required to protect the operation while elevating team performance.

 📌 Core Concepts
- The difference in scope: "My ticket" vs. "Our operation."
- The mindset shift from execution to ownership
- Operational awareness: SLA, FRT, backlog, and risk signals
- Proactive calibration vs. reactive problem-solving
- Directional communication under pressure
- Balancing customer care with operational protection

 🔎 Framework Deep Dive

 1️⃣ The Core Difference
A CX Specialist succeeds by solving individual customer problems well.
A CX Lead succeeds by ensuring the entire team solves problems well, consistently, and on time.
- Specialist owns the ticket.
- Lead owns the floor.

 3️⃣ The Mindset Shift
**Shift 1: Doing → Owning** | From solving tasks to owning outcomes across the team.
**Shift 2: Reacting → Proactive** | From answering problems to identifying patterns and preventing risk.
**Shift 3: Helpful → Directional** | Leads provide clarity, not options.`
  },
  {
    id: 2,
    title: 'Leadership Foundations: Expectations, Skills & KPIs',
    week: 1,
    sort_order: 2,
    icon: '🏆',
    objective: 'Understand what great leadership looks like at CookUnity by defining the core qualities of a Lead, connecting them to daily behaviors and internal policies, and learning how performance is measured through qualitative and quantitative KPIs.',
    criteria_list: [
      'Define what leadership means at CookUnity',
      'Identify core leadership qualities and behavioral expectations',
      'Explain qualitative vs. quantitative KPIs, including weights and impact',
      'Apply leadership judgment to realistic scenarios',
      'Balance culture and results in decision-making',
      'Use policies as tools for confident, fair, and effective leadership'
    ],
    content: `Leadership Foundations: Expectations, Skills & KPIs

 🎯 Objective
Understand what great leadership looks like at CookUnity by defining the core qualities of a Lead, connecting them to daily behaviors and internal policies, and learning how performance is measured through qualitative and quantitative KPIs.

 📌 Core Concepts
- Leadership = Culture (how you lead) + Results (what you deliver)
- Great Leads model accountability, empathy, and clarity under pressure
- Policies are tools that enable confident and fair decision-making
- Leadership behaviors directly impact KPI performance
- Strong judgment balances morale, coaching impact, and operational excellence

 2️⃣ Core Leadership Qualities
A great Lead demonstrates the following consistently:
1. **Accountability** - Owns outcomes, follows through on commitments, and promotes responsibility across the team.
2. **Empathy** - Understands team challenges and leads with compassion, especially during high-pressure moments.
3. **Communication** - Sets clear expectations, delivers constructive feedback, and keeps priorities aligned.
4. **Adaptability** - Adjusts strategies when needed and supports the team through change.
5. **Decision-Making** - Makes informed, timely decisions that balance data, fairness, and business context.
6. **Coaching Mentality** - Invests in team growth, promotes ownership, and drives continuous improvement.`
  },
  {
    id: 3,
    title: 'Lead Task Overview',
    week: 1,
    sort_order: 3,
    icon: '📋',
    objective: 'Understand, execute, and prioritize the 9 core Lead responsibilities by applying structured decision-making, escalation judgment, and KPI awareness to protect customer experience and operational stability.',
    criteria_list: [
      'Identify and execute all 9 core responsibilities',
      'Apply clear escalation judgment (act vs escalate vs open JIRA)',
      'Prioritize competing tasks using structured criteria',
      'Distinguish daily vs weekly operational rhythms',
      'Demonstrate RCA thinking in coaching and DSAT analysis',
      'Communicate clearly in Slack and document properly in JIRA',
      'Balance speed, accuracy, and customer risk in decision-making'
    ],
    content: `Lead Task Overview

 🎯 Objective
Understand, execute, and prioritize the 9 core Lead responsibilities by applying structured decision-making, escalation judgment, and KPI awareness to protect customer experience and operational stability.

 📌 Core Concepts
- Leads own execution at the operational level — not just oversight
- Customer risk + SLA impact drive prioritization
- Patterns matter more than isolated incidents
- Slack communicates — JIRA tracks
- Every responsibility has a cadence: daily, weekly, or ad-hoc
- No escalation without evidence; no action without follow-up

 The 9 Core Responsibilities
1️⃣ **Wabi-Sabis Handling** - Guide Specialists through validation, coach misuse patterns, and open JIRA for systemic issues
2️⃣ **War Room Sessions** - Data-driven coaching for low KPI performance using RCA tools
3️⃣ **Slack Monitoring** - Maintain real-time visibility, unblock within minutes, announce SLA risks
4️⃣ **On-Holds Reviews** - Review daily, update customers, escalate aging cases (>72h)
5️⃣ **Follow-Up Reassignment** - Reassign within SLA with complete handoff notes
6️⃣ **DSAT Analysis** - Complete weekly quota (15), identify root cause + preventability
7️⃣ **Triage Team Tagging Audit** - Audit tagging accuracy, coach hygiene, raise tagging bugs
8️⃣ **Inbound Volume Insights** - Track trends, flag spikes early, notify WFM/Supervisors
9️⃣ **Queue & SLA Monitoring** - Continuously monitor channels, redistribute Specialists, announce risks`
  },
  {
    id: 4,
    title: 'Policy Overview: What Leads Need to Know',
    week: 1,
    sort_order: 4,
    icon: '📖',
    objective: 'Learn the essential policy areas CX Leads must apply to guide agents consistently, make fair decisions, and know when to escalate versus resolve.',
    criteria_list: [
      'Identify the key policy categories Leads must know',
      'Apply policies to guide agents with clarity and consistency',
      'Explain when to resolve vs. escalate based on policy rules',
      'Use correct validation paths before approving credits/refunds',
      'Demonstrate policy judgment through quiz performance'
    ],
    content: `Policy Overview: What Leads Need to Know

 🎯 Objective
Learn the essential policy areas CX Leads must apply to guide agents consistently, make fair decisions, and know when to escalate versus resolve.

 📌 Core Concepts
- Leads don't memorize every policy — they apply policies correctly in real time
- Policies protect consistency, fairness, and customer experience
- Strong leadership = clear guidance + correct escalation judgment
- Most policy decisions live in: eligibility, health disclaimers, allergens/food safety, billing, credits/refunds, cancellations, UnityPass, substitutions, gift cards/vouchers, shipping issues

 Key Policy Areas
- **Eligibility & Account Responsibility** - Who can use the service (18+, contiguous US serviced areas)
- **Medical Disclaimer & Health/Weight Claims** - CookUnity is not medical advice
- **Allergens & Food Safety** - Cross-contamination risk exists; customers responsible for review
- **Billing, Payments & Subscriptions** - Express vs. Weekly Plans, service fees, non-refundable processed charges
- **Credits & Refunds** - Issues must generally be reported within 2 days of delivery
- **Cancel/Modify Plan & Cutoffs** - Changes before cutoff (typically noon, 4–6 days before delivery)
- **UnityPass** - Auto-renewing membership with specific refund limits
- **Food Substitution** - Substitutions may occur; ingredients/allergens may differ
- **Gift Cards, Vouchers & Referrals** - Account required; gift cards generally non-refundable
- **Shipping Issues** - Third-party carriers; correct address/instructions required`
  },
  {
    id: 5,
    title: 'Tagging Mastery: Why It Matters & How It Works',
    week: 1,
    sort_order: 5,
    icon: '🏷️',
    objective: 'Understand the purpose, structure, and impact of CX tagging, including Contact Reasons, Sub-Contact Reasons, and Zendesk Routing — and apply correct tagging to ensure clean data, operational efficiency, and insight-driven decision-making.',
    criteria_list: [
      'Define tagging and its strategic impact',
      'Correctly differentiate Contact vs. Sub-Contact Reasons',
      'Apply accurate tagging to real ticket scenarios',
      'Understand Zendesk routing structure',
      'Maintain tagging hygiene and consistency',
      'Recognize how tagging drives reporting, insights, and operational decisions'
    ],
    content: `Tagging Mastery: Why It Matters & How It Works

 🎯 Objective
Understand the purpose, structure, and impact of CX tagging, including Contact Reasons, Sub-Contact Reasons, and Zendesk Routing — and apply correct tagging to ensure clean data, operational efficiency, and insight-driven decision-making.

 📌 Core Concepts
- Tags organize and structure customer conversations
- Clean tagging drives accurate reporting and cross-functional decisions
- Contact Reasons define why the customer reached out
- Sub-Contact Reasons define what specifically happened
- Leads ensure tagging consistency and hygiene
- Tagging directly impacts routing, prioritization, and escalation

 1️⃣ Tagging: Why? What? Who?
**Why Tagging Matters**
- Organize chaos: Enables search, filtering, and trend analysis
- Track behaviors and issues: Highlights recurring pain points
- Drive decision-making: Supports Product, Ops, Marketing, and CX strategy
- Speed up support: Provides instant context and improves prioritization

**What Is a Tag?**
A tag is a label or keyword added to a ticket to describe its content, context, or category.`
  },
  {
    id: 6,
    title: 'Queue Management Fundamentals for New CX Leads',
    week: 1,
    sort_order: 6,
    icon: '☎️',
    objective: 'Develop the foundational skills to monitor, prioritize, and distribute queue workload effectively — ensuring SLA compliance, balanced agent coverage, and proactive operational decisions.',
    criteria_list: [
      'Explain the purpose of queue management',
      'Apply SLA-based prioritization',
      'Identify and respond to volume spikes',
      'Redistribute agents strategically',
      'Communicate operational decisions clearly',
      'Demonstrate proactive monitoring habits'
    ],
    content: `Queue Management Fundamentals for New CX Leads

 🎯 Objective
Develop the foundational skills to monitor, prioritize, and distribute queue workload effectively — ensuring SLA compliance, balanced agent coverage, and proactive operational decisions.

 📌 Core Concepts
- Queue Management = monitoring and directing support traffic efficiently
- SLA awareness drives prioritization decisions
- Friction level determines urgency
- Volume spikes require fast redistribution of resources
- Proactive monitoring prevents SLA breaches
- Clear communication ensures team alignment

 2️⃣ SLA & Priority Management
**SLA Awareness**
- 📩 Email: 8 hours
- 💬 Chat: 2 minutes
- 💬 SMS: 5 minutes

**How to Prioritize**
- 🔴 High Friction: Urgent, emotional, repeat complaints → First priority
- 🟠 Time-Sensitive: Refund windows, prep-day issues → Second priority
- 🟢 Low Friction: General inquiries, non-urgent feedback → Lower priority`
  },
  {
    id: 7,
    title: 'Wabi-Sabi & Coaching Fundamentals for CX Leads',
    week: 1,
    sort_order: 7,
    icon: '🎓',
    objective: 'Understand how to properly evaluate, respond to, and coach through Wabi-Sabis by identifying root causes, applying policy standards, and delivering high-quality, developmental feedback.',
    criteria_list: [
      'Define what a Wabi-Sabi is and why it exists',
      'Select correct Escalation Reasons based on root cause',
      'Evaluate compensation requests using policy standards',
      'Deliver structured, developmental coaching responses',
      'Apply the Behavior → Impact → Expectation → Action formula',
      'Distinguish between approval authority and coaching responsibility'
    ],
    content: `Wabi-Sabi & Coaching Fundamentals for CX Leads

 🎯 Objective
Understand how to properly evaluate, respond to, and coach through Wabi-Sabis by identifying root causes, applying policy standards, and delivering high-quality, developmental feedback.

 📌 Core Concepts
- A Wabi-Sabi is an internal escalation to Leadership
- Wabis must include full context and justification
- Escalation Reason = root cause (not symptom)
- Leads are responsible for coaching, not just approving
- Strong feedback follows a structured improvement formula
- Coaching drives operational accuracy and agent growth

 1️⃣ What Is a Wabi-Sabi?
A Wabi-Sabi is an internal escalation created when an agent needs Leadership support to:
- Ask a question
- Raise a concern
- Alert Leadership
- Request compensation (credit/refund)`
  },
  {
    id: 8,
    title: 'Escalation Workflow',
    week: 1,
    sort_order: 8,
    icon: '⬆️',
    objective: 'Master CookUnity\'s escalation workflow by escalating with a clear proposal (not just a problem), applying the correct triggers, using the 7-part escalation template, and following the required 4-step flow for consistent, high-quality leadership decisions.',
    criteria_list: [
      'Explain escalation as a proposal-driven leadership skill',
      'Identify correct escalation triggers vs non-escalation situations',
      'Apply the full 7-part escalation template consistently',
      'Use complaint history + sentiment to assess churn risk and urgency',
      'Follow the 4-step flow without skipping Supervisor alignment',
      'Distinguish weak vs strong escalations and improve them with missing elements'
    ],
    content: `Escalation Workflow (BAU 4.4 – CX Restructure)

 🎯 Objective
Master CookUnity's escalation workflow by escalating with a clear proposal (not just a problem), applying the correct triggers, using the 7-part escalation template, and following the required 4-step flow for consistent, high-quality leadership decisions.

 📌 Core Concepts
- Escalation = recommendation + analysis, not "what should I do?"
- Escalate only when triggers are met (financial, legal/safety, policy exception, cross-functional impact, repeated complaints, churn risk)
- Every escalation must be self-contained: customer context, policy analysis, proof, and next step
- Supervisor alignment is mandatory before posting in #cx_sups_leads
- Complaint history + sentiment determines urgency and churn risk
- Strong escalations build precedent, reduce leadership bottlenecks, and improve consistency

 1️⃣ Core Principle: Proposals, Not Problems
Escalation is not asking management what to do. Escalation is presenting a recommendation and asking leadership to validate or challenge it.`
  },
  {
    id: 9,
    title: 'JIRA Handling in CX: Lead Escalation & Quality Standards',
    week: 1,
    sort_order: 9,
    icon: '🔧',
    objective: 'Learn how to evaluate, approve/reject, and create high-quality JIRAs that keep the Zendesk ↔ Slack ↔ JIRA pipeline clean, actionable, and traceable — while ensuring consistent ownership and follow-through.',
    criteria_list: [
      'Define what a JIRA is and why it exists in CX',
      'Apply the create vs. do-not-create criteria consistently',
      'Differentiate UX issues vs. tech issues correctly',
      'Execute the full Lead escalation flow (TAKEN → evaluate → approve/reject → follow-up)',
      'Write a complete JIRA using the standard template',
      'Assign priority appropriately and defend decisions in scenarios'
    ],
    content: `JIRA Handling in CX: Lead Escalation & Quality Standards

 🎯 Objective
Learn how to evaluate, approve/reject, and create high-quality JIRAs that keep the Zendesk ↔ Slack ↔ JIRA pipeline clean, actionable, and traceable — while ensuring consistent ownership and follow-through.

 📌 Core Concepts
- JIRA = formal escalation of a product/technical issue to Product Support / Engineering
- Leads are the bridge between Specialist detection and Product action
- Only escalate real, validated platform issues (avoid "noise")
- UX feedback ≠ tech bug (different path)
- Strong JIRAs require complete context, evidence, and clear impact
- Ownership includes follow-up, updates, and reporting (no JIRA left behind)

 1️⃣ What Is a JIRA & Why It Matters
A JIRA is the official way we escalate a product/platform issue so it can be investigated and resolved by Product Support / Engineering.
Incomplete or invalid JIRAs create noise, slow down real investigations, and increase customer impact — the goal is a clean, efficient pipeline.`
  },
  {
    id: 10,
    title: 'Wabi - Sabi Test',
    week: 2,
    sort_order: 10,
    icon: '🧪',
    objective: 'Evaluate WABI-SABI decision quality by applying policy and operational judgment to realistic escalation scenarios.',
    criteria_list: [
      'Submit responses for all 5 WABI-SABI scenarios',
      'Justify each decision with policy and context',
      'Demonstrate clear communication to the agent'
    ],
    content: `The WABI Playbook: Your Turn

This module is an assessment with 5 free-text scenarios.
For each case, decide whether to approve, deny, or correct the WABI-SABI request.
Then explain your thought process and write how you would respond to the agent.

Scenarios include:
- Warm Meals
- CAC (first-time customer cancellation)
- Food Poisoning
- CAC FW
- Customer does not want the order`
  },
  {
    id: 11,
    title: 'Tagging Test',
    week: 2,
    sort_order: 11,
    icon: '✅',
    objective: 'Assess tagging accuracy across contact reason and sub-contact reason scenarios using multiple-choice questions.',
    criteria_list: [
      'Complete all multiple-choice questions',
      'Apply correct tagging logic from routing content',
      'Demonstrate consistency across mixed customer scenarios'
    ],
    content: `This module is an assessment focused on CX tagging.

It includes multiple-choice questions across two sections:
- Core tagging concepts
- Applied tagging scenarios from realistic customer messages

Choose one option per question and submit each answer.`
  }
];

async function seedModules() {
  try {
    console.log('🌱 Starting module seeding with content and criteria_list...\n');
    let successCount = 0;
    let failCount = 0;

    for (const moduleData of modulesData) {
      const moduleForDb = {
        id: moduleData.id,
        title: cleanMarkdownNoise(moduleData.title),
        week: moduleData.week,
        sort_order: moduleData.sort_order,
        icon: moduleData.icon,
        objective: cleanMarkdownNoise(moduleData.objective),
        description: cleanMarkdownNoise(moduleData.objective),
        content: cleanMarkdownNoise(moduleData.content),
        criteria_list: moduleData.criteria_list
      };

      // Upsert module with content and criteria_list.
      // First try with criteria_list, if it fails due to column missing, try without it.
      let { data: module, error: moduleError } = await supabase
        .from('modules')
        .upsert(moduleForDb, { onConflict: 'id' })
        .select()
        .single();

      // If criteria_list column doesn't exist yet, try without it
      if (moduleError && moduleError.message.includes('criteria_list')) {
        console.log(`⚠️  criteria_list column not found for "${moduleData.title}", updating without it...`);
        
        const moduleWithoutCriteria = {
          ...moduleForDb,
        };
        delete moduleWithoutCriteria.criteria_list;

        ({ data: module, error: moduleError } = await supabase
          .from('modules')
          .upsert(moduleWithoutCriteria, { onConflict: 'id' })
          .select()
          .single());
      }

      if (moduleError) {
        console.error(`❌ Error updating module "${moduleData.title}":`, moduleError.message);
        failCount++;
        continue;
      }

      if (!module || !module.id) {
        console.error(`❌ No module data returned for "${moduleData.title}"`);
        failCount++;
        continue;
      }

      console.log(`✅ Module updated: "${moduleData.title}" (ID: ${module.id})`);
      successCount++;
    }

    console.log(`\n🎉 Update complete! ${successCount}/${modulesData.length} modules updated with content and criteria_list.`);
    if (failCount > 0) {
      console.log(`⚠️  ${failCount} modules failed.`);
    }
  } catch (error) {
    console.error('Fatal error during seeding:', error);
    process.exit(1);
  }
}

seedModules();
