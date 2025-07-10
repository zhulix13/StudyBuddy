-- Clean up existing policies
drop policy if exists "Allow access to public or joined private groups" on study_groups;
drop policy if exists "Members can view group members" on group_members;
drop policy if exists "Users can join public groups" on group_members;

-- Study groups policies
create policy "Allow access to public groups"
on study_groups
for select
using (is_private = false);

create policy "Allow access to joined private groups"
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

-- Group members policies - simplified to avoid recursion
create policy "Users can view their own memberships"
on group_members
for select
using (user_id = auth.uid());

create policy "Users can view members of public groups"
on group_members
for select
using (
  exists (
    select 1 from study_groups
    where study_groups.id = group_members.group_id
    and study_groups.is_private = false
  )
);

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

-- Allow group creators to add members to their groups
create policy "Group creators can manage members"
on group_members
for all
using (
  exists (
    select 1 from study_groups
    where study_groups.id = group_members.group_id
    and study_groups.created_by = auth.uid()
  )
);