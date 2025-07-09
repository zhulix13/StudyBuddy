-- Enable RLS
alter table group_members enable row level security;

-- Allow members to view members in their group
create policy "Members can view their group members"
on group_members
for select
using (
  exists (
    select 1 from group_members as gm
    where gm.group_id = group_members.group_id
    and gm.user_id = auth.uid()
  )
);

-- Allow users to join public groups
create policy "Users can join public groups"
on group_members
for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1 from study_groups
    where study_groups.id = group_members.group_id
    and is_private = false
  )
);


-- 3. Allow users to leave groups they are in
create policy "Allow users to leave groups they are in"
on group_members
for delete
using (
  user_id = auth.uid()
);

-- (Optional) Disable delete for now
create policy "Prevent unauthorized deletes"
on group_members
for delete
using (false);
