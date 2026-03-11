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

const teamMembers = [
  {
    full_name: 'Aviana',
    display_title: 'Director of Customer Experience',
    level: 'director',
    bio: 'Leads the overall CX strategy, priorities, and long-term customer support vision across the organization.',
    sort_order: 1,
  },
  {
    full_name: 'Cinthia Medina Velez',
    display_title: 'Sr Manager Customer Support',
    level: 'manager',
    bio: 'Owns customer support performance, process standards, and team execution quality.',
    sort_order: 1,
  },
  {
    full_name: 'Serafin Sanchez Lacoste',
    display_title: 'Sr Manager CX Training & Quality',
    level: 'manager',
    bio: 'Leads CX training and quality excellence to ensure strong coaching and consistent service outcomes.',
    sort_order: 2,
  },
  {
    full_name: 'Gabriel Eduardo Gonzalez Cristofano',
    display_title: 'Customer Experience Assistant Manager',
    level: 'assistant_manager',
    bio: 'Supports operational leadership, team development, and daily performance alignment.',
    sort_order: 1,
  },
  {
    full_name: 'Daniella Giraldo',
    display_title: 'Customer Experience Assistant Manager',
    level: 'assistant_manager',
    bio: 'Drives execution consistency and supports cross-team coordination in day-to-day operations.',
    sort_order: 2,
  },
  {
    full_name: 'Paola Pirela',
    display_title: 'Customer Experience Supervisor',
    level: 'supervisor',
    bio: 'Supervises frontline performance, coaching quality, and escalation handling.',
    sort_order: 1,
  },
  {
    full_name: 'Ketevan Streletska',
    display_title: 'Customer Experience Supervisor',
    level: 'supervisor',
    bio: 'Leads queue health and team execution while ensuring SLA adherence and service quality.',
    sort_order: 2,
  },
  {
    full_name: 'Rocio Vargas Rosales',
    display_title: 'Customer Experience Supervisor',
    level: 'supervisor',
    bio: 'Supports operational consistency through coaching, follow-up, and daily workflow control.',
    sort_order: 3,
  },
  {
    full_name: 'Ximena Farrilie A.H.',
    display_title: 'Customer Experience Supervisor',
    level: 'supervisor',
    bio: 'Guides agents on quality standards, decision-making, and customer-risk mitigation.',
    sort_order: 4,
  },
  {
    full_name: 'Luis Siso Arteaga',
    display_title: 'Customer Experience Supervisor II',
    level: 'supervisor',
    bio: 'Provides senior supervision support across escalations, quality reviews, and team alignment.',
    sort_order: 5,
  },
  {
    full_name: 'Daniela Castañeda',
    display_title: 'Customer Experience Supervisor',
    level: 'supervisor',
    bio: 'Coordinates frontline quality and coaching actions to improve customer outcomes.',
    sort_order: 6,
  },
  {
    full_name: 'Esteban Mujica Hernandez',
    display_title: 'Customer Experience Supervisor',
    level: 'supervisor',
    bio: 'Monitors queue execution and supports team decisions in high-priority situations.',
    sort_order: 7,
  },
  {
    full_name: 'Fiorella Marquez',
    display_title: 'Customer Experience Supervisor II',
    level: 'supervisor',
    bio: 'Drives supervision quality with focus on operational rhythm and service standards.',
    sort_order: 8,
  },
  {
    full_name: 'Francisco Romano',
    display_title: 'Customer Experience Supervisor',
    level: 'supervisor',
    bio: 'Supports response quality and execution consistency through structured supervision.',
    sort_order: 9,
  },
  {
    full_name: 'Gabriel Badilla',
    display_title: 'Customer Experience Supervisor',
    level: 'supervisor',
    bio: 'Supervises day-to-day support operations and reinforces customer experience standards.',
    sort_order: 10,
  },
  {
    full_name: 'Katherine Lino Bravo',
    display_title: 'Customer Experience Lead',
    level: 'lead',
    bio: 'Leads frontline execution and coaching while supporting consistent ticket quality.',
    sort_order: 1,
  },
  {
    full_name: 'Yeirmer Mendez',
    display_title: 'Customer Experience Lead',
    level: 'lead',
    bio: 'Supports team coordination and quality decisions during daily operation.',
    sort_order: 2,
  },
  {
    full_name: 'Laika Supay Deviasso',
    display_title: 'Customer Experience Lead',
    level: 'lead',
    bio: 'Guides agents through escalations and reinforces policy-aligned decision-making.',
    sort_order: 3,
  },
  {
    full_name: 'Ximena Angulo',
    display_title: 'Customer Experience Lead',
    level: 'lead',
    bio: 'Promotes operational consistency through clear direction and coaching support.',
    sort_order: 4,
  },
  {
    full_name: 'Lucila Aguilar Loyola',
    display_title: 'Customer Experience Lead',
    level: 'lead',
    bio: 'Supports SLA discipline and quality outcomes across frontline workflows.',
    sort_order: 5,
  },
  {
    full_name: 'Martin Carhuamaca',
    display_title: 'Customer Experience Lead',
    level: 'lead',
    bio: 'Helps maintain queue health and customer-risk prioritization in daily execution.',
    sort_order: 6,
  },
  {
    full_name: 'Mateo Diaz Cardona',
    display_title: 'Customer Experience Lead',
    level: 'lead',
    bio: 'Supports team performance through coaching and proactive case management.',
    sort_order: 7,
  },
  {
    full_name: 'Milena Marisel Franco Cornejo',
    display_title: 'Customer Experience Lead',
    level: 'lead',
    bio: 'Contributes to service quality by guiding escalations and feedback loops.',
    sort_order: 8,
  },
  {
    full_name: 'Girolamo Yapo',
    display_title: 'Customer Experience Lead',
    level: 'lead',
    bio: 'Drives consistent ticket handling and supports team alignment under pressure.',
    sort_order: 9,
  },
  {
    full_name: 'Jose Angel Diaz Sanchez',
    display_title: 'Customer Experience Lead',
    level: 'lead',
    bio: 'Supports customer experience standards through coaching and operational awareness.',
    sort_order: 10,
  },
];

async function seedTeamMembers() {
  try {
    console.log('🌱 Seeding team members...\n');

    const { error: probeError } = await supabase
      .from('team_members')
      .select('id')
      .limit(1);

    if (probeError && probeError.message.toLowerCase().includes('does not exist')) {
      console.error('❌ Table team_members was not found.');
      console.error('Run migration 20260311_create_team_members_table.sql in Supabase SQL Editor first.');
      process.exit(1);
    }

    if (probeError) {
      throw probeError;
    }

    const payload = teamMembers.map((member) => ({
      ...member,
      active: true,
      photo_url: null,
    }));

    const { error } = await supabase
      .from('team_members')
      .upsert(payload, { onConflict: 'full_name' });

    if (error) {
      throw error;
    }

    console.log(`✅ Team members upserted: ${payload.length}`);
  } catch (error) {
    console.error('❌ Error seeding team members:', error);
    process.exit(1);
  }
}

seedTeamMembers();
