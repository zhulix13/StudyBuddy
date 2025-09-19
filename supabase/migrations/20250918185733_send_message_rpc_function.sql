create or replace function send_message(
  p_group_id uuid,
  p_content text default null,
  p_note_id uuid default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  new_msg group_messages;
  enriched_msg jsonb;
begin
  -- ✅ Insert the new message
  insert into group_messages (group_id, sender_id, content, note_id)
  values (p_group_id, auth.uid(), p_content, p_note_id)
  returning * into new_msg;

  -- ✅ Record "sent" status
  insert into message_statuses (message_id, user_id, status)
  values (new_msg.id, auth.uid(), 'sent');

  -- ✅ Build enriched message (like .select with joins)
  select jsonb_build_object(
    'id', gm.id,
    'group_id', gm.group_id,
    'sender_id', gm.sender_id,
    'content', gm.content,
    'note_id', gm.note_id,
    'created_at', gm.created_at,
    'sender', to_jsonb(p.*),
    'note', to_jsonb(n.*),
    'statuses', coalesce(jsonb_agg(ms.*) filter (where ms.id is not null), '[]'::jsonb)
  )
  into enriched_msg
  from group_messages gm
  left join profiles p on p.id = gm.sender_id
  left join notes n on n.id = gm.note_id
  left join message_statuses ms on ms.message_id = gm.id
  where gm.id = new_msg.id
  group by gm.id, p.*, n.*;

  return enriched_msg;
end;
$$;

