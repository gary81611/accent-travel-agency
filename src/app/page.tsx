import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getImageUrl } from "@/lib/supabase/storage";
import { getSiteImages } from "@/lib/supabase/site-images";
import { getSiteSettings } from "@/lib/supabase/site-settings";
import TripCard from "@/components/public/TripCard";

export default async function HomePage() {
  const supabase = await createClient();
  const [img, settings] = await Promise.all([getSiteImages(), getSiteSettings()]);
  const phoneRaw = settings.phone.replace(/\D/g, "");

  const { data: featuredTrips } = await supabase
    .from("trips")
    .select("*")
    .eq("featured", true)
    .neq("slug", "gallery")
    .order("created_at", { ascending: false })
    .limit(6);

  // Batch photo fetch instead of N+1
  const tripIds = (featuredTrips || []).map((t) => t.id);
  const { data: allTripPhotos } = tripIds.length > 0
    ? await supabase
        .from("photos")
        .select("trip_id, storage_path")
        .in("trip_id", tripIds)
        .order("display_order")
    : { data: [] };

  const photoByTrip = new Map<string, { storage_path: string }>();
  for (const photo of allTripPhotos || []) {
    if (!photoByTrip.has(photo.trip_id)) photoByTrip.set(photo.trip_id, photo);
  }

  const tripsWithPhotos = (featuredTrips || []).map((trip) => ({
    trip,
    photo: photoByTrip.get(trip.id) || null,
  }));

  // Only show gallery photos — find the gallery virtual trip
  const { data: galleryTrip } = await supabase
    .from("trips")
    .select("id")
    .eq("slug", "gallery")
    .single();

  let galleryPhotos: { id: string; storage_path: string; caption: string | null }[] = [];
  if (galleryTrip) {
    const { data } = await supabase
      .from("photos")
      .select("id, storage_path, caption")
      .eq("trip_id", galleryTrip.id)
      .order("display_order")
      .limit(6);
    galleryPhotos = (data || []) as typeof galleryPhotos;
  }

  return (
    <>
      {/* ═══════ HERO — full viewport, photo background ═══════ */}
      <section className="relative h-screen min-h-[600px] flex items-start justify-center overflow-hidden">
        <Image
          src={getImageUrl(img.hero_home || "heroes/homehero-1920w.jpg")}
          alt="Travel destination"
          fill
          className="object-cover scale-105"
          style={{ objectPosition: img.hero_home_pos || "center center" }}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />
        <div className="absolute inset-0 bg-brand-teal/30" />
        <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 200px 60px rgba(0,0,0,0.3)" }} />

        {/* Logo — positioned at top of hero */}
        <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-20">
          <div className="relative w-[180px] h-[120px] sm:w-[260px] sm:h-[170px] md:w-[320px] md:h-[210px]">
            <Image
              src={getImageUrl("branding/logo-new-1920w.png")}
              alt="Accent Travel Agency"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto">
          <div className="mt-[220px] sm:mt-[260px] md:mt-[300px]"></div>

          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="block w-16 h-px bg-brand-gold-light/60" />
            <span className="font-[family-name:var(--font-heading-alt)] text-[13px] sm:text-[14px] text-brand-gold-light uppercase tracking-[0.4em]">
              Since 1981
            </span>
            <span className="block w-16 h-px bg-brand-gold-light/60" />
          </div>

          <p className="font-[family-name:var(--font-heading)] text-[1.5rem] sm:text-[2rem] md:text-[2.5rem] text-white/90 uppercase tracking-[0.15em] mb-4 italic">
            &ldquo;Ask Us. We&apos;ve Been There.&rdquo;
          </p>

          <h1 className="font-[family-name:var(--font-heading)] text-[2.2rem] sm:text-[3rem] md:text-[4rem] lg:text-[4.5rem] font-bold leading-[1] uppercase tracking-[0.08em] mb-4">
            <span className="block text-brand-gold-light">Specializing in Group Travel</span>
            <span className="block text-white">and Tours for 10 or More</span>
          </h1>

          <p className="font-[family-name:var(--font-heading-alt)] text-base sm:text-lg text-white/70 uppercase tracking-[0.25em] mb-3 max-w-2xl mx-auto">
            Amarillo, TX &middot; Family Owned Since 1981
          </p>

          <div className="w-20 h-[2px] bg-brand-gold mx-auto mb-8" />

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/trips"
              className="bg-brand-gold text-white px-10 py-4 rounded font-[family-name:var(--font-heading)] text-lg font-bold uppercase tracking-[0.15em] hover:bg-brand-gold-light transition-all hover:shadow-lg hover:shadow-brand-gold/20"
            >
              Explore Our Tours
            </Link>
            <Link
              href="/contact"
              className="border border-white/40 text-white px-10 py-4 rounded font-[family-name:var(--font-heading)] text-lg font-bold uppercase tracking-[0.15em] hover:bg-white/10 hover:border-white/70 transition-all backdrop-blur-sm"
            >
              Request Info
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 animate-bounce">
          <span className="text-[10px] uppercase tracking-[0.3em] font-[family-name:var(--font-heading-alt)]">Scroll</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ═══════ VALUE PROPS BANNER ════════════════════════════ */}
      <section className="bg-brand-teal text-white py-5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 text-center">
          {[
            { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", text: "Free Consultations" },
            { icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", text: "Same-Day Estimates" },
            { icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z", text: "40+ Years Experience" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-brand-gold-light shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
              </svg>
              <span className="font-[family-name:var(--font-heading)] text-[15px] tracking-[0.1em] uppercase">{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ INTRO ═════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span className="font-[family-name:var(--font-heading-alt)] text-[12px] text-brand-gold uppercase tracking-[0.35em] block mb-3">
            About Our Agency
          </span>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-[2.8rem] text-brand-teal mb-3 uppercase leading-tight">
            Change Your Surroundings<br className="hidden sm:block" /> and Experience Life!
          </h2>
          <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-8" />
          <p className="text-lg text-brand-charcoal/80 leading-relaxed">
            Your perfect destination awaits! At Accent Travel Agency, we have the experience to get
            you there and to fulfill your travel dreams. Since 1981, our family has provided essential
            travel assistance to satisfy the travel bug inside us all. The world has amazing
            destinations — jet off to one of them today by calling{" "}
            <a href={`tel:${phoneRaw}`} className="text-brand-gold font-bold hover:underline">
              {settings.phone}
            </a>{" "}
            for a quote on your group of 10 or more.
          </p>
        </div>
      </section>

      {/* ═══════ YEAR TOURS + TRAVEL INFO ════════════════════════ */}
      <section className="py-12 px-6 bg-brand-offwhite border-b border-gray-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <h3 className="font-[family-name:var(--font-heading)] text-2xl text-brand-teal uppercase mb-2">
              2025 &ndash; 2027 Group Tours
            </h3>
            <div className="w-12 h-[2px] bg-brand-gold mx-auto mb-4" />
            <p className="text-brand-charcoal/80 mb-6">
              Experience an amazing adventure through exquisite cities all planned by the expert team at Accent Travel Agency.
            </p>
            <Link
              href="/trips"
              className="inline-block bg-brand-gold text-white px-8 py-3 rounded font-[family-name:var(--font-heading)] font-bold uppercase tracking-[0.1em] hover:bg-brand-gold-light transition-colors"
            >
              View All Tours
            </Link>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <h3 className="font-[family-name:var(--font-heading)] text-2xl text-brand-teal uppercase mb-2">
              Important Travel Information
            </h3>
            <div className="w-12 h-[2px] bg-brand-gold mx-auto mb-4" />
            <p className="text-brand-charcoal/80 mb-6">
              Get the latest requirements on travel and important links to make your group tour excursion a success!
            </p>
            <Link
              href="/travel-info"
              className="inline-block bg-brand-gold text-white px-8 py-3 rounded font-[family-name:var(--font-heading)] font-bold uppercase tracking-[0.1em] hover:bg-brand-gold-light transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ FEATURED TRIPS ════════════════════════════════ */}
      <section className="py-20 px-6 bg-brand-offwhite">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="font-[family-name:var(--font-heading-alt)] text-[12px] text-brand-gold uppercase tracking-[0.35em] block mb-3">
              Our Tours
            </span>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-[2.8rem] text-brand-teal uppercase leading-tight">
              Group Tours That Make Memories
            </h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tripsWithPhotos.map(({ trip, photo }) => (
              <TripCard key={trip.id} trip={trip} photo={photo} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/trips"
              className="inline-block bg-brand-gold text-white px-10 py-4 rounded font-[family-name:var(--font-heading)] text-lg font-bold uppercase tracking-[0.12em] hover:bg-brand-gold-light transition-all hover:shadow-lg"
            >
              View All Tours
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ PHOTO GALLERY STRIP ══════════════════════════ */}
      {galleryPhotos.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <span className="font-[family-name:var(--font-heading-alt)] text-[12px] text-brand-gold uppercase tracking-[0.35em] block mb-3">
                Our Memories
              </span>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-[2.8rem] text-brand-teal uppercase leading-tight">
                Photos From Our Travels
              </h2>
              <div className="w-16 h-[2px] bg-brand-gold mx-auto mt-4" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
              {galleryPhotos.map((photo) => (
                <div key={photo.id} className="bg-white rounded-lg overflow-hidden shadow-md group">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={getImageUrl(photo.storage_path)}
                      alt={photo.caption || "Travel photo"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                  {photo.caption && (
                    <p className="px-3 py-2 text-sm text-brand-charcoal font-medium">{photo.caption}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/gallery"
                className="inline-block border-2 border-brand-gold text-brand-gold px-10 py-4 rounded font-[family-name:var(--font-heading)] text-lg font-bold uppercase tracking-[0.12em] hover:bg-brand-gold hover:text-white transition-all"
              >
                View Full Gallery
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══════ CTA SECTION ══════════════════════════════════ */}
      <section className="relative py-24 px-6 overflow-hidden">
        <Image
          src={getImageUrl(img.hero_home_cta || "heroes/videosplash-1920w.jpg")}
          alt="Travel background"
          fill
          className="object-cover"
          style={{ objectPosition: img.hero_home_cta_pos || "center center" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-teal/85 to-brand-teal/70" />
        <div className="relative z-10 max-w-3xl mx-auto text-center text-white">
          <span className="font-[family-name:var(--font-heading-alt)] text-[12px] text-brand-gold-light uppercase tracking-[0.35em] block mb-4">
            Let&apos;s Plan Your Trip
          </span>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl font-bold mb-4 uppercase leading-tight">
            Ready for Your<br />Next Adventure?
          </h2>
          <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
          <p className="text-lg mb-10 text-white/80 max-w-xl mx-auto">
            Contact our experienced team today to plan your perfect group tour. We handle every detail so you can focus on making memories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${phoneRaw}`}
              className="bg-brand-gold text-white px-10 py-4 rounded font-[family-name:var(--font-heading)] text-lg font-bold uppercase tracking-[0.12em] hover:bg-brand-gold-light transition-all hover:shadow-lg"
            >
              Call {settings.phone}
            </a>
            <Link
              href="/contact"
              className="border border-white/40 text-white px-10 py-4 rounded font-[family-name:var(--font-heading)] text-lg font-bold uppercase tracking-[0.12em] hover:bg-white/10 hover:border-white/70 transition-all"
            >
              Send a Message
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
