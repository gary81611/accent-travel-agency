import { createClient } from "@/lib/supabase/server";
import TripCard from "@/components/public/TripCard";
import Image from "next/image";
import { getImageUrl } from "@/lib/supabase/storage";

export const metadata = { title: "Group Tours" };

export default async function TripsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year } = await searchParams;
  const supabase = await createClient();

  const { data: allTrips } = await supabase
    .from("trips")
    .select("*")
    .neq("slug", "gallery")
    .order("created_at", { ascending: false });

  const trips = allTrips || [];

  // Filter by year if specified (match year in dates field)
  const filtered = year
    ? trips.filter((t) => t.dates?.includes(year))
    : trips;

  // Get first photo per trip
  const tripsWithPhotos = await Promise.all(
    filtered.map(async (trip) => {
      const { data: photos } = await supabase
        .from("photos")
        .select("storage_path")
        .eq("trip_id", trip.id)
        .order("display_order")
        .limit(1);
      return { trip, photo: photos?.[0] || null };
    })
  );

  // Get unique years from all trips for the filter tabs
  const years = [...new Set(
    trips
      .map((t) => t.dates?.match(/\d{4}/)?.[0])
      .filter(Boolean)
  )].sort();

  return (
    <>
      {/* Hero */}
      <section className="relative h-64 flex items-center justify-center overflow-hidden">
        <Image
          src={getImageUrl("heroes/accent-travel-agency-hero-2026-01-2880w.jpg")}
          alt="Group tours"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-brand-teal/60" />
        <div className="relative z-10 text-center text-white">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-6xl font-bold uppercase tracking-wider">
            {year ? `${year} Group Tours` : "All Group Tours"}
          </h1>
        </div>
      </section>

      {/* Year filter */}
      <section className="bg-white border-b sticky top-[105px] z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto">
          <a
            href="/trips"
            className={`px-4 py-2 rounded-full text-sm font-[family-name:var(--font-heading)] font-semibold uppercase tracking-wide transition-colors ${
              !year
                ? "bg-brand-gold text-white"
                : "bg-brand-lightgray text-brand-charcoal hover:bg-brand-gold-pale"
            }`}
          >
            All Tours
          </a>
          {years.map((y) => (
            <a
              key={y}
              href={`/trips?year=${y}`}
              className={`px-4 py-2 rounded-full text-sm font-[family-name:var(--font-heading)] font-semibold uppercase tracking-wide transition-colors ${
                year === y
                  ? "bg-brand-gold text-white"
                  : "bg-brand-lightgray text-brand-charcoal hover:bg-brand-gold-pale"
              }`}
            >
              {y}
            </a>
          ))}
        </div>
      </section>

      {/* Trip grid */}
      <section className="py-12 px-4 bg-brand-offwhite min-h-[50vh]">
        <div className="max-w-7xl mx-auto">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 text-lg py-20">
              No tours found{year ? ` for ${year}` : ""}. Check back soon!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tripsWithPhotos.map(({ trip, photo }) => (
                <TripCard key={trip.id} trip={trip} photo={photo} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
