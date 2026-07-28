alter table public.tm_meetings
  add column if not exists owner_id uuid references auth.users(id) on delete cascade,
  add column if not exists word_of_day text,
  add column if not exists close_time text,
  add column if not exists status text not null default 'draft',
  add column if not exists public_link text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

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

create index if not exists tm_members_owner_idx on public.tm_members(owner_id);
create index if not exists tm_guests_owner_idx on public.tm_guests(owner_id);

alter table public.tm_members enable row level security;
alter table public.tm_guests enable row level security;

drop policy if exists "tm members owner all" on public.tm_members;
drop policy if exists "tm guests owner all" on public.tm_guests;

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

notify pgrst, 'reload schema';
