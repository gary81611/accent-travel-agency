alter table public.trips add column if not exists status text default 'active';
alter table public.trips add column if not exists status_note text;
alter table public.trips add column if not exists meals text;
alter table public.trips add column if not exists duration text;
