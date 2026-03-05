-- Supabase SQL Schema for Lucky Wheel

-- Programs table
create table programs (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default now()
);

-- Participants table
create table participants (
  id uuid default gen_random_uuid() primary key,
  program_id uuid references programs(id) on delete cascade not null,
  full_name text not null,
  cccd text not null,
  phone text,
  created_at timestamp with time zone default now()
);

-- Prizes table
create table prizes (
  id uuid default gen_random_uuid() primary key,
  program_id uuid references programs(id) on delete cascade not null,
  name text not null,
  color text not null,
  icon text not null,
  total_quantity int not null default 1,
  remaining_quantity int not null default 1
);

-- Winners table
create table winners (
  id uuid default gen_random_uuid() primary key,
  program_id uuid references programs(id) on delete cascade not null,
  participant_id uuid references participants(id) on delete cascade not null,
  prize_id uuid references prizes(id) on delete cascade not null,
  created_at timestamp with time zone default now()
);

-- Indexes
create index idx_participants_program on participants(program_id);
create index idx_prizes_program on prizes(program_id);
create index idx_winners_program on winners(program_id);

-- RLS policies (enable row level security)
alter table programs enable row level security;
alter table participants enable row level security;
alter table prizes enable row level security;
alter table winners enable row level security;

-- Allow all operations for anon (for simplicity - adjust for production)
create policy "Allow all on programs" on programs for all using (true) with check (true);
create policy "Allow all on participants" on participants for all using (true) with check (true);
create policy "Allow all on prizes" on prizes for all using (true) with check (true);
create policy "Allow all on winners" on winners for all using (true) with check (true);
