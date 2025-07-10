-- Step 1: Create security definer functions to break the recursion

-- Function to check if a user is a member of a study group
CREATE OR REPLACE FUNCTION public.is_member_of_group(group_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.group_members 
    WHERE group_id = group_uuid 
    AND user_id = auth.uid()
  );
$$;

-- Function to check if a study group is public
CREATE OR REPLACE FUNCTION public.is_public_group(group_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (is_private = false)
  FROM public.study_groups
  WHERE id = group_uuid;
$$;

-- Step 2: Clean up duplicate and problematic policies on study_groups
DROP POLICY IF EXISTS "Allow access to public groups" ON public.study_groups;
DROP POLICY IF EXISTS "Allow creators to access their own groups" ON public.study_groups;
DROP POLICY IF EXISTS "study_groups_select_public" ON public.study_groups;
DROP POLICY IF EXISTS "study_groups_select_private_members" ON public.study_groups;
DROP POLICY IF EXISTS "study_groups_select_creators" ON public.study_groups;
DROP POLICY IF EXISTS "View public or own groups" ON public.study_groups;

-- Step 3: Create new, simplified policies for study_groups using security definer functions
CREATE POLICY "View public groups" 
ON public.study_groups
FOR SELECT
TO public
USING (is_private = false);

CREATE POLICY "View own groups" 
ON public.study_groups
FOR SELECT
TO public
USING (created_by = auth.uid());

CREATE POLICY "View groups as member" 
ON public.study_groups
FOR SELECT
TO public
USING (is_member_of_group(id));

-- Step 4: Clean up duplicate and problematic policies on group_members
DROP POLICY IF EXISTS "Members can view their group members" ON public.group_members;
DROP POLICY IF EXISTS "Prevent unauthorized deletes" ON public.group_members;
DROP POLICY IF EXISTS "Leave own group" ON public.group_members;
DROP POLICY IF EXISTS "group_members_select_own" ON public.group_members;
DROP POLICY IF EXISTS "group_members_select_same_group" ON public.group_members;
DROP POLICY IF EXISTS "Members can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Allow users to leave groups they are in" ON public.group_members;
DROP POLICY IF EXISTS "Can view members of your groups" ON public.group_members;

-- Step 5: Create new, simplified policies for group_members using security definer functions
CREATE POLICY "View own membership" 
ON public.group_members
FOR SELECT
TO public
USING (user_id = auth.uid());

CREATE POLICY "View members of public groups" 
ON public.group_members
FOR SELECT
TO public
USING (is_public_group(group_id));

CREATE POLICY "View members of groups I'm in" 
ON public.group_members
FOR SELECT
TO public
USING (is_member_of_group(group_id));

-- Keep the existing INSERT policies for group_members but modify them to use the function
DROP POLICY IF EXISTS "group_members_insert" ON public.group_members;
DROP POLICY IF EXISTS "Join public groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can join public groups" ON public.group_members;

CREATE POLICY "Join public groups" 
ON public.group_members
FOR INSERT
TO public
WITH CHECK ((user_id = auth.uid()) AND is_public_group(group_id));

-- Keep the existing DELETE policy for leaving groups
CREATE POLICY "Leave own group" 
ON public.group_members
FOR DELETE
TO public
USING (user_id = auth.uid());
