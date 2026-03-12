/**
 * Seed script: uploads images to Supabase Storage and inserts
 * all structured data (trips, pages, settings, photos) into the database.
 *
 * Usage: node scripts/seed.mjs
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const IMAGES_DIR = join(PROJECT_ROOT, 'scrape', 'images');
const EXTRACTED_DIR = join(PROJECT_ROOT, 'scrape', 'extracted');

function readJSON(filename) {
  return JSON.parse(readFileSync(join(EXTRACTED_DIR, filename), 'utf-8'));
}

function mimeType(filepath) {
  const ext = extname(filepath).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.png': 'image/png', '.gif': 'image/gif',
    '.webp': 'image/webp', '.svg': 'image/svg+xml',
  };
  return types[ext] || 'application/octet-stream';
}

// ── Upload images to Supabase Storage ──────────────────────────
async function uploadImages() {
  console.log('\n📸 Uploading images to Supabase Storage...');
  let uploaded = 0, skipped = 0, failed = 0;

  const dirs = readdirSync(IMAGES_DIR).filter(d =>
    statSync(join(IMAGES_DIR, d)).isDirectory()
  );

  for (const dir of dirs) {
    const dirPath = join(IMAGES_DIR, dir);
    const files = readdirSync(dirPath).filter(f => !f.startsWith('.'));

    for (const file of files) {
      const filePath = join(dirPath, file);
      const storagePath = `${dir}/${file}`;

      try {
        const fileBuffer = readFileSync(filePath);
        const { error } = await supabase.storage
          .from('photos')
          .upload(storagePath, fileBuffer, {
            contentType: mimeType(file),
            upsert: true,
          });

        if (error) {
          console.error(`  ✗ ${storagePath}: ${error.message}`);
          failed++;
        } else {
          uploaded++;
        }
      } catch (err) {
        console.error(`  ✗ ${storagePath}: ${err.message}`);
        failed++;
      }
    }
    console.log(`  ${dir}/: ${files.length} files processed`);
  }

  console.log(`  ✓ Uploaded: ${uploaded}, Skipped: ${skipped}, Failed: ${failed}`);
}

// ── Seed settings ──────────────────────────────────────────────
async function seedSettings() {
  console.log('\n⚙️  Seeding settings...');
  const settings = readJSON('settings.json');

  const rows = [
    { key: 'business_name', value: settings.business_name },
    { key: 'tagline', value: settings.tagline },
    { key: 'subtitle', value: settings.subtitle },
    { key: 'phone', value: settings.phone },
    { key: 'email', value: settings.email },
    { key: 'address', value: settings.address },
    { key: 'city', value: settings.city },
    { key: 'state', value: settings.state },
    { key: 'zip', value: settings.zip },
    { key: 'venmo', value: settings.venmo },
    { key: 'zelle', value: settings.zelle },
    { key: 'facebook', value: settings.facebook },
    { key: 'year_established', value: settings.year_established },
    { key: 'value_props', value: settings.value_props },
  ];

  const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' });
  if (error) console.error('  ✗ Settings error:', error.message);
  else console.log(`  ✓ ${rows.length} settings inserted`);
}

// ── Seed pages ─────────────────────────────────────────────────
async function seedPages() {
  console.log('\n📄 Seeding pages...');
  const pages = readJSON('pages.json');

  for (const page of pages) {
    const { error } = await supabase.from('pages').upsert(
      { slug: page.slug, title: page.title, content: page.content },
      { onConflict: 'slug' }
    );
    if (error) console.error(`  ✗ Page "${page.slug}": ${error.message}`);
    else console.log(`  ✓ Page "${page.slug}" inserted`);
  }
}

// ── Seed trips and photos ──────────────────────────────────────
async function seedTrips() {
  console.log('\n✈️  Seeding trips and photos...');
  const trips = readJSON('trips.json');

  for (const trip of trips) {
    // Insert trip
    const { data: tripData, error: tripError } = await supabase
      .from('trips')
      .upsert({
        title: trip.title,
        slug: trip.slug,
        destination: trip.destination,
        description: trip.description,
        dates: trip.dates || null,
        price: trip.price || null,
        featured: trip.featured,
      }, { onConflict: 'slug' })
      .select('id')
      .single();

    if (tripError) {
      console.error(`  ✗ Trip "${trip.title}": ${tripError.message}`);
      continue;
    }

    const tripId = tripData.id;
    console.log(`  ✓ Trip "${trip.title}" (${tripId})`);

    // Insert photos for this trip
    if (trip.images && trip.images.length > 0) {
      // Determine storage folder based on year
      const yearFolder = `trips-${trip.year}`;

      const photoRows = trip.images.map((img, idx) => ({
        trip_id: tripId,
        storage_path: `${yearFolder}/${img}`,
        caption: null,
        display_order: idx,
      }));

      const { error: photoError } = await supabase.from('photos').upsert(photoRows);
      if (photoError) console.error(`    ✗ Photos: ${photoError.message}`);
      else console.log(`    ✓ ${photoRows.length} photos linked`);
    }

    // Insert itinerary days if present
    if (trip.itinerary && trip.itinerary.length > 0) {
      const itinRows = trip.itinerary.map((day, idx) => ({
        trip_id: tripId,
        day_number: idx + 1,
        title: day.title,
        description: day.description || '',
      }));

      const { error: itinError } = await supabase.from('itineraries').upsert(itinRows);
      if (itinError) console.error(`    ✗ Itinerary: ${itinError.message}`);
    }
  }
}

// ── Seed gallery photos (not trip-specific) ────────────────────
async function seedGalleryPhotos() {
  console.log('\n🖼️  Seeding gallery photos...');
  const photosData = readJSON('photos.json');

  // Gallery photos don't belong to a specific trip.
  // We'll create a virtual "gallery" trip to hold them.
  const { data: galleryTrip, error: galleryError } = await supabase
    .from('trips')
    .upsert({
      title: 'Photo Gallery',
      slug: 'gallery',
      destination: 'Various Destinations',
      description: 'Photos from past Accent Travel Agency group tours.',
      featured: false,
    }, { onConflict: 'slug' })
    .select('id')
    .single();

  if (galleryError) {
    console.error('  ✗ Gallery trip:', galleryError.message);
    return;
  }

  const galleryId = galleryTrip.id;

  const photoRows = photosData.gallery.map((photo, idx) => ({
    trip_id: galleryId,
    storage_path: `gallery/${photo.file}`,
    caption: photo.caption,
    display_order: idx,
  }));

  const { error } = await supabase.from('photos').insert(photoRows);
  if (error) console.error(`  ✗ Gallery photos: ${error.message}`);
  else console.log(`  ✓ ${photoRows.length} gallery photos inserted`);
}

// ── Main ───────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Starting seed...');
  console.log(`   Supabase: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);

  await uploadImages();
  await seedSettings();
  await seedPages();
  await seedTrips();
  await seedGalleryPhotos();

  console.log('\n✅ Seed complete!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
