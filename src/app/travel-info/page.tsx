import { createClient } from "@/lib/supabase/server";
import { getImageUrl } from "@/lib/supabase/storage";
import Image from "next/image";

export const metadata = { title: "General Travel Information" };

export default async function TravelInfoPage() {
  const supabase = await createClient();
  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", "general-travel-information")
    .single();

  // Parse the markdown content into sections
  const content = page?.content || "";
  const sections = content.split(/^## /m).filter(Boolean);

  return (
    <>
      {/* Hero */}
      <section className="relative h-64 flex items-center justify-center overflow-hidden">
        <Image
          src={getImageUrl("heroes/general-hero-2880w.jpg")}
          alt="Travel information"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-brand-teal/60" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-6xl font-bold uppercase tracking-wider">
            Travel Information
          </h1>
          <p className="mt-2 text-brand-gold-light text-lg">Helpful links and resources</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <p className="text-lg text-brand-charcoal leading-relaxed mb-10">
          Accent Travel Agency wants you to be prepared before and after your travel excursion.
          Below are some helpful tips to make your trip memorable. If you have any additional
          questions, please call us at{" "}
          <a href="tel:8065706640" className="text-brand-gold font-bold hover:underline">
            (806) 570-6640
          </a>
        </p>

        {sections.map((section: string, i: number) => {
          const lines = section.split("\n").filter(Boolean);
          const heading = lines[0];
          const items = lines.slice(1);

          // Skip the intro paragraph (first section before any ##)
          if (i === 0 && !content.startsWith("## ")) {
            return null;
          }

          return (
            <div key={i} className="mb-10">
              <h2 className="font-[family-name:var(--font-heading)] text-2xl text-brand-teal uppercase mb-2">
                {heading}
              </h2>
              <div className="w-16 h-1 bg-brand-gold mb-4" />
              <ul className="space-y-2">
                {items.map((item, j) => {
                  // Parse markdown links: [text](url)
                  const linkMatch = item.match(/\[([^\]]+)\]\(([^)]+)\)/);
                  if (linkMatch) {
                    return (
                      <li key={j} className="flex items-start gap-2">
                        <span className="text-brand-gold mt-1 shrink-0">→</span>
                        <a
                          href={linkMatch[2]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-gold hover:underline"
                        >
                          {linkMatch[1]}
                        </a>
                      </li>
                    );
                  }
                  return (
                    <li key={j} className="text-brand-charcoal leading-relaxed">
                      {item.replace(/^- /, "")}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}
