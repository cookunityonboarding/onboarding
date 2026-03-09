-- Extend invitations table to support full invitation workflow
alter table invitations
add column if not exists name text,
add column if not exists invited_by uuid references users(id),
add column if not exists expires_at timestamp with time zone,
add column if not exists resent_at timestamp with time zone,
add column if not exists created_at timestamp with time zone default now();

-- Create index for faster email lookups
create index if not exists idx_invitations_email on invitations (email);

-- Create index for filtering pending invitations
create index if not exists idx_invitations_accepted on invitations (accepted);
