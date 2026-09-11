create or replace function public.leave_video_room(
  room_id_input uuid,
  duration_seconds_input integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining_members integer;
  recorded_duration integer := greatest(coalesce(duration_seconds_input, 0), 0);
begin
  if auth.uid() is null then
    return false;
  end if;

  delete from public.video_room_members
  where room_id = room_id_input and user_id = auth.uid();

  if not found then
    return false;
  end if;

  insert into public.sessions (
    user_id,
    name,
    duration,
    started_at,
    completed_at,
    state
  ) values (
    auth.uid(),
    'Video Grind',
    recorded_duration,
    now() - make_interval(secs => recorded_duration),
    now(),
    'completed'
  );

  select count(*)::integer into remaining_members
  from public.video_room_members
  where room_id = room_id_input;

  if remaining_members = 0 then
    delete from public.video_rooms where id = room_id_input;
  end if;

  return true;
end;
$$;

grant execute on function public.leave_video_room(uuid, integer) to authenticated;
