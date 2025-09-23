DROP FUNCTION IF EXISTS accept_invite(text);

CREATE OR REPLACE FUNCTION accept_invite(p_token text)
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
DECLARE
  v_invite group_invites%ROWTYPE;
BEGIN
  -- Fetch invite
  SELECT gi.* INTO v_invite
  FROM group_invites gi
  WHERE gi.token = p_token
    AND gi.status = 'pending'
    AND gi.expires_at > now()
    AND (
      gi.invitee_id IS NULL OR gi.invitee_id = auth.uid()
    )
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invite';
  END IF;

  -- Insert member
  INSERT INTO group_members (group_id, user_id, role)
  VALUES (v_invite.group_id, auth.uid(), 'member')
  ON CONFLICT DO NOTHING;

  -- Update invite status
  UPDATE group_invites gi
  SET status = 'accepted'
  WHERE gi.id = v_invite.id;

  -- Return invite + group details
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
    g.name        AS group_name,
    g.description AS group_description,
    g.subject     AS group_subject,
    g.avatar_url  AS group_avatar
  FROM group_invites gi
  JOIN study_groups g ON g.id = gi.group_id
  WHERE gi.id = v_invite.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
