-- Enable RLS on study_groups
alter table study_groups enable row level security;

-- Policy: Allow access to public groups for all logged-in users
create policy "Allow access to public groups"
on study_groups
for select
using (
  is_private = false
);

-- Policy: Allow members to view private groups they belong to
create policy "Allow members to view private groups"
on study_groups
for select
using (
  is_private = true
  and exists (
    select 1 from group_members
    where group_members.group_id = study_groups.id
    and group_members.user_id = auth.uid()
  )
);
