-- Cluster 1: institutions. See docs/01-data-architecture.md.
-- Rarely changes; no RLS needed beyond the public-read policy every catalog
-- cluster gets (see cegep_catalog migration for the rationale).

create extension if not exists pgcrypto;

create table cegeps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_code text unique not null,        -- 'sainte-foy', 'limoilou', 'garneau', 'champlain-slc'
  sector text not null check (sector in ('public_french','public_english','private')),
  region text not null default 'Quebec City',
  website_url text,
  admission_service text,                  -- 'SRACQ', 'direct', etc.
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_code text unique not null,
  website_url text,
  bci_member boolean default true
);

alter table cegeps enable row level security;
create policy "public read" on cegeps for select using (true);

alter table universities enable row level security;
create policy "public read" on universities for select using (true);
