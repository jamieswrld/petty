-- Run in Supabase SQL editor (free tier) for live chat on GitHub Pages.

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

alter table chat_messages enable row level security;
alter table chat_presence enable row level security;

create policy "Anyone can read chat" on chat_messages for select using (true);
create policy "Anyone can post chat" on chat_messages for insert with check (true);
create policy "Anyone can read presence" on chat_presence for select using (true);
create policy "Anyone can upsert presence" on chat_presence for insert with check (true);
create policy "Anyone can update presence" on chat_presence for update using (true);
create policy "Anyone can leave presence" on chat_presence for delete using (true);

alter publication supabase_realtime add table chat_messages;
