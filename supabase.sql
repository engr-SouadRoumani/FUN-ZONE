-- FUN ZONE database schema. Run this entire file in Supabase SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.admins (user_id uuid primary key references auth.users(id) on delete cascade, created_at timestamptz default now());
create table if not exists public.events (id uuid primary key default gen_random_uuid(), title text not null, description text, join_code text not null unique, status text not null default 'active' check(status in ('active','paused','closed')), created_at timestamptz default now());
create table if not exists public.teams (id uuid primary key default gen_random_uuid(), event_id uuid not null references public.events(id) on delete cascade, team_name text not null check(length(trim(team_name)) between 2 and 32), created_at timestamptz default now());
create unique index if not exists teams_event_name_unique on public.teams(event_id, lower(trim(team_name)));
create table if not exists public.games (id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null, description text, icon text);
create table if not exists public.event_games (id uuid primary key default gen_random_uuid(), event_id uuid not null references public.events(id) on delete cascade, game_id uuid not null references public.games(id) on delete cascade, is_active boolean not null default true, settings jsonb not null default '{}'::jsonb, unique(event_id,game_id));
create table if not exists public.game_attempts (id uuid primary key default gen_random_uuid(), event_id uuid not null references public.events(id) on delete cascade, game_id uuid not null references public.games(id), team_id uuid not null references public.teams(id) on delete cascade, score integer not null default 0 check(score>=0), duration integer not null default 0, status text not null default 'completed', started_at timestamptz default now(), completed_at timestamptz default now());
create index if not exists attempts_event_team_idx on public.game_attempts(event_id,team_id);
create or replace view public.leaderboard as select t.event_id,t.id as team_id,t.team_name,coalesce(sum(best.best_score),0)::bigint as total_score from public.teams t left join (select team_id,event_id,game_id,max(score) as best_score from public.game_attempts where status='completed' group by team_id,event_id,game_id) best on best.team_id=t.id and best.event_id=t.event_id group by t.event_id,t.id,t.team_name;
insert into public.games(slug,name,description,icon) values
('memory','تحدي الذاكرة','طابق الصور المتشابهة','🧠'),('steps','رتّب الخطوات','رتّب الأحداث بالتسلسل','🪜'),('quiz','معلومات عامة','أسئلة ثقافية متنوعة','🌍'),('crossword','تحدي الكلمات','حل الكلمات والألغاز','🔤'),('riddles','ألغاز وذكاء','ألغاز منطقية وممتعة','💡'),('scramble','رتّب الحروف','كوّن الكلمات الصحيحة','🔀'),('spot','اكتشف المختلف','لاحظ التفاصيل','👀'),('emoji','خمّن بالإيموجي','خمّن من الرموز التعبيرية','😄') on conflict(slug) do nothing;
-- Automatically activate the full starter game set for every new event.
create or replace function public.attach_default_games() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.event_games(event_id,game_id,is_active)
  select new.id,g.id,true from public.games g on conflict(event_id,game_id) do nothing;
  return new;
end; $$;
drop trigger if exists attach_default_games_after_event on public.events;
create trigger attach_default_games_after_event after insert on public.events for each row execute function public.attach_default_games();

-- Enable RLS
alter table public.admins enable row level security; alter table public.events enable row level security; alter table public.teams enable row level security; alter table public.games enable row level security; alter table public.event_games enable row level security; alter table public.game_attempts enable row level security;
-- Admin helper
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.admins where user_id=auth.uid()) $$;
-- Public can read active events and games; admin can manage all.
create policy "read active events" on public.events for select using(status='active' or public.is_admin());
create policy "admin manage events" on public.events for all using(public.is_admin()) with check(public.is_admin());
create policy "public read games" on public.games for select using(true);
create policy "admin manage games" on public.games for all using(public.is_admin()) with check(public.is_admin());
create policy "read event games" on public.event_games for select using(is_active or public.is_admin());
create policy "admin manage event games" on public.event_games for all using(public.is_admin()) with check(public.is_admin());
create policy "teams can register" on public.teams for insert with check(exists(select 1 from public.events e where e.id=event_id and e.status='active'));
create policy "teams public names" on public.teams for select using(true);
create policy "admin manage teams" on public.teams for all using(public.is_admin()) with check(public.is_admin());
create policy "public submit attempts" on public.game_attempts for insert with check(exists(select 1 from public.teams t join public.event_games eg on eg.event_id=t.event_id and eg.game_id=game_attempts.game_id where t.id=game_attempts.team_id and t.event_id=game_attempts.event_id and eg.is_active));
create policy "public read attempts" on public.game_attempts for select using(true);
create policy "admin manage attempts" on public.game_attempts for all using(public.is_admin()) with check(public.is_admin());
-- Realtime feed for live leaderboard refresh
alter publication supabase_realtime add table public.game_attempts;
