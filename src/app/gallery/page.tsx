import { createClient } from "@/lib/supabase/server";
import { getImageUrl } from "@/lib/supabase/storage";
import { getSiteImages } from "@/lib/supabase/site-images";
import Image from "next/image";
import GalleryPhoto from "@/components/public/GalleryPhoto";

export const metadata = { title: "Photo Gallery" };

type Photo = {
  id: string;
  storage_path: string;
  caption: string | null;
  trip_id: string;
  display_shape: string;
};

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

export default async function GalleryPage() {
  const supabase = await createClient();
  const img = await getSiteImages();

  // Only show gallery photos — no random trip photos
  const { data: galleryTrip } = await supabase
    .from("trips")
    .select("id")
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

  return (
    <>
      {/* Hero */}
      <section className="relative h-80 flex items-center justify-center overflow-hidden pt-20">
        <Image
          src={getImageUrl(img.hero_gallery || "heroes/about-hero-2880w.jpg")}
          alt="Photo gallery"
          fill
          className="object-cover"
          style={{ objectPosition: img.hero_gallery_pos || "center center" }}
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
          {galleryPhotos.length === 0 ? (
            <p className="text-center text-gray-400 py-20">No gallery photos yet. Check back soon!</p>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {galleryPhotos.map((photo) => {
                const isCircle = photo.display_shape === "circle";
                return (
                  <div
                    key={photo.id}
                    className={`break-inside-avoid overflow-hidden shadow-md bg-white ${isCircle ? "rounded-full" : "rounded-lg"}`}
                  >
                    <GalleryPhoto
                      storage_path={photo.storage_path}
                      caption={photo.caption}
                      display_shape={photo.display_shape}
                      isCircle={isCircle}
                      shapeClass={shapeAspect(photo.display_shape)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
