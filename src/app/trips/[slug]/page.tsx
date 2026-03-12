import { createClient } from "@/lib/supabase/server";
import { getImageUrl } from "@/lib/supabase/storage";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: trip } = await supabase
    .from("trips")
    .select("title, destination")
    .eq("slug", slug)
    .single();

  if (!trip) return { title: "Trip Not Found" };
  return { title: `${trip.title} — ${trip.destination}` };
}

export default async function TripDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!trip) notFound();

  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("trip_id", trip.id)
    .order("display_order");

  const { data: itinerary } = await supabase
    .from("itineraries")
    .select("*")
    .eq("trip_id", trip.id)
    .order("day_number");

  const heroPhoto = photos?.[0];

  return (
    <>
      {/* Hero */}
      <section className="relative h-72 md:h-96 flex items-end overflow-hidden">
        {heroPhoto ? (
          <Image
            src={getImageUrl(heroPhoto.storage_path)}
            alt={trip.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-brand-teal" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 pb-8">
          <Link
            href="/trips"
            className="inline-block text-white/80 hover:text-white text-sm mb-3 transition-colors"
          >
            ← Back to All Tours
          </Link>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl font-bold text-white uppercase tracking-wide">
            {trip.title}
          </h1>
          <p className="text-brand-gold-light text-lg mt-1">{trip.destination}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Quick facts */}
            <div className="flex flex-wrap gap-4 mb-8">
              {trip.dates && (
                <div className="bg-brand-offwhite rounded-lg px-4 py-3">
                  <p className="text-xs text-gray-500 uppercase font-[family-name:var(--font-heading)] tracking-wide">Dates</p>
                  <p className="font-semibold text-brand-charcoal">{trip.dates}</p>
                </div>
              )}
              {trip.price && (
                <div className="bg-brand-offwhite rounded-lg px-4 py-3">
                  <p className="text-xs text-gray-500 uppercase font-[family-name:var(--font-heading)] tracking-wide">Price</p>
                  <p className="font-semibold text-brand-gold">{trip.price}</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="prose prose-lg max-w-none mb-10">
              <h2 className="font-[family-name:var(--font-heading)] text-2xl text-brand-teal uppercase">
                About This Tour
              </h2>
              <div className="w-16 h-1 bg-brand-gold mb-4" />
              {trip.description.split("\n").map((paragraph: string, i: number) => (
                <p key={i} className="text-brand-charcoal leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Itinerary */}
            {itinerary && itinerary.length > 0 && (
              <div className="mb-10">
                <h2 className="font-[family-name:var(--font-heading)] text-2xl text-brand-teal uppercase mb-1">
                  Itinerary
                </h2>
                <div className="w-16 h-1 bg-brand-gold mb-6" />
                <div className="space-y-4">
                  {itinerary.map((day) => (
                    <div key={day.id} className="border-l-4 border-brand-gold pl-4 py-2">
                      <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-brand-teal">
                        Day {day.day_number}: {day.title}
                      </h3>
                      <p className="text-brand-charcoal mt-1">{day.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Photo gallery */}
            {photos && photos.length > 1 && (
              <div>
                <h2 className="font-[family-name:var(--font-heading)] text-2xl text-brand-teal uppercase mb-1">
                  Photo Gallery
                </h2>
                <div className="w-16 h-1 bg-brand-gold mb-6" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo) => {
                    const shape = photo.display_shape || "landscape";
                    const aspectMap: Record<string, string> = {
                      landscape: "aspect-[4/3]", portrait: "aspect-[3/4]", square: "aspect-square",
                      wide: "aspect-[16/9]", tall: "aspect-[2/3]", circle: "aspect-square rounded-full",
                    };
                    return (
                      <div key={photo.id} className={`relative ${aspectMap[shape] || "aspect-[4/3]"} rounded-lg overflow-hidden`}>
                        <Image
                          src={getImageUrl(photo.storage_path)}
                          alt={photo.caption || trip.title}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                        {photo.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">
                            {photo.caption}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-brand-offwhite rounded-xl p-6 sticky top-32">
              <h3 className="font-[family-name:var(--font-heading)] text-xl text-brand-teal uppercase mb-4">
                Interested in This Tour?
              </h3>
              <p className="text-sm text-brand-charcoal mb-6">
                Contact us for pricing, availability, and to reserve your spot on this amazing group tour.
              </p>
              <a
                href="tel:8065706640"
                className="block text-center bg-brand-gold text-white px-6 py-3 rounded-md font-[family-name:var(--font-heading)] text-lg font-bold uppercase tracking-wide hover:bg-brand-gold-light transition-colors mb-3"
              >
                Call (806) 570-6640
              </a>
              <Link
                href="/contact"
                className="block text-center border-2 border-brand-gold text-brand-gold px-6 py-3 rounded-md font-[family-name:var(--font-heading)] text-lg font-bold uppercase tracking-wide hover:bg-brand-gold hover:text-white transition-colors"
              >
                Request Info
              </Link>

              <div className="border-t mt-6 pt-4 text-sm text-gray-500">
                <p className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  accenttravelgroups@gmail.com
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Amarillo, TX
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
