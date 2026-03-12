-- Accent Travel Agency — Initial Schema
-- Run this in the Supabase SQL Editor

-- Trips
create table public.trips (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  destination text not null,
  description text not null default '',
  dates text,
  price text,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- Itineraries (per-trip, per-day)
create table public.itineraries (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  day_number integer not null,
  title text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

-- Photos
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  storage_path text not null,
  caption text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Static pages (About, Contact, etc.)
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content text not null default '',
  created_at timestamptz not null default now()
);

-- Site-wide settings (key-value)
create table public.settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null default ''
);

-- Indexes
create index idx_trips_slug on public.trips(slug);
create index idx_trips_featured on public.trips(featured) where featured = true;
create index idx_itineraries_trip on public.itineraries(trip_id, day_number);
create index idx_photos_trip on public.photos(trip_id, display_order);
create index idx_pages_slug on public.pages(slug);

-- Row Level Security
alter table public.trips enable row level security;
alter table public.itineraries enable row level security;
alter table public.photos enable row level security;
alter table public.pages enable row level security;
alter table public.settings enable row level security;

-- Public read access
create policy "Public read trips" on public.trips for select using (true);
create policy "Public read itineraries" on public.itineraries for select using (true);
create policy "Public read photos" on public.photos for select using (true);
create policy "Public read pages" on public.pages for select using (true);
create policy "Public read settings" on public.settings for select using (true);

-- Authenticated user (owner) full access
create policy "Owner manage trips" on public.trips for all using (auth.role() = 'authenticated');
create policy "Owner manage itineraries" on public.itineraries for all using (auth.role() = 'authenticated');
create policy "Owner manage photos" on public.photos for all using (auth.role() = 'authenticated');
create policy "Owner manage pages" on public.pages for all using (auth.role() = 'authenticated');
create policy "Owner manage settings" on public.settings for all using (auth.role() = 'authenticated');

-- Storage bucket for trip photos
insert into storage.buckets (id, name, public) values ('photos', 'photos', true);

create policy "Public read photos storage" on storage.objects for select using (bucket_id = 'photos');
create policy "Owner upload photos" on storage.objects for insert with check (bucket_id = 'photos' and auth.role() = 'authenticated');
create policy "Owner update photos" on storage.objects for update using (bucket_id = 'photos' and auth.role() = 'authenticated');
create policy "Owner delete photos" on storage.objects for delete using (bucket_id = 'photos' and auth.role() = 'authenticated');
