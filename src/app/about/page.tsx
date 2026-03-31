import { createClient } from "@/lib/supabase/server";
import { getImageUrl } from "@/lib/supabase/storage";
import { getSiteImages } from "@/lib/supabase/site-images";
import Image from "next/image";

export const metadata = { title: "About Us" };

export default async function AboutPage() {
  const supabase = await createClient();
  const img = await getSiteImages();
  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", "about")
    .single();

  const sections = [
    {
      heading: "Family and Locally Owned Since 1981",
      text: "Work with a travel team that gets as excited about your trip as you do. At Accent Travel Agency, our staff prides itself on finding your inner child with expert personal service.",
      imageKey: "about_bus",
    },
    {
      heading: "Tell Us Where You Want to Go",
      text: "The first step of our travel booking process is the discovery of your perfect destination. When you're ready to experience something new, our team can get you there and help you create memories that will last a lifetime.",
      imageKey: "about_2",
    },
    {
      heading: "How Do You Want to Travel?",
      text: "At Accent Travel, we can create a group that can include travel by air, ship, bus or just about any other way you can imagine. Experience something new with experienced experts on your side.",
      imageKey: "about_3",
    },
    {
      heading: "If You Can Dream It, Our Team Can Plan It",
      text: "Our #1 goal is to provide you with experienced and personalized service that exceeds your expectations. Utilizing our travel experience, our staff creates travel plans that are stress-free and only leave room for fun.",
      imageKey: "about_4",
    },
  ];

  const specialties = [
    "Group Tours (10 or more)",
    "Escorted & Independent Tours",
    "Cruises & River Cruises",
    "Customized Itineraries",
    "Airline Reservations",
    "Hotel & Resort Bookings",
    "International & Domestic Travel",
    "Travel Insurance",
    "Passport & Visa Assistance",
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative h-80 md:h-[28rem] flex items-center justify-center overflow-hidden pt-20">
        <Image
          src={getImageUrl(img.hero_about || "heroes/about-hero-98e9416b-2880w.jpg")}
          alt="About Accent Travel Agency"
          fill
          className="object-cover"
          style={{ objectPosition: img.hero_about_pos || "center center" }}
          priority
        />
        <div className="absolute inset-0 bg-brand-teal/60" />
        <div className="relative z-10 text-center text-white">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-6xl font-bold uppercase tracking-wider">
            About Accent Travel Agency
          </h1>
          <p className="mt-3 text-white/80 text-sm md:text-base font-[family-name:var(--font-heading)] uppercase tracking-[0.15em]">
            Free Consultations &nbsp;|&nbsp; Same-Day Estimates &nbsp;|&nbsp; 40+ Years of Experience
          </p>
        </div>
      </section>

      {/* Travel the world callout */}
      <section className="bg-brand-teal text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl font-bold uppercase tracking-wide mb-2">
            Travel the World with People You Know
          </h2>
          <p className="text-white/80 text-lg">
            We specialize exclusively in group travel for parties of 10 or more.
            Let us handle every detail while you enjoy the journey with friends, family, and fellow travelers.
          </p>
        </div>
      </section>

      {/* CMS content — if the admin has written about page content, render it */}
      {page?.content && page.content.trim().length > 0 && (
        <section className="max-w-4xl mx-auto px-4 py-16">
          {page.content.split(/\n(?=##\s)/).map((block: string, i: number) => {
            const headingMatch = block.match(/^##\s+(.+)/);
            const heading = headingMatch ? headingMatch[1] : null;
            const body = heading ? block.replace(/^##\s+.+\n?/, "") : block;
            return (
              <div key={i} className="mb-10">
                {heading && (
                  <>
                    <h2 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl text-brand-teal uppercase mb-2">
                      {heading}
                    </h2>
                    <div className="w-16 h-1 bg-brand-gold mb-4" />
                  </>
                )}
                {body.trim().split("\n\n").map((paragraph: string, j: number) => (
                  <p key={j} className="text-lg text-brand-charcoal leading-relaxed mb-4">
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
            );
          })}
        </section>
      )}

      {/* Fallback content sections — alternating layout */}
      {(!page?.content || page.content.trim().length === 0) && <div className="max-w-7xl mx-auto px-4 py-16">
        {sections.map((section, i) => (
          <div
            key={i}
            className={`flex flex-col ${
              i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            } gap-8 mb-16 items-center`}
          >
            <div className="md:w-1/2">
              <div className={`relative ${i === 0 ? "aspect-[3/4]" : "aspect-[4/3]"} rounded-xl overflow-hidden shadow-lg`}>
                <Image
                  src={getImageUrl(img[section.imageKey] || `about/about${i + 1}-1920w.jpg`)}
                  alt={section.heading}
                  fill
                  className="object-cover"
                  style={{ objectPosition: img[`${section.imageKey}_pos`] || "center center" }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
            <div className="md:w-1/2">
              <h2 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl text-brand-teal uppercase mb-2">
                {section.heading}
              </h2>
              <div className="w-16 h-1 bg-brand-gold mb-4" />
              <p className="text-lg text-brand-charcoal leading-relaxed">{section.text}</p>
            </div>
          </div>
        ))}
      </div>}

      {/* Specialties */}
      <section className="py-16 px-4 bg-brand-offwhite">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl text-brand-teal uppercase mb-2">
              Our Specialties
            </h2>
            <div className="w-16 h-1 bg-brand-gold mx-auto mb-4" />
            <p className="text-brand-charcoal/70 text-lg">
              With over 40 years of experience, we offer a full range of group travel services.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {specialties.map((specialty) => (
              <div key={specialty} className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-3">
                <div className="bg-brand-gold/10 rounded-full p-2 shrink-0">
                  <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-semibold text-brand-charcoal">{specialty}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Groups of 10+ emphasis */}
      <section className="relative py-16 px-4 overflow-hidden">
        <Image
          src={getImageUrl(img.hero_about || "heroes/about-hero-98e9416b-2880w.jpg")}
          alt=""
          fill
          className="object-cover"
          style={{ objectPosition: img.hero_about_pos || "center center" }}
        />
        <div className="absolute inset-0 bg-brand-teal/80" />
        <div className="relative z-10 max-w-3xl mx-auto text-center text-white">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold uppercase mb-4">
            Groups of 10 or More
          </h2>
          <p className="text-lg text-white/80 mb-6">
            Whether it&apos;s a church group, club, family reunion, or group of friends — if you have 10 or more travelers,
            we can create a custom itinerary just for your group. We handle all the details so you can focus on making memories.
          </p>
          <a
            href="tel:8065706640"
            className="inline-block bg-brand-gold text-white px-10 py-4 rounded font-[family-name:var(--font-heading)] text-lg font-bold uppercase tracking-wide hover:bg-brand-gold-light transition-colors"
          >
            Call (806) 570-6640
          </a>
        </div>
      </section>

    </>
  );
}
