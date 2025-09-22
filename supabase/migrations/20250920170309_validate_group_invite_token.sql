DROP FUNCTION IF EXISTS validate_invite(text);

CREATE OR REPLACE FUNCTION validate_invite(token text)
RETURNS TABLE (
  id uuid,
  group_id uuid,
  invited_by uuid,
  invitee_id uuid,
  email text,
  status text,
  expires_at timestamptz,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    gi.id,
    gi.group_id,
    gi.invited_by,
    gi.invitee_id,
    gi.email,
    gi.status,
    gi.expires_at,
    gi.created_at
  FROM group_invites gi
  WHERE gi.token = token
    AND gi.status = 'pending'
    AND gi.expires_at > now()
    AND (
      (gi.invitee_id IS NOT NULL AND gi.email IS NULL)
      OR (gi.invitee_id IS NULL AND gi.email IS NOT NULL)
    )
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invite';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
