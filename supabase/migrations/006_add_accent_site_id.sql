-- Add 'accent' as a valid site_id for Accent Travel Agency pages
ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_site_id_check;
ALTER TABLE pages ADD CONSTRAINT pages_site_id_check CHECK (site_id IN ('rva', 'alpenglow', 'accent'));
