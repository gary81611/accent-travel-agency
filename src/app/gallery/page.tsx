import { createClient } from "@/lib/supabase/server";
import { getImageUrl } from "@/lib/supabase/storage";
import Image from "next/image";

export const metadata = { title: "Photo Gallery" };

function shapeAspect(shape: string) {
  const map: Record<string, string> = {
    landscape: "aspect-[4/3]",
    portrait: "aspect-[3/4]",
    square: "aspect-square",
    wide: "aspect-[16/9]",
    tall: "aspect-[2/3]",
    circle: "aspect-square",
  };
  return map[shape] || "aspect-[4/3]";
}

type Photo = {
  id: string;
  storage_path: string;
  caption: string | null;
  trip_id: string;
  display_shape: string;
};

export default async function GalleryPage() {
  const supabase = await createClient();

  // Get gallery photos (from the "gallery" virtual trip)
  const { data: galleryTrip } = await supabase
    .from("trips")
    .select()
    .eq("slug", "gallery")
    .single();

  let galleryPhotos: Photo[] = [];

  if (galleryTrip) {
    const { data } = await supabase
      .from("photos")
      .select()
      .eq("trip_id", galleryTrip.id)
      .order("display_order");
    galleryPhotos = (data || []) as Photo[];
  }

  // Also get photos from actual trips
  const { data: tripPhotos } = await supabase
    .from("photos")
    .select()
    .order("display_order")
    .limit(20);

  // Merge, deduplicating by id
  const seenIds = new Set(galleryPhotos.map((p) => p.id));
  const extraPhotos = ((tripPhotos || []) as Photo[]).filter((p) => !seenIds.has(p.id));
  const allPhotos = [...galleryPhotos, ...extraPhotos];

  return (
    <>
      {/* Hero */}
      <section className="relative h-64 flex items-center justify-center overflow-hidden">
        <Image
          src={getImageUrl("heroes/about-hero-2880w.jpg")}
          alt="Photo gallery"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-brand-teal/60" />
        <div className="relative z-10 text-center text-white">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-6xl font-bold uppercase tracking-wider">
            Photo Gallery
          </h1>
          <p className="mt-2 text-brand-gold-light text-lg">
            Memories from our group tours around the world
          </p>
        </div>
      </section>

      {/* Gallery grid */}
      <section className="py-12 px-4 bg-brand-offwhite min-h-[50vh]">
        <div className="max-w-7xl mx-auto">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {allPhotos.map((photo) => {
              const isCircle = photo.display_shape === "circle";
              return (
                <div
                  key={photo.id}
                  className={`break-inside-avoid overflow-hidden shadow-md bg-white ${isCircle ? "rounded-full" : "rounded-lg"}`}
                >
                  <div className={`relative ${shapeAspect(photo.display_shape)}`}>
                    <Image
                      src={getImageUrl(photo.storage_path)}
                      alt={photo.caption || "Travel photo"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  {photo.caption && !isCircle && (
                    <p className="px-3 py-2 text-sm text-brand-charcoal">{photo.caption}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
