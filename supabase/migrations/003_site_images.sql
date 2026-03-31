-- Migration: Insert site image paths into settings table
-- These were previously hardcoded throughout the site.

INSERT INTO settings (key, value) VALUES
  ('image_logo',             'branding/logo-new-1920w.png'),
  ('image_hero_home',        'heroes/homehero-1920w.jpg'),
  ('image_hero_home_cta',    'heroes/videosplash-1920w.jpg'),
  ('image_hero_trips',       'heroes/accent-travel-agency-hero-2026-01-2880w.jpg'),
  ('image_hero_gallery',     'heroes/about-hero-2880w.jpg'),
  ('image_hero_about',       'heroes/about-hero-98e9416b-2880w.jpg'),
  ('image_hero_contact',     'heroes/contact-hero-2880w.jpg'),
  ('image_hero_travel_info', 'heroes/general-hero-2880w.jpg'),
  ('image_about_1',          'about/about1-1920w.jpg'),
  ('image_about_2',          'about/about2-1920w.jpg'),
  ('image_about_3',          'about/about3-1920w.jpg'),
  ('image_about_4',          'about/about4-1920w.jpg'),
  ('image_about_bus',        'about/accent-travel-agency-about-support-image01-1920w.jpg')
ON CONFLICT (key) DO NOTHING;
