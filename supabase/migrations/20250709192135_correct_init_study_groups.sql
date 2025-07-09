-- Create table for study groups
create table if not exists study_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text,
  description text,
  created_by uuid references auth.users not null,
  is_private boolean default false,
  created_at timestamp with time zone default now()
);

-- Create table for group members
create table if not exists group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references study_groups(id) on delete cascade,
  user_id uuid references auth.users on delete cascade,
  role text default 'member' check (role in ('member', 'admin')),
  joined_at timestamp with time zone default now(),
  unique (group_id, user_id)
);
