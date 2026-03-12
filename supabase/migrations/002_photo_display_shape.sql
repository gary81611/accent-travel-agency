-- Add display_shape column to photos for flexible photo presentation
-- Shapes: 'landscape', 'portrait', 'square', 'wide', 'tall', 'circle'
alter table public.photos add column display_shape text not null default 'landscape';

-- Clean up generic auto-captions that aren't useful
update public.photos set caption = null where caption in ('Group photo', 'Travel photo', 'Group tour photo');
