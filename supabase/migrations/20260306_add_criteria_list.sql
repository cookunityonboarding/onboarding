-- Add criteria_list column to modules table
alter table modules add column if not exists criteria_list jsonb;
