-- Enable RLS (safe to run again)
alter table study_groups enable row level security;

-- Clean up older policies if they exist
drop policy if exists "Allow access to public groups" on study_groups;
drop policy if exists "Allow members to view private groups" on study_groups;

-- Single, combined optimized policy
create policy "Allow access to public or joined private groups"
on study_groups
for select
using (
  is_private = false
  or (
    is_private = true
    and exists (
      select 1 from group_members
      where group_members.group_id = study_groups.id
      and group_members.user_id = auth.uid()
    )
  )
);
