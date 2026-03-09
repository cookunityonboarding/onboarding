-- Persist per-criterion completion progress for each trainee/module pair.
alter table module_completions
add column if not exists criteria_checked jsonb not null default '[]'::jsonb;

-- Ensure we only keep one progress row per trainee per module.
create unique index if not exists idx_module_completions_user_module_unique
on module_completions (user_id, module_id);
