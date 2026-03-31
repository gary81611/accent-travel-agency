-- Add brochure document support to trips
alter table public.trips add column if not exists brochure_url text;
