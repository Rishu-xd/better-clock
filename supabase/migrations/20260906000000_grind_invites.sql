-- Run this migration before deploying the invite flow.
alter table public.grind_groups
  add column if not exists invite_code text;

update public.grind_groups
set invite_code = substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)
where invite_code is null;

alter table public.grind_groups
  alter column invite_code set not null;

create unique index if not exists grind_groups_invite_code_key
  on public.grind_groups (invite_code);

create unique index if not exists grind_group_members_group_user_key
  on public.grind_group_members (group_id, user_id);

-- The client needs these RLS capabilities for the flow above. Adapt the
-- visibility predicates if rooms should be private beyond invite possession.
do $$
begin
  create policy "Authenticated users can read grind groups"
    on public.grind_groups for select to authenticated using (true);
  create policy "Creators can create grind groups"
    on public.grind_groups for insert to authenticated with check (created_by = auth.uid());
  create policy "Authenticated users can read grind members"
    on public.grind_group_members for select to authenticated using (true);
  create policy "Users can join a grind as themselves"
    on public.grind_group_members for insert to authenticated with check (user_id = auth.uid());
  create policy "Users can leave their own grind memberships"
    on public.grind_group_members for delete to authenticated using (user_id = auth.uid());
  create policy "Creators can delete empty grind groups"
    on public.grind_groups for delete to authenticated using (created_by = auth.uid());
exception
  when duplicate_object then null;
end $$;

-- Enable Realtime for natural member-list updates in the room UI.
do $$
begin
  alter publication supabase_realtime add table public.grind_group_members;
exception
  when duplicate_object then null;
end $$;
