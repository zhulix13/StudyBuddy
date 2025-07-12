CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.study_groups(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES auth.users(id),
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  read boolean DEFAULT false
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sender or recipient or group member can read"
  ON public.messages
  FOR SELECT
  USING (
    sender_id = (select auth.uid())
    OR receiver_id = (select auth.uid())
    OR (group_id IS NOT NULL AND is_group_member(group_id))
  );

CREATE POLICY "Sender can insert"
  ON public.messages
  FOR INSERT
  WITH CHECK (sender_id = (select auth.uid()));

CREATE POLICY "Sender can delete their messages"
  ON public.messages
  FOR DELETE
  USING (sender_id = (select auth.uid()));

CREATE POLICY "Sender can update their messages"
  ON public.messages
  FOR UPDATE
  USING (sender_id = (select auth.uid()));

