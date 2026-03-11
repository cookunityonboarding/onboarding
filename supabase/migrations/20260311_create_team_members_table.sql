create table if not exists team_members (
  id serial primary key,
  full_name text not null unique,
  display_title text not null,
  level text check (level in ('director', 'manager', 'assistant_manager', 'supervisor', 'lead')) not null,
  bio text,
  photo_url text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_team_members_level_sort
  on team_members (level, sort_order, full_name);

create or replace function update_team_members_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_team_members_updated_at on team_members;

create trigger trg_team_members_updated_at
before update on team_members
for each row
execute function update_team_members_updated_at();
