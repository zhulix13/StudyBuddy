alter table group_members enable row level security;

create policy "Members can view group members"
on group_members
for select
using (
  exists (
    select 1 from study_groups
    where study_groups.id = group_members.group_id
    and (
      is_private = false
      or exists (
        select 1 from group_members as gm
        where gm.group_id = study_groups.id
        and gm.user_id = auth.uid()
      )
    )
  )
);

-- Drop the old policy if it exists
drop policy if exists "Users can join public groups" on group_members;

-- Recreate the corrected policy
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

