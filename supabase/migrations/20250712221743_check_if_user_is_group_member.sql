CREATE OR REPLACE FUNCTION public.is_group_member(group_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = group_uuid
    AND user_id = auth.uid()
  );
$$;

