alter table public.grind_groups
  add column if not exists session_mode text,
  add column if not exists session_duration integer,
  add column if not exists session_state text not null default 'idle',
  add column if not exists session_started_at timestamptz,
  add column if not exists session_elapsed_seconds integer not null default 0;

alter table public.grind_groups
  add constraint grind_groups_session_mode_check check (session_mode is null or session_mode in ('countdown', 'stopwatch'));

alter table public.grind_groups
  add constraint grind_groups_session_state_check check (session_state in ('idle', 'running', 'paused', 'completed'));

create policy "Hosts can control their grind clock"
  on public.grind_groups for update to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

do $$
begin
  alter publication supabase_realtime add table public.grind_groups;
exception
  when duplicate_object then null;
end $$;
