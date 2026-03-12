import { createClient } from "@/lib/supabase/server";
import { getImageUrl } from "@/lib/supabase/storage";
import Image from "next/image";

export const metadata = { title: "About Us" };

export default async function AboutPage() {
  const supabase = await createClient();
  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", "about")
    .single();

  const sections = [
    {
      heading: "Family and Locally Owned Since 1981",
      text: "Work with a travel team that gets as excited about your trip as you do. At Accent Travel Agency, our staff prides itself on finding your inner child with expert personal service.",
      image: "about/about1-1920w.jpg",
    },
    {
      heading: "Tell Us Where You Want to Go",
      text: "The first step of our travel booking process is the discovery of your perfect destination. When you're ready to experience something new, our team can get you there and help you create memories that will last a lifetime.",
      image: "about/about2-1920w.jpg",
    },
    {
      heading: "How Do You Want to Travel?",
      text: "At Accent Travel, we can create a group that can include travel by air, ship, bus or just about any other way you can imagine. Experience something new with experienced experts on your side.",
      image: "about/about3-1920w.jpg",
    },
    {
      heading: "If You Can Dream It, Our Team Can Plan It",
      text: "Our #1 goal is to provide you with experienced and personalized service that exceeds your expectations. Utilizing our travel experience, our staff creates travel plans that are stress-free and only leave room for fun.",
      image: "about/about4-1920w.jpg",
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative h-72 md:h-96 flex items-center justify-center overflow-hidden">
        <Image
          src={getImageUrl("heroes/about-hero-98e9416b-2880w.jpg")}
          alt="About Accent Travel Agency"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-brand-teal/60" />
        <div className="relative z-10 text-center text-white">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-6xl font-bold uppercase tracking-wider">
            About Accent Travel Agency
          </h1>
        </div>
      </section>

      {/* Content sections — alternating layout */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {sections.map((section, i) => (
          <div
            key={i}
            className={`flex flex-col ${
              i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            } gap-8 mb-16 items-center`}
          >
            <div className="md:w-1/2">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={getImageUrl(section.image)}
                  alt={section.heading}
                  fill
                  className="object-cover"
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

        {/* Bus photo */}
        <div className="text-center">
          <div className="relative inline-block rounded-xl overflow-hidden shadow-lg">
            <Image
              src={getImageUrl("about/accent-travel-agency-about-support-image01-1920w.jpg")}
              alt="Accent Travel Agency bus"
              width={800}
              height={500}
              className="w-full max-w-2xl h-auto"
            />
          </div>
        </div>
      </div>

      {/* Payment methods */}
      <section className="bg-brand-offwhite py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl text-brand-teal uppercase mb-4">
            Payment Methods Accepted
          </h2>
          <div className="w-16 h-1 bg-brand-gold mx-auto mb-6" />
          <div className="flex flex-wrap justify-center gap-3">
            {["American Express", "Cash", "Check", "Diners Club", "Discover", "MasterCard", "Visa", "Venmo", "Zelle"].map(
              (method) => (
                <span
                  key={method}
                  className="bg-white px-4 py-2 rounded-full text-sm text-brand-charcoal shadow-sm"
                >
                  {method}
                </span>
              )
            )}
          </div>
        </div>
      </section>
    </>
  );
}
