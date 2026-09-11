create table if not exists public.video_rooms (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  max_participants integer not null default 20 check (max_participants between 2 and 20)
);

create table if not exists public.video_room_members (
  room_id uuid not null references public.video_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

alter table public.video_rooms enable row level security;
alter table public.video_room_members enable row level security;

do $$
begin
  create policy "Authenticated users can read video rooms"
    on public.video_rooms for select to authenticated using (true);
  create policy "Users can create video rooms"
    on public.video_rooms for insert to authenticated with check (host_id = auth.uid());
  create policy "Authenticated users can read video room members"
    on public.video_room_members for select to authenticated using (true);
  create policy "Users can leave video rooms"
    on public.video_room_members for delete to authenticated using (user_id = auth.uid());
exception
  when duplicate_object then null;
end $$;

create or replace function public.join_video_room(room_id_input uuid)
returns table (accepted boolean, reason text)
language plpgsql
security definer
set search_path = public
as $$
declare
  room_limit integer;
  member_count integer;
begin
  if auth.uid() is null then
    return query select false, 'You need to be logged in.'::text;
    return;
  end if;

  select max_participants into room_limit
  from public.video_rooms
  where id = room_id_input
  for update;

  if room_limit is null then
    return query select false, 'This video room no longer exists.'::text;
    return;
  end if;

  if exists (
    select 1 from public.video_room_members
    where room_id = room_id_input and user_id = auth.uid()
  ) then
    return query select true, 'Already joined.'::text;
    return;
  end if;

  select count(*)::integer into member_count
  from public.video_room_members
  where room_id = room_id_input;

  if member_count >= room_limit then
    return query select false, 'This room is full.'::text;
    return;
  end if;

  insert into public.video_room_members (room_id, user_id)
  values (room_id_input, auth.uid())
  on conflict (room_id, user_id) do nothing;

  return query select true, 'Joined.'::text;
end;
$$;

grant execute on function public.join_video_room(uuid) to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.video_room_members;
exception
  when duplicate_object then null;
end $$;
