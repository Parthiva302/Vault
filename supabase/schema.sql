create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  tags text[] not null default '{}',
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  title text,
  description text,
  favicon_url text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.yt_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  title text,
  thumbnail text,
  channel text,
  tags text[] not null default '{}',
  watched boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null default '',
  tags text[] not null default '{}',
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.snippets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  code text not null,
  language text not null default 'text',
  description text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists prompts_user_created_idx on public.prompts(user_id, created_at desc);
create index if not exists links_user_created_idx on public.links(user_id, created_at desc);
create index if not exists yt_links_user_created_idx on public.yt_links(user_id, created_at desc);
create index if not exists notes_user_updated_idx on public.notes(user_id, is_pinned desc, updated_at desc);
create index if not exists snippets_user_created_idx on public.snippets(user_id, created_at desc);

create index if not exists prompts_tags_idx on public.prompts using gin(tags);
create index if not exists links_tags_idx on public.links using gin(tags);
create index if not exists yt_links_tags_idx on public.yt_links using gin(tags);
create index if not exists notes_tags_idx on public.notes using gin(tags);
create index if not exists snippets_tags_idx on public.snippets using gin(tags);

alter table public.prompts enable row level security;
alter table public.links enable row level security;
alter table public.yt_links enable row level security;
alter table public.notes enable row level security;
alter table public.snippets enable row level security;

create policy "Users can read own prompts" on public.prompts for select using (auth.uid() = user_id);
create policy "Users can insert own prompts" on public.prompts for insert with check (auth.uid() = user_id);
create policy "Users can update own prompts" on public.prompts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own prompts" on public.prompts for delete using (auth.uid() = user_id);

create policy "Users can read own links" on public.links for select using (auth.uid() = user_id);
create policy "Users can insert own links" on public.links for insert with check (auth.uid() = user_id);
create policy "Users can update own links" on public.links for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own links" on public.links for delete using (auth.uid() = user_id);

create policy "Users can read own yt links" on public.yt_links for select using (auth.uid() = user_id);
create policy "Users can insert own yt links" on public.yt_links for insert with check (auth.uid() = user_id);
create policy "Users can update own yt links" on public.yt_links for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own yt links" on public.yt_links for delete using (auth.uid() = user_id);

create policy "Users can read own notes" on public.notes for select using (auth.uid() = user_id);
create policy "Users can insert own notes" on public.notes for insert with check (auth.uid() = user_id);
create policy "Users can update own notes" on public.notes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own notes" on public.notes for delete using (auth.uid() = user_id);

create policy "Users can read own snippets" on public.snippets for select using (auth.uid() = user_id);
create policy "Users can insert own snippets" on public.snippets for insert with check (auth.uid() = user_id);
create policy "Users can update own snippets" on public.snippets for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own snippets" on public.snippets for delete using (auth.uid() = user_id);

create trigger set_prompts_updated_at before update on public.prompts for each row execute function public.set_updated_at();
create trigger set_links_updated_at before update on public.links for each row execute function public.set_updated_at();
create trigger set_yt_links_updated_at before update on public.yt_links for each row execute function public.set_updated_at();
create trigger set_notes_updated_at before update on public.notes for each row execute function public.set_updated_at();
create trigger set_snippets_updated_at before update on public.snippets for each row execute function public.set_updated_at();

alter publication supabase_realtime add table public.prompts;
alter publication supabase_realtime add table public.links;
alter publication supabase_realtime add table public.yt_links;
alter publication supabase_realtime add table public.notes;
alter publication supabase_realtime add table public.snippets;
