-- Initial schema for CX Leads Onboarding
drop table if exists invitations;
drop table if exists responses;
drop table if exists module_completions;
drop table if exists exercises;
drop table if exists modules;
drop table if exists users;

-- users table with all supported roles and profile fields
create table if not exists users (
  id uuid primary key default auth.uid(),
  email text unique not null,
  role text check (role in (
    'supervisor','trainee','lead','manager','assistant_manager'
  )) not null,
  name text,
  bio text,
  slack text,
  end_training_date timestamp with time zone,
  active boolean default true not null,
  created_at timestamp with time zone default now()
);

-- table to track invitations sent to new users
create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text check (role in (
    'supervisor','trainee','manager','assistant_manager'
  )) not null,
  token text unique not null,
  sent_at timestamp with time zone,
  accepted boolean default false,
  user_id uuid references users(id)
);

-- modules table for the onboarding curriculum
create table if not exists modules (
  id serial primary key,
  title text not null,
  week integer not null,
  sort_order integer not null,
  icon text,
  objective text,
  content text,
  description text,
  criteria_list jsonb
);

-- exercises associated with modules
create table if not exists exercises (
  id serial primary key,
  module_id integer references modules(id) on delete cascade,
  question text not null,
  type text check (type in ('yes_no','single_choice','multiple_choice','short_answer','simulation')) default 'short_answer',
  data jsonb,
  correct_answer jsonb,
  grading text check (grading in ('auto','manual')) default 'manual'
);

-- responses/results from trainees
create table if not exists responses (
  id serial primary key,
  user_id uuid references users(id) on delete cascade,
  exercise_id integer references exercises(id) on delete cascade,
  answer text,
  score numeric,
  correct boolean,
  graded_by uuid references users(id),
  graded_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- record of module completion / approval
create table if not exists module_completions (
  id serial primary key,
  user_id uuid references users(id) on delete cascade,
  module_id integer references modules(id) on delete cascade,
  criteria_met boolean default false,
  marked_complete boolean default false,
  marked_by uuid references users(id),
  marked_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

