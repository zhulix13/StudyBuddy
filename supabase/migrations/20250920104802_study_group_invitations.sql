create table group_invites (
    id uuid primary key default gen_random_uuid(),
    group_id uuid not null references study_groups(id) on delete cascade,
    invited_by uuid not null references auth.users(id) on delete cascade,
    email text, -- optional: for inviting users not yet registered
    token text not null unique, -- JWT or random string
    status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'expired', 'revoked')),
    expires_at timestamptz not null default (now() + interval '7 days'),
    created_at timestamptz not null default now()
);

