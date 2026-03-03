-- Example Supabase migration script to create initial tables

-- users table with two roles: supervisor and trainee
create table if not exists users (
  id uuid primary key default auth.uid(),
  email text unique not null,
  role text check (role in ('supervisor','trainee')) not null,
  created_at timestamp with time zone default now()
);

-- modules table for the onboarding curriculum
create table if not exists modules (
  id serial primary key,
  title text not null,
  week integer not null,
  sort_order integer not null,
  description text
);

-- exercises associated with modules
create table if not exists exercises (
  id serial primary key,
  module_id integer references modules(id) on delete cascade,
  question text not null,
  type text check (type in ('multiple_choice','short_answer','simulation')) default 'short_answer',
  data jsonb -- optional extra fields
);

-- responses/results from trainees
create table if not exists responses (
  id serial primary key,
  user_id uuid references users(id) on delete cascade,
  exercise_id integer references exercises(id) on delete cascade,
  answer text,
  score numeric,
  created_at timestamp with time zone default now()
);
