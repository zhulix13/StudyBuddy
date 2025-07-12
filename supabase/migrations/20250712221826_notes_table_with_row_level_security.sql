CREATE TABLE IF NOT EXISTS public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  is_private boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Note owner or group member"
  ON public.notes
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR (is_private = false AND group_id IS NULL)
    OR (is_private = false AND is_group_member(group_id))
  );

CREATE POLICY "User can create own notes"
  ON public.notes
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "User can update own notes"
  ON public.notes
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "User can delete own notes"
  ON public.notes
  FOR DELETE
  USING (user_id = auth.uid());

