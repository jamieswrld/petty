-- Run ALL of this in Supabase SQL Editor (New query → paste → Run).

-- 1. Tables
create table if not exists chat_messages (
  id bigint generated always as identity primary key,
  username text not null,
  text text not null check (char_length(text) <= 200),
  sent_at timestamptz not null default now()
);

create table if not exists chat_presence (
  session_id text primary key,
  username text not null,
  last_seen timestamptz not null default now()
);

-- 2. Row level security
alter table chat_messages enable row level security;
alter table chat_presence enable row level security;

-- 3. Policies (safe to re-run)
drop policy if exists "Anyone can read chat" on chat_messages;
drop policy if exists "Anyone can post chat" on chat_messages;
drop policy if exists "Anyone can read presence" on chat_presence;
drop policy if exists "Anyone can upsert presence" on chat_presence;
drop policy if exists "Anyone can update presence" on chat_presence;
drop policy if exists "Anyone can leave presence" on chat_presence;

create policy "Anyone can read chat" on chat_messages for select using (true);
create policy "Anyone can post chat" on chat_messages for insert with check (true);
create policy "Anyone can read presence" on chat_presence for select using (true);
create policy "Anyone can upsert presence" on chat_presence for insert with check (true);
create policy "Anyone can update presence" on chat_presence for update using (true);
create policy "Anyone can leave presence" on chat_presence for delete using (true);

-- 4. Realtime (skip if this line errors — enable chat_messages in Database → Publications instead)
do $$
begin
  alter publication supabase_realtime add table chat_messages;
exception
  when duplicate_object then null;
end $$;
