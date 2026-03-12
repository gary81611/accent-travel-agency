import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getImageUrl } from "@/lib/supabase/storage";
import TripCard from "@/components/public/TripCard";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: featuredTrips } = await supabase
    .from("trips")
    .select("*")
    .eq("featured", true)
    .neq("slug", "gallery")
    .order("created_at", { ascending: false })
    .limit(6);

  // Get first photo for each trip
  const tripsWithPhotos = await Promise.all(
    (featuredTrips || []).map(async (trip) => {
      const { data: photos } = await supabase
        .from("photos")
        .select("storage_path")
        .eq("trip_id", trip.id)
        .order("display_order")
        .limit(1);
      return { trip, photo: photos?.[0] || null };
    })
  );

  // Get gallery photos for the photo strip
  const { data: galleryPhotos } = await supabase
    .from("photos")
    .select("*")
    .order("display_order")
    .limit(6);

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <Image
          src={getImageUrl("heroes/homehero-1920w.jpg")}
          alt="Travel destination"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-brand-teal/60" />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="font-[family-name:var(--font-heading)] text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg uppercase tracking-wider">
            Ask Us. We&apos;ve Been There.
          </h1>
          <p className="font-[family-name:var(--font-heading-alt)] text-xl md:text-2xl mb-2 text-brand-gold-light">
            Specializing in Group Travel and Tours
          </p>
          <p className="text-lg md:text-xl mb-8 text-gray-200">
            Group Tour Travel Agency in Amarillo, TX
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/trips"
              className="bg-brand-gold text-white px-8 py-3 rounded-md font-[family-name:var(--font-heading)] text-xl font-bold uppercase tracking-wide hover:bg-brand-gold-light transition-colors"
            >
              Explore Our Tours
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-md font-[family-name:var(--font-heading)] text-xl font-bold uppercase tracking-wide hover:bg-white hover:text-brand-teal transition-colors"
            >
              Request Info
            </Link>
          </div>
        </div>
      </section>

      {/* Value Props Banner */}
      <section className="bg-brand-gold text-white py-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-[family-name:var(--font-heading)] text-lg md:text-xl tracking-wide uppercase">
            Free Consultations &nbsp;|&nbsp; Same-Day Estimates &nbsp;|&nbsp; 40+ Years of Experience
          </p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl text-brand-teal mb-2 uppercase">
            Change Your Surroundings and Experience Life!
          </h2>
          <div className="w-20 h-1 bg-brand-gold mx-auto mb-6" />
          <p className="text-lg text-brand-charcoal leading-relaxed">
            Your perfect destination awaits! At Accent Travel Agency, we have the experience to get
            you there and to fulfill your travel dreams. Since 1981, our family has provided essential
            travel assistance to satisfy the travel bug inside us all. The world has amazing
            destinations — jet off to one of them today by calling{" "}
            <a href="tel:8065706640" className="text-brand-gold font-bold hover:underline">
              (806) 570-6640
            </a>{" "}
            for a quote on your group of 10 or more.
          </p>
        </div>
      </section>

      {/* Featured Trips */}
      <section className="py-16 px-4 bg-brand-offwhite">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl text-brand-teal text-center mb-2 uppercase">
            Group Tours That Make Memories!
          </h2>
          <div className="w-20 h-1 bg-brand-gold mx-auto mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tripsWithPhotos.map(({ trip, photo }) => (
              <TripCard key={trip.id} trip={trip} photo={photo} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/trips"
              className="inline-block bg-brand-gold text-white px-8 py-3 rounded-md font-[family-name:var(--font-heading)] text-xl font-bold uppercase tracking-wide hover:bg-brand-gold-light transition-colors"
            >
              View All Tours
            </Link>
          </div>
        </div>
      </section>

      {/* Photo Gallery Strip */}
      {galleryPhotos && galleryPhotos.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl text-brand-teal text-center mb-2 uppercase">
              Photos From Our Travels
            </h2>
            <div className="w-20 h-1 bg-brand-gold mx-auto mb-10" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galleryPhotos.map((photo) => (
                <div key={photo.id} className="relative aspect-[4/3] rounded-lg overflow-hidden">
                  <Image
                    src={getImageUrl(photo.storage_path)}
                    alt={photo.caption || "Travel photo"}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/gallery"
                className="inline-block border-2 border-brand-gold text-brand-gold px-8 py-3 rounded-md font-[family-name:var(--font-heading)] text-xl font-bold uppercase tracking-wide hover:bg-brand-gold hover:text-white transition-colors"
              >
                View More Photos
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <Image
          src={getImageUrl("heroes/videosplash-1920w.jpg")}
          alt="Travel background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-brand-teal/70" />
        <div className="relative z-10 max-w-3xl mx-auto text-center text-white">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl font-bold mb-4 uppercase">
            Ready for Your Next Adventure?
          </h2>
          <p className="text-lg mb-8 text-gray-200">
            Contact our experienced team today to plan your perfect group tour.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:8065706640"
              className="bg-brand-gold text-white px-8 py-3 rounded-md font-[family-name:var(--font-heading)] text-xl font-bold uppercase tracking-wide hover:bg-brand-gold-light transition-colors"
            >
              Call (806) 570-6640
            </a>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-md font-[family-name:var(--font-heading)] text-xl font-bold uppercase tracking-wide hover:bg-white hover:text-brand-teal transition-colors"
            >
              Send a Message
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
