create table if not exists public.tm_meetings (
  id text primary key,
  owner_id uuid references auth.users(id) on delete cascade,
  meeting_number text not null,
  meeting_date text not null,
  theme text not null,
  word_of_day text,
  close_time text,
  status text not null default 'draft',
  public_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tm_candidates (
  id text primary key,
  meeting_id text not null references public.tm_meetings(id) on delete cascade,
  category text not null check (category in ('prepared', 'impromptu', 'evaluator')),
  name text not null default '',
  speech_title text,
  project text,
  votes integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.tm_votes (
  id uuid primary key default gen_random_uuid(),
  meeting_id text not null references public.tm_meetings(id) on delete cascade,
  voter_token text not null,
  prepared_candidate_id text not null references public.tm_candidates(id) on delete cascade,
  impromptu_candidate_id text not null references public.tm_candidates(id) on delete cascade,
  evaluator_candidate_id text references public.tm_candidates(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (meeting_id, voter_token)
);

create table if not exists public.tm_winner_history (
  id uuid primary key default gen_random_uuid(),
  meeting_number text not null,
  meeting_date text not null,
  prepared_winner text,
  prepared_votes integer not null default 0,
  impromptu_winner text,
  impromptu_votes integer not null default 0,
  evaluator_winner text,
  evaluator_votes integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.tm_club_settings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  club_name text not null,
  club_short text,
  toastmaster_id text,
  admin_name text,
  username text,
  logo_data_url text,
  agenda_template_name text,
  agenda_template_data_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id)
);

create table if not exists public.tm_club_admins (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  toastmaster_id text,
  username text,
  password_hint text,
  name text,
  created_at timestamptz not null default now()
);

create table if not exists public.tm_members (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  english_name text,
  email text,
  phone text,
  pathway text,
  level text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  joined_date text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tm_guests (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  introduced_by text,
  visit_date text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.tm_meeting_attendance (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  meeting_id text not null references public.tm_meetings(id) on delete cascade,
  person_type text not null check (person_type in ('member', 'guest')),
  person_id text not null,
  attended boolean not null default true,
  created_at timestamptz not null default now(),
  unique (meeting_id, person_type, person_id)
);

create table if not exists public.tm_meeting_roles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  meeting_id text not null references public.tm_meetings(id) on delete cascade,
  role_name text not null,
  person_type text not null check (person_type in ('member', 'guest')),
  person_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists tm_members_owner_idx on public.tm_members(owner_id);
create index if not exists tm_guests_owner_idx on public.tm_guests(owner_id);
create index if not exists tm_attendance_owner_meeting_idx on public.tm_meeting_attendance(owner_id, meeting_id);
create index if not exists tm_roles_owner_meeting_idx on public.tm_meeting_roles(owner_id, meeting_id);
create index if not exists tm_club_settings_owner_idx on public.tm_club_settings(owner_id);

alter table public.tm_club_settings
  add column if not exists logo_data_url text,
  add column if not exists agenda_template_name text,
  add column if not exists agenda_template_data_url text;

create index if not exists tm_club_admins_owner_idx on public.tm_club_admins(owner_id);

alter table public.tm_meetings
  add column if not exists owner_id uuid references auth.users(id) on delete cascade;

alter table public.tm_votes
  add column if not exists evaluator_candidate_id text references public.tm_candidates(id) on delete cascade;

alter table public.tm_winner_history
  add column if not exists evaluator_winner text,
  add column if not exists evaluator_votes integer not null default 0;

alter table public.tm_candidates
  drop constraint if exists tm_candidates_category_check;

alter table public.tm_candidates
  add constraint tm_candidates_category_check
  check (category in ('prepared', 'impromptu', 'evaluator'));

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

  return jsonb_build_object('already_voted', false);
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
drop policy if exists "tm attendance owner all" on public.tm_meeting_attendance;
drop policy if exists "tm roles owner all" on public.tm_meeting_roles;

create policy "tm meetings public read"
on public.tm_meetings for select
to anon
using (true);

create policy "tm meetings public write"
on public.tm_meetings for insert
to authenticated
with check (owner_id = (select auth.uid()));

create policy "tm meetings public update"
on public.tm_meetings for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy "tm candidates public read"
on public.tm_candidates for select
to anon
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
to anon
with check (true);

create policy "tm history public read"
on public.tm_winner_history for select
to anon
using (true);

create policy "tm history public write"
on public.tm_winner_history for insert
to anon
with check (true);

create policy "tm club settings public read"
on public.tm_club_settings for select
to anon
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

create policy "tm members owner all"
on public.tm_members for all
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

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

create policy "tm roles owner all"
on public.tm_meeting_roles for all
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));
