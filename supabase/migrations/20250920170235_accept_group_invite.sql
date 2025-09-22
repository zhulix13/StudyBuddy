DROP FUNCTION IF EXISTS accept_invite(text);

create or replace function accept_invite(token text)
returns group_invites as $$
declare
  invite group_invites;
begin
  select * into invite
  from group_invites
  where group_invites.token = token
    and status = 'pending'
    and expires_at > now()
    and (
      invitee_id is null or invitee_id = auth.uid()
    )
  limit 1;

  if not found then
    raise exception 'Invalid or expired invite';
  end if;

  -- Insert member
  insert into group_members (group_id, user_id, role)
  values (invite.group_id, auth.uid(), 'member')
  on conflict do nothing;

  -- Update invite status
  update group_invites
  set status = 'accepted'
  where id = invite.id;

  return invite;
end;
$$ language plpgsql security definer;

