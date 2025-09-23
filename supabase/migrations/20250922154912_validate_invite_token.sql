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
  created_at timestamptz,
  group_name text,
  group_description text,
  group_subject text,
  group_avatar text
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
    gi.created_at,
    g.name AS group_name,
    g.description AS group_description,
    g.subject AS group_subject,
    g.avatar_url AS group_avatar
  FROM group_invites gi
  JOIN study_groups g ON g.id = gi.group_id
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

