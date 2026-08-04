create extension if not exists pgcrypto;

create table if not exists public.tm_meetings (
  id text primary key
);

create table if not exists public.tm_candidates (
  id text primary key
);

create table if not exists public.tm_votes (
  id uuid primary key default gen_random_uuid()
);

create table if not exists public.tm_winner_history (
  id uuid primary key default gen_random_uuid()
);

create table if not exists public.tm_club_settings (
  id uuid primary key default gen_random_uuid()
);

create table if not exists public.tm_club_admins (
  id text primary key
);

create table if not exists public.tm_members (
  id text primary key
);

create table if not exists public.tm_guests (
  id text primary key
);

create table if not exists public.tm_meeting_attendance (
  id uuid primary key default gen_random_uuid()
);

create table if not exists public.tm_meeting_roles (
  id uuid primary key default gen_random_uuid()
);

create table if not exists public.tm_timer_records (
  id text primary key
);

alter table public.tm_meetings
  add column if not exists owner_id uuid references auth.users(id) on delete cascade,
  add column if not exists club_id text not null default 'default',
  add column if not exists meeting_number text,
  add column if not exists meeting_date text,
  add column if not exists theme text,
  add column if not exists word_of_day text,
  add column if not exists close_time text,
  add column if not exists status text not null default 'draft',
  add column if not exists public_link text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.tm_candidates
  add column if not exists meeting_id text references public.tm_meetings(id) on delete cascade,
  add column if not exists category text,
  add column if not exists name text not null default '',
  add column if not exists speech_title text,
  add column if not exists project text,
  add column if not exists votes integer not null default 0,
  add column if not exists sort_order integer not null default 0,
  add column if not exists created_at timestamptz not null default now();

alter table public.tm_votes
  add column if not exists meeting_id text references public.tm_meetings(id) on delete cascade,
  add column if not exists voter_token text,
  add column if not exists prepared_candidate_id text references public.tm_candidates(id) on delete cascade,
  add column if not exists impromptu_candidate_id text references public.tm_candidates(id) on delete cascade,
  add column if not exists evaluator_candidate_id text references public.tm_candidates(id) on delete cascade,
  add column if not exists created_at timestamptz not null default now();

alter table public.tm_winner_history
  add column if not exists owner_id uuid references auth.users(id) on delete cascade,
  add column if not exists club_id text not null default 'default',
  add column if not exists meeting_id text,
  add column if not exists meeting_number text,
  add column if not exists meeting_date text,
  add column if not exists prepared_winner text,
  add column if not exists prepared_votes integer not null default 0,
  add column if not exists impromptu_winner text,
  add column if not exists impromptu_votes integer not null default 0,
  add column if not exists evaluator_winner text,
  add column if not exists evaluator_votes integer not null default 0,
  add column if not exists created_at timestamptz not null default now();

alter table public.tm_club_settings
  add column if not exists owner_id uuid references auth.users(id) on delete cascade,
  add column if not exists club_id text not null default 'default',
  add column if not exists club_name text,
  add column if not exists club_short text,
  add column if not exists toastmaster_id text,
  add column if not exists admin_name text,
  add column if not exists username text,
  add column if not exists logo_data_url text,
  add column if not exists agenda_template_name text,
  add column if not exists agenda_template_data_url text,
  add column if not exists agenda_role_template jsonb not null default '[]'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.tm_club_admins
  add column if not exists owner_id uuid references auth.users(id) on delete cascade,
  add column if not exists club_id text not null default 'default',
  add column if not exists toastmaster_id text,
  add column if not exists email text,
  add column if not exists username text,
  add column if not exists password_hint text,
  add column if not exists name text,
  add column if not exists created_at timestamptz not null default now();

alter table public.tm_members
  add column if not exists owner_id uuid references auth.users(id) on delete cascade,
  add column if not exists club_id text not null default 'default',
  add column if not exists name text,
  add column if not exists english_name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists pathway text,
  add column if not exists level text,
  add column if not exists status text not null default 'active',
  add column if not exists joined_date text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.tm_guests
  add column if not exists owner_id uuid references auth.users(id) on delete cascade,
  add column if not exists club_id text not null default 'default',
  add column if not exists name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists introduced_by text,
  add column if not exists visit_date text,
  add column if not exists notes text,
  add column if not exists created_at timestamptz not null default now();

alter table public.tm_meeting_attendance
  add column if not exists owner_id uuid references auth.users(id) on delete cascade,
  add column if not exists club_id text not null default 'default',
  add column if not exists meeting_id text references public.tm_meetings(id) on delete cascade,
  add column if not exists person_type text,
  add column if not exists person_id text,
  add column if not exists attended boolean not null default true,
  add column if not exists created_at timestamptz not null default now();

alter table public.tm_meeting_roles
  add column if not exists owner_id uuid references auth.users(id) on delete cascade,
  add column if not exists club_id text not null default 'default',
  add column if not exists meeting_id text references public.tm_meetings(id) on delete cascade,
  add column if not exists role_name text,
  add column if not exists role_time text,
  add column if not exists person_type text,
  add column if not exists person_id text,
  add column if not exists created_at timestamptz not null default now();

alter table public.tm_timer_records
  add column if not exists owner_id uuid references auth.users(id) on delete cascade,
  add column if not exists club_id text not null default 'default',
  add column if not exists meeting_id text references public.tm_meetings(id) on delete cascade,
  add column if not exists item_id text,
  add column if not exists item_type text,
  add column if not exists summary text,
  add column if not exists person text,
  add column if not exists planned_duration text,
  add column if not exists elapsed_seconds integer not null default 0,
  add column if not exists light text,
  add column if not exists light_label text,
  add column if not exists started_at timestamptz,
  add column if not exists ended_at timestamptz,
  add column if not exists created_at timestamptz not null default now();

alter table public.tm_candidates drop constraint if exists tm_candidates_category_check;
alter table public.tm_candidates
  add constraint tm_candidates_category_check
  check (category in ('prepared', 'impromptu', 'evaluator'));

alter table public.tm_members drop constraint if exists tm_members_status_check;
alter table public.tm_members
  add constraint tm_members_status_check
  check (status in ('active', 'inactive'));

create unique index if not exists tm_votes_meeting_voter_unique on public.tm_votes(meeting_id, voter_token);
drop index if exists tm_club_settings_owner_unique;
create unique index if not exists tm_club_settings_owner_club_unique on public.tm_club_settings(owner_id, club_id);
create unique index if not exists tm_attendance_meeting_person_unique on public.tm_meeting_attendance(meeting_id, person_type, person_id);
create index if not exists tm_members_owner_idx on public.tm_members(owner_id);
create index if not exists tm_guests_owner_idx on public.tm_guests(owner_id);
create index if not exists tm_attendance_owner_meeting_idx on public.tm_meeting_attendance(owner_id, meeting_id);
create index if not exists tm_roles_owner_meeting_idx on public.tm_meeting_roles(owner_id, meeting_id);
create index if not exists tm_timer_records_owner_meeting_idx on public.tm_timer_records(owner_id, meeting_id);
create index if not exists tm_timer_records_meeting_idx on public.tm_timer_records(meeting_id, created_at desc);
create index if not exists tm_club_settings_owner_idx on public.tm_club_settings(owner_id);
create index if not exists tm_club_admins_owner_idx on public.tm_club_admins(owner_id);
create index if not exists tm_members_owner_club_idx on public.tm_members(owner_id, club_id);
create index if not exists tm_guests_owner_club_idx on public.tm_guests(owner_id, club_id);
create index if not exists tm_meetings_owner_club_idx on public.tm_meetings(owner_id, club_id);
create unique index if not exists tm_winner_history_meeting_unique on public.tm_winner_history(meeting_id);

create or replace function public.tm_submit_vote(
  p_meeting_id text,
  p_prepared_candidate_id text,
  p_impromptu_candidate_id text,
  p_evaluator_candidate_id text,
  p_voter_token text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
  v_club_id text;
  v_meeting_number text;
  v_meeting_date text;
  v_prepared_winner text;
  v_prepared_votes integer := 0;
  v_impromptu_winner text;
  v_impromptu_votes integer := 0;
  v_evaluator_winner text;
  v_evaluator_votes integer := 0;
begin
  if exists (
    select 1
    from public.tm_votes
    where meeting_id = p_meeting_id
      and voter_token = p_voter_token
  ) then
    return jsonb_build_object('already_voted', true);
  end if;

  insert into public.tm_votes (
    meeting_id,
    voter_token,
    prepared_candidate_id,
    impromptu_candidate_id,
    evaluator_candidate_id
  )
  values (
    p_meeting_id,
    p_voter_token,
    p_prepared_candidate_id,
    p_impromptu_candidate_id,
    p_evaluator_candidate_id
  );

  update public.tm_candidates
  set votes = votes + 1
  where id in (p_prepared_candidate_id, p_impromptu_candidate_id, p_evaluator_candidate_id)
    and meeting_id = p_meeting_id;

  select owner_id, club_id, meeting_number, meeting_date
  into v_owner_id, v_club_id, v_meeting_number, v_meeting_date
  from public.tm_meetings
  where id = p_meeting_id;

  select name, votes
  into v_prepared_winner, v_prepared_votes
  from public.tm_candidates
  where meeting_id = p_meeting_id
    and category = 'prepared'
  order by votes desc, sort_order asc
  limit 1;

  select name, votes
  into v_impromptu_winner, v_impromptu_votes
  from public.tm_candidates
  where meeting_id = p_meeting_id
    and category = 'impromptu'
  order by votes desc, sort_order asc
  limit 1;

  select name, votes
  into v_evaluator_winner, v_evaluator_votes
  from public.tm_candidates
  where meeting_id = p_meeting_id
    and category = 'evaluator'
  order by votes desc, sort_order asc
  limit 1;

  insert into public.tm_winner_history (
    owner_id,
    club_id,
    meeting_id,
    meeting_number,
    meeting_date,
    prepared_winner,
    prepared_votes,
    impromptu_winner,
    impromptu_votes,
    evaluator_winner,
    evaluator_votes
  )
  values (
    v_owner_id,
    coalesce(v_club_id, 'default'),
    p_meeting_id,
    coalesce(v_meeting_number, ''),
    coalesce(v_meeting_date, ''),
    coalesce(v_prepared_winner, ''),
    coalesce(v_prepared_votes, 0),
    coalesce(v_impromptu_winner, ''),
    coalesce(v_impromptu_votes, 0),
    coalesce(v_evaluator_winner, ''),
    coalesce(v_evaluator_votes, 0)
  )
  on conflict (meeting_id) do update set
    owner_id = excluded.owner_id,
    club_id = excluded.club_id,
    meeting_number = excluded.meeting_number,
    meeting_date = excluded.meeting_date,
    prepared_winner = excluded.prepared_winner,
    prepared_votes = excluded.prepared_votes,
    impromptu_winner = excluded.impromptu_winner,
    impromptu_votes = excluded.impromptu_votes,
    evaluator_winner = excluded.evaluator_winner,
    evaluator_votes = excluded.evaluator_votes;

  return jsonb_build_object('already_voted', false);
end;
$$;

create or replace function public.tm_save_meeting(
  p_id text,
  p_club_id text,
  p_meeting_number text,
  p_meeting_date text,
  p_theme text,
  p_word_of_day text,
  p_close_time text,
  p_status text,
  p_public_link text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid := auth.uid();
begin
  if v_owner_id is null then
    raise exception 'not_authenticated';
  end if;

  insert into public.tm_meetings (
    id,
    owner_id,
    club_id,
    meeting_number,
    meeting_date,
    theme,
    word_of_day,
    close_time,
    status,
    public_link,
    updated_at
  )
  values (
    p_id,
    v_owner_id,
    coalesce(p_club_id, 'default'),
    coalesce(p_meeting_number, ''),
    coalesce(p_meeting_date, ''),
    coalesce(p_theme, ''),
    p_word_of_day,
    p_close_time,
    coalesce(p_status, 'draft'),
    p_public_link,
    now()
  )
  on conflict (id) do update set
    owner_id = excluded.owner_id,
    club_id = excluded.club_id,
    meeting_number = excluded.meeting_number,
    meeting_date = excluded.meeting_date,
    theme = excluded.theme,
    word_of_day = excluded.word_of_day,
    close_time = excluded.close_time,
    status = excluded.status,
    public_link = excluded.public_link,
    updated_at = now()
  where public.tm_meetings.owner_id is null
     or (public.tm_meetings.owner_id = v_owner_id and public.tm_meetings.club_id = coalesce(p_club_id, 'default'));

  if not found then
    raise exception 'meeting_belongs_to_another_owner';
  end if;

  return jsonb_build_object('id', p_id, 'owner_id', v_owner_id);
end;
$$;

create or replace function public.tm_save_vote_setup(
  p_meeting jsonb,
  p_candidates jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid := auth.uid();
  v_meeting_id text := p_meeting->>'id';
  v_club_id text := coalesce(nullif(p_meeting->>'club_id', ''), 'default');
begin
  if v_owner_id is null then
    raise exception 'not_authenticated';
  end if;

  if v_meeting_id is null or v_meeting_id = '' then
    raise exception 'missing_meeting_id';
  end if;

  perform public.tm_save_meeting(
    v_meeting_id,
    v_club_id,
    p_meeting->>'meeting_number',
    p_meeting->>'meeting_date',
    p_meeting->>'theme',
    p_meeting->>'word_of_day',
    p_meeting->>'close_time',
    p_meeting->>'status',
    p_meeting->>'public_link'
  );

  delete from public.tm_candidates
  where meeting_id = v_meeting_id
    and exists (
      select 1 from public.tm_meetings
      where tm_meetings.id = v_meeting_id
        and tm_meetings.owner_id = v_owner_id
        and tm_meetings.club_id = v_club_id
    );

  insert into public.tm_candidates (
    id,
    meeting_id,
    category,
    name,
    speech_title,
    project,
    votes,
    sort_order
  )
  select
    candidate->>'id',
    v_meeting_id,
    candidate->>'category',
    coalesce(candidate->>'name', ''),
    coalesce(candidate->>'speech_title', ''),
    coalesce(candidate->>'project', ''),
    coalesce((candidate->>'votes')::integer, 0),
    coalesce((candidate->>'sort_order')::integer, 0)
  from jsonb_array_elements(coalesce(p_candidates, '[]'::jsonb)) as candidate
  where coalesce(candidate->>'id', '') <> ''
    and coalesce(candidate->>'category', '') in ('prepared', 'impromptu', 'evaluator');

  return jsonb_build_object(
    'id', v_meeting_id,
    'owner_id', v_owner_id,
    'candidate_count', jsonb_array_length(coalesce(p_candidates, '[]'::jsonb))
  );
end;
$$;

alter table public.tm_meetings enable row level security;
alter table public.tm_candidates enable row level security;
alter table public.tm_votes enable row level security;
alter table public.tm_winner_history enable row level security;
alter table public.tm_club_settings enable row level security;
alter table public.tm_club_admins enable row level security;
alter table public.tm_members enable row level security;
alter table public.tm_guests enable row level security;
alter table public.tm_meeting_attendance enable row level security;
alter table public.tm_meeting_roles enable row level security;
alter table public.tm_timer_records enable row level security;

drop policy if exists "tm meetings public read" on public.tm_meetings;
drop policy if exists "tm meetings public write" on public.tm_meetings;
drop policy if exists "tm meetings public update" on public.tm_meetings;
drop policy if exists "tm candidates public read" on public.tm_candidates;
drop policy if exists "tm candidates public write" on public.tm_candidates;
drop policy if exists "tm candidates public update" on public.tm_candidates;
drop policy if exists "tm candidates public delete" on public.tm_candidates;
drop policy if exists "tm votes public insert" on public.tm_votes;
drop policy if exists "tm history public read" on public.tm_winner_history;
drop policy if exists "tm history public write" on public.tm_winner_history;
drop policy if exists "tm club settings public read" on public.tm_club_settings;
drop policy if exists "tm club settings owner all" on public.tm_club_settings;
drop policy if exists "tm club admins owner all" on public.tm_club_admins;
drop policy if exists "tm members owner all" on public.tm_members;
drop policy if exists "tm guests owner all" on public.tm_guests;
drop policy if exists "tm members public read" on public.tm_members;
drop policy if exists "tm guests public read" on public.tm_guests;
drop policy if exists "tm roles public read" on public.tm_meeting_roles;
drop policy if exists "tm attendance owner all" on public.tm_meeting_attendance;
drop policy if exists "tm roles owner all" on public.tm_meeting_roles;
drop policy if exists "tm timer records public read" on public.tm_timer_records;
drop policy if exists "tm timer records public insert" on public.tm_timer_records;
drop policy if exists "tm timer records owner all" on public.tm_timer_records;

create policy "tm meetings public read"
on public.tm_meetings for select
to anon, authenticated
using (true);

create policy "tm meetings public write"
on public.tm_meetings for insert
to authenticated
with check (owner_id = (select auth.uid()));

create policy "tm meetings public update"
on public.tm_meetings for update
to authenticated
using (owner_id is null or owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy "tm candidates public read"
on public.tm_candidates for select
to anon, authenticated
using (true);

create policy "tm candidates public write"
on public.tm_candidates for insert
to authenticated
with check (
  exists (
    select 1 from public.tm_meetings
    where tm_meetings.id = tm_candidates.meeting_id
      and tm_meetings.owner_id = (select auth.uid())
  )
);

create policy "tm candidates public update"
on public.tm_candidates for update
to authenticated
using (
  exists (
    select 1 from public.tm_meetings
    where tm_meetings.id = tm_candidates.meeting_id
      and tm_meetings.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.tm_meetings
    where tm_meetings.id = tm_candidates.meeting_id
      and tm_meetings.owner_id = (select auth.uid())
  )
);

create policy "tm candidates public delete"
on public.tm_candidates for delete
to authenticated
using (
  exists (
    select 1 from public.tm_meetings
    where tm_meetings.id = tm_candidates.meeting_id
      and tm_meetings.owner_id = (select auth.uid())
  )
);

create policy "tm votes public insert"
on public.tm_votes for insert
to anon, authenticated
with check (true);

create policy "tm history public read"
on public.tm_winner_history for select
to anon, authenticated
using (true);

create policy "tm history public write"
on public.tm_winner_history for insert
to anon, authenticated
with check (true);

create policy "tm club settings public read"
on public.tm_club_settings for select
to anon, authenticated
using (true);

create policy "tm club settings owner all"
on public.tm_club_settings for all
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy "tm club admins owner all"
on public.tm_club_admins for all
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy "tm members public read"
on public.tm_members for select
to anon, authenticated
using (true);

create policy "tm members owner all"
on public.tm_members for all
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy "tm guests public read"
on public.tm_guests for select
to anon, authenticated
using (true);

create policy "tm guests owner all"
on public.tm_guests for all
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy "tm attendance owner all"
on public.tm_meeting_attendance for all
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy "tm roles public read"
on public.tm_meeting_roles for select
to anon, authenticated
using (true);

create policy "tm roles owner all"
on public.tm_meeting_roles for all
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy "tm timer records public read"
on public.tm_timer_records for select
to anon, authenticated
using (true);

create policy "tm timer records public insert"
on public.tm_timer_records for insert
to anon, authenticated
with check (true);

create policy "tm timer records owner all"
on public.tm_timer_records for all
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

grant usage on schema public to anon, authenticated;
grant select on public.tm_meetings to anon, authenticated;
grant select on public.tm_candidates to anon, authenticated;
grant insert on public.tm_votes to anon;
grant all on public.tm_meetings to authenticated;
grant all on public.tm_candidates to authenticated;
grant all on public.tm_votes to authenticated;
grant all on public.tm_winner_history to anon, authenticated;
grant all on public.tm_club_settings to authenticated;
grant select on public.tm_club_settings to anon;
grant all on public.tm_club_admins to authenticated;
grant all on public.tm_members to authenticated;
grant all on public.tm_guests to authenticated;
grant select on public.tm_members to anon;
grant select on public.tm_guests to anon;
grant all on public.tm_meeting_attendance to authenticated;
grant all on public.tm_meeting_roles to authenticated;
grant select on public.tm_meeting_roles to anon;
grant select, insert on public.tm_timer_records to anon, authenticated;
grant all on public.tm_timer_records to authenticated;
grant execute on function public.tm_submit_vote(text, text, text, text, text) to anon, authenticated;
grant execute on function public.tm_save_meeting(text, text, text, text, text, text, text, text, text) to authenticated;
grant execute on function public.tm_save_vote_setup(jsonb, jsonb) to authenticated;

notify pgrst, 'reload schema';
