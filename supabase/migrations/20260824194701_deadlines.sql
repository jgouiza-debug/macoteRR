-- Cluster 5: deadlines (admission rounds, AFE, withdrawal dates; bursary
-- deadlines live on the bursaries row itself and get unioned in at query
-- time, not duplicated here). See docs/01-data-architecture.md.

create table deadlines (
  id uuid primary key default gen_random_uuid(),
  type text check (type in ('sracq_round','sram_round','afe_deadline','withdrawal_no_penalty','other')) not null,
  title text not null,
  date date not null,
  applies_to_cegep_id uuid references cegeps(id),  -- null = province-wide
  source_url text not null,
  last_verified_at date not null
);

alter table deadlines enable row level security;
create policy "public read" on deadlines for select using (true);
